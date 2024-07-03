import { Injectable } from '@nestjs/common'
import axios from 'axios'
import Bottleneck from 'bottleneck'
import { BaseService } from '../../../shared/base/base.service'
import { GetQuery } from '../../../shared/dto/get-query.dto'
import { Logger } from '../../../shared/logger/logger'
import { TwitterGraphqlApi } from '../api/twitter-graphql.api'
import { AudioSpaceState } from '../enum/twitter-graphql.enum'
import { TwitterSpace } from '../model/twitter-space.entity'
import { TwitterSpaceRepository } from '../repository/twitter-space.repository'
import { TwitterSpaceUtil } from '../util/twitter-space.util'
import { TwitterUserQueueService } from './twitter-user-queue.service'
import { TwitterUserService } from './twitter-user.service'

@Injectable()
export class TwitterSpaceService extends BaseService<TwitterSpace> {
  private readonly logger = new Logger(TwitterSpaceService.name)
  private readonly dbLimiter = new Bottleneck({ maxConcurrent: 1 })
  private readonly apiLimiter = new Bottleneck({ maxConcurrent: 1 })

  constructor(
    public readonly repository: TwitterSpaceRepository,
    public readonly twitterUserService: TwitterUserService,
    public readonly twitterUserQueueService: TwitterUserQueueService,
    public readonly twitterGraphqlApi: TwitterGraphqlApi,
  ) {
    super(repository)
  }

  public async getById(id: string, opts?: GetQuery) {
    let res = opts?.renew
      ? null
      : await super.getById(id)
    if (!res) {
      res = await this.fetchById(id)
    }
    return res
  }

  public async fetchById(id: string) {
    const audioSpaces = await this.fetchAudioSpacesById(id)
    if (!audioSpaces.length) {
      return null
    }

    const spaces = await Promise.all(
      audioSpaces.map((v) => this.save(TwitterSpaceUtil.fromAudioSpace(v))),
    )

    await Promise.allSettled(
      audioSpaces.map((v) => this.saveCreator(v)),
    )

    const space = spaces.reduce((pv, cv) => ({ ...pv, ...cv }), {} as any as TwitterSpace)
    Object.assign(
      space,
      await this.savePlaylist(audioSpaces[0]),
    )

    await this.saveParticipants(audioSpaces[0])

    // if (space.state === TwitterSpaceState.ENDED) {
    //   await this.saveParticipants(audioSpaces[0])
    // }

    return space
  }

  public async fetchAudioSpacesById(id: string) {
    const results = await this.apiLimiter.schedule(() => Promise.allSettled([
      this.getAudioSpaceById(id),
      this.getAudioSpaceByRestId(id),
    ]))

    const audioSpaces = results
      .filter((res) => res.status === 'fulfilled')
      .map((res: PromiseFulfilledResult<any>) => res.value)
      .filter((res) => res?.metadata)

    if (!audioSpaces.length) {
      if (results.filter((res) => res.status === 'fulfilled').length === 2) {
        await this.repository.updateById(id, {
          isActive: false,
          modifiedAt: Date.now(),
        })
      } else {
        await this.repository.updateById(id, {
          modifiedAt: Date.now(),
        })
      }
    }

    return audioSpaces
  }

  public async getAudioSpaceById(id: string) {
    try {
      const { data } = await this.twitterGraphqlApi.getAudioSpaceById(id)
      const audioSpace = data?.data?.audioSpace
      return audioSpace
    } catch (error) {
      this.logger.error(`getAudioSpaceById: ${error.message}`, null, { id })
      throw error
    }
  }

  public async getAudioSpaceByRestId(id: string) {
    try {
      const { data } = await this.twitterGraphqlApi.getAudioSpaceByRestId(id)
      const audioSpace = data?.data?.audio_space_by_rest_id
      return audioSpace
    } catch (error) {
      this.logger.error(`getAudioSpaceByRestId: ${error.message}`, null, { id })
      throw error
    }
  }

  public async getLiveVideoStreamStatus(key: string) {
    const url = `https://api.twitter.com/1.1/live_video_stream/status/${key}`
    const res = await axios.get(url)
    return res
  }

  public async fetchPlaylistById(id: string, audioSpace?: any) {
    if (!audioSpace) {
      // eslint-disable-next-line no-param-reassign
      audioSpace = await this.getAudioSpaceById(id)
    }

    const newId = TwitterSpaceUtil.parseAudioSpaceId(audioSpace)
    if (id !== newId) {
      throw new Error('Space id not match')
    }

    const { data } = await this.getLiveVideoStreamStatus(audioSpace.metadata.media_key)
    const playlistUrl = TwitterSpaceUtil.toMasterPlaylistUrl(data.source.location)
    return playlistUrl
  }

  public async save(data: TwitterSpace) {
    const res = await this.dbLimiter.schedule(() => this.repository.save(data))
    return res
  }

  public async saveCreator(audioSpace: any) {
    const id = TwitterSpaceUtil.parseAudioSpaceId(audioSpace)
    try {
      await this.twitterUserService.saveResult(audioSpace.metadata.creator_results.result)
    } catch (error) {
      this.logger.error(`saveCreator: ${error.message}`, null, { id, audioSpace })
    }
  }

  public async saveParticipants(audioSpace: any) {
    const id = TwitterSpaceUtil.parseAudioSpaceId(audioSpace)
    try {
      const { participants } = audioSpace
      const tmpUsers = [...participants.admins, participants.speakers].map((v) => {
        const res = {
          id: TwitterSpaceUtil.parseParticipantId(v),
          username: TwitterSpaceUtil.parseParticipantUsername(v),
        }
        return res
      })
      await Promise.allSettled(tmpUsers.map((v) => this.twitterUserQueueService.add(v, { priority: 999 })))
    } catch (error) {
      this.logger.error(`saveParticipants: ${error.message}`, null, { id, audioSpace })
    }
  }

  public async savePlaylist(audioSpace: any) {
    const id = TwitterSpaceUtil.parseAudioSpaceId(audioSpace)
    const { metadata } = audioSpace
    const canFetchPlaylist = true
      && [
        metadata.state === AudioSpaceState.RUNNING,
        [AudioSpaceState.ENDED, AudioSpaceState.TIMED_OUT].includes(metadata.state) && metadata.is_space_available_for_replay,
      ].some((v) => v)

    if (!canFetchPlaylist) {
      return null
    }

    try {
      const playlistUrl = await this.fetchPlaylistById(id, audioSpace)
      const res = {
        playlistActive: true,
        playlistUpdatedAt: Date.now(),
        playlistUrl,
      }
      await this.repository.updateById(id, res)
      return res
    } catch (error) {
      this.logger.error(`savePlaylist: ${error.message}`, null, { id })
    }

    return null
  }
}

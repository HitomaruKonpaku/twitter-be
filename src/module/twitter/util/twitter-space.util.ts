import { NumberUtil } from '../../../shared/util/number.util'
import { AudioSpaceState } from '../enum/twitter-graphql.enum'
import { TwitterSpaceState } from '../enum/twitter-space.enum'
import { TwitterSpace } from '../model/twitter-space.entity'

export class TwitterSpaceUtil {
  public static parseId(url: string): string {
    const pattern = /(?<=spaces\/)\w+/
    const value = pattern.exec(url)?.[0] || url
    return value
  }

  public static fromAudioSpace(audioSpace: any) {
    const { metadata, participants } = audioSpace
    const creator = participants.admins[0]
    const obj: TwitterSpace = {
      id: TwitterSpaceUtil.parseAudioSpaceId(audioSpace),
      isActive: true,
      createdAt: NumberUtil.parse(metadata.created_at),
      updatedAt: NumberUtil.parse(metadata.updated_at),
      modifiedAt: Date.now(),
      creatorId: creator?.user_results?.result?.rest_id || creator?.user_results?.rest_id,
      state: TwitterSpaceUtil.parseState(metadata.state),
      altState: metadata.state,
      scheduledStart: NumberUtil.parse(metadata.scheduled_start),
      startedAt: NumberUtil.parse(metadata.start || metadata.started_at),
      endedAt: NumberUtil.parse(metadata.ended_at),
      lang: metadata.language,
      title: metadata.title,
      hostIds: TwitterSpaceUtil.parseParticipantIds(participants.admins),
      speakerIds: TwitterSpaceUtil.parseParticipantIds(participants.speakers),
      participantCount: metadata.total_participated,
      totalLiveListeners: metadata.total_live_listeners,
      totalReplayWatched: metadata.total_replay_watched,
      isAvailableForReplay: metadata.is_space_available_for_replay,
      isAvailableForClipping: metadata.is_space_available_for_clipping,
      narrowCastSpaceType: metadata.narrow_cast_space_type,
      subscriberCount: audioSpace.subscriber_count,
      ticketsSold: metadata.tickets_sold,
      ticketsTotal: metadata.tickets_total,
    }
    return obj
  }

  public static parseAudioSpaceId(audioSpace) {
    const { metadata } = audioSpace
    const id = audioSpace.rest_id || metadata.broadcast_id || metadata.rest_id
    return id
  }

  public static parseState(state: AudioSpaceState): TwitterSpaceState {
    const obj = {
      [AudioSpaceState.NOT_STARTED]: TwitterSpaceState.SCHEDULED,
      [AudioSpaceState.PRE_PUBLISHED]: TwitterSpaceState.SCHEDULED,
      [AudioSpaceState.RUNNING]: TwitterSpaceState.LIVE,
      [AudioSpaceState.TIMED_OUT]: TwitterSpaceState.ENDED,
      [AudioSpaceState.ENDED]: TwitterSpaceState.ENDED,
      [AudioSpaceState.CANCELED]: TwitterSpaceState.CANCELED,
    }
    return obj[state] || null
  }

  public static parseParticipantId(participant: any) {
    const res = participant.user_results?.result?.rest_id || participant.user_results?.rest_id
    return res
  }

  public static parseParticipantIds(participants: any[]) {
    const res = participants
      .map((v) => TwitterSpaceUtil.parseParticipantId(v))
      .filter((v) => v)
    return res
  }

  public static parseParticipantUsername(participant: any) {
    const res = participant.user_results?.result?.legacy?.screen_name || participant.twitter_screen_name
    return res
  }

  public static parseParticipantUsernames(participants: any[]) {
    const res = participants
      .map((v) => TwitterSpaceUtil.parseParticipantUsername(v))
      .filter((v) => v)
    return res
  }

  public static toMasterPlaylistUrl(url: string): string {
    return url
      // Handle live playlist
      .replace('?type=live', '')
      .replace('dynamic_playlist', 'master_playlist')
      // Handle replay playlist
      .replace('?type=replay', '')
      .replace(/playlist_\d+/g, 'master_playlist')
  }

  public static getUserIds(space: TwitterSpace): string[] {
    if (!space) {
      return []
    }

    const ids = [...new Set([space.creatorId, ...(space.hostIds || []), ...(space.speakerIds || [])])]
    return ids
  }
}

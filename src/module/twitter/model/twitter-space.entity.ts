import { Column, Entity, PrimaryColumn } from 'typeorm'
import { AudioSpaceState } from '../enum/twitter-graphql.enum'
import { TwitterSpaceState } from '../enum/twitter-space.enum'
import { TwitterUser } from './twitter-user.entity'

@Entity('twitter_space')
export class TwitterSpace {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive?: boolean

  @Column({ name: 'created_at', type: 'numeric', nullable: true })
  createdAt?: number

  @Column({ name: 'updated_at', type: 'numeric', nullable: true })
  updatedAt?: number

  @Column({ name: 'modified_at', type: 'numeric', nullable: true })
  modifiedAt?: number

  @Column({ name: 'creator_id', type: 'text' })
  creatorId: string

  @Column({ name: 'state', type: 'text', nullable: true })
  state?: TwitterSpaceState

  @Column({ name: 'alt_state', type: 'text', nullable: true })
  altState?: AudioSpaceState

  @Column({ name: 'scheduled_start', type: 'numeric', nullable: true })
  scheduledStart?: number

  @Column({ name: 'started_at', type: 'numeric', nullable: true })
  startedAt?: number

  @Column({ name: 'ended_at', type: 'numeric', nullable: true })
  endedAt?: number

  @Column({ name: 'lang', type: 'text', nullable: true })
  lang?: string

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({ name: 'host_ids', type: 'json', nullable: true })
  hostIds?: string[]

  @Column({ name: 'speaker_ids', type: 'json', nullable: true })
  speakerIds?: string[]

  @Column({ name: 'participant_count', type: 'numeric', nullable: true })
  participantCount?: number

  @Column({ name: 'total_live_listeners', type: 'numeric', nullable: true })
  totalLiveListeners?: number

  @Column({ name: 'total_replay_watched', type: 'numeric', nullable: true })
  totalReplayWatched?: number

  @Column({ name: 'is_available_for_replay', type: 'boolean', nullable: true })
  isAvailableForReplay?: boolean

  @Column({ name: 'is_available_for_clipping', type: 'boolean', nullable: true })
  isAvailableForClipping?: boolean

  @Column({ name: 'narrow_cast_space_type', type: 'numeric', nullable: true })
  narrowCastSpaceType?: number

  @Column({ name: 'subscriber_count', type: 'numeric', nullable: true })
  subscriberCount?: number

  @Column({ name: 'tickets_sold', type: 'numeric', nullable: true })
  ticketsSold?: number

  @Column({ name: 'tickets_total', type: 'numeric', nullable: true })
  ticketsTotal?: number

  @Column({ name: 'playlist_active', type: 'boolean', nullable: true })
  playlistActive?: boolean

  @Column({ name: 'playlist_updated_at', type: 'numeric', nullable: true })
  playlistUpdatedAt?: number

  @Column({ name: 'playlist_url', type: 'text', nullable: true })
  playlistUrl?: string

  creator?: TwitterUser

  hosts?: TwitterUser[]

  speakers?: TwitterUser[]
}

import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { TwitterSpace } from './twitter-space.entity'

@Entity('twitter_user')
export class TwitterUser {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive?: boolean

  @Column({ name: 'created_at', type: 'numeric', nullable: true })
  createdAt?: number

  @Column({ name: 'updated_at', type: 'numeric', nullable: true })
  updatedAt?: number

  @Index()
  @Column({ name: 'username', type: 'text' })
  username: string

  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string

  @Column({ type: 'boolean', default: false })
  protected?: boolean

  @Column({ type: 'boolean', default: false })
  verified?: boolean

  @Column({ name: 'verified_type', type: 'text', nullable: true })
  verifiedType?: string

  @Column({ type: 'text', nullable: true })
  location?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl?: string

  @Column({ name: 'profile_banner_url', type: 'text', nullable: true })
  profileBannerUrl?: string

  @Column({ name: 'followers_count', type: 'numeric', nullable: true })
  followersCount?: number

  @Column({ name: 'following_count', type: 'numeric', nullable: true })
  followingCount?: number

  @Column({ name: 'tweet_count', type: 'numeric', nullable: true })
  tweetCount?: number

  @Column({ name: 'organization_id', type: 'text', nullable: true })
  organizationId?: string

  @Column({ name: 'affiliates_count', type: 'numeric', nullable: true })
  affiliatesCount?: number

  spaces?: TwitterSpace[]
}

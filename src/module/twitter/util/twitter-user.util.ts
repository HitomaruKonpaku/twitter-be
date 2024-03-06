import { NumberUtil } from '../../../shared/util/number.util'
import { TwitterUser } from '../model/twitter-user.entity'

export class TwitterUserUtil {
  public static fromResult(result: any) {
    const { legacy } = result
    const obj: TwitterUser = {
      id: result.rest_id,
      isActive: true,
      createdAt: NumberUtil.fromDate(legacy.created_at),
      updatedAt: Date.now(),
      username: legacy.screen_name,
      name: legacy.name,
      protected: !!legacy.protected,
      verified: !!legacy.verified_type || !!result.is_blue_verified,
      verifiedType: legacy.verified_type?.toLowerCase() || null,
      location: legacy.location,
      description: legacy.description || '',
      profileImageUrl: TwitterUserUtil.parseProfileImageUrl(legacy.profile_image_url_https),
      profileBannerUrl: TwitterUserUtil.parseProfileBannerUrl(legacy.profile_banner_url),
      followersCount: legacy.followers_count,
      followingCount: legacy.friends_count,
      tweetCount: legacy.statuses_count,
      affiliatesCount: result.business_account?.affiliates_count,
    }
    return obj
  }

  public static parseProfileImageUrl(value: string): string {
    const url = value?.replace?.('_normal', '') || null
    return url
  }

  public static parseProfileBannerUrl(value: string): string {
    const url = value || null
    return url
  }
}

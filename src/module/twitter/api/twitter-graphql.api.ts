import { Injectable } from '@nestjs/common'
import { TwitterApi } from './twitter.api'

@Injectable()
export class TwitterGraphqlApi {
  constructor(private readonly twitterApi: TwitterApi) { }

  private get guestTokenHeaders() {
    return { 'x-guest-token': '1' }
  }

  // public async getUserByRestId(id: string) {
  // }

  public async getUserByScreenName(username: string) {
    const url = 'graphql/k5XapwcSikNsEsILW5FvgA/UserByScreenName'
    const params = {
      variables: JSON.stringify({
        screen_name: username,
        withSafetyModeUserFields: true,
      }),
      features: JSON.stringify({
        hidden_profile_likes_enabled: true,
        hidden_profile_subscriptions_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        subscriptions_verification_info_is_identity_verified_enabled: true,
        subscriptions_verification_info_verified_since_enabled: true,
        highlights_tweets_tab_ui_enabled: true,
        responsive_web_twitter_article_notes_tab_enabled: true,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
      }),
      fieldToggles: JSON.stringify({
        withAuxiliaryUserLabels: true,
      }),
    }
    const res = await this.twitterApi.client.get(url, { params, headers: this.guestTokenHeaders })
    return res
  }

  public async getAudioSpaceById(id: string) {
    const url = 'graphql/MZwo_AA10ZpJfbY4ZekqQA/AudioSpaceById'
    const params = {
      variables: JSON.stringify({
        id,
        isMetatagsQuery: true,
        withReplays: true,
        withListeners: true,
      }),
      features: JSON.stringify({
        spaces_2022_h2_spaces_communities: true,
        spaces_2022_h2_clipping: true,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        tweetypie_unmention_optimization_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: true,
        tweet_awards_web_tipping_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
        rweb_video_timestamps_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_enhance_cards_enabled: false,
      }),
    }
    const res = await this.twitterApi.client.get(url, { params })
    return res
  }

  public async getAudioSpaceByRestId(id: string) {
    const url = 'graphql/N80MQ7fkrpuq1-kCWVSvzQ/AudiospaceByRestId'
    const params = {
      variables: JSON.stringify({
        audio_space_id: id,
      }),
      features: JSON.stringify({
        super_follow_tweet_api_enabled: false,
        tweetypie_unmention_optimization_enabled: false,
        creator_subscriptions_tweet_preview_api_enabled: false,
        android_graphql_skip_api_media_color_palette: false,
        subscriptions_verification_info_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: false,
        longform_notetweets_consumption_enabled: false,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
        longform_notetweets_rich_text_read_enabled: false,
        super_follow_exclusive_tweet_notifications_enabled: false,
        super_follow_user_api_enabled: false,
        blue_business_profile_image_shape_enabled: false,
        creator_subscriptions_subscription_count_enabled: false,
        longform_notetweets_inline_media_enabled: false,
        super_follow_badge_privacy_enabled: false,
      }),
    }
    const res = await this.twitterApi.client.get(url, { params })
    return res
  }
}

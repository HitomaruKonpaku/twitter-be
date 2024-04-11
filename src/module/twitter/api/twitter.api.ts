import { Injectable } from '@nestjs/common'
import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { USER_AGENT } from '../../../constant/app.constant'
import { Logger } from '../../../shared/logger/logger'
import { TWITTER_API_URL, TWITTER_PUBLIC_AUTHORIZATION } from '../constant/twitter.constant'

@Injectable()
export class TwitterApi {
  private readonly logger = new Logger(TwitterApi.name)

  private axiosInstance: AxiosInstance

  private guestToken: string
  private rateLimits: Record<string, any> = {}

  constructor() {
    this.initInstance()
  }

  public get client() {
    return this.axiosInstance
  }

  public async fetchGuestToken(): Promise<string> {
    this.logger.debug('--> fetchGuestToken')
    const { data } = await axios.request({
      method: 'GET',
      url: 'https://twitter.com',
      headers: {
        'user-agent': USER_AGENT,
      },
      beforeRedirect(options, responseDetails) {
        const cookie = (responseDetails.headers['set-cookie'] as any as string[])
          .map((v) => v.split(';')[0]).join('; ')
        Object.assign(options.headers, { cookie })
      },
    })
    const token = /(?<=gt=)\d+/.exec(data)?.[0]
    this.logger.debug('<-- fetchGuestToken', { token })
    return token
  }

  public getRateLimitByName(name: string) {
    const keys = Object.keys(this.rateLimits)
    const key = keys.find((v) => v.includes(name))
    const obj = this.rateLimits[key] || null
    return obj
  }

  private initInstance() {
    const client = axios.create({
      baseURL: TWITTER_API_URL,
    })

    client.interceptors.request.use(
      async (config) => {
        this.logRequest(config)
        await this.handleRequest(config)
        return config
      },
      null,
    )

    client.interceptors.response.use(
      (response) => {
        this.logResponse(response)
        this.handleResponse(response)
        return response
      },
      (error) => {
        this.logResponse(error.response)
        this.handleResponse(error.response)
        return Promise.reject(error)
      },
    )

    this.axiosInstance = client
  }

  private logRequest(config: AxiosRequestConfig) {
    const method = config.method.toUpperCase()
    const url = [config.baseURL, config.url]
      .join('/')
      .replace(TWITTER_API_URL, '')
    this.logger.debug(['-->', '   ', method, url].join(' '))
  }

  private logResponse(res: AxiosResponse) {
    if (!res?.config) {
      return
    }

    const { status } = res
    const method = res.config.method.toUpperCase()
    const url = [res.config.baseURL, res.config.url]
      .join('/')
      .replace(TWITTER_API_URL, '')
    const limit = Number(res.headers['x-rate-limit-limit'])
    if (!limit) {
      const msg = ['<--', status, method, url].join(' ')
      this.logger.debug(msg)
      return
    }

    const remaining = Number(res.headers['x-rate-limit-remaining'])
    const reset = Number(res.headers['x-rate-limit-reset'])
    const msg = ['<--', status, method, url, limit, remaining, new Date(reset * 1000).toISOString()].join(' ')
    this.logger.debug(msg)
  }

  private async handleRequest(config: AxiosRequestConfig) {
    const headers = config.headers as AxiosHeaders
    const authorization = process.env.TWITTER_PUBLIC_AUTHORIZATION || TWITTER_PUBLIC_AUTHORIZATION
    headers.set('authorization', authorization)

    if (!headers.has('x-guest-token')) {
      const cookie = [
        ['auth_token', process.env.TWITTER_AUTH_TOKEN],
        ['ct0', process.env.TWITTER_CSRF_TOKEN],
      ].map((v) => v.join('=')).join('; ')
      headers.set('cookie', cookie)
      headers.set('x-csrf-token', process.env.TWITTER_CSRF_TOKEN)
      return
    }

    const url = this.getRateLimitRequestUrl(config)
    const rateLimit = this.rateLimits[url]

    try {
      if (!this.guestToken || (rateLimit && rateLimit.limit && rateLimit.remaining === 0)) {
        this.guestToken = await this.fetchGuestToken()
      }
      headers.set('x-guest-token', this.guestToken)
    } catch (error) {
      this.logger.error(`handleRequest: ${error.message}`, null, { url, rateLimit })
    }
  }

  private handleResponse(res: AxiosResponse) {
    const url = this.getRateLimitRequestUrl(res.config)
    const limit = Number(res.headers['x-rate-limit-limit'])
    const remaining = Number(res.headers['x-rate-limit-remaining'])
    const reset = Number(res.headers['x-rate-limit-reset'])
    if (limit) {
      const { rateLimits } = this
      rateLimits[url] = rateLimits[url] || {}
      rateLimits[url].limit = limit
      rateLimits[url].remaining = remaining
      rateLimits[url].reset = reset * 1000
    }
  }

  private getRateLimitRequestUrl(config: AxiosRequestConfig) {
    const url = config.baseURL?.includes?.('graphql')
      ? config.url.substring(config.url.indexOf('/') + 1)
      : config.url
    return url
  }
}

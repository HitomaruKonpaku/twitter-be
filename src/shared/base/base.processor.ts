import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '../logger/logger'

export abstract class BaseProcessor extends WorkerHost {
  protected abstract readonly logger: Logger

  protected debug = false

  @OnWorkerEvent('error')
  onError(error: any) {
    this.logger.error(`error: ${error.message}`)
  }

  @OnWorkerEvent('paused')
  onPaused() {
    this.logger.warn('paused')
  }

  @OnWorkerEvent('resumed')
  onResumed() {
    this.logger.warn('resumed')
  }

  @OnWorkerEvent('ready')
  onReady() {
    this.logger.warn('ready')
  }

  @OnWorkerEvent('drained')
  onDrained() {
    if (this.debug) {
      this.logger.debug('drained')
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error) {
    this.logger.error(`failed: ${job.id} - ${error.message}`)
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    if (this.debug) {
      this.logger.debug(`active: ${job.id}`)
    }
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    if (this.debug) {
      this.logger.debug(`stalled: ${jobId}`)
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`completed: ${job.id}`)
  }
}

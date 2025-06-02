/* eslint-disable @typescript-eslint/no-unused-vars */

import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { BaseRepository } from './base.repository'

export abstract class BaseService<T> {
  constructor(
    public readonly repository: BaseRepository<T>,
  ) { }

  public async getById(id: string, opts?: any): Promise<T> {
    const res = await this.repository.getById(id)
    return res
  }

  public async getByIds(ids: string[], opts?: any): Promise<T[]> {
    const res = await this.repository.getByIds(ids)
    return res
  }

  public async upsertById(data: QueryDeepPartialEntity<T>) {
    const { id } = (data as any)
    if (!id) {
      throw new Error('ID_NOT_FOUND')
    }

    await this.repository.upsertById(data)
    const res = await this.getById(id)
    return res
  }

  public async count() {
    const res = await this.repository.count()
    return res
  }
}

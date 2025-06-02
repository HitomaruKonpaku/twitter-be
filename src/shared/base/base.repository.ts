import { FindManyOptions, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

export abstract class BaseRepository<T> {
  constructor(
    public readonly repository: Repository<T>,
  ) { }

  public async getById(id: string): Promise<T> {
    const res = await this.repository
      .createQueryBuilder()
      .andWhere('id = :id', { id })
      .getOne()
    return res
  }

  public async getByIds(ids: string[]): Promise<T[]> {
    const res = await this.repository
      .createQueryBuilder()
      .andWhere('id IN (:...ids)', { ids })
      .getMany()
    return res
  }

  public async count(options?: FindManyOptions<T>) {
    const res = await this.repository.count(options)
    return res
  }

  public async updateById(id: string, data: Partial<T>) {
    const res = await this.repository.update({ id } as any, data as any)
    return res
  }

  public async upsertById(data: QueryDeepPartialEntity<T>) {
    const res = await this.repository.upsert(
      data,
      {
        conflictPaths: ['id'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
    return res
  }

  public async save(data: T) {
    const res = await this.repository.save(data)
    return res
  }
}

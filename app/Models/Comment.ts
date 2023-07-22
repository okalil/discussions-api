import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  ManyToMany,
  belongsTo,
  column,
  computed,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Discussion from './Discussion'
import User from './User'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public content: string

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public discussionId: number

  @belongsTo(() => Discussion)
  public discussion: BelongsTo<typeof Discussion>

  @manyToMany(() => User)
  public votes: ManyToMany<typeof User>

  @computed({ serializeAs: 'votes_count' })
  public get votesCount() {
    return this.$extras.votes_count
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

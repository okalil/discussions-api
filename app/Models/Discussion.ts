import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  HasMany,
  ManyToMany,
  belongsTo,
  column,
  computed,
  hasMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Comment from './Comment'

export default class Discussion extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public description: string

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @manyToMany(() => User)
  public votes: ManyToMany<typeof User>

  @computed({ serializeAs: 'votes_count' })
  public get votesCount() {
    return this.$extras.votes_count
  }

  @computed({ serializeAs: 'comments_count' })
  public get commentsCount() {
    return this.$extras.comments_count
  }

  @computed({ serializeAs: 'user_voted' })
  public get userVoted() {
    return !!this.$extras.user_voted
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

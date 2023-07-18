import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Comment from './Comment'
import User from './User'

export default class Vote extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public commentId: number

  @column()
  public userId: number

  @belongsTo(() => Comment)
  public comment: BelongsTo<typeof Comment>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

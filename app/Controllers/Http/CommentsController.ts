import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Comment from 'App/Models/Comment'
import Discussion from 'App/Models/Discussion'
import Ws from 'App/Services/Ws'

export default class CommentsController {
  public async index({ params, response }: HttpContextContract) {
    const comments = await Comment.query()
      .preload('user')
      .withCount('votes')
      .orderBy('createdAt', 'asc')
      .where('discussion_id', params.id)
    await Promise.all(
      comments.map(async (it) => {
        if (it.user.picture) it.user.picture = await Drive.getUrl(it.user.picture)
      })
    )
    response.json({ comments })
  }

  public async show({ auth, params, response }: HttpContextContract) {
    const comment = await Comment.query()
      .preload('user')
      .withCount('votes')
      .withAggregate('votes', (query) => {
        query
          .count('*')
          .where('user_id', auth.user?.id ?? 0)
          .as('user_voted')
      })
      .orderBy('createdAt', 'asc')
      .where('discussionId', params.id)
      .firstOrFail()
    if (comment.user.picture) comment.user.picture = await Drive.getUrl(comment.user.picture)
    response.json({ comment })
  }

  public async store({ params, auth, request, response }: HttpContextContract) {
    const user = auth.user!
    const { content } = await request.validate({
      schema: schema.create({ content: schema.string([rules.trim()]) }),
    })

    const discussion = await Discussion.findOrFail(params.id)
    const comment = await discussion.related('comments').create({
      userId: user.id,
      content,
    })
    await comment.load('user')
    if (comment.user.picture) comment.user.picture = await Drive.getUrl(comment.user.picture)

    Ws.io.to(`discussion:${discussion.id}`).emit('comment_new', comment)

    response.json({ comment })
  }

  public async update({ params, auth, request, response }: HttpContextContract) {
    const user = auth.user!
    const { content } = await request.validate({
      schema: schema.create({ content: schema.string([rules.trim()]) }),
    })

    const comment = await user
      .related('comments')
      .query()
      .where('id', params.commentId)
      .firstOrFail()
    await comment.merge({ content }).save()

    Ws.io.to(`discussion:${params.id}`).emit('comment_update', comment.id)

    response.json({ comment })
  }

  public async destroy({ params, auth, response }: HttpContextContract) {
    const user = auth.user!
    await user.related('comments').query().where('id', params.commentId).delete()

    Ws.io.to(`discussion:${params.id}`).emit('comment_delete', params.commentId)

    response.status(204)
  }

  public async like({ response, params, auth }: HttpContextContract) {
    const user = auth.user!
    const comment = await Comment.findOrFail(params.commentId)
    await comment.related('votes').create(user)
    Ws.io.to(`discussion:${params.id}`).emit('comment_update', comment.id)
    response.status(204)
  }

  public async dislike({ response, params, auth }: HttpContextContract) {
    const user = auth.user!
    const comment = await Comment.findOrFail(params.commentId)
    await comment.related('votes').detach([user.id])
    Ws.io.to(`discussion:${params.id}`).emit('comment_update', comment.id)
    response.status(204)
  }
}

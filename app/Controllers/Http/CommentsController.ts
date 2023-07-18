import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Comment from 'App/Models/Comment'
import Discussion from 'App/Models/Discussion'

export default class CommentsController {
  public async index({ params, response }: HttpContextContract) {
    const comments = await Comment.query()
      .preload('user')
      .withCount('votes')
      .orderBy('createdAt', 'desc')
      .where('discussion_id', params.id)
    response.json({ comments })
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

    response.json({ comment })
  }

  public async destroy({ params, auth, response }: HttpContextContract) {
    const user = auth.user!
    await user.related('comments').query().where('id', params.commentId).delete()
    response.status(204)
  }
}

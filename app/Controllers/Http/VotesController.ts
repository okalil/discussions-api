import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import Ws from 'App/Services/Ws'

export default class VotesController {
  public async store({ auth, params, response }: HttpContextContract) {
    const comment = await Comment.findOrFail(params.commentId)
    await comment.related('votes').create({ userId: auth.user!.id })

    Ws.io.to(`discussion:${params.id}`).emit('vote_up', comment.id)

    response.status(204)
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    const comment = await Comment.findOrFail(params.commentId)
    await auth.user!.related('votes').query().where('commentId', comment.id).delete()

    Ws.io.to(`discussion:${params.id}`).emit('vote_down', comment.id)

    response.status(204)
  }
}

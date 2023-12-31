import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Discussion from 'App/Models/Discussion'
import Ws from 'App/Services/Ws'

export default class DiscussionsController {
  public async index({ auth, request, response }: HttpContextContract) {
    const page = await request.input('page', 1)
    const limit = await request.input('limit', 10)
    const q: string = await request.input('q', '')

    const paginator = await Discussion.query()
      .whereILike('title', `%${q}%`)
      .orWhereILike('description', `%${q}%`)
      .preload('user')
      .withCount('comments')
      .withCount('votes')
      .withAggregate('votes', (query) => {
        query
          .count('*')
          .where('user_id', auth.user?.id ?? 0)
          .as('user_voted')
      })
      .paginate(page, limit)

    response.json(paginator)
  }

  public async show({ auth, response, params }: HttpContextContract) {
    const discussion = await Discussion.query()
      .where('id', params.id)
      .preload('user')
      .withCount('comments')
      .withCount('votes')
      .withAggregate('votes', (query) => {
        query
          .count('*')
          .where('user_id', auth.user?.id ?? 0)
          .as('user_voted')
      })
      .firstOrFail()

    response.json({ discussion })
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        title: schema.string([rules.trim()]),
        description: schema.string([rules.trim()]),
      }),
    })
    const discussion = await auth.user?.related('discussions').create(data)
    response.json({ discussion })
  }

  public async update({ request, response, params, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        title: schema.string.optional([rules.trim()]),
        description: schema.string.optional([rules.trim()]),
      }),
    })
    const discussion = await auth
      .user!.related('discussions')
      .query()
      .where('id', params.id)
      .firstOrFail()

    await discussion.merge(data).save()
    response.json({ discussion })
  }

  public async delete({ response, params, auth }: HttpContextContract) {
    const discussion = await auth
      .user!.related('discussions')
      .query()
      .where('id', params.id)
      .firstOrFail()

    await discussion.delete()
    response.status(204)
  }

  public async like({ response, params, auth }: HttpContextContract) {
    const discussion = await Discussion.findOrFail(params.id)
    await discussion.related('votes').create(auth.user!)

    Ws.io.to(`discussion:${params.id}`).emit('discussion_update', discussion.id)
    response.status(204)
  }

  public async dislike({ response, params, auth }: HttpContextContract) {
    const discussion = await Discussion.findOrFail(params.id)
    await discussion.related('votes').detach([auth.user!.id])

    Ws.io.to(`discussion:${params.id}`).emit('discussion_update', discussion.id)
    response.status(204)
  }
}

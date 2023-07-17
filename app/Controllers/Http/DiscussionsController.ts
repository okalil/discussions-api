import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Discussion from 'App/Models/Discussion'

export default class DiscussionsController {
  public async index({ request, response }: HttpContextContract) {
    const page = await request.input('page', 1)
    const limit = await request.input('limit', 10)

    const paginator = await Discussion.query().preload('user').paginate(page, limit)
    response.json(paginator)
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
}

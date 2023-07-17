import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import User from 'App/Models/User'

export default class UsersController {
  public async store({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        name: schema.string([rules.trim()]),
        email: schema.string([rules.email()]),
        password: schema.string([rules.confirmed()]),
      }),
    })
    await User.create(data)

    const result = await auth.use('api').attempt(data.email, data.password)
    response.json(result)
  }

  public async login({ auth, request, response }: HttpContextContract) {
    const data = request.all()
    const result = await auth.use('api').attempt(data.email, data.password)
    response.json(result)
  }

  public async profile({ auth, response }: HttpContextContract) {
    const user = auth.user!
    if (user.picture) user.picture = await Drive.getUrl(user.picture)
    response.json({ user })
  }

  public async update({ auth, request, response }: HttpContextContract) {
    const user = auth.user!
    const { picture, ...data } = await request.validate({
      schema: schema.create({
        name: schema.string.optional([rules.trim()]),
        picture: schema.file.optional(),
        password: schema.string.optional([rules.confirmed()]),
      }),
    })
    if (picture) {
      await picture.moveToDisk('./')
      if (user.picture) await Drive.delete(user.picture)
      user.picture = picture.fileName ?? null
    }
    await user.merge(data).save()
    response.json({ user })
  }
}

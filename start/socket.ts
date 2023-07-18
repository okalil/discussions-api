import crypto from 'node:crypto'

import User from 'App/Models/User'
import Ws from 'App/Services/Ws'
import ApiToken from 'App/Models/ApiToken'

Ws.boot()

Ws.io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token

    if (!token || typeof token !== 'string') {
      throw new Error('E_MISSING_API_TOKEN')
    }

    socket.data.user = await getUserOrFail(token)

    next()
  } catch (error) {
    next(error)
  }
})

function parseToken(token: string) {
  const parts = token.split('.')
  /**
   * Ensure the token has two parts
   */
  if (parts.length !== 2) {
    throw new Error('E_INVALID_API_TOKEN')
  }

  /**
   * Ensure the first part is a base64 encode id
   */
  const tokenId = Buffer.from(parts[0], 'base64').toString('utf-8')

  if (!tokenId) {
    throw new Error('E_INVALID_API_TOKEN')
  }

  const parsedToken = crypto.createHash('sha256').update(parts[1]).digest('hex')
  return {
    id: tokenId,
    token: parsedToken,
  }
}

async function getUserOrFail(token: string): Promise<User> {
  const parsedToken = parseToken(token)
  const apiToken = await ApiToken.query()
    .select('userId')
    .where('id', parsedToken.id)
    .andWhere('token', parsedToken.token)
    .preload('user')
    .first()
  if (!apiToken) {
    throw new Error('E_INVALID_API_TOKEN')
  }
  return apiToken.user
}

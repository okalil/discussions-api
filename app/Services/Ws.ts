import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'
import User from 'App/Models/User'

interface ServerToClientEvents {}

interface ClientToServerEvents {}

interface InterServerEvents {}

interface SocketData {
  user: User
}

class Ws {
  public io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
  private booted = false

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!)
  }
}

export default new Ws()

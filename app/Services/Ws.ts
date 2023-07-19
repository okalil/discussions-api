import AdonisServer from '@ioc:Adonis/Core/Server'
import { Server } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

class Ws {
  public io: Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>
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

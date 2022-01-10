import {Inject, forwardRef, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketServer,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse
} from '@nestjs/websockets';
import { Socket, Server} from 'socket.io';
import { AppService } from './app.service';


//@Injectable()
@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @Inject(forwardRef(() => AppService))private appService: AppService,
  ) { }

  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    this.appService.getSession().then(session => {
      console.log(session)
      this.appService.polling(session)
      client.emit('session', session)
    })
  
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string): WsResponse<string> {
    return { event: 'msgToClient', data: 'Hello world!' };
  }

}

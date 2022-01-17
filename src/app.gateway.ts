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
//import { response } from 'express';
import { Socket, Server} from 'socket.io';
import { AppService } from './app.service';

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
    this.appService.xmlrpcRequest('open')
    .catch((err) => console.log(err))
    .then(session => {
      console.log(session)
      this.appService.polling(session)
      client.emit('session', session)
    })
  
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('resume')
  handleResume(client: Socket, request: string){
    let requestData = JSON.parse(request)
    this.appService.xmlrpcRequest(
      "print_admin.resumeJob", 
      [requestData['session'], 
      parseInt(requestData['jobid'])]
      )
    .catch((err) => console.log(err))
    .then(response => {
      client.emit('resume',response)
    })
  }

  @SubscribeMessage('delete')
  handleDelete(client: Socket, request: string){
    let requestData = JSON.parse(request)
    this.appService.xmlrpcRequest(
      "print_admin.cancelJob", 
      [requestData['session'], 
      parseInt(requestData['jobid'])]
      )
    .catch((err) => console.log(err))
    .then(response => {
      client.emit('delete',`job ${requestData['jobid']} was deleted`)
    })
  }

  @SubscribeMessage('previewSmall')
  handleSmallPreview(client: Socket, request: string){
    let requestData = JSON.parse(request)
    this.appService.xmlrpcRequest(
      "print.loadJobFromSpooler", 
      [requestData['session'], 
      parseInt(requestData['jobid'])]
      )
    .catch((err) => console.log(err))
    .then( async () =>
    this.appService.getPreview(requestData).subscribe({
         next: response => client.emit('previewSmall',JSON.stringify(response)),
         error: e => console.log(e),
         complete: () => console.log('getPriview completed!')
    }))
    
  }

  @SubscribeMessage('preview')
  handlePreview(client: Socket, request: string){
    let requestData = JSON.parse(request)
    //this.appService.loadJobFromSpooler(requestData['session'],parseInt(requestData['jobid']))
    this.appService.xmlrpcRequest(
      "print.loadJobFromSpooler", 
      [requestData['session'], 
      parseInt(requestData['jobid'])]
      )
    .catch((err) => console.log(err))
    .then( async () =>
    this.appService.getPreview(requestData).subscribe({
         next: response => client.emit('preview',JSON.stringify(response)),
         error: e => console.log(e),
         complete: () => console.log('getPriview completed!')
    }))
    
  }

  @SubscribeMessage('properties')
  handleProperties(client: Socket, request: string): WsResponse<string> {
    return { event: 'properties', data: 'properties' };
  }

}

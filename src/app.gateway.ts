import { Inject, forwardRef, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketServer,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse
} from '@nestjs/websockets';
import bufferToDataUrl from "buffer-to-data-url";
import { Socket, Server } from 'socket.io';
import { AppService } from './app.service';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @Inject(forwardRef(() => AppService)) private appService: AppService,
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
        this.appService.stopPolling()
        this.appService.polling(session)
        client.emit('session', session)
      })

  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('resume')
  handleResume(client: Socket, request: string) {
    let requestData = JSON.parse(request)
    this.appService.xmlrpcRequest(
      "print_admin.resumeJob",
      [requestData['session'],
      parseInt(requestData['jobid'])]
    )
      .catch((err) => console.log(err))
      .then(response => {
        client.emit('resume', response)
      })
  }

  @SubscribeMessage('delete')
  handleDelete(client: Socket, request: string) {
    let requestData = JSON.parse(request)
    this.appService.xmlrpcRequest(
      "print_admin.cancelJob",
      [requestData['session'],
      parseInt(requestData['jobid'])]
    )
      .catch((err) => console.log(err))
      .then(response => {
        client.emit('delete', `job ${requestData['jobid']} was deleted`)
        this.appService.deletePreview(parseInt(requestData['jobid']))
      })
  }

  // @SubscribeMessage('previewSmall')
  // handleSmallPreview(client: Socket, request: string) {
  //   let requestData = JSON.parse(request)
  //   this.appService.xmlrpcRequest(
  //     'call',
  //     [requestData['session'],
  //     [
  //       ['print.loadJobFromSpooler', parseInt(requestData['jobid'])],
  //       ['scan.setActiveSetFile'],
  //     ]])
  //     // "print.loadJobFromSpooler",
  //     // [requestData['session'],
  //     // parseInt(requestData['jobid'])]
  //   //)
  //     .catch((err) => console.log(err))
  //     .then(async () =>
  //       this.appService.getPreview(requestData).subscribe({
  //         next: response => client.emit('previewSmall', JSON.stringify(response)),
  //         error: e => console.log(e),
  //         complete: () => console.log('getPriview completed!')
  //       }))

  // }

  @SubscribeMessage('preview')
  handlePreview(client: Socket, request: string) {
    let requestData = JSON.parse(request)
    this.appService.xmlrpcRequest(
      "print.loadJobFromSpooler",
      [requestData['session'],
      parseInt(requestData['jobid'])]
    )
      .catch((err) => console.log(err))
      .then(async () =>
        this.appService.getPreview(requestData).subscribe({
          next: response => {
          let data = {
            jobid: null,
            dataUrl: null
          }
          data['jobid'] = parseInt(requestData['jobid']),
          data['dataUrl'] = bufferToDataUrl("image/png", Buffer.from(response))
          // return data
            client.emit('preview', JSON.stringify(data))
          },
          error: e => console.log(e),
          complete: () => console.log('getPriview completed!')
        }))

  }

  @SubscribeMessage('getProperties')
  getProperties(client: Socket, request: string) {
    let requestData = JSON.parse(request)
    console.log(requestData)
    this.appService.xmlrpcRequest(
      'call',
      [requestData['session'],
      [
        ['print.loadJobFromSpooler', parseInt(requestData['jobid'])],
        ['print.getParams'],
        ['print.getParam', 'info_supports_color']
      ]])
      .catch(err => console.log(err))
      .then(response => client.emit('getProperties', JSON.stringify(response)))
  }

  @SubscribeMessage('setProperties')
  setProperties(client: Socket, request: string) {
    let requestData = JSON.parse(request)
    console.log(requestData)
    this.appService.xmlrpcRequest(
      'call',
      [requestData['session'],
      [
        ['print.loadJobFromSpooler', parseInt(requestData['jobid'])],
        ['scan.saveActiveSetFileOptions'],
        ['print.setParam', 'copies_file', requestData['copies_file']],
        ['print.setParam', 'medium', requestData['medium']],
        ['print.setParam', 'mediasource', requestData['mediasource']],
        ['print.setParam', 'auto_cropping', String(requestData['auto_cropping'])],
        ['print.setParam', 'rotation', requestData['rotation']],
        ['print.setParam', 'rotate_to_orientation', requestData['rotate_to_orientation']],
        ['print.setParam', 'roll_placement', requestData['roll_placement']],
        ['print.setParam', 'stampoption', requestData['stampoption']],
        ['print.setParam', 'jobinfo1', requestData['baseId'] != null ? requestData['baseId'] : requestData['jobid']],
        ['print.startSet', 0],
        ['print_admin.cancelJob', parseInt(requestData['jobid'])]
      ]])
      .catch(err => console.log(err))
      .then(response => console.log(response))
  }

}

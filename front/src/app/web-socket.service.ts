import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  socket: any;
  readonly uri: string = 'http://localhost:3002';

  constructor() {
    this.socket = io(this.uri);
  }

  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: string) => {
        subscriber.next(data);
      });
    });
  }

  emit(eventName: string, data: string) {
    this.socket.emit(eventName, data);
  }
}

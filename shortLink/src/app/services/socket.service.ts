import { computed, inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private authService = inject(AuthService);

  private socket: Socket;
  private userId = computed(() => this.authService.user()?._id);

  constructor() {
    this.socket = io(environment.apiUrl);

    this.socket.on('connect', () => {
      console.log('✅ Connected to backend socket:', this.socket.id);
    });

    this.socket.on('join-room', () => console.log('room has been joined'));

    this.socket.on('disconnect', () => {
      console.warn('Socket disconnected');
    });

    this.socket.on('message', (msg) => {
      console.log('📩 Received message:', msg);
    });

    this.socket.on('subscription-updated', () => {
      
    });
  }

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }

  joinRoom() {
    this.socket.emit('join-room', this.userId());
  }
}

import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Observable, Subject, take } from 'rxjs';

export interface PaymentSuccessEvent {
  userId: string;
  subscriptionId: string;
  productId: string;
  message: string;
}

export interface PaymentFailedEvent {
  userId: string;
  subscriptionId?: string;
  message: string;
}

export interface SubscriptionUpdatedEvent {
  userId: string;
  eventType: string;
  subscriptionId?: string;
  productId?: string;
}

export interface LinksUpdatedEvent {
  type: 'expired' | 'deleted';
  linkIds: string[];
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private authService = inject(AuthService);

  private socket: Socket;
  private userId = computed(() => this.authService.user()?._id);
  private isConnected = signal(false);
  private hasJoinedRoom = signal(false);

  // Subjects for payment events
  private paymentSuccessSubject = new Subject<PaymentSuccessEvent>();
  private paymentFailedSubject = new Subject<PaymentFailedEvent>();
  private subscriptionUpdatedSubject = new Subject<SubscriptionUpdatedEvent>();
  private linksUpdatedSubject = new Subject<LinksUpdatedEvent>();

  // Observables for components to subscribe to
  public paymentSuccess$ = this.paymentSuccessSubject.asObservable();
  public paymentFailed$ = this.paymentFailedSubject.asObservable();
  public subscriptionUpdated$ = this.subscriptionUpdatedSubject.asObservable();
  public linksUpdated$ = this.linksUpdatedSubject.asObservable();

  constructor() {
    this.socket = io(environment.apiUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to backend socket:', this.socket.id);
      this.isConnected.set(true);

      // Re-join room on reconnect if we have a userId
      if (this.userId() && !this.hasJoinedRoom()) {
        this.joinRoom();
      }
    });

    this.socket.on('disconnect', () => {
      console.warn('⚠️ Socket disconnected');
      this.isConnected.set(false);
      this.hasJoinedRoom.set(false);
    });

    this.socket.on('room-joined', (data) => {
      console.log('✅ Successfully joined room:', data.roomId);
      this.hasJoinedRoom.set(true);
    });

    this.socket.on('subscription-updated', (data: SubscriptionUpdatedEvent) => {
      console.log('📩 Subscription updated:', data);
      this.subscriptionUpdatedSubject.next(data);
      this.authService.refreshUser().pipe(take(1)).subscribe();
    });

    this.socket.on('payment-success', (data: PaymentSuccessEvent) => {
      console.log('✅ Payment success:', data);
      this.paymentSuccessSubject.next(data);
      this.authService.refreshUser().pipe(take(1)).subscribe();
    });

    this.socket.on('payment-failed', (data: PaymentFailedEvent) => {
      console.error('❌ Payment failed:', data);
      this.paymentFailedSubject.next(data);
    });

    this.socket.on('links:updated', (data: LinksUpdatedEvent) => {
      console.log('🔗 Links updated via cron:', data);
      this.linksUpdatedSubject.next(data);
    });

    // When user logs out (userId becomes null), disconnect the socket.
    // Socket.IO automatically removes the socket from all rooms on disconnect.
    effect(() => {
      const userId = this.userId();
      if (!userId && untracked(() => this.hasJoinedRoom())) {
        this.socket.disconnect();
      }
    });
  }

  joinRoom() {
    const userId = this.userId();

    if (!userId) {
      console.warn('⚠️ Cannot join room: userId is not available');
      return;
    }

    if (this.hasJoinedRoom()) {
      return;
    }

    if (!this.isConnected()) {
      // Reconnect if socket was explicitly disconnected (e.g. after logout)
      if (!this.socket.connected) {
        this.socket.connect();
      }
      // Will join the room once the 'connect' event fires
      return;
    }

    console.log('🚀 Joining room:', userId);
    this.socket.emit('join-room', userId);
  }

  // Call this when user logs in or is loaded
  initializeUserRoom() {
    if (this.isConnected() && this.userId() && !this.hasJoinedRoom()) {
      this.joinRoom();
    }
  }
}

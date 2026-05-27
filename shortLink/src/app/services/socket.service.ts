import { computed, effect, inject, Injectable, PLATFORM_ID, signal, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);

  private socket: Socket | null = null;
  private userId = computed(() => this.authService.user()?._id);
  private isConnected = signal(false);
  private hasJoinedRoom = signal(false);

  private paymentSuccessSubject = new Subject<PaymentSuccessEvent>();
  private paymentFailedSubject = new Subject<PaymentFailedEvent>();
  private subscriptionUpdatedSubject = new Subject<SubscriptionUpdatedEvent>();
  private linksUpdatedSubject = new Subject<LinksUpdatedEvent>();

  public paymentSuccess$ = this.paymentSuccessSubject.asObservable();
  public paymentFailed$ = this.paymentFailedSubject.asObservable();
  public subscriptionUpdated$ = this.subscriptionUpdatedSubject.asObservable();
  public linksUpdated$ = this.linksUpdatedSubject.asObservable();

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.socket = io(environment.apiUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to backend socket:', this.socket!.id);
      this.isConnected.set(true);

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

    effect(() => {
      const userId = this.userId();
      if (!userId && untracked(() => this.hasJoinedRoom())) {
        this.socket?.disconnect();
      }
    });
  }

  joinRoom() {
    if (!this.socket) return;

    const userId = this.userId();

    if (!userId) {
      console.warn('⚠️ Cannot join room: userId is not available');
      return;
    }

    if (this.hasJoinedRoom()) return;

    if (!this.isConnected()) {
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return;
    }

    console.log('🚀 Joining room:', userId);
    this.socket.emit('join-room', userId);
  }

  initializeUserRoom() {
    if (this.isConnected() && this.userId() && !this.hasJoinedRoom()) {
      this.joinRoom();
    }
  }
}

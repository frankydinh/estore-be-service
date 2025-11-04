import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../common/interfaces';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: JwtPayload;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocketGateway');
  private clients: Map<string, AuthenticatedSocket> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  handleConnection(client: AuthenticatedSocket): void {
    const token =
      (client.handshake.auth.token as string | undefined) ||
      client.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      this.logger.warn(
        `Client ${client.id} attempted to connect without token`,
      );
      void client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET') || '',
      });

      client.data.user = payload;
      this.clients.set(client.id, client);

      this.logger.log(
        `Client connected: ${client.id} (User: ${payload.email})`,
      );

      // Join user to their personal room
      void client.join(`user_${payload.sub}`);
    } catch (error) {
      this.logger.error(`Authentication error for client ${client.id}:`, error);
      void client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.clients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): { event: string; data: string } {
    void client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'joinedRoom', data: room };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): { event: string; data: string } {
    void client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    return { event: 'leftRoom', data: room };
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { room: string; message: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): { event: string; data: string } {
    const user = client.data.user;
    if (user) {
      this.server.to(data.room).emit('message', {
        user: user.email,
        message: data.message,
        timestamp: new Date(),
      });
    }
    return { event: 'messageSent', data: 'Message sent successfully' };
  }

  // Method to send order updates to specific user
  sendOrderUpdate(userId: number, orderData: unknown): void {
    this.server.to(`user_${userId}`).emit('orderUpdate', orderData);
    this.logger.log(`Order update sent to user ${userId}`);
  }

  // Method to broadcast system notifications
  broadcastNotification(message: string): void {
    this.server.emit('notification', {
      message,
      timestamp: new Date(),
    });
    this.logger.log(`Broadcast notification: ${message}`);
  }
}

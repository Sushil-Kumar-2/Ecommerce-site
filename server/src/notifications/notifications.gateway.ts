import { Logger, UnauthorizedException } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { NotificationDocument } from './schemas/notification.schema';

export interface NotificationSocketPayload {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  metadata: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        throw new UnauthorizedException('Missing auth token');
      }

      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const userId = payload.sub;

      client.data.userId = userId;
      await client.join(`user:${userId}`);

      this.logger.debug(`Socket connected: userId=${userId} id=${client.id}`);
    } catch {
      this.logger.warn(`Socket rejected: id=${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    const userId = client.data.userId as string | undefined;
    this.logger.debug(
      `Socket disconnected: userId=${userId ?? 'unknown'} id=${client.id}`,
    );
  }

  emitToUser(
    userId: string,
    notification: NotificationDocument,
    unreadCount: number,
  ): void {
    if (!this.server) {
      return;
    }

    this.server.to(`user:${userId}`).emit('notification', {
      notification: this.toPayload(notification),
      unreadCount,
    });
  }

  emitUnreadCount(userId: string, unreadCount: number): void {
    if (!this.server) {
      return;
    }

    this.server.to(`user:${userId}`).emit('unread_count', { unreadCount });
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token as string | undefined;
    if (authToken) {
      return authToken.replace(/^Bearer\s+/i, '');
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) {
      return queryToken.replace(/^Bearer\s+/i, '');
    }

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string') {
      return header.replace(/^Bearer\s+/i, '');
    }

    return undefined;
  }

  private toPayload(
    notification: NotificationDocument,
  ): NotificationSocketPayload {
    const doc = notification as NotificationDocument & {
      createdAt?: Date;
      updatedAt?: Date;
    };

    return {
      _id: notification._id.toString(),
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      referenceId: notification.referenceId,
      referenceType: notification.referenceType,
      metadata: notification.metadata ?? {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

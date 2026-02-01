import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TransformedOrder } from './orders.service';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OrdersGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitNewOrder(order: TransformedOrder) {
    this.server.emit('order:new', order);
  }

  emitOrderUpdated(order: TransformedOrder) {
    this.server.emit('order:updated', order);
  }

  emitOrderPicked(order: TransformedOrder) {
    this.server.emit('order:picked', order);
  }

  emitOrderRecovered(order: TransformedOrder) {
    this.server.emit('order:recovered', order);
  }
}

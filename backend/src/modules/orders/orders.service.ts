import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, MoreThan } from 'typeorm';
import { Order, Item } from './entities';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStateDto } from './dto';
import { OrderState } from '../../common/enums';

export interface TransformedItem {
  id: string;
  name: string;
  quantity: number;
  price: {
    amount: number;
    currency: string;
  };
}

export interface TransformedOrder {
  id: string;
  state: OrderState;
  riderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: TransformedItem[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  private transformOrder(order: Order): TransformedOrder {
    return {
      id: order.id,
      state: order.state,
      riderId: order.riderId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: {
          amount: Number(item.priceAmount),
          currency: item.priceCurrency,
        },
      })),
    };
  }

  async create(createOrderDto: CreateOrderDto): Promise<TransformedOrder> {
    const order = this.orderRepository.create({
      state: OrderState.PENDING,
      items: createOrderDto.items.map((item) => ({
        name: item.name,
        priceAmount: item.priceAmount,
        priceCurrency: item.priceCurrency || 'EUR',
        quantity: item.quantity || 1,
      })),
    });
    const savedOrder = await this.orderRepository.save(order);
    return this.transformOrder(savedOrder);
  }

  async findAll(): Promise<TransformedOrder[]> {
    const orders = await this.orderRepository.find({
      where: { state: Not(OrderState.DELIVERED) },
      order: { createdAt: 'ASC' },
    });
    return orders.map((order) => this.transformOrder(order));
  }

  async findOne(id: string): Promise<TransformedOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return this.transformOrder(order);
  }

  async updateState(
    id: string,
    updateOrderStateDto: UpdateOrderStateDto,
  ): Promise<TransformedOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    order.state = updateOrderStateDto.state;
    const savedOrder = await this.orderRepository.save(order);
    return this.transformOrder(savedOrder);
  }

  async pickup(id: string, riderId: string): Promise<TransformedOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    order.state = OrderState.DELIVERED;
    order.riderId = riderId;
    const savedOrder = await this.orderRepository.save(order);
    return this.transformOrder(savedOrder);
  }

  async findHistory(hours: number = 2): Promise<TransformedOrder[]> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const orders = await this.orderRepository.find({
      where: {
        state: OrderState.DELIVERED,
        updatedAt: MoreThan(cutoffTime),
      },
      order: { updatedAt: 'DESC' },
    });
    return orders.map((order) => this.transformOrder(order));
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<TransformedOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    // Only allow editing PENDING or IN_PROGRESS orders
    if (order.state !== OrderState.PENDING && order.state !== OrderState.IN_PROGRESS) {
      throw new BadRequestException(
        `Only PENDING or IN_PROGRESS orders can be edited. Current state: ${order.state}`,
      );
    }

    // Delete existing items
    await this.itemRepository.delete({ orderId: id });

    // Create new items
    const newItems = updateOrderDto.items.map((item) => {
      return this.itemRepository.create({
        name: item.name,
        priceAmount: item.priceAmount,
        priceCurrency: item.priceCurrency || 'EUR',
        quantity: item.quantity || 1,
        orderId: id,
      });
    });

    // Save new items
    await this.itemRepository.save(newItems);

    // Reload order with new items
    const updatedOrder = await this.orderRepository.findOne({ where: { id } });
    return this.transformOrder(updatedOrder!);
  }

  async recover(id: string): Promise<TransformedOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    if (order.state !== OrderState.DELIVERED) {
      throw new BadRequestException(
        `Only DELIVERED orders can be recovered. Current state: ${order.state}`,
      );
    }
    order.state = OrderState.PENDING;
    order.riderId = null;
    const savedOrder = await this.orderRepository.save(order);
    return this.transformOrder(savedOrder);
  }
}

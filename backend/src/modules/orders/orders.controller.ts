import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStateDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    this.ordersGateway.emitNewOrder(order);
    return order;
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('history')
  findHistory() {
    return this.ordersService.findHistory();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const order = await this.ordersService.update(id, updateOrderDto);
    this.ordersGateway.emitOrderUpdated(order);
    return order;
  }

  @Patch(':id/state')
  async updateState(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStateDto: UpdateOrderStateDto,
  ) {
    const order = await this.ordersService.updateState(id, updateOrderStateDto);
    this.ordersGateway.emitOrderUpdated(order);
    return order;
  }

  @Post(':id/pickup')
  async pickup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('riderId') riderId: string,
  ) {
    const order = await this.ordersService.pickup(id, riderId);
    this.ordersGateway.emitOrderPicked(order);
    return order;
  }

  @Post(':id/recover')
  async recover(@Param('id', ParseUUIDPipe) id: string) {
    const order = await this.ordersService.recover(id);
    this.ordersGateway.emitOrderRecovered(order);
    return order;
  }

  @Post(':id/photo-evidence')
  async addPhotoEvidence(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('photoEvidence') photoEvidence: string,
  ) {
    const order = await this.ordersService.addPhotoEvidence(id, photoEvidence);
    this.ordersGateway.emitPhotoAdded(order);
    return order;
  }
}

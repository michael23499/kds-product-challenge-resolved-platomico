import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order, Item } from './entities';
import { OrderState } from '../../common/enums';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: jest.Mocked<Repository<Order>>;
  let itemRepository: jest.Mocked<Repository<Item>>;

  const mockOrder: Order = {
    id: 'test-uuid-123',
    state: OrderState.PENDING,
    riderId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'item-uuid-1',
        name: 'Hamburguesa',
        priceAmount: 10.99,
        priceCurrency: 'EUR',
        quantity: 2,
        orderId: 'test-uuid-123',
        order: {} as Order,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Item),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    itemRepository = module.get(getRepositoryToken(Item));
  });

  describe('create', () => {
    it('should create an order with items', async () => {
      const createOrderDto = {
        items: [
          { name: 'Hamburguesa', priceAmount: 10.99, quantity: 2 },
        ],
      };

      orderRepository.create.mockReturnValue(mockOrder);
      orderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      expect(orderRepository.create).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(mockOrder.id);
      expect(result.state).toBe(OrderState.PENDING);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].price.amount).toBe(10.99);
    });
  });

  describe('findAll', () => {
    it('should return orders excluding DELIVERED', async () => {
      orderRepository.find.mockResolvedValue([mockOrder]);

      const result = await service.findAll();

      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { state: expect.anything() },
        order: { createdAt: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne('test-uuid-123');

      expect(result.id).toBe('test-uuid-123');
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateState', () => {
    it('should update order state', async () => {
      const updatedOrder = { ...mockOrder, state: OrderState.IN_PROGRESS };
      orderRepository.findOne.mockResolvedValue(mockOrder);
      orderRepository.save.mockResolvedValue(updatedOrder);

      const result = await service.updateState('test-uuid-123', {
        state: OrderState.IN_PROGRESS,
      });

      expect(result.state).toBe(OrderState.IN_PROGRESS);
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateState('invalid-id', { state: OrderState.IN_PROGRESS }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('pickup', () => {
    it('should mark order as DELIVERED with riderId', async () => {
      const readyOrder = { ...mockOrder, state: OrderState.READY };
      const deliveredOrder = {
        ...readyOrder,
        state: OrderState.DELIVERED,
        riderId: 'rider-123',
      };

      orderRepository.findOne.mockResolvedValue(readyOrder);
      orderRepository.save.mockResolvedValue(deliveredOrder);

      const result = await service.pickup('test-uuid-123', 'rider-123');

      expect(result.state).toBe(OrderState.DELIVERED);
      expect(result.riderId).toBe('rider-123');
    });
  });

  describe('recover', () => {
    it('should recover DELIVERED order to PENDING', async () => {
      const deliveredOrder = {
        ...mockOrder,
        state: OrderState.DELIVERED,
        riderId: 'rider-123',
      };
      const recoveredOrder = {
        ...deliveredOrder,
        state: OrderState.PENDING,
        riderId: null,
      };

      orderRepository.findOne.mockResolvedValue(deliveredOrder);
      orderRepository.save.mockResolvedValue(recoveredOrder);

      const result = await service.recover('test-uuid-123');

      expect(result.state).toBe(OrderState.PENDING);
      expect(result.riderId).toBeNull();
    });

    it('should throw BadRequestException if order is not DELIVERED', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);

      await expect(service.recover('test-uuid-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update order items', async () => {
      const updateDto = {
        items: [{ name: 'Pizza', priceAmount: 15.99, quantity: 1 }],
      };

      const updatedOrder = {
        ...mockOrder,
        items: [
          {
            id: 'new-item-1',
            name: 'Pizza',
            priceAmount: 15.99,
            priceCurrency: 'EUR',
            quantity: 1,
            orderId: mockOrder.id,
            order: {} as Order,
          },
        ],
      };

      orderRepository.findOne
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(updatedOrder);
      itemRepository.delete.mockResolvedValue({ affected: 1, raw: {} });
      itemRepository.create.mockReturnValue(updatedOrder.items[0]);
      itemRepository.save.mockResolvedValue(updatedOrder.items);

      const result = await service.update('test-uuid-123', updateDto);

      expect(itemRepository.delete).toHaveBeenCalledWith({
        orderId: 'test-uuid-123',
      });
      expect(result.items[0].name).toBe('Pizza');
    });

    it('should throw BadRequestException if order is READY', async () => {
      const readyOrder = { ...mockOrder, state: OrderState.READY };
      orderRepository.findOne.mockResolvedValue(readyOrder);

      await expect(
        service.update('test-uuid-123', { items: [] }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

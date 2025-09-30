import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { PaymentService } from '../payment/payment.service';
import { mockProduct1, mockProduct2 } from './mocks/products.mock';
import { mockAddress } from './mocks/address.mock';
import { mockCart } from './mocks/cart.mock';
import { mockOrderId, mockStatus, mockUpdatedOrder } from './mocks/update.order.mock';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { mockOrder } from './mocks/order.mock';
import { mockOrderById } from './mocks/order.mock.by-id';

describe('OrderService', () => {
  let orderService: OrderService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    }
  }

  const mockProductsService = {
    findOne: jest.fn()
  }

  const mockPaymentServiceService = {
    getOrderIdFromSession: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: ProductsService,
          useValue: mockProductsService
        },
        {
          provide: PaymentService,
          useValue: mockPaymentServiceService
        }
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(orderService).toBeDefined();
  });

  describe('createOrder', () => {

    const mockOrder = { id: 999 };

    it('deve criar um pedido e retornar o ID do pedido', async () => {
      // Mock dos produtos
      mockProductsService.findOne
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);

      // Mock da criação do pedido
      mockPrismaService.order.create.mockResolvedValueOnce(mockOrder);

      const result = await orderService.createOrder({
        userId: 1,
        address: mockAddress,
        shippingCost: 5,
        shippingDays: 3,
        cart: mockCart
      });

      expect(mockProductsService.findOne).toHaveBeenCalledTimes(2);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(2);

      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          total: 45, // 10*2 + 20*1 + 5
          shippingCost: 5,
          shippingDays: 3,
          shippingZipcode: mockAddress.zipcode,
          shippingStreet: mockAddress.street,
          shippingNumber: mockAddress.number,
          shippingCity: mockAddress.city,
          shippingState: mockAddress.state,
          shippingCountry: mockAddress.country,
          shippingComplement: mockAddress.complement,
          orderItem: {
            create: [
              {
                productId: 1,
                quantity: 2,
                price: 10,
              },
              {
                productId: 2,
                quantity: 1,
                price: 20,
              }
            ],
          },
        },
      });

      expect(result).toEqual(999);
    });

    it('deve retornar null se o pedido não for criado', async () => {
      // Mock dos produtos
      mockProductsService.findOne
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);

      // Simular falha na criação
      mockPrismaService.order.create.mockResolvedValueOnce(null);

      const result = await orderService.createOrder({
        userId: 1,
        address: mockAddress,
        shippingCost: 5,
        shippingDays: 3,
        cart: mockCart
      });

      expect(result).toBeNull();
    });
  });

  describe('updateOrderStatus', () => {
    it('deve atualizar o status do pedido', async () => {
      
      mockPrismaService.order.update.mockResolvedValueOnce(mockUpdatedOrder);

      const result = await orderService.updateOrderStatus(mockOrderId, mockStatus);

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: { status: mockStatus }
      });

      expect(result).toEqual(mockUpdatedOrder);
    });
  });

  describe('orderSession', () => {
    it('deve retornar o orderId quando encontrado', async () => {
      const mockSessionId = 'sess_123';
      const mockOrderId = 42;

      mockPaymentServiceService.getOrderIdFromSession.mockResolvedValueOnce(mockOrderId);

      const result = await orderService.orderSession(mockSessionId);

      expect(mockPaymentServiceService.getOrderIdFromSession).toHaveBeenCalledWith(mockSessionId);
      expect(result).toEqual({ orderId: mockOrderId });
    });

    it('deve lançar BadRequestException se orderId não for encontrado', async () => {
      const mockSessionId = 'sess_456';

      mockPaymentServiceService.getOrderIdFromSession.mockResolvedValueOnce(null);

      await expect(orderService.orderSession(mockSessionId)).rejects.toThrow(BadRequestException);
      await expect(orderService.orderSession(mockSessionId)).rejects.toThrow('Erro ao buscar pedido pelo sessionId');
    });
  });

  describe('getUserOrders', () => {
    it('deve retornar os pedidos do usuário', async () => {
      const mockUserId = 1;
      const mockOrders = mockOrder;

      mockPrismaService.order.findMany.mockResolvedValueOnce(mockOrders);

      const result = await orderService.getUserOrders(mockUserId);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      expect(result).toEqual(mockOrders);
    });

    it('deve lançar UnauthorizedException se userId não for fornecido', async () => {
      await expect(orderService.getUserOrders(null as any)).rejects.toThrow(UnauthorizedException);
      await expect(orderService.getUserOrders(undefined as any)).rejects.toThrow('Acesso negado');
    });
  });

  describe('getOrderById', () => {
    
    const mockUserId = 10;
    const mockOrder = mockOrderById;

    it('deve retornar um pedido formatado corretamente', async () => {
      mockPrismaService.order.findFirst.mockResolvedValueOnce(mockOrder);

      const result = await orderService.getOrderById(mockOrderId, mockUserId);

      expect(mockPrismaService.order.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockOrderId,
          userId: mockUserId
        },
        select: expect.any(Object), // você pode verificar o objeto completo se quiser
      });

      expect(result).toEqual({
        ...mockOrder,
        orderItem: mockOrder.orderItem.map(item => ({
          ...item,
          product: {
            ...item.product,
            image: 'media/products/image1.jpg',
            images: undefined
          }
        }))
      });
    });

    it('deve lançar BadRequestException se pedido não for encontrado', async () => {
      mockPrismaService.order.findFirst.mockResolvedValueOnce(null);

      await expect(orderService.getOrderById(mockOrderId, mockUserId)).rejects.toThrow(BadRequestException);
      await expect(orderService.getOrderById(mockOrderId, mockUserId)).rejects.toThrow('Pedido não encontrado');
    });
  });
});

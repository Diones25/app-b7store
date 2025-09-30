import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { AuthService } from '../auth/auth.service';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { mockOrder, mockOrderId, mockUserId } from './mocks/order.controller.mock';

jest.mock('../utils/get-absolute-image-url', () => ({
  getAbsoluteImageUrl: jest.fn()
}));

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: OrderService;

  const mockOrderService = {
    getUserOrders: jest.fn(),
    getOrderById: jest.fn(),
    orderSession: jest.fn()
  }

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn()
  }

  class MockAuthGuard {
    canActivate() {
      return true;
    }
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService
        },
        {
          provide: AuthService,
          useValue: mockAuthService
        },
        {
          provide: MockAuthGuard,
          useClass: MockAuthGuard
        }
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(orderController).toBeDefined();
  });

  describe('listOrders', () => {
    it('deve retornar os pedidos do usuário ao chamar listOrders', async () => {
      const mockUserId = 42;

      mockOrderService.getUserOrders.mockResolvedValueOnce(mockOrder);

      const result = await orderController.listOrders(mockUserId);

      expect(orderService.getUserOrders).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockOrder);
    });
  });
 
  describe('listOrder', () => {
    it('deve retornar um pedido com imagens convertidas para URL absoluta', async () => {

      const expectedAbsoluteUrl = 'http://localhost:3000/media/products/image.png';
      (getAbsoluteImageUrl as jest.Mock).mockReturnValue(expectedAbsoluteUrl);
      mockOrderService.getOrderById.mockResolvedValueOnce(mockOrder);

      const result = await orderController.listOrder(mockUserId, { id: mockOrderId });

      expect(orderService.getOrderById).toHaveBeenCalledWith(mockOrderId, mockUserId);
      expect(getAbsoluteImageUrl).toHaveBeenCalledWith('media/products/image.png');
      expect(result).toEqual({
        order: {
          ...mockOrder,
          orderItem: [
            {
              ...mockOrder.orderItem[0],
              product: {
                ...mockOrder.orderItem[0].product,
                image: expectedAbsoluteUrl
              }
            }
          ]
        }
      });
    });
  });

  describe('orderSession', () => {
    it('deve retornar o orderId baseado no sessionId', async () => {
      const sessionId = 'sess_abc123';
      const expectedResponse = { orderId: 42 };

      mockOrderService.orderSession.mockResolvedValueOnce(expectedResponse);

      const result = await orderController.orderSession({ sessionId });

      expect(orderService.orderSession).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(expectedResponse);
    });
  });
});

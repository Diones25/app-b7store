import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { mockCart } from './cart.mock';
import { mockSession } from './session.mock';

describe('StripeService', () => {
  let stripeService: StripeService;

  const mockPrismaService = {
    findOne: jest.fn()
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'fake-stripe-api-key';
      if (key === 'FRONTEND_URL') return 'front-url';
    })
  };

  const mockProductsService = {
    findOne: jest.fn()
  };

  const mockStripeCheckoutCreate = jest.fn();

  // Mock do Stripe
  const mockRetrieve = jest.fn();
  const mockStripeInstance = {
    checkout: {
      sessions: {
        retrieve: mockRetrieve
      }
    }
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: ProductsService,
          useValue: mockProductsService
        }
      ],
    }).compile();

    stripeService = module.get<StripeService>(StripeService);
    // Substitui a instância stripe por um mock
    (stripeService as any).stripe = {
      checkout: {
        sessions: {
          create: mockStripeCheckoutCreate
        }
      }
    };
  });

  it('should be defined', () => {
    expect(stripeService).toBeDefined();
  });

  describe('createStripeCheckoutSession', () => {
    it('deve criar uma sessão de checkout do Stripe corretamente', async () => {

      mockProductsService.findOne.mockImplementation((productId: number) => {
        if (productId === 1) {
          return Promise.resolve({ label: 'Produto A', price: 100 });
        } else if (productId === 2) {
          return Promise.resolve({ label: 'Produto B', price: 50 });
        }
        return null;
      });

      mockStripeCheckoutCreate.mockResolvedValue(mockSession);

      // Act
      const result = await stripeService.createStripeCheckoutSession({
        cart: mockCart,
        shippingCost: 25,
        orderId: 999
      });

      // Assert
      expect(mockProductsService.findOne).toHaveBeenCalledTimes(2);
      expect(mockStripeCheckoutCreate).toHaveBeenCalledWith({
        line_items: [
          {
            price_data: {
              product_data: { name: 'Produto A' },
              currency: 'BRL',
              unit_amount: 10000, // 100 * 100
            },
            quantity: 2
          },
          {
            price_data: {
              product_data: { name: 'Produto B' },
              currency: 'BRL',
              unit_amount: 5000, // 50 * 100
            },
            quantity: 1
          },
          {
            price_data: {
              product_data: { name: 'Frete' },
              currency: 'BRL',
              unit_amount: 2500 // 25 * 100
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        metadata: {
          orderId: '999'
        },
        success_url: 'front-url/cart/sucess?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'front-url/my-orders'
      });

      expect(result).toEqual(mockSession);
    });
  });

  describe('getStripeCheckoutSession', () => {
    let stripeService: StripeService;

    beforeEach(async () => {
      const mockProductsService = { findOne: jest.fn() };
      const mockConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'STRIPE_SECRET_KEY') return 'fake-key';
          if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        })
      };

      // Mocka o construtor do Stripe
      jest.mock('stripe', () => {
        return jest.fn().mockImplementation(() => mockStripeInstance);
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StripeService,
          { provide: ProductsService, useValue: mockProductsService },
          { provide: ConfigService, useValue: mockConfigService }
        ]
      }).compile();

      stripeService = module.get<StripeService>(StripeService);

      // Injeta manualmente o mock no lugar do Stripe real (caso o construtor não tenha funcionado como esperado)
      // Isso depende da forma como `Stripe` está importado e inicializado
      stripeService['stripe'] = mockStripeInstance as any;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('deve chamar stripe.checkout.sessions.retrieve com o session_id correto', async () => {
      const sessionId = 'sess_123';
      const mockSessionData = { id: sessionId, status: 'complete' };

      mockRetrieve.mockResolvedValue(mockSessionData);

      const result = await stripeService.getStripeCheckoutSession(sessionId);

      expect(mockRetrieve).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockSessionData);
    });
  });

});

import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { StripeService } from '../stripe/stripe.service';
import { BadRequestException } from '@nestjs/common';
import { mockSession } from './mocks/session.mock';
import { mockParams } from './mocks/params.mock';

describe('PaymentService', () => {
  let paymentService: PaymentService;

  const mockStripeService = {
    createStripeCheckoutSession: jest.fn(),
    getStripeCheckoutSession: jest.fn()
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: StripeService,
          useValue: mockStripeService
        }
      ],
    }).compile();

    paymentService = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(paymentService).toBeDefined();
  });

  describe('createPaymentLink', () => {

    it('deve retornar a URL do link de pagamento', async () => {      
      mockStripeService.createStripeCheckoutSession.mockResolvedValueOnce(mockSession);

      const result = await paymentService.createPaymentLink(mockParams);

      expect(mockStripeService.createStripeCheckoutSession).toHaveBeenCalledWith(mockParams);
      expect(result).toBe(mockSession.url);
    });

    it('deve retornar null se a URL não estiver presente na sessão', async () => {
      const mockSession = { url: undefined };
      mockStripeService.createStripeCheckoutSession.mockResolvedValueOnce(mockSession);

      const result = await paymentService.createPaymentLink(mockParams);

      expect(result).toBeNull();
    });

    it('deve lançar BadRequestException se ocorrer erro', async () => {
      mockStripeService.createStripeCheckoutSession.mockRejectedValueOnce(new Error('Stripe Error'));

      await expect(paymentService.createPaymentLink(mockParams)).rejects.toThrow(BadRequestException);
      await expect(paymentService.createPaymentLink(mockParams)).rejects.toThrow('Erro ao criar link de pagamento');
    });
  });

  describe('getOrderIdFromSession', () => {

    const sessionId = 'sess_abc123';

    it('deve retornar o orderId como número quando a sessão contém orderId', async () => {
      const mockSession = {
        metadata: {
          orderId: '123'
        },
      };

      mockStripeService.getStripeCheckoutSession.mockResolvedValueOnce(mockSession);

      const result = await paymentService.getOrderIdFromSession(sessionId);

      expect(mockStripeService.getStripeCheckoutSession).toHaveBeenCalledWith(sessionId);
      expect(result).toBe(123);
    });

    it('deve lançar exceção se orderId estiver ausente na sessão', async () => {
      const mockSession = {
        metadata: {}, // orderId ausente
      };

      mockStripeService.getStripeCheckoutSession.mockResolvedValueOnce(mockSession);

      await expect(paymentService.getOrderIdFromSession(sessionId)).rejects.toThrow(BadRequestException);
      await expect(paymentService.getOrderIdFromSession(sessionId)).rejects.toThrow('Erro ao buscar orderId da sessão');
    });

    it('deve lançar exceção se a chamada ao Stripe falhar', async () => {
      mockStripeService.getStripeCheckoutSession.mockRejectedValueOnce(new Error('Stripe failed'));

      await expect(paymentService.getOrderIdFromSession(sessionId)).rejects.toThrow(BadRequestException);
      await expect(paymentService.getOrderIdFromSession(sessionId)).rejects.toThrow('Erro ao buscar orderId da sessão');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { OrderService } from '../order/order.service';
import { ConfigService } from '@nestjs/config';
import { mockEventBase } from './mocks/event-base.mock';
import { BadRequestException, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { mockEvent } from './mocks/event.mock';

describe('WebhookService', () => {
  let webhookService: WebhookService;
  const mockUpdateOrderStatus = jest.fn();
  let stripeMock: Partial<Stripe>;

  const mockOrderService = {
    updateOrderStatus: mockUpdateOrderStatus,
  };

  const mockOrderServiceUpdate = {
    updateOrderStatus: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'fake-stripe-api-key';
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: OrderService,
          useValue: mockOrderService
        },
        {
          provide: OrderService,
          useValue: mockOrderServiceUpdate
        },
      ],
    }).compile();

    webhookService = module.get<WebhookService>(WebhookService);
    // Sobrescreve o stripe.webhooks.constructEvent com um mock
    webhookService['stripe'] = {
      webhooks: {
        constructEvent: jest.fn()
      }
    } as unknown as Stripe;

    // Mock dos logs, para não poluir os testes
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
  });

  it('should be defined', () => {
    expect(webhookService).toBeDefined();
  });


  describe('tripeWebhook', () => {

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WebhookService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: OrderService, useValue: mockOrderService }
        ]
      }).compile();

      webhookService = module.get<WebhookService>(WebhookService);

      // Mocka o método constructEvent da própria service
      jest.spyOn(webhookService, 'constuctEvent');
      mockUpdateOrderStatus.mockReset();
    });

    it.each([
      ['checkout.session.completed', 'paid'],
      ['checkout.session.async_payment_succeeded', 'paid'],
      ['checkout.session.expired', 'cancelled'],
      ['checkout.session.async_payment_failed', 'cancelled']
    ])('deve lidar com evento %s e atualizar status para %s', async (eventType, expectedStatus) => {
      const mockEvent = {
        ...mockEventBase,
        type: eventType,
      };

      (webhookService.constuctEvent as jest.Mock).mockResolvedValue(mockEvent);

      await webhookService.stripeWebhook('raw-body', 'sig', 'whsec_x');

      expect(webhookService.constuctEvent).toHaveBeenCalledWith('raw-body', 'sig', 'whsec_x');
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith(123, expectedStatus);
    });

    it('não deve chamar updateOrderStatus se constuctEvent retornar null', async () => {
      (webhookService.constuctEvent as jest.Mock).mockResolvedValue(null);

      await webhookService.stripeWebhook('raw-body', 'sig', 'whsec_x');

      expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
    });
  });

  describe('constructEvent', () => {
    it('deve retornar evento quando constructEvent funcionar corretamente', async () => {
      (webhookService['stripe'].webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);

      const result = await webhookService.constuctEvent('raw-body', 'sig', 'secret');

      expect(result).toEqual(mockEvent);
      expect(webhookService['stripe'].webhooks.constructEvent).toHaveBeenCalledWith('raw-body', 'sig', 'secret');
    });

    it('deve lançar BadRequestException quando constructEvent lançar erro', async () => {
      (webhookService['stripe'].webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Stripe error');
      });

      await expect(
        webhookService.constuctEvent('raw-body', 'sig', 'secret')
      ).rejects.toThrow(BadRequestException);

      expect(webhookService['stripe'].webhooks.constructEvent).toHaveBeenCalledWith('raw-body', 'sig', 'secret');
    });
  });
});

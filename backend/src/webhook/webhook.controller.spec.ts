import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { getStripeWebhookSecret } from '../utils/get-stripe-webhook-secret';
import { Request } from 'express';

jest.mock('../utils/get-stripe-webhook-secret', () => ({
  getStripeWebhookSecret: jest.fn(() => 'mock-webhook-secret'),
}));

describe('WebhookController', () => {
  let webhookController: WebhookController;
  let webhookService: WebhookService;

  const mockWebhookService = {
    stripeWebhook: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: WebhookService,
          useValue: mockWebhookService
        }
      ]
    }).compile();

    webhookController = module.get<WebhookController>(WebhookController);
    webhookService = module.get<WebhookService>(WebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(webhookController).toBeDefined();
  });

  describe('handleWebhook', () => {

    it('deve chamar stripeWebhook com os dados corretos e retornar resultado', async () => {
      const mockReq = {
        body: 'raw-body-data'
      } as unknown as Request;

      const mockSignature = 'stripe-signature';
      const mockResult = { success: true };

      mockWebhookService.stripeWebhook.mockResolvedValue(mockResult);

      const result = await webhookController.handleWebhook(mockReq, mockSignature);

      expect(getStripeWebhookSecret).toHaveBeenCalled();
      expect(webhookService.stripeWebhook).toHaveBeenCalledWith('raw-body-data', 'stripe-signature', 'mock-webhook-secret');
      expect(result).toEqual(mockResult);
    });
  });
});

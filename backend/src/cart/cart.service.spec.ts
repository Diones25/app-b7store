import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { ProductsService } from '../products/products.service';
import { UserService } from '../user/user.service';
import { OrderService } from '../order/order.service';
import { PaymentService } from '../payment/payment.service';
import { ConfigService } from '@nestjs/config';
import { mockProducts } from './mocks/products.mock';
import { productMock } from './mocks/product.mock';
import { productArrayMock } from './mocks/product.array.mock';
import { productArrayObjMock } from './mocks/product.array.obj.mock';
import { BadRequestException } from '@nestjs/common';
import { mockShippingData } from './mocks/shipping.data.mock';
import { mockBody } from './mocks/body.mock';
import { mockAddress } from './mocks/address.mock';
import { cartFinishDto } from './mocks/cartfinish.mock';
import { userAddressMock } from './mocks/user.address.mock';
import { cartMock } from './mocks/cart.mock';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CartService', () => {
  let cartService: CartService;

  jest.mock('../utils/get-absolute-image-url', () => ({
    getAbsoluteImageUrl: jest.fn((path) => `http://localhost:3001/${path}`),
  }));

  const mockProductService = {
    findOne: jest.fn()
  };

  const mockUserService = {
    getAddressById: jest.fn()
  };

  const mockOrderService = {
    createOrder: jest.fn()
  };

  const mockPaymentService = {
    createPaymentLink: jest.fn()
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'MELHOR_ENVIO_API_KEY') return 'fake-api-key';
      if (key === 'EMAIL_USER_AGENT') return 'fake-user-agent';
    })
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: ProductsService,
          useValue: mockProductService
        },
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: OrderService,
          useValue: mockOrderService
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(cartService).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar produtos formatados para IDs fornecidos', async () => {
      mockProductService.findOne
        .mockResolvedValueOnce(mockProducts[0])
        .mockResolvedValueOnce(mockProducts[1]);

      const result = await cartService.findAll([1, 2]);

      expect(result).toEqual(productArrayObjMock);

      expect(mockProductService.findOne).toHaveBeenCalledTimes(2);
      expect(mockProductService.findOne).toHaveBeenCalledWith(1);
      expect(mockProductService.findOne).toHaveBeenCalledWith(2);
    });

    it('deve pular produtos nulos retornados pelo findOne', async () => {
      mockProductService.findOne
        .mockResolvedValueOnce(null) // Produto não encontrado
        .mockResolvedValueOnce(productMock);

      const result = await cartService.findAll([1, 2]);

      expect(result).toEqual(productArrayMock);

      expect(mockProductService.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('getShipping', () => {
    it('deve retornar dados de envio da API', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockShippingData });

      const result = await cartService.getShipping(mockBody);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
        mockBody,
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer fake-api-key',
            'Content-Type': 'application/json',
            'User-Agent': 'Aplicação fake-user-agent',
          },
        }
      );

      expect(result).toEqual(mockShippingData);
    });

    it('should throw BadRequestException when API call fails', async () => {
      const mockError = new Error('Request failed');
      (mockError as any).response = {
        data: { message: 'Invalid request' },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(cartService.getShipping(mockBody)).rejects.toThrow(BadRequestException);
      await expect(cartService.getShipping(mockBody)).rejects.toThrow('Erro ao buscar dados de frete');
    });
  });

  describe('finish', () => {
    const userId = 1;
    const orderId = 123;
    it('deve finalizar o pedido e retornar o link de pagamento', async () => {
      mockUserService.getAddressById.mockResolvedValue(mockAddress);
      mockOrderService.createOrder.mockResolvedValue(orderId); 
      mockPaymentService.createPaymentLink.mockResolvedValue('http://payment-link.com');

      const result = await cartService.finish(userId, cartFinishDto);

      expect(mockUserService.getAddressById).toHaveBeenCalledWith(userId, cartFinishDto.addressId);
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(userAddressMock);
      expect(mockPaymentService.createPaymentLink).toHaveBeenCalledWith(cartMock);

      expect(result).toEqual({ urlPayment: 'http://payment-link.com' });
    });

    it('deve lançar exceção se endereço não for encontrado', async () => {
      mockUserService.getAddressById.mockResolvedValue(null);

      await expect(cartService.finish(userId, cartFinishDto))
        .rejects
        .toThrow(BadRequestException);

      await expect(cartService.finish(userId, cartFinishDto))
        .rejects
        .toThrow('Endereço não encontrado');

      expect(mockOrderService.createOrder).not.toHaveBeenCalled();
      expect(mockPaymentService.createPaymentLink).not.toHaveBeenCalled();
    });

    it('deve lançar exceção se o pedido não for criado', async () => {
      mockUserService.getAddressById.mockResolvedValue(mockAddress);
      mockOrderService.createOrder.mockResolvedValue(null); // simulate failure

      await expect(cartService.finish(userId, cartFinishDto))
        .rejects
        .toThrow(BadRequestException);

      await expect(cartService.finish(userId, cartFinishDto))
        .rejects
        .toThrow('Erro ao criar pedido');

      expect(mockPaymentService.createPaymentLink).not.toHaveBeenCalled();
    });
  });

});

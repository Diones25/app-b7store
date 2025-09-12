import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { CalcularFreteDto } from './dto/calcular-frete.dto';
import { CartFinishDto } from './dto/cart-finish.dto';

describe('CartController', () => {
  let cartController: CartController;

  const mockCartService = {
    getShipping: jest.fn(),
    findAll: jest.fn(),
    finish: jest.fn()
  }

  const mockUserService = {
    findAdresses: jest.fn(),
    findOne: jest.fn(),
    createAdress: jest.fn()
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
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService
        },
        {
          provide: UserService,
          useValue: mockUserService  
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
    }).compile();

    cartController = module.get<CartController>(CartController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(cartController).toBeDefined();
  });

  it('Buscar frete', async () => {
    const body: CalcularFreteDto = {
      from: {
        postal_code: "12345678"
      },
      to: {
        postal_code: "87654321"
      },
      package: {
        height: 10,
        width: 15,
        length: 20,
        weight: 2
      }
    }
    await cartController.getShipping(body);
    expect(mockCartService.getShipping).toHaveBeenCalledTimes(1);
    expect(mockCartService.getShipping).toHaveBeenCalledWith(body);
  });

  it('Retornando os dados do carrinho', async () => {
    const ids: number[] = [1,2,3,4];
    const body = { ids };
    await cartController.findAll(body);
    expect(mockCartService.findAll).toHaveBeenCalledTimes(1);
    expect(mockCartService.findAll).toHaveBeenCalledWith(ids);
  });

  it('Retornando um pedido', async () => {
    const cartItem = {
      productId: 1,
      quantity: 2
    }

    const body: CartFinishDto = {
      cart: [cartItem],
      addressId: 1
    }

    const userId = 1
    
    await cartController.finish(userId, body);
    expect(mockCartService.finish).toHaveBeenCalledTimes(1);
    expect(mockCartService.finish).toHaveBeenCalledWith(userId,body);
  });
});

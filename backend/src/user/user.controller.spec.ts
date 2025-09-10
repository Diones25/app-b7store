import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthService } from "../auth/auth.service";
import { CreateAdresseUserDto } from "./dto/create-adress-user.dto";

describe('UserController', () => {
  let userController: UserController;

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
      controllers: [UserController],
      providers: [
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

    userController = module.get<UserController>(UserController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('Criar endereço', async () => {
    const body: CreateAdresseUserDto = {
      zipcode: '62320005',
      street: 'Rua de teste',
      number: '123',
      city: 'Tianguá',
      state: 'Ceará',
      country: 'Brasil',
      complement: 'Complemento de teste'
    }
    const userId = 1;
    await userController.createAdresses(userId, body);
    expect(mockUserService.createAdress).toHaveBeenCalledTimes(1);
    expect(mockUserService.createAdress).toHaveBeenCalledWith(userId, body);
  });

  it('Buscando um usuário', async () => {
    const id = 1;
    await userController.findOne(id);
    expect(mockUserService.findOne).toHaveBeenCalledTimes(1);
    expect(mockUserService.findOne).toHaveBeenCalledWith(id);
  });

  it('Buscando um endereço', async () => {
    const userId = 1;
    await userController.findAdresses(userId);
    expect(mockUserService.findAdresses).toHaveBeenCalledTimes(1);
    expect(mockUserService.findAdresses).toHaveBeenCalledWith(userId);
  });

});
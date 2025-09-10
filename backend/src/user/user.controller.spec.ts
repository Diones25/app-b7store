import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthService } from "../auth/auth.service";

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

});
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLoginDTO } from './dto/auth-login.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';

describe('AuthController', () => {
  let authcontroller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ],
    }).compile();

    authcontroller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authcontroller).toBeDefined();
  });

  it('Login', async () => {
    const body: AuthLoginDTO = {
      email: '62320005',
      password: '1234'
    }
    await authcontroller.login(body);
    expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    expect(mockAuthService.login).toHaveBeenCalledWith(body.email, body.password);
  });

  it('Register', async () => {
    const body: AuthRegisterDTO = {
      name: 'Teste',
      email: '62320005',
      password: '1234'
    }
    await authcontroller.register(body);
    expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    expect(mockAuthService.register).toHaveBeenCalledWith(body);
  });
});

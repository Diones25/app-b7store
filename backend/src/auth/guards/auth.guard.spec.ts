import { AuthGuard } from './auth.guard';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { ExecutionContext } from '@nestjs/common';
import { mockRequest } from './mocks/request.mock';
import { decodedToken } from './mocks/token.decoded.mock';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  const mockAuthService = {
    checkToken: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockContext: Partial<ExecutionContext> = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    authGuard = new AuthGuard(
      mockAuthService as any,
      mockUserService as any
    );
  });

  it('deve retornar verdadeiro e anexar usuário e tokenPayload para solicitar se o token for válido', async () => {
    mockAuthService.checkToken.mockResolvedValue(decodedToken);
    mockUserService.findOne.mockResolvedValue(userMock);

    const result = await authGuard.canActivate(mockContext as ExecutionContext);

    expect(result).toBe(true);
    expect(mockAuthService.checkToken).toHaveBeenCalledWith('valid.token');
    expect(mockUserService.findOne).toHaveBeenCalledWith(decodedToken.id);
    expect(mockRequest.tokenPayload).toEqual(decodedToken);
    expect(mockRequest.user).toEqual(userMock);
  });

  it('deve retornar falso se checkToken gerar erro', async () => {
    mockAuthService.checkToken.mockRejectedValue(new Error('Invalid token'));

    const result = await authGuard.canActivate(mockContext as ExecutionContext);

    expect(result).toBe(false);
    expect(mockAuthService.checkToken).toHaveBeenCalledWith('valid.token');
  });

  it('deve retornar falso se userService.findOne gerar erro', async () => {
    const decodedToken = { id: 1 };

    mockAuthService.checkToken.mockResolvedValue(decodedToken);
    mockUserService.findOne.mockRejectedValue(new Error('User not found'));

    const result = await authGuard.canActivate(mockContext as ExecutionContext);

    expect(result).toBe(false);
    expect(mockAuthService.checkToken).toHaveBeenCalledWith('valid.token');
    expect(mockUserService.findOne).toHaveBeenCalledWith(decodedToken.id);
  });
});

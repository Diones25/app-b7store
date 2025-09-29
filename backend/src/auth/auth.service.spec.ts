import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { mockUser } from './mocks/user.mock';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { mockDecoded } from './mocks/token.decoded.mock';
import { mockToken } from './mocks/token.mock';
import * as bcrypt from 'bcrypt';
import { mockPassword } from './mocks/password.mock';
import { mockUserData } from './mocks/user.data.mock';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authservice: AuthService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn()
    }
  }

  const mockUserService = {
    create: jest.fn()
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ],
    }).compile();

    authservice = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authservice).toBeDefined();
  });

  describe('createToken', () => {
    it('deve retornar um token de acesso válido', async () => {
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authservice.createToken(mockUser as any);

      expect(result).toEqual({
        accessToken: mockToken
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email
        },
        {
          expiresIn: '7d',
          subject: mockUser.id.toString()
        }
      );
    });
  });

  describe('checkToken', () => {
    it('deve retornar dados decodificados se o token for válido', async () => {
      mockJwtService.verify.mockReturnValue(mockDecoded);

      const result = await authservice.checkToken(mockToken);

      expect(result).toEqual(mockDecoded);
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken);
    });

    it('deve lançar BadRequestException se o token for inválido', async () => {
      const mockError = new Error('Invalid token');

      mockJwtService.verify.mockImplementation(() => {
        throw mockError;
      });

      await expect(authservice.checkToken(mockToken)).rejects.toThrow(BadRequestException);
      await expect(authservice.checkToken(mockToken)).rejects.toThrow(
        JSON.stringify(mockError.message)
      );
    });
  });

  describe('login', () => {

    beforeEach(() => {
      jest.clearAllMocks(); // limpa mocks a cada teste
    });

    it('deve retornar accessToken quando as credenciais forem válidas', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authservice.login(mockUser.email, mockPassword);

      expect(result).toEqual({ accessToken: mockToken });
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: mockUser.email
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(authservice.login(mockUser.email, mockPassword)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException se a senha for inválida', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authservice.login(mockUser.email, mockPassword)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockUser.password);
    });
  });

  describe('register', () => {
    const createdUser = {
      id: 1,
      ...mockUserData,
    };

    beforeEach(() => {
      jest.clearAllMocks(); // limpar os mocks antes de cada teste
    });

    it('deve retornar accessToken quando o usuário for criado com sucesso', async () => {
      mockUserService.create.mockResolvedValue(createdUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authservice.register(mockUserData);

      expect(mockUserService.create).toHaveBeenCalledWith(mockUserData);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: createdUser.id
        },
      });
      expect(result).toEqual({ accessToken: mockToken });
    });

    it('deve lançar BadRequestException se o usuário não for encontrado após a criação', async () => {
      mockUserService.create.mockResolvedValue(createdUser);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authservice.register(mockUserData)).rejects.toThrow(BadRequestException);
      expect(mockUserService.create).toHaveBeenCalledWith(mockUserData);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: createdUser.id
        },
      });
    });
  });
});

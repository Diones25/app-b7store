import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpException } from '@nestjs/common';
import * as bcrypt from "bcrypt";

//O código abaixo serve para mockar o bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn()
}));


describe('UserService', () => {
  let userService: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    }
  }
  

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('Create', () => {

    it('E-mail ja cadastrado', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Jhon',
        email: 'jhon@gmail.com',
        password: '12345'
      }

      mockPrismaService.user.findUnique.mockReturnValueOnce(createUserDto);
      await userService.create(createUserDto).catch((error) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error).toHaveProperty('message', 'E-mail ja cadastrado');
      })

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: createUserDto.email
        }
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(0)
    });

    it('Criar usuário', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Jhon',
        email: 'jhon@gmail.com',
        password: '12345'
      }

      // Simula que o usuário ainda não existe
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      // Simula a criação do usuário
      mockPrismaService.user.create.mockResolvedValueOnce({
        id: 1,
        name: 'Jhon',
        email: 'jhon@gmail.com',
        password: 'hashed_password'
      });

      // Se você estiver usando bcrypt.hash, precisa mockar também
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_password');

      const result = await userService.create(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1)
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email.toLowerCase(),
          password: 'hashed_password'
        }
      });

      // Valida o retorno da função
      expect(result).toEqual({
        id: 1,
        name: 'Jhon',
        email: 'jhon@gmail.com'
      });
    });


  });
});

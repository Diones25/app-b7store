import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpException, NotFoundException } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import { CreateAdresseUserDto } from './dto/create-adress-user.dto';

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
    },
    userAddress: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

  describe('Buscar um usuário', () => {
    it('findOne - deve retornar o usuário quando existe', async () => {
      const userId = 1;
      const mockUser = {
        id: 1,
        name: 'Jhon',
        email: 'jhon@gmail.com',
        password: 'hashed_password'
      };

      // Mock: usuário existe
      mockPrismaService.user.count.mockResolvedValueOnce(1);

      // Mock: retorno do findUnique
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await userService.findOne(userId);
      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: { id: userId }
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId }
      });

      expect(result).toEqual(mockUser);
    });

    it('findOne - deve lançar NotFoundException quando usuário não existe', async () => {
      const userId = 999;

      // Mock: usuário não existe
      mockPrismaService.user.count.mockResolvedValueOnce(0);

      await expect(userService.findOne(userId)).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: { id: userId }
      });

      // O método findUnique nunca deve ser chamado nesse caso
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('createAdress', () => {
    it('createAdress - Deve criando um novo endereço para o usuário', async () => {
      const userId = 1; 
      const createAdresseUserDto: CreateAdresseUserDto = {
        zipcode: '62320005',
        street: 'Rua de teste',
        number: '12345',
        city: 'Tianguá',
        state: 'Ceará',
        country: 'Brasil',
        complement: 'Complemento de teste'
      }

      mockPrismaService.userAddress.create.mockResolvedValueOnce({
        id: 2,
        userId: 1,
        zipcode: "62320-000",
        street: "Stree teste",
        number: "123",
        city: "Tianguá",
        state: "Ceará",
        country: "Brasil",
        complement: "Apt 1",
        createdAt: "2025-09-16T01:46:44.811Z",
        updatedAt: "2025-09-16T01:46:44.811Z"
      });

      const result = await userService.createAdress(userId, createAdresseUserDto);

      expect(mockPrismaService.userAddress.create).toHaveBeenCalledTimes(1)
      expect(mockPrismaService.userAddress.create).toHaveBeenCalledWith({
        data: {
          ...createAdresseUserDto,
          userId
        }
      });

      // Valida o retorno da função
      expect(result).toEqual({
        id: 2,
        userId: 1,
        zipcode: "62320-000",
        street: "Stree teste",
        number: "123",
        city: "Tianguá",
        state: "Ceará",
        country: "Brasil",
        complement: "Apt 1",
        createdAt: "2025-09-16T01:46:44.811Z",
        updatedAt: "2025-09-16T01:46:44.811Z"
      });
    });
  });
});

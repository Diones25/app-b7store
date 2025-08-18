import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      findUnique: jest.fn(),
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks(); //Limpa os mocks antes de cada teste
  });

  describe('findOne', () => {
    it('deve retornar a categoria se ela existir', async () => {
      const mockCategory = { id: 1, name: 'Categoria Teste', slug: 'categoria-teste' };

      // Primeiro mock: categoryNotFound
      // Segundo mock: finOne (que também usa findUnique)
      (prismaService.category.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockCategory) // mock para categoryNotFound
        .mockResolvedValueOnce(mockCategory); // mock para findOne

      const result = await service.findOne(1);

      expect(result).toEqual(mockCategory);
      expect(prismaService.category.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true, name: true, slug: true }
      });
    });

    it('deve lançar NotFoundException se a categoria não existir', () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValueOnce(null);

      expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(prismaService.category.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});

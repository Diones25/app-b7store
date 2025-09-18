import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { mockCategory } from './mocks/mockCategory';
import { mockMetadata } from './mocks/mockMetadata';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      findUnique: jest.fn(),
      findFirst: jest.fn()
    },
    categoryMetadata: {
      findMany: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('findOne', () => {
    it('deve retornar a categoria se ela existir', async () => {
      const id = 1;
      // Primeiro mock: categoryNotFound
      // Segundo mock: finOne (que também usa findUnique)
      (prismaService.category.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockCategory) // mock para categoryNotFound
        .mockResolvedValueOnce(mockCategory); // mock para findOne

      const result = await categoryService.findOne(id);

      expect(result).toEqual(mockCategory);
      expect(prismaService.category.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: {
          id: id
        },
        select: {
          id: true,
          name: true,
          slug: true
        }
      });
    });

    it('deve lançar NotFoundException se a categoria não existir', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(categoryService.findOne(999)).rejects.toThrow(NotFoundException);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(prismaService.category.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findCategorySlug', () => {
    const id = 1;
    const slug = 'categoria-teste';

    it('findCategorySlug - Deve retornar a categoria se o slug existir', async () => { 

      // Mock do método chamado dentro de categorySlugNotFound
      (prismaService.category.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockCategory);

      // Mock do método chamado diretamente por findCategorySlug
      (prismaService.category.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockCategory);

      const result = await categoryService.findCategorySlug(slug);

      expect(result).toEqual(mockCategory);
      // Valida chamadas
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { slug }
      });
      expect(prismaService.category.findFirst).toHaveBeenCalledWith({
        where: { 
          slug
        },
        select: {
          id: true,
          name: true,
          slug: true
        }
      });
    });

    it('Deve lançar NotFoundException se a categoria com slug não existir', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(categoryService.findCategorySlug(slug)).rejects.toThrow(NotFoundException);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({ where: { slug: slug } });
      expect(prismaService.category.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('categoryMetadata', () => {
    const id = 1;

    it('deve retornar os metadados da categoria', async () => {

      // Mock do método categoryNotFound que usa findUnique
      (prismaService.category.findUnique as jest.Mock).mockResolvedValueOnce(mockCategory);

      // Mock do findMany para retornar os metadados
      (prismaService.categoryMetadata.findMany as jest.Mock).mockResolvedValueOnce(mockMetadata);

      const result = await categoryService.findMetadata(id);

      expect(result).toEqual(mockMetadata);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prismaService.categoryMetadata.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: id
        },
        select: {
          id: true,
          name: true,
          values: {
            select: {
              id: true,
              label: true
            }
          }
        }
      });
    });

    it('deve lançar NotFoundException se a categoria não existir', async () => {
      (prismaService.categoryMetadata.findMany as jest.Mock).mockResolvedValueOnce(null);

      await expect(categoryService.findMetadata(id)).rejects.toThrow(NotFoundException);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prismaService.category.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from '../category/category.service';
import { Productfilter } from '../types/product-filter';
import { mockProducts } from './mocks/products.mock';
import { mockProduct } from './mocks/product.mock';
import { mockCategory } from './mocks/category.mock';
import { relatedProducts } from './mocks/related-products.mock';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let prismaService: PrismaService;
  let categoryService: CategoryService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }

  const mockCategoryService = {
    findOne: jest.fn(),
    categoryNotFound: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: CategoryService,
          useValue: mockCategoryService
        }
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(productsService).toBeDefined();
  });

  describe('findAll', () => {

    it('deve buscar produtos com filtros básicos e retornar produtos formatados', async () => {
      const filters: Productfilter = {
        orderBy: 'views',
        limit: 2,
        metadata: undefined
      };

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await productsService.findAll(filters);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          label: true,
          price: true,
          images: {
            take: 1,
            orderBy: { id: 'asc' }
          }
        },
        where: {},
        orderBy: { viewsCount: 'desc' },
        take: 2
      });

      expect(result).toEqual([
        {
          id: 1,
          label: 'Produto A',
          price: 100,
          image: 'media/products/image-a.jpg',
          images: undefined
        },
        {
          id: 2,
          label: 'Produto B',
          price: 200,
          image: null,
          images: undefined
        }
      ]);
    });

    it('deve aplicar filtros de metadados corretamente', async () => {
      const filters = {
        orderBy: 'price',
        metadata: {
          '1': '10|20', // categoryMetadataId: metadataValueId list
          '2': '30'
        }
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);

      await productsService.findAll(filters);

      expect(prismaService.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          AND: [
            {
              metadata: {
                some: {
                  categoryMetadataId: '1',
                  metadataValueId: { in: ['10', '20'] }
                }
              }
            },
            {
              metadata: {
                some: {
                  categoryMetadataId: '2',
                  metadataValueId: { in: ['30'] }
                }
              }
            }
          ]
        },
        orderBy: { price: 'asc' },
      }));
    });

    it('deve usar orderBy padrão (viewsCount) quando orderBy for desconhecido', async () => {
      const filters = {
        orderBy: 'inexistente'
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);

      await productsService.findAll(filters);

      expect(prismaService.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: { viewsCount: 'desc' }
      }));
    });
  });

  describe('findOne', () => {
    it('deve retornar um produto com imagens formatadas e categoria', async () => {
      jest.spyOn(productsService, 'productNotFound').mockResolvedValue({
        id: 1,
        label: 'Produto Teste',
        price: 100,
        description: 'Descrição do produto',
        categoryId: 2,
        viewsCount: 0,
        salesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      jest.spyOn(productsService, 'incrementProductView').mockResolvedValue(undefined);

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockCategoryService.findOne.mockResolvedValue(mockCategory);

      const result = await productsService.findOne(1);

      expect(productsService.productNotFound).toHaveBeenCalledWith(1);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1
        },
        select: {
          id: true,
          label: true,
          price: true,
          description: true,
          categoryId: true,
          images: true
        }
      });
      expect(categoryService.findOne).toHaveBeenCalledWith(2);
      expect(productsService.incrementProductView).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        ...mockProduct,
        images: ['media/products/img1.jpg', 'media/products/img2.jpg'],
        category: mockCategory
      });
    });

    it('deve retornar null se produto não for encontrado após passar por productNotFound', async () => {
      jest.spyOn(productsService, 'productNotFound').mockResolvedValue({
        id: 99,
        label: 'Produto Inexistente',
        price: 0,
        description: '',
        categoryId: 0,
        viewsCount: 0,
        salesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      const result = await productsService.findOne(99);

      expect(result).toBeNull();
      expect(productsService.productNotFound).toHaveBeenCalledWith(99);
    });
  });

  describe('findRelated', () => {
    it('deve retornar produtos relacionados com imagem formatada', async () => {
      const productId = 1;
      const categoryId = 5;

      // Mocks
      mockCategoryService.categoryNotFound.mockResolvedValue(undefined);
      mockPrismaService.product.findUnique.mockResolvedValue({ categoryId });
      mockPrismaService.product.findMany.mockResolvedValue(relatedProducts);

      const result = await productsService.findRelated(productId, 4);

      expect(categoryService.categoryNotFound).toHaveBeenCalledWith(productId);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        select: { categoryId: true }
      });
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          categoryId,
          id: { not: productId }
        },
        select: {
          id: true,
          label: true,
          price: true,
          images: {
            take: 1,
            orderBy: { id: 'asc' }
          }
        },
        take: 4,
        orderBy: { viewsCount: 'desc' }
      });

      expect(result).toEqual([
        {
          id: 2,
          label: 'Produto 2',
          price: 200,
          image: 'media/products/img2.jpg',
          images: undefined
        },
        {
          id: 3,
          label: 'Produto 3',
          price: 300,
          image: null,
          images: undefined
        }
      ]);
    });

    it('deve retornar [] se o produto não existir', async () => {
      mockCategoryService.categoryNotFound.mockResolvedValue(undefined);
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      const result = await productsService.findRelated(999);

      expect(result).toEqual([]);
      expect(prismaService.product.findMany).not.toHaveBeenCalled();
    });

    it('deve chamar categoryNotFound e lançar erro se categoria for inválida', async () => {
      mockCategoryService.categoryNotFound.mockRejectedValue(new Error('Categoria não encontrada'));

      await expect(productsService.findRelated(123)).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('productNotFound', () => {
    it('deve retornar o produto se ele existir', async () => {
      const mockProduct = { id: 1, label: 'Produto 1' };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await productsService.productNotFound(1);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar NotFoundException se o produto não existir', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      const loggerWarnSpy = jest.spyOn(productsService['logger'], 'warn').mockImplementation();

      await expect(productsService.productNotFound(999)).rejects.toThrow(NotFoundException);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(loggerWarnSpy).toHaveBeenCalledWith('Produto com id 999 não encontrado.');
    });
  });

  describe('incrementProductView', () => {
    it('deve chamar prisma.product.update com os parâmetros corretos', async () => {
      const id = 1;

      mockPrismaService.product.update.mockResolvedValue({}); 

      await productsService.incrementProductView(id);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          viewsCount: {
            increment: 1
          }
        }
      });
    });
  });
});

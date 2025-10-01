import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { mockProducts } from './mocks/product-findall.mock';
import { query } from './mocks/query-controller.mock';

jest.mock('../utils/get-absolute-image-url', () => ({
  getAbsoluteImageUrl: jest.fn((path: string) => `http://localhost:3001/${path}`),
}));

describe('ProductsController', () => {
  let productController: ProductsController;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findRelated: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService
        }
      ]
    }).compile();

    productController = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar produtos com imagem formatada e liked false', async () => {
      mockProductsService.findAll.mockResolvedValue(mockProducts);

      const result = await productController.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        limit: 2,
        orderBy: 'views',
        metadata: { 1: '10|20' }
      });

      expect(result).toEqual([
        {
          ...mockProducts[0],
          image: getAbsoluteImageUrl(mockProducts[0].image as any),
          liked: false
        },
        {
          ...mockProducts[1],
          image: null,
          liked: false
        }
      ]);
    });
  });

  describe('findOne', () => {
    it('deve retornar produto com imagens absolutas se encontrado', async () => {
      const params = { id: '5' };

      const mockProduct = {
        id: 5,
        label: 'Produto Teste',
        price: 100,
        images: ['media/products/img1.jpg', 'media/products/img2.jpg'],
        description: 'Descrição',
        category: {}
      };

      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await productController.findOne(params);

      expect(mockProductsService.findOne).toHaveBeenCalledWith(5);
      expect(result).toEqual({
        ...mockProduct,
        images: mockProduct.images.map(img => getAbsoluteImageUrl(img))
      });
    });

    it('deve retornar null se produto não for encontrado', async () => {
      const params = { id: '999' };

      mockProductsService.findOne.mockResolvedValue(null);

      const result = await productController.findOne(params);

      expect(mockProductsService.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('findRelated', () => {
    it('deve retornar produtos relacionados com imagem absoluta e liked false', async () => {
      const params = { id: '3' };
      const query = { limit: '2' };

      const mockRelatedProducts = [
        { id: 1, label: 'Produto 1', image: 'media/products/img1.jpg' },
        { id: 2, label: 'Produto 2', image: null }
      ];

      mockProductsService.findRelated.mockResolvedValue(mockRelatedProducts);

      const result = await productController.findRelated(params, query);

      expect(mockProductsService.findRelated).toHaveBeenCalledWith(3, 2);
      expect(result).toEqual([
        {
          id: 1,
          label: 'Produto 1',
          image: 'http://localhost:3001/media/products/img1.jpg',
          liked: false
        },
        {
          id: 2,
          label: 'Produto 2',
          image: null,
          liked: false
        }
      ]);
    });

    it('deve funcionar sem query.limit (limit undefined)', async () => {
      const params = { id: '5' };
      const query = {}; // sem limit

      const mockRelatedProducts = [
        { id: 9, label: 'Produto X', image: 'media/products/x.jpg' }
      ];

      mockProductsService.findRelated.mockResolvedValue(mockRelatedProducts);

      const result = await productController.findRelated(params, query);

      expect(mockProductsService.findRelated).toHaveBeenCalledWith(5, undefined);
      expect(result).toEqual([
        {
          id: 9,
          label: 'Produto X',
          image: 'http://localhost:3001/media/products/x.jpg',
          liked: false
        }
      ]);
    });
  });

});

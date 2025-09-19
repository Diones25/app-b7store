import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { mockCategory } from './mocks/mockCategory';
import { mockMetadata } from './mocks/mockMetadata';

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let categoryService: CategoryService;

  const mockCategoryService = {
    findCategorySlug: jest.fn(),
    findMetadata: jest.fn()
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService
        }
      ],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(categoryController).toBeDefined();
  });

  it('deve retornar categoria e metadados quando o slug existir', async () => {
    mockCategoryService.findCategorySlug.mockResolvedValueOnce(mockCategory);
    mockCategoryService.findMetadata.mockResolvedValueOnce(mockMetadata);

    const result = await categoryController.findMetadata({ slug: 'categoria-teste' });

    expect(categoryService.findCategorySlug).toHaveBeenCalledWith('categoria-teste');
    expect(categoryService.findMetadata).toHaveBeenCalledWith(mockCategory.id);
    expect(result).toEqual({
      category: mockCategory,
      metadata: mockMetadata
    });
  });

  it('deve retornar null se a categoria não for encontrada', async () => {
    mockCategoryService.findCategorySlug.mockResolvedValueOnce(null);

    const result = await categoryController.findMetadata({ slug: 'inexistente' });

    expect(categoryService.findCategorySlug).toHaveBeenCalledWith('inexistente');
    expect(categoryService.findMetadata).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

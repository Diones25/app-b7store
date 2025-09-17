import { Test, TestingModule } from '@nestjs/testing';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { mockBanners } from './mocks/mockBanners';
import { mockBannersWithAbsoluteUrl } from './mocks/mockBannersWithAbsoluteUrl';

// 👇 Mockando a função externa
jest.mock('../utils/get-absolute-image-url', () => ({
  getAbsoluteImageUrl: jest.fn()
}));

describe('BannersController', () => {
  let controller: BannersController;
  let bannersService: BannersService;

  const mockBannersService = {
    findAll: jest.fn().mockResolvedValue(mockBanners)
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannersController],
      providers: [
        {
          provide: BannersService,
          useValue: mockBannersService
        }
      ]
    }).compile();

    controller = module.get<BannersController>(BannersController);
    bannersService = module.get<BannersService>(BannersService);
  });

  describe('findAll', () => {
    it('findAll - Deve retornar uma lista banners com URLs absolutas', async () => {
      // 👇 Mocka a função utilitária externa
      (getAbsoluteImageUrl as jest.Mock).mockImplementation((path: string) => {
        return `https://cdn.site.com/${path}`;
      });

      const result = await controller.findAll();

      expect(bannersService.findAll).toHaveBeenCalledTimes(1);
      expect(getAbsoluteImageUrl).toHaveBeenCalledTimes(mockBanners.length);
      expect(result).toEqual(mockBannersWithAbsoluteUrl);
    });
  });
});

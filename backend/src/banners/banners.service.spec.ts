import { Test, TestingModule } from '@nestjs/testing';
import { BannersService } from './banners.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BannersService', () => {
  let bannersService: BannersService;

  const mockPrismaService = {
    banner: {
      findMany: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile();

    bannersService = module.get<BannersService>(BannersService);
  });

  it('should be defined', () => {
    expect(bannersService).toBeDefined();
  });
});

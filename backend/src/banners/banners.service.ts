import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BannersService {

  constructor(
    private readonly prisma: PrismaService
  ) {}
  
  private readonly logger = new Logger(BannersService.name);

  async create() {

  }

  async findAll() {
    const banners = await this.prisma.banner.findMany({
      select: {
        img: true,
        link: true
      }
    });
    this.logger.log('Buscando todos os banners');
    return banners.map(banner => ({
      ...banner,
      img: `media/banners/${banner.img}`
    }));
  }
}

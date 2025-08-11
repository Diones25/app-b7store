import { Controller, Get } from '@nestjs/common';
import { BannersService } from './banners.service';
import { getAbsoluteImageUrl } from 'src/utils/get-absolute-image-url';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }
  
  @Get()
  async findAll() {
    const banners = this.bannersService.findAll();

    const bannerWithAbsoluteUrl = (await banners).map(banner => ({
      ...banner,
      img: getAbsoluteImageUrl(banner.img)
    }));  

    return bannerWithAbsoluteUrl;
  }
}

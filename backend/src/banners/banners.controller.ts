import { Controller, Get } from '@nestjs/common';
import { BannersService } from './banners.service';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }
  
  @Get()
  @ApiOperation({
    summary: 'Listar banners',
    description: 'Retorna uma lista de banners cadastrados no sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Banners encontrados com sucesso',
    example: [
      {
        "img": "http://localhost:3001/media/banners/banner_promo_1.jpg",
        "link": "/categories/camisas"
      },
      {
        "img": "http://localhost:3001/media/banners/banner_promo_2.jpg",
        "link": "/categories/algo"
      }
    ]
  })
  async findAll() {
    const banners = this.bannersService.findAll();

    const bannerWithAbsoluteUrl = (await banners).map(banner => ({
      ...banner,
      img: getAbsoluteImageUrl(banner.img)
    }));  

    return bannerWithAbsoluteUrl;
  }
}

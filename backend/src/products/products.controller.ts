import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsQueryDto } from './dto/products-query-dto';
import { ProductsService } from './products.service';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { ProductIdParamDto } from './dto/productId-param-dto';
import { ProductIdParamRelatedDto } from './dto/productId-param-related-dto';
import { ProductsQueryRelatedDto } from './dto/products-query-related-dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('products')
export class ProductsController {

  constructor(
    private readonly productsService: ProductsService
  ) { }

  @Get()
  @ApiOperation({
    summary: 'Listar produtos',
    description: 'Retorna uma lista de produtos cadastrados no sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos encontrados com sucesso',
    example: [
      {
        "id": 1,
        "label": "Camisa PHP",
        "price": 69.9,
        "image": "http://localhost:3001/media/products/product_1_2.jpg",
        "liked": false
      },
      {
        "id": 3,
        "label": "Camisa React",
        "price": 94.5,
        "image": "http://localhost:3001/media/products/product_3_1.jpg",
        "liked": false
      },
    ]
  })
  async findAll(@Query() query: ProductsQueryDto) {
    const parsedLimit = query.limit ? parseInt(query.limit) : undefined;
    const parsedMetadata = query.metadata ? JSON.parse(query.metadata) : undefined;

    const products = await this.productsService.findAll({
      metadata: parsedMetadata,
      orderBy: query.orderBy,
      limit: parsedLimit,
    });

    const productsWithAbsoluteUrl = products.map(product => ({
      ...product,
      image: product.image ? getAbsoluteImageUrl(product.image) : null,
      liked: false // TODO: Once have like funcionallity, fech this.
    }))

    return productsWithAbsoluteUrl;
  }

  @Get(':id')
  async findOne(@Param() params: ProductIdParamDto) {
    const product = await this.productsService.findOne(parseInt(params.id));
    if (!product) return null;
    return {
      ...product,
      images: product.images.map(image => getAbsoluteImageUrl(image))
    }
  }

  @Get(':id/related')
  async findRelated(@Param() params: ProductIdParamRelatedDto, @Query() query: ProductsQueryRelatedDto) {
    const products = await this.productsService.findRelated(parseInt(params.id), query.limit ? parseInt(query.limit) : undefined);

    return products.map(product => ({
      ...product,
      image: product.image ? getAbsoluteImageUrl(product.image) : null,
      liked: false // TODO: Once have like funcionallity, fech this.
    }))
  }
}

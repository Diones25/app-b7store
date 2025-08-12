import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsQueryDto } from './dto/products-query-dto';
import { ProductsService } from './products.service';
import { getAbsoluteImageUrl } from 'src/utils/get-absolute-image-url';
import { ProductIdParamDto } from './dto/productId-param-dto';

@Controller('products')
export class ProductsController {

  constructor(
    private readonly productsService: ProductsService
  ) { }

  @Get()
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
}

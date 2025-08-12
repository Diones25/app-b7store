import { Controller, Get, Query } from '@nestjs/common';
import { GetProductsQueryDto } from './dto/get-products-query-dto';
import { ProductsService } from './products.service';
import { getAbsoluteImageUrl } from 'src/utils/get-absolute-image-url';

@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: GetProductsQueryDto) {
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
}

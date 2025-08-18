import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/types/product';
import { getAbsoluteImageUrl } from 'src/utils/get-absolute-image-url';

@Injectable()
export class CartService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService
  ) {}
  
  private readonly logger = new Logger(CartService.name);

  async findAll(ids: number[]) {
    this.logger.log('Buscando os dados do carrinho');
    
    let products: Product[] = [];
    for (let id of ids) {
      const product = await this.productsService.findOne(id);
      if (product) {
        products.push({
          id: product.id,
          label: product.label,
          price: product.price,
          image: product.images[0] ? getAbsoluteImageUrl(product.images[0]) : null
        });
      }
    }

    return products;
  }
  
  async getShipping(zipcode: string) {
    this.logger.log('Buscando dados de frete');
    return { zipcode, cost: 7, days: 3 };
  }
}

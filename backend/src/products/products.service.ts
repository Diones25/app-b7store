import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Productfilter } from './types/product-filter';

@Injectable()
export class ProductsService {

  constructor(
    private readonly prisma: PrismaService
  ) { }
  
  private readonly logger = new Logger(ProductsService.name);

  async create() {

  }

  async findAll(filters: Productfilter) {
    // Organize Order
    let orderBy = {};
    switch (filters.orderBy) {
      case 'views':
        default:
        orderBy = { viewsCount: 'desc' };
        break;
      case 'selling':
        orderBy = { salesCount: 'desc' };
        break;
      case 'price':
        orderBy = { price: 'asc' };
        break;
    }

    // Organize Metadata
    let where: any = {};
    if (filters.metadata && typeof filters.metadata === 'object') {
      let metaFilters: any = [];
      for (let categoryMetadataId in filters.metadata) {
        const value = filters.metadata[categoryMetadataId];
        if (typeof value !== 'string') continue;
        const valuesIds = value.split('|').map(v => v.trim()).filter(Boolean);
        if (valuesIds.length === 0) continue;

        metaFilters.push({
          metadata: {
            some: {
              categoryMetadataId,
              metadataValueId: {
                in: valuesIds
              }
            }
          }
        });
      }

      if (metaFilters.length > 0) {
        where.AND = metaFilters
      }
    }

    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        label: true,
        price: true,
        images: {
          take: 1,
          orderBy: {
            id: 'asc'
          }
        }
      },
      where,
      orderBy,
      take: filters.limit ?? undefined
    })

    this.logger.log('Buscando todos os produtos');
    
    return products.map(product => ({
      ...product,
      image: product.images[0] ? `media/products/${product.images[0].url}` : null,
      images: undefined
    }));
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Productfilter } from './types/product-filter';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class ProductsService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService
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

  async findOne(id: number) {
    await this.productNotFound(id);
    const product = await this.prisma.product.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        label: true,
        price: true,
        description: true,
        categoryId: true,
        images: true
      }
    });

    if (!product) {
      return null;
    }

    const category = await this.categoryService.findOne(product.categoryId);

    await this.incrementProductView(id);

    this.logger.log(`Buscando produto com id ${id}`);
    
    return {
      ...product,
      images: product.images.length > 0 ? product.images.map(image => `media/products/${image.url}`) : [],
      category
    }
  }


  async productNotFound(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      this.logger.warn(`Produto com id ${id} não encontrado.`);
      throw new NotFoundException(`Produto com id ${id} não encontrado.`);
    }
    return product;
  }

  async incrementProductView(id: number) {
    await this.prisma.product.update({
      where: {
        id: id
      },
      data: {
        viewsCount: {
          increment: 1
        }
      }
    })
  }
}

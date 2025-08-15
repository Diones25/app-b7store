import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {

  constructor(
    private readonly prisma: PrismaService
  ) { }

  private readonly logger = new Logger(CategoryService.name);

  async findAll() { }

  async findOne(id: number) {
    await this.categoryNotFound(id);
    return this.prisma.category.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
  }

  async findCategorySlug(slug: string) {
    await this.categorySlugNotFound(slug);
    return this.prisma.category.findFirst({
      where: {
        slug
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
  }

  async findMetadata(id: number) {
    await this.categoryNotFound(id);
    return this.prisma.categoryMetadata.findMany({
      where: {
        categoryId: id
      },
      select: {
        id: true,
        name: true,
        values: {
          select: {
            id: true,
            label: true
          }
        }
      }
    });
  }

  async categoryNotFound(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      this.logger.warn(`Categoria com id ${id} não encontrado.`);
      throw new NotFoundException(`Categoria com id ${id} não encontrado.`);
    }
    return category;
  }

  async categorySlugNotFound(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) {
      this.logger.warn(`Categoria com slug ${slug} não encontrado.`);
      throw new NotFoundException(`Categoria com slug ${slug} não encontrado.`);
    }
    return category;
  }
}

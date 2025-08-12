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


  async categoryNotFound(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      this.logger.warn(`Categoria com id ${id} não encontrado.`);
      throw new NotFoundException(`Categoria com id ${id} não encontrado.`);
    }
    return category;
  }
}

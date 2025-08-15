import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategorySlugParamDto } from './dto/category-param-slug.dto';

@Controller('category')
export class CategoryController {

  constructor(private readonly categoryService: CategoryService) { }
  
  @Get(':slug/metadata')
  async findMetadata(@Param() params: CategorySlugParamDto) {
    const category = await this.categoryService.findCategorySlug(params.slug);

    if (!category) return null;

    const metadata = await this.categoryService.findMetadata(category.id);
    return {
      category,
      metadata
    };
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategorySlugParamDto } from './dto/category-param-slug.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('category')
export class CategoryController {

  constructor(private readonly categoryService: CategoryService) { }
  
  @Get(':slug/metadata')
  @ApiOperation({
    summary: 'Listar metadados da categoria',
    description: 'Retorna um objeto com os metadados da categoria cadastrados no sistema',
  })
  @ApiParam({ name: 'slug', type: Number, required: true, description: 'Slug da categoria' })
  @ApiResponse({
    status: 200,
    description: 'Metadados encontrados com sucesso',
    example: {
      "category": {
        "id": 1,
        "name": "Camisas",
        "slug": "camisas"
      },
      "metadata": [
        {
          "id": "tech",
          "name": "Tecnologia",
          "values": [
            {
              "id": "node",
              "label": "Node"
            },
            {
              "id": "react",
              "label": "React"
            },
            {
              "id": "php",
              "label": "PHP"
            },
            {
              "id": "python",
              "label": "Python"
            }
          ]
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na validação dos dados',
    example: {
      message: 'slug é obrigatorio',
      error: 'Bad Request',
      statusCode: 400
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Metadados não encontrados',
    example: {
      message: 'Categoria com slug :slug não encontrado.',
      error: 'Not Found',
      statusCode: 404
    }
  })
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

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsQueryDto } from './dto/products-query-dto';
import { ProductsService } from './products.service';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { ProductIdParamDto } from './dto/productId-param-dto';
import { ProductIdParamRelatedDto } from './dto/productId-param-related-dto';
import { ProductsQueryRelatedDto } from './dto/products-query-related-dto';
import { ApiOperation, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';

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
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de produtos a serem retornados' })
  @ApiQuery({ name: 'metadata', required: false, type: String, description: 'Metadados dos produtos' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['views', 'selling', 'price'], description: 'Ordenação dos produtos' })
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
  @ApiOperation({
    summary: 'Listar produto',
    description: 'Retorna um objeto de produtos cadastrados no sistema',
  })
  @ApiParam({ name: 'id', type: Number, required: true, description: 'ID do produto' })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado com sucesso',
    example: {
      "id": 1,
      "label": "Camisa PHP",
      "price": 69.9,
      "description": "Camisa com estampa PHP, para desenvolvedores web",
      "categoryId": 1,
      "images": [
        "http://localhost:3001/media/products/product_1_2.jpg",
        "http://localhost:3001/media/products/product_1_1.jpg"
      ],
      "category": {
        "id": 1,
        "name": "Camisas",
        "slug": "camisas"
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na validação dos dados',
    example: {
      message: 'id deve conter apenas números',
      error: 'Bad Request',
      statusCode: 400
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
    example: {
      message: 'Produto com id 6 não encontrado.',
      error: 'Not Found',
      statusCode: 404
    }
  })
  async findOne(@Param() params: ProductIdParamDto) {
    const product = await this.productsService.findOne(parseInt(params.id));
    if (!product) return null;
    return {
      ...product,
      images: product.images.map(image => getAbsoluteImageUrl(image))
    }
  }

  @Get(':id/related')
  @ApiOperation({
    summary: 'Listar produtos relacionados',
    description: 'Retorna uma lista de produtos relacionados cadastrados no sistema apartir de um id da categoria',
  })
  @ApiParam({ name: 'id', type: Number, required: true, description: 'ID da categoria' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de produtos a serem retornados' })
  @ApiResponse({
    status: 200,
    description: 'Produtos encontrados com sucesso',
    example: [
      {
        "id": 3,
        "label": "Camisa React",
        "price": 94.5,
        "image": "http://localhost:3001/media/products/product_3_1.jpg",
        "liked": false
      },
      {
        "id": 2,
        "label": "Camisa Python",
        "price": 79.99,
        "image": "http://localhost:3001/media/products/product_2_2.jpg",
        "liked": false
      }
    ]
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na validação dos dados',
    example: {
      message: 'id deve conter apenas números',
      error: 'Bad Request',
      statusCode: 400
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada',
    example: {
      message: 'Categoria com id 6 não encontrado.',
      error: 'Not Found',
      statusCode: 404
    }
  })
  async findRelated(@Param() params: ProductIdParamRelatedDto, @Query() query: ProductsQueryRelatedDto) {
    const products = await this.productsService.findRelated(parseInt(params.id), query.limit ? parseInt(query.limit) : undefined);

    return products.map(product => ({
      ...product,
      image: product.image ? getAbsoluteImageUrl(product.image) : null,
      liked: false // TODO: Once have like funcionallity, fech this.
    }))
  }
}

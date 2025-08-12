import { IsEnum, IsOptional, IsString, Matches } from "class-validator";

enum OrderByEnum {
  VIEWS = 'views',
  SELLING = 'selling',
  PRICE = 'price',
}

export class ProductsQueryDto {

  @IsOptional()
  @IsString({ message: 'Deve ser uma string' })
  metadata?: string;

  @IsOptional()
  @IsString({ message: 'Deve ser uma string' })
  @IsEnum(OrderByEnum, { message: 'orderBy deve ser: views, selling ou price' })
  orderBy?: string;

  @IsOptional()
  @IsString({ message: 'Deve ser uma string' })
  @Matches(/^\d+$/, { message: 'limit deve conter apenas números' })
  limit?: string;
}       
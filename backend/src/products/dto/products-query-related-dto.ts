import { IsOptional, IsString, Matches } from "class-validator";

export class ProductsQueryRelatedDto {

  @IsOptional()
  @IsString({ message: 'Deve ser uma string' })
  @Matches(/^\d+$/, { message: 'limit deve conter apenas números' })
  limit?: string;
}       
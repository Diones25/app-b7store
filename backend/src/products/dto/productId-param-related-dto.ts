import { IsNotEmpty, IsString, Matches } from "class-validator";


export class ProductIdParamRelatedDto {

  @IsString({ message: 'Deve ser uma string' })
  @IsNotEmpty({ message: 'id é obrigatorio' })
  @Matches(/^\d+$/, { message: 'id deve conter apenas números' })
  id: string;
}       
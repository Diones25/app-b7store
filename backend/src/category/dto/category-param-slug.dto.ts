
import { IsNotEmpty, IsString } from "class-validator";


export class CategorySlugParamDto {

  @IsString({ message: 'Deve ser uma string' })
  @IsNotEmpty({ message: 'slug é obrigatorio' })
  slug: string;
}   
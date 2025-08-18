import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt } from "class-validator";

export class FindCartDto {

  @IsArray({ message: 'O campo "ids" deve ser um array' })
  @ArrayNotEmpty({ message: 'O array "ids" nao pode ser vazio' })
  @IsInt({ each: true, message: 'Todos os IDs devem ser inteiros' })
  @Type(() => Number) 
  ids: number[];
}
import { IsString, MinLength } from "class-validator";

export class ZipCodeCartDto {

  @IsString({ message: 'O campo "zipcode" deve ser uma string' })
  @MinLength(4, { message: 'O campo "zipcode" deve ter pelo menos 4 caracteres' })
  zipcode: string;
}
import { IsOptional, IsString } from "class-validator";

export class CreateAdresseUserDto {

  @IsString({ message: 'CEP deve ser uma string' })
  zipcode: string;

  @IsString({ message: 'Rua deve ser uma string' })
  street: string;

  @IsString({ message: 'Número deve ser uma string' })
  number: string;

  @IsString({ message: 'Cidade deve ser uma string' })
  city: string;

  @IsString({ message: 'Estado deve ser uma string' })
  state: string;

  @IsString({ message: 'País deve ser uma string' })
  country: string;

  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  complement: string;
}
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {

  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter no minimo 2 caracteres' })
  name: string;

  @IsString({ message: 'Email deve ser uma string' })
  @IsEmail()
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(4, { message: 'Password deve ter no minimo 4 caracteres' })
  password: string;
}
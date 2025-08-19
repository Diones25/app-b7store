import { IsEmail, IsString, IsStrongPassword, MinLength } from "class-validator";

export class AuthLoginDTO {

  @IsString({ message: 'Email deve ser uma string' })
  @IsEmail()
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(4, { message: 'Password deve ter no minimo 4 caracteres' })
  password: string;
}
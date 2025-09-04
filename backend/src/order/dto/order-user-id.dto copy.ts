import { IsString, Matches } from "class-validator";

export class OrderUserIdDto {

  @IsString({ message: 'id deve ser uma string' })
  @Matches(/^\d+$/, { message: 'id deve conter apenas números' })
  id: number
}
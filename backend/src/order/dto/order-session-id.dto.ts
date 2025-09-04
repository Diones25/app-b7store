import { IsString } from "class-validator";

export class OrderSessionIdDto {

  @IsString({ message: 'sessionId deve ser uma string' })
  sessionId: string
}
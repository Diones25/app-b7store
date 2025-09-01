import { Type } from "class-transformer";
import { IsArray, IsInt, Min, ValidateNested } from "class-validator";

export class CartFinishDto {
  @IsArray({ message: 'cart deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cart: CartItemDto[];

  @Type(() => Number) 
  @IsInt({ message: 'O campo AddressId deve ser um número inteiro' })
  AddressId: number;
}

export class CartItemDto {
  @Type(() => Number)
  @IsInt({ message: 'productId deve ser um número inteiro' })
  productId: number;

  @Type(() => Number)
  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser pelo menos 1' })
  quantity: number;
}
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { FindCartDto } from './dto/find-cart.dto';
import { ZipCodeCartDto } from './dto/zipcode-cart.dto';
import { CalcularFreteDto } from './dto/calcular-frete.dto';

@Controller('cart')
export class CartController {

  constructor(private readonly cartService: CartService) { }

  @Post('shipping') 
  getShipping(@Body() body: CalcularFreteDto) {
    return this.cartService.getShipping(body);
  }
  
  @Post('mount')
  findAll(@Body() body: FindCartDto) {
    return this.cartService.findAll(body.ids);
  }
}

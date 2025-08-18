import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { FindCartDto } from './dto/find-cart.dto';
import { ZipCodeCartDto } from './dto/zipcode-cart.dto';

@Controller('cart')
export class CartController {

  constructor(private readonly cartService: CartService) { }

  @Get('shipping') 
  getShipping(@Query() query: ZipCodeCartDto) {
    return this.cartService.getShipping(query.zipcode);
  }
  
  @Post('mount')
  findAll(@Body() body: FindCartDto) {
    return this.cartService.findAll(body.ids);
  }
}

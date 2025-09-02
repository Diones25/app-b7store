import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { FindCartDto } from './dto/find-cart.dto';
import { CalcularFreteDto } from './dto/calcular-frete.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserId } from 'src/decorators/user-id-decorator';
import { CartFinishDto } from './dto/cart-finish.dto';

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

  @UseGuards(AuthGuard)
  @Post('finish')
  finish(@UserId() userId: number, @Body() cartFinishDto: CartFinishDto) {
    return this.cartService.finish(userId, cartFinishDto);
  }
}

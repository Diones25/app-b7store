import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderSessionIdDto } from './dto/order-session-id.dto';
import { UserId } from 'src/decorators/user-id-decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { OrderUserIdDto } from './dto/order-user-id.dto copy';
import { getAbsoluteImageUrl } from 'src/utils/get-absolute-image-url';

@Controller('orders')
export class OrderController {

  constructor(private readonly orderService: OrderService) { }

  @UseGuards(AuthGuard)
  @Get()
  listOrders(@UserId() userId: number) {
    return this.orderService.getUserOrders(userId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async listOrder(@UserId() userId: number, @Param() params: OrderUserIdDto) {
    const order = await this.orderService.getOrderById(params.id, userId);
    const itemsWithAbsoluteUrl = order.orderItem.map(item => ({
      ...item,
      product: {
        ...item.product,
        image: item.product.image ? getAbsoluteImageUrl(item.product.image) : null
      }
    }));

    return {
      order: {
        ...order,
        orderItem: itemsWithAbsoluteUrl
      }
    }
  }
  
  @Get('session')
  orderSession(@Query() query: OrderSessionIdDto) {
    return this.orderService.orderSession(query.sessionId);
  }
}

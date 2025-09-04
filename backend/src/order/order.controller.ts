import { Controller, Get, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderSessionIdDto } from './dto/order-session-id.dto';
import { UserId } from 'src/decorators/user-id-decorator';

@Controller('orders')
export class OrderController {

  constructor(private readonly orderService: OrderService) { }

  @Get()
  listOrders(@UserId() userId: number) {
    return this.orderService.getUserOrders(userId);
  }
  
  @Get('session')
  orderSession(@Query() query: OrderSessionIdDto) {
    return this.orderService.orderSession(query.sessionId);
  }
}

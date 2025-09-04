import { Controller, Get, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderSessionIdDto } from './dto/order-session-id.dto';

@Controller('order')
export class OrderController {

  constructor(private readonly orderService: OrderService) { }
  
  @Get('session')
  orderSession(@Query() query: OrderSessionIdDto) {
    return this.orderService.orderSession(query.sessionId);
  }
}

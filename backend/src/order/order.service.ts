import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderParams } from 'src/types/create-order-params';

@Injectable()
export class OrderService {

  constructor(private readonly prisma: PrismaService) { }
  
  private readonly logger = new Logger(OrderService.name);

  async createOrder({ userId, address, shippingCost, shippingDays, cart }: CreateOrderParams){
    this.logger.log('Criando um novo pedido');
  }
}

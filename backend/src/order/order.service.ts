import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { CreateOrderParams } from 'src/types/create-order-params';
import { OrderItems } from 'src/types/order-items';

@Injectable()
export class OrderService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService
  ) { }
  
  private readonly logger = new Logger(OrderService.name);

  async createOrder({ userId, address, shippingCost, shippingDays, cart }: CreateOrderParams){
    this.logger.log('Criando um novo pedido');

    let total = 0;
    let orderItems: OrderItems = [];

    for (let cartItem of cart) {
      const product = await this.productsService.findOne(cartItem.productId);
      if (product) {
        total += product.price * cartItem.quantity;

        orderItems.push({
          productId: product.id,
          quantity: cartItem.quantity,
          price: product.price
        });
      }
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        shippingCost,
        shippingDays,
        shippingZipcode: address.zipcode,
        shippingStreet: address.street,
        shippingNumber: address.number,
        shippingCity: address.city,
        shippingState: address.state,
        shippingCountry: address.country,
        shippingComplement: address.complement,
        orderItem: {
          create: orderItems
        }
      }
    });

    if (!order) return null;
    return order.id;
  }
}

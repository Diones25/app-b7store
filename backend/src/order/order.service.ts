import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderParams } from '../types/create-order-params';
import { OrderItems } from '../types/order-items';

@Injectable()
export class OrderService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService
  ) { }
  
  private readonly logger = new Logger(OrderService.name);

  async createOrder({ userId, address, shippingCost, shippingDays, cart }: CreateOrderParams){
    this.logger.log('Criando um novo pedido');

    let subtotal = 0;
    let orderItems: OrderItems = [];

    for (let cartItem of cart) {
      const product = await this.productsService.findOne(cartItem.productId);
      if (product) {
        subtotal += product.price * cartItem.quantity;

        orderItems.push({
          productId: product.id,
          quantity: cartItem.quantity,
          price: product.price
        });
      }
    }

    let total = subtotal + shippingCost;

    const order = await this.prisma.order.create({
      data: {
        userId,
        total: total,
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

import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderParams } from '../types/create-order-params';
import { OrderItems } from '../types/order-items';
import { PaymentService } from 'src/payment/payment.service';
import { OrderUserIdDto } from './dto/order-user-id.dto copy';
import { getAbsoluteImageUrl } from 'src/utils/get-absolute-image-url';

@Injectable()
export class OrderService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly paymentService: PaymentService
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

  async updateOrderStatus(orderId: number, status: 'paid' | 'cancelled') {
    this.logger.log('Atualizando o status do pedido');
    return this.prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        status
      }
    });
  }

  async orderSession(session_id: string) {
    this.logger.log('Buscando pedido pelo sessionId');
    const orderId = await this.paymentService.getOrderIdFromSession(session_id);
    if (!orderId) {
      this.logger.error('Erro ao buscar pedido pelo sessionId');
      throw new BadRequestException('Erro ao buscar pedido pelo sessionId');
    }

    return {
      orderId: orderId
    }
  }

  async getUserOrders(userId: number) {
    this.logger.log('Listando os pedidos de um usuário');
    if (!userId) {
      this.logger.error('Acesso negado');
      throw new UnauthorizedException('Acesso negado');
    }
    return this.prisma.order.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getOrderById(id: number, userId: number) {
    this.logger.log('Listando um pedido');
    const order = await this.prisma.order.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId)
      },
      select: {
        id: true,
        status: true,
        total: true,
        shippingCost: true,
        shippingDays: true,
        shippingCity: true,
        shippingComplement: true,
        shippingCountry: true,
        shippingNumber: true,
        shippingState: true,
        shippingStreet: true,
        shippingZipcode: true,
        createdAt: true,
        orderItem: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                label: true,
                price: true,
                images: {
                  take: 1,
                  orderBy: { id: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      this.logger.error('Pedido não encontrado');
      throw new BadRequestException('Pedido não encontrado');
    }

    return {
      ...order,
      orderItem: order.orderItem.map(item => ({
          ...item,
          product: {
            ...item.product,
            image: item.product.images[0] ? `media/products/${item.product.images[0].url}` : null,
            images: undefined
          }
      }))
    }

  }
}

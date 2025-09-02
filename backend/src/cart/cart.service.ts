import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/types/product';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { CalcularFreteDto } from './dto/calcular-frete.dto';
import { CartFinishDto } from './dto/cart-finish.dto';
import { UserService } from 'src/user/user.service';
import { OrderService } from 'src/order/order.service';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class CartService {
  private readonly apiKey: string | undefined;
  private readonly userAgent: string | undefined;
  private readonly apiUrlMelhorEnvio: string = 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate';

  constructor(
    private readonly productsService: ProductsService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService
  ) {
    this.apiKey = this.configService.get<string>('MELHOR_ENVIO_API_KEY');
    this.userAgent = this.configService.get<string>('EMAIL_USER_AGENT');
  }
  
  private readonly logger = new Logger(CartService.name);

  async findAll(ids: number[]) {
    this.logger.log('Buscando os dados do carrinho');
    
    let products: Product[] = [];
    for (let id of ids) {
      const product = await this.productsService.findOne(id);
      if (product) {
        products.push({
          id: product.id,
          label: product.label,
          price: product.price,
          image: product.images[0] ? getAbsoluteImageUrl(product.images[0]) : null
        });
      }
    }

    return products;
  }
  
  async getShipping(body: CalcularFreteDto) {

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${this.apiKey}`, 
      'Content-Type': 'application/json',
      'User-Agent':`Aplicação ${this.userAgent}`
    };

    try {
      this.logger.log('Buscando dados de frete');
      const response = await axios.post(this.apiUrlMelhorEnvio, body, { headers });
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao buscar dados de frete', error);
      throw new BadRequestException(JSON.stringify(error.response?.data) ,'Erro ao buscar dados de frete');
    }

  }

  async finish(userId: number, cartFinishDto: CartFinishDto) {

    const address = await this.userService.getAddressById(userId, cartFinishDto.addressId);
    if (!address) {
      this.logger.error('Endereço não encontrado');
      throw new BadRequestException('Endereço não encontrado');
    }

    const shippingCost = 7;
    const shippingDays = 3;

    const orderId = await this.orderService.createOrder({
      userId,
      address,
      shippingCost,
      shippingDays,
      cart: cartFinishDto.cart
    });

    if (!orderId) {
      this.logger.error('Erro ao criar pedido');
      throw new BadRequestException('Erro ao criar pedido');
    }

    // TODO: Integrar meio de pagamento
    let urlPayment = await this.paymentService.createPaymentLink({
      cart: cartFinishDto.cart,
      shippingCost,
      orderId
    });
    return {
      urlPayment: urlPayment,
    };
  }
}

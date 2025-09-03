import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [OrderModule],
  providers: [WebhookService],
  controllers: [WebhookController]
})
export class WebhookModule {}

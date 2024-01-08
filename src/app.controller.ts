import { Body, Controller, Post } from '@nestjs/common';
import { GoogleNotificationProducer } from './google-notification-producer.service';
// CREAT DTO

@Controller('notifications')
export class AppController {
  constructor(
    private readonly notificationProducer: GoogleNotificationProducer,
  ) {}

  @Post()
  async createVehicle(@Body() notification: any) {
    this.notificationProducer
      .emit(notification)
      .catch((error) => console.log('ERROR emitting:', notification, error));
  }
}

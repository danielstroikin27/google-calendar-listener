import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import { KAFKA_SERVICE, CALENDAR_CHANGE_TOPIC } from 'src/constants';
import * as NotificationSchema from './schemas/gcal-push-notification.json';

@Injectable()
export class GoogleNotificationProducer implements OnModuleInit {
  schemaId: number;

  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly schemaRegistry: SchemaRegistry,
  ) {}

  async onModuleInit() {
    // Register the schema
    const { id } = await this.schemaRegistry.register(
      { type: SchemaType.JSON, schema: JSON.stringify(NotificationSchema) },
      { subject: `${CALENDAR_CHANGE_TOPIC}-value` },
    );
    this.schemaId = id;
  }

  async serialize(message: any) {
    const value = await this.schemaRegistry.encode(this.schemaId, message);
    return { value, headers: {} };
  }

  async emit(message: any) {
    const value = await this.serialize(message);
    return this.kafkaClient.emit(CALENDAR_CHANGE_TOPIC, value);
  }
}

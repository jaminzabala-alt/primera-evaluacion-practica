import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(config.get('DATABASE_PORT') || config.get('POSTGRES_PORT') || 5432),
        username: config.get<string>('POSTGRES_USER', 'postgres'),
        password: config.get<string>('POSTGRES_PASSWORD', 'change_me'),
        database: config.get<string>('POSTGRES_DB', 'orders_db'),
        entities: [Order],
        synchronize: true,
      }),
    }),
    OrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

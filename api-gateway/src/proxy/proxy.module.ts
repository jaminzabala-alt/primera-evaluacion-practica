import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 0,
      validateStatus: () => true,
    }),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const target =
      this.configService.get<string>('ORDERS_SERVICE_URL') ||
      'http://localhost:3001';

    consumer
      .apply(
        createProxyMiddleware({
          target,
          changeOrigin: true,
          pathRewrite: {
            '^/api/docs-json': '/api/docs-json',
            '^/api/docs': '/api/docs',
          },
        }),
      )
      .forRoutes('/api/docs', '/api/docs-json');
  }
}

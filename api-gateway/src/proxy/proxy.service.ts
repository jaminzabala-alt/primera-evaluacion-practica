import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ProxyService {
  private readonly backendBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.backendBaseUrl =
      this.configService.get<string>('ORDERS_SERVICE_URL') ||
      'http://localhost:3001';
  }

  async forward(req: Request): Promise<{ status: number; data: unknown }> {
    const targetPath = req.originalUrl.replace(/^\/api\/orders/, '/orders');
    const url = `${this.backendBaseUrl}${targetPath}`;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method,
          url,
          data: req.body,
          headers: {
            'content-type': req.headers['content-type'] || 'application/json',
          },
          validateStatus: () => true,
        }),
      );

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError.message);

      throw new HttpException(
        'Bad gateway',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}

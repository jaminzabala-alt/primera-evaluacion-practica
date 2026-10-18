import { All, Controller, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller('api/orders')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  async proxyCollection(@Req() req: Request, @Res() res: Response) {
    const result = await this.proxyService.forward(req);
    return res.status(result.status).json(result.data);
  }

  @All(':id')
  async proxyItem(
    @Param('id') _id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.proxyService.forward(req);
    return res.status(result.status).json(result.data);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create(createOrderDto);
    return this.ordersRepository.save(order);
  }

  findAll(): Promise<Order[]> {
    return this.ordersRepository.findAll();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    const merged = this.ordersRepository.merge(order, updateOrderDto);
    return this.ordersRepository.save(merged);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
    return { deleted: true };
  }
}

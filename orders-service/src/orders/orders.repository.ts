import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  create(createOrderDto: CreateOrderDto): Order {
    return this.repository.create({
      ...createOrderDto,
      status: createOrderDto.status ?? 'pending',
    });
  }

  save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }

  findAll(): Promise<Order[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Order | null> {
    return this.repository.findOne({ where: { id } });
  }

  merge(order: Order, updateOrderDto: UpdateOrderDto): Order {
    return this.repository.merge(order, updateOrderDto);
  }

  remove(order: Order): Promise<Order> {
    return this.repository.remove(order);
  }
}

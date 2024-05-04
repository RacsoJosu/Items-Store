import { Injectable } from '@nestjs/common';
import { CreateOrderInput } from './dto/inputs/create-order.input';
import { UpdateOrderInput } from './dto/inputs/update-order.input';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}
  async create(
    createOrderInput: CreateOrderInput,
    userAdmin: User,
  ): Promise<Order> {
    const newOrder = this.orderRepository.create({
      ...createOrderInput,
      user: userAdmin,
    });
    return await this.orderRepository.save(newOrder);
  }

  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<Order[]> {
    try {
      const { limit, offset } = paginationArgs;
      const { search } = searchArgs;
      const queryBuilder = this.orderRepository
        .createQueryBuilder()
        .limit(limit)
        .skip(offset)
        .where(`"userId" =  :userId`, { userId: user.id });
      if (search) {
        queryBuilder.andWhere('LOWER(nombre) like :name', {
          name: `%${search.toLocaleLowerCase()}%`,
        });
      }

      return queryBuilder.getMany();
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: string, user: User): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: {
        id: id,
        user: {
          id: user.id,
        },
      },
    });
    if (!order) throw new Error(`No existe el order con el id #${id}`);
    return order;
  }

  async update(
    id: string,
    updateOrderInput: UpdateOrderInput,
    user: User,
  ): Promise<Order> {
    await this.findOne(id, user);
    const order = await this.orderRepository.preload(updateOrderInput);
    if (!order) throw new Error(`No existe el item con el id #${id}`);
    return this.orderRepository.save(order);
  }

  async remove(id: string, user: User): Promise<Order> {
    const order = await this.findOne(id, user);
    await this.orderRepository.remove(order);
    return { ...order, id };
  }
}

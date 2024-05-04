import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/inputs/create-order.input';
import { UpdateOrderInput } from './dto/inputs/update-order.input';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Resolver(() => Order)
@UseGuards(JwtAuthGuard)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order)
  createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
    @CurrentUser([ValidRoles.ADMIN]) user: User,
  ): Promise<Order> {
    return this.ordersService.create(createOrderInput, user);
  }

  @Query(() => [Order], { name: 'orders' })
  findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ) {
    return this.ordersService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => Order, { name: 'order' })
  findOne(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Mutation(() => Order)
  updateOrder(
    @Args('updateOrderInput') updateOrderInput: UpdateOrderInput,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.update(
      updateOrderInput.id,
      updateOrderInput,
      user,
    );
  }

  @Mutation(() => Order)
  removeOrder(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.remove(id, user);
  }
}

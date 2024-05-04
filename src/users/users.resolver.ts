/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ValidRolesArgs } from './dto/args/roles-args';
import { ParseUUIDPipe, Search, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { ItemsService } from 'src/items/items.service';
import { Item } from 'src/items/entities/item.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/orders.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
    @Args() validRoles: ValidRolesArgs,
    @CurrentUser([ValidRoles.ADMIN, ValidRoles.SUPERUSER]) _user: User,
  ): Promise<User[]> {
    return this.usersService.findAll(
      validRoles.roles,
      searchArgs,
      paginationArgs,
    );
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.ADMIN, ValidRoles.SUPERUSER]) _user: User,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.ADMIN, ValidRoles.SUPERUSER]) _user: User,
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, _user);
  }
  @ResolveField(() => Int, { name: 'itemCount' })
  async itemCoun(
    @Parent() user: User,
    @CurrentUser([ValidRoles.ADMIN]) adminUser: User,
  ): Promise<number> {
    return this.itemsService.itemCountByUser(user);
  }
  @ResolveField(() => [Item], { name: 'getItemByUser' })
  async getItemByUser(
    @CurrentUser([ValidRoles.ADMIN]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return this.itemsService.findAll({ user, paginationArgs, searchArgs });
  }
  // GetOrdersbyUser
  @ResolveField(() => [Order], { name: 'getOrderByUser' })
  async getOrdersByUser(
    @CurrentUser([ValidRoles.ADMIN]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Order[]> {
    return this.ordersService.findAll(user, paginationArgs, searchArgs);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(
    @Args('id', { type: () => ID }) id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser([ValidRoles.ADMIN, ValidRoles.SUPERUSER]) user: User,
  ): Promise<User> {
    return this.usersService.block(id, user);
  }
}

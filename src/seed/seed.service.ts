import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {
  private isProd: boolean = false;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async executeSedd(): Promise<boolean> {
    if (this.isProd) {
      throw new UnauthorizedException(' We cannot run Seed Module');
    }
    // limpiar la base de datos
    await this.deleteDataBase();

    const user = await this.loadUsers();
    await this.loadItems(user);
    return true;
  }
  async loadUsers(): Promise<User> {
    const users = [];
    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }
    return users[0];
  }
  async deleteDataBase() {
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadItems(user: User) {
    for (const item of SEED_ITEMS) {
      await this.itemsService.create(item, user);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { SearchArgs } from 'src/common/dto/args';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}
  async create(
    createItemInput: CreateItemInput,
    userAdmin: User,
  ): Promise<Item> {
    const newItem = this.itemsRepository.create({
      ...createItemInput,
      user: userAdmin,
    });
    return await this.itemsRepository.save(newItem);
  }

  async findAll({
    user,
    paginationArgs,
    searchArgs,
  }: {
    user: User;
    paginationArgs: PaginationArgs;
    searchArgs: SearchArgs;
  }): Promise<Item[]> {
    try {
      const { limit, offset } = paginationArgs;
      const { search } = searchArgs;
      const queryBuilder = this.itemsRepository
        .createQueryBuilder()
        .take(limit)
        .skip(offset)
        .where(`"userId" = :userId`, { userId: user.id });

      if (search) {
        queryBuilder.andWhere('LOWER(nombre) like :name', {
          name: `%${search.toLowerCase()}%`,
        });
      }

      return queryBuilder.getMany();
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
    });
    if (!item) throw new Error(`No existe el item con el id #${id}`);
    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    const item = await this.itemsRepository.preload(updateItemInput);
    if (!item) throw new Error(`No existe el item con el id #${id}`);
    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    const item = await this.findOne(id, user);
    if (!item) throw new Error(`No existe el item con el id #${id}`);
    await this.itemsRepository.remove(item);

    return { ...item, id };
  }
  async itemCountByUser(user: User): Promise<number> {
    return this.itemsRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}

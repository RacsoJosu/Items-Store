import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupInput } from 'src/auth/dto/input/signup.input';
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger('UsersService');
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });
      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.__handleDbError(error);
    }
  }

  async findAll(
    roles: ValidRoles[],
    searchArgs: SearchArgs,
    paginationArgs: PaginationArgs,
  ): Promise<User[]> {
    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;
    const queryBuilder = this.usersRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .select();

    // if (search) {
    //   queryBuilder.andWhere('LOWER(fullName) like :name', {
    //     name: `%${search.toLowerCase()}%`,
    //   });
    // }

    if (roles && roles.length > 0) {
      queryBuilder
        .andWhere('ARRAY[roles] && ARRAY[:...roles]', { roles })
        .take(limit)
        .skip(offset);
    }

    return queryBuilder.getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({
        email: email,
      });
    } catch (error) {
      this.__handleDbError({
        code: 'error-001',
        detail: `${email} not found`,
      });
    }
  }
  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({
        id,
      });
    } catch (error) {
      this.__handleDbError({
        code: 'error-002',
        detail: `${id} not found`,
      });
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    userAdmin: User,
  ): Promise<User> {
    try {
      const user = await this.usersRepository.preload(updateUserInput);
      user.lastUpdateBy = userAdmin;

      return await this.usersRepository.save(user);
    } catch (error) {
      this.__handleDbError(error);
    }
  }
  async block(id: string, userByBlock: User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    if (!userToBlock) {
      throw new Error('User not found');
    }

    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = userByBlock;
    const infoUser = await this.usersRepository.save(userToBlock);
    console.log(infoUser);
    return infoUser;
  }
  private __handleDbError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key ', ''));
    }

    if (error.code === 'error-001') {
      throw new NotFoundException(error.detail);
    }
    if (error.code === 'error-002') {
      throw new NotFoundException(error.detail);
    }
    this.logger.error(error);
    console.log(error);
    throw new InternalServerErrorException('Please check server logs ');
  }
}

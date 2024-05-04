import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'orders' })
@ObjectType()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;
  @Column('varchar')
  @Field(() => String)
  nombre: string;
  @ManyToOne(() => User, (user) => user.items, { nullable: false, lazy: true })
  @Index('index-userid-orders')
  @Field(() => User)
  user: User;
}

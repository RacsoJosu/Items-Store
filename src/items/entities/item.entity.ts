import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'items' })
@ObjectType()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;
  @Column('varchar')
  @Field(() => String)
  nombre: string;

  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  unidades?: string;
  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  categoria?: string;
  // Usuario
  @ManyToOne(() => User, (user) => user.items, { nullable: false, lazy: true })
  @Index('userId-index')
  @Field(() => User)
  user: User;
}

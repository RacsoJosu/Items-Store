import { IsUUID } from 'class-validator';
import { CreateOrderInput } from './create-order.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateOrderInput extends PartialType(CreateOrderInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}

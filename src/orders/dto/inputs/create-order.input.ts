import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  nombre: string;
}

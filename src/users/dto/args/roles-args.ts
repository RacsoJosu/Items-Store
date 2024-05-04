import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray, IsOptional } from 'class-validator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';

@ArgsType()
export class ValidRolesArgs {
  @Field(() => [ValidRoles], { nullable: true })
  @IsArray()
  @IsOptional()
  roles?: ValidRoles[] = [];
}

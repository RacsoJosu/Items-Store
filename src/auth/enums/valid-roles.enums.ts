import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  ADMIN = 'admin',
  USER = 'user',
  SUPERUSER = 'superUser',
}
registerEnumType(ValidRoles, { name: 'validRoles' });

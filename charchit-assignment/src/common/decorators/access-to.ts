/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLE = 'role';
export const AccessTo = (...roles: Role[]) => SetMetadata(ROLE, roles);

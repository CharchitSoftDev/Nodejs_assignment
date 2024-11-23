/* eslint-disable max-classes-per-file */
import { Role } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class UserIdDto {
	@IsUUID()
	public userId: string;
}

export class UserDetailsDto {
	@IsEnum(Role)
	public role: Role;
}

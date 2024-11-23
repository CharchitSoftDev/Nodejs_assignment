import { AccessTo } from '@common/decorators/access-to';
import { RoleGuard } from '@common/guards/role.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request } from '@src/auth/types/request.type';

import { UserService } from '@src/users/user.service';
import { ListUsersType } from './types/list-users';
import { MyProfileType } from './types/my-profile.type';

@UseGuards(RoleGuard)
@ApiTags('Users')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * Method to fetch my profile
	 * @param req
	 * @returns
	 */
	@AccessTo(Role.ADMIN, Role.INDIVIDUAL, Role.LEAD, Role.CLIENT)
	@Get('me')
	public getMyProfile(@Req() req: Request): Promise<MyProfileType> {
		return this.userService.getMyProfile(req.user);
	}

	
	/**
	 * Method to fetch users list
	 * @returns
	 */
	@AccessTo(Role.ADMIN, Role.LEAD) // make it accessible only to admins and leads
	@Get()
	public getUsers(): Promise<ListUsersType[]> {
		return this.userService.getUsers();
	}
}

import { UserDetailsDto, UserIdDto } from '@admin/dto/members.dto';
import { AccessTo } from '@common/decorators/access-to';
import { RoleGuard } from '@common/guards/role.guard';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { GetUserDetailsType } from './types/user-details.type';

@UseGuards(RoleGuard)
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	/**
	 * Admin updates a user's details
	 * @param userIdDto
	 * @param userDetailsDto
	 * @returns
	 */
	@AccessTo(Role.ADMIN)

	@Put('/users/:userId')
	public editUser(
		@Param() userIdDto: UserIdDto,
		@Body() userDetailsDto: UserDetailsDto
	): Promise<void> {
		return this.adminService.editUser(userIdDto.userId, userDetailsDto);
	}

	/**
	 * Method to fetch user details
	 * @param userIdDto
	 * @returns
	 */
	@AccessTo(Role.ADMIN)
	@Get('/users/:userId')
	public getUser(@Param() userIdDto: UserIdDto): Promise<GetUserDetailsType> {
		return this.adminService.getUser(userIdDto.userId);
	}
}

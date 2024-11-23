import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ToolNames } from '@prisma/client';
import { PrismaService } from '@src/prisma/prisma.service';
import { GetUserDetailsType, UserDetailsType } from './types/user-details.type';

@Injectable()
export class AdminService {
	constructor(
		private readonly prisma: PrismaService,
		private eventEmitter: EventEmitter2,
	) {}

	/**
	 * Edit user details - jobTitle and role (Lead/Admin/Individual)
	 * @param userId
	 * @param body
	 * @returns
	 */
	public async editUser(userId: string, body: UserDetailsType): Promise<void> {
		const user = await this.prisma.users.findFirst({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundException('User not found!');
		}

		await this.prisma.accesses.update({
			where: {
				userId,
			},
			data: {
				role: body.role,
			},
		});

		// update permissions for user because their role is updated.
		await this.eventEmitter.emitAsync('update.permissions', userId);
	}

	/**
	 * Method to get user details
	 * @param userId
	 * @returns GetUserDetailsType
	 */
	public async getUser(userId: string): Promise<GetUserDetailsType> {
		const userWithProfile = await this.prisma.users.findFirst({
			where: {
				id: userId,
				isDeleted: false,
			},
			select: {
				id: true,
				profilePic: true,
				jobTitle: true,
				email: true,
				firstName: true,
				lastName: true,
				department: true,
				lastActivity: {
					select: {
						lastActivityAt: true,
					},
				},
				integrations: {
					where: {
						name: ToolNames.GITHUB,
						isActive: true,
					},
					select: {
						username: true,
					},
				},
				access: {
					select: {
						role: true,
					},
				},
				projectUsers: {
					where: {
						project: {
							isDeleted: false,
						},
					},
					select: {
						project: {
							select: {
								id: true,
								name: true,
								logo: true,
								startDate: true,
							},
						},
					},
				},
			},
		});
		if (!userWithProfile) throw new NotFoundException('User not found!');
		// Destructuring the required objects
		return this.userMapper(userWithProfile);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private userMapper(userWithProfile: any): GetUserDetailsType {
		const {
			integrations: [github],
			access,
			projectUsers,
			lastActivity,
			...user
		} = userWithProfile;

		return {
			...user,
			githubUsername: github?.username ?? null,
			role: access.role,
			lastActive: lastActivity.lastActivityAt,
			projects: projectUsers.map((item) => item.project),
		};
	}
}

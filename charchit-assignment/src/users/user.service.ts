import { Injectable } from '@nestjs/common';
import { Prisma, ToolNames } from '@prisma/client';
import { PrismaService } from '@prisma-service/prisma.service';
import { PayloadForJWT } from '@src/auth/types/token.type';
import { MyProfileType } from '@users/types/my-profile.type';
import { ListUsersType } from './types/list-users';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Method to fetch my profile
	 * @param user
	 * @returns MyProfileType
	 */
	public async getMyProfile(user: PayloadForJWT): Promise<MyProfileType> {
		const myProfile = await this.prisma.users.findFirstOrThrow({
			where: {
				id: user.sub,
				isDeleted: false,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				profilePic: true,
				email: true,
				jobTitle: true,
				department: true,
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
				notification: {
					select: {
						email: true,
					},
				},
				lastActivity: {
					select: {
						lastActivityAt: true,
					},
				},
			},
		});

		const {
			integrations: [github],
			access: { role },
			notification: { email: emailNotification },
			lastActivity: { lastActivityAt },
			...myProf
		} = myProfile;

		const githubUsername = github?.username ?? null;

		return {
			...myProf,
			role,
			emailNotification,
			lastActivityAt,
		};
	}

	/**
	 * Method to toggle Emails On/Off
	 * @param user
	 * @param emailToggle
	 * @returns
	 */
	public async emailToggle(user: PayloadForJWT, emailToggle: boolean): Promise<void> {
		await this.prisma.notifications.update({
			where: {
				userId: user.sub,
			},
			data: {
				email: emailToggle,
			},
		});
	}

	/**
	 * Method to unlink github
	 * @param user
	 * @returns
	 */
	public async unlinkGithub(user: PayloadForJWT): Promise<void> {
		await this.prisma.integrations.updateMany({
			where: {
				userId: user.sub,
				isActive: true,
			},
			data: {
				isActive: false,
			},
		});
	}

	/**
	 * Method to fetch list of all users/members for admin
	 * @returns
	 */
	public async getUsers(): Promise<ListUsersType[]> {
		const users: ListUsersType[] = await this.prisma.$queryRaw(
			Prisma.sql`select
			"users"."id",
			"users"."firstName",
			"users"."lastName",
			"users"."profilePic", 
			"users"."jobTitle",
			"accesses"."role"
		from
			"users"
		left join "accesses" on
			"users"."id" = "accesses"."userId"
		where "users"."isDeleted" = false
		order by "users"."firstName", "users"."lastName" ASC;
			`
		);

		return users;
	}
}

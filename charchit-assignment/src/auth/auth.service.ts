
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-service/prisma.service';
import { Role } from '@prisma/client';
import { returnLoginUserData } from '@utils/loginResponse';
import { User, UserLoginResponse } from './types/auth-service.type';
import { GooglePayload } from './validators/payload.validator';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	/**
	 * Method for user/member login
	 * @param payload
	 * @returns
	 */
	// eslint-disable-next-line max-lines-per-function
	public async findOrCreateUser(payload: GooglePayload): Promise<UserLoginResponse> {
		let user: User | null = await this.prisma.users.findFirst({
			where: {
				email: payload.email,
				isDeleted: false,
			},
			select: {
				id: true,
				googleId: true,
				firstName: true,
				lastName: true,
				email: true,
				profilePic: true,
				department: true,
				jobTitle: true,
				isActive: true,
				integrations: true,
				access: true,
			},
		});

		if (!user) {
			user = await this.onboardUser(payload);
		} else {
			user = await this.prisma.users.update({
				where: {
					email: user.email,
				},
				data: {
					access: {
						update: {
							readPermissions: {
								set: ['*'],
							},
						},
					},
					lastActivity: {
						update: {
							lastActivityAt: new Date(),
						},
					},
				},
				select: {
					id: true,
					googleId: true,
					firstName: true,
					lastName: true,
					email: true,
					profilePic: true,
					department: true,
					jobTitle: true,
					isActive: true,
					integrations: true,
					access: true,
				},
			});
		}

		return returnLoginUserData(user);
	}

	// method to support login fn
	private async onboardUser(payload: GooglePayload): Promise<User> {
	

		const user = await this.prisma.users.create({
			data: {
				email: payload.email,
				firstName: payload.firstName ?? '',
				lastName: payload.surname ?? '',
				isActive: true,
				access: {
					create: {
						role: Role.INDIVIDUAL,
						readPermissions: {
							set: ['*'],
						},
						writePermissions: {
							set: [],
						},
					},
				},
				lastActivity: { create: {} },
			},
			select: {
				id: true,
				googleId: true,
				firstName: true,
				lastName: true,
				email: true,
				profilePic: true,
				access: true,
			},
		});

		return user;
	}

}

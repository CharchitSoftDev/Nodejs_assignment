import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ReIssueTokenException } from '@common/exceptions/ReIssueTokenException';
import { Request } from '@src/auth/types/request.type';
import { returnLoginUserData } from '@utils/loginResponse';
import { User } from '@src/auth/types/auth-service.type';

const prisma = new PrismaClient();
@Catch(ReIssueTokenException)
export class ReIssueTokenExceptionFilter implements ExceptionFilter {
	public async catch(
		exception: ReIssueTokenException,
		host: ArgumentsHost,
	): Promise<void> {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const { user } = ctx.getRequest<Request>();
		const status = exception.getStatus();

		const userInfo: User | null = await prisma.users.findFirst({
			where: {
				id: user.sub,
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

		response.status(status).json({
			statusCode: status,
			message: exception.message,
			data: {
				...returnLoginUserData(userInfo),
			},
		});
	}
}

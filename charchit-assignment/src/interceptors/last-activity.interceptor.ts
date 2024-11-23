import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PATH_METADATA } from '@nestjs/common/constants';
import { PrismaService } from '@prisma-service/prisma.service';
import { Request } from '@src/auth/types/request.type';

@Injectable()
export class LastActivityInterceptor implements NestInterceptor {
	constructor(private readonly prisma: PrismaService, private readonly reflector: Reflector) {}

	public async intercept(
		context: ExecutionContext,
		next: CallHandler
	): Promise<Observable<unknown>> {
		const lastActivityAt = new Date();

		const path = this.reflector.get<string>(PATH_METADATA, context.getHandler());

		const excludePath = ['/health', '/login', '/create-password', '/forgot-password'];

		const req: Request = context.switchToHttp().getRequest();

		if (!excludePath.includes(path)) {
			await this.prisma.lastActivity.update({
				where: {
					userId: req.user.sub,
				},

				data: {
					lastActivityAt,
				},
			});
		}

		return next.handle();
	}
}

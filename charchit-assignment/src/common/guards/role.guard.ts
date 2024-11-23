import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Role } from '@prisma/client';
import { IS_PUBLIC } from '@common/decorators/is-public';
import { ROLE } from '@common/decorators/access-to';
import { Request } from '@src/auth/types/request.type';

@Injectable()
export class RoleGuard extends AuthGuard('token-strategy') {
	constructor(private reflector: Reflector) {
		super();
	}

	public canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const isPublic = this.reflector.get(IS_PUBLIC, context.getHandler());
		const requiredRoles = this.reflector.get(ROLE, context.getHandler()) as
			| Array<Role>
			| Role;

		const { user } = context.switchToHttp().getRequest<Request>();

		// check for role
		return (
			isPublic ||
			(Array.isArray(requiredRoles)
				? requiredRoles.includes(user.role)
				: user.role === requiredRoles)
		);
	}
}

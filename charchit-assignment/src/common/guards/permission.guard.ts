import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Role } from '@prisma/client';
import { Request } from '@src/auth/types/request.type';

@Injectable()
export class PermissionGuard extends AuthGuard('token-strategy') {
	constructor() {
		super();
	}

	public canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const {
			user,
			params: { projectId },
			method,
		} = context.switchToHttp().getRequest<Request>();

		if (method === 'PUT') {
			return (
				!projectId ||
				this.hasWritePermissions(user.role, projectId, user.writePermissions)
			);
		}
		return true;
	}

	private hasWritePermissions(
		userRole: Role,
		resourceId: string,
		writePermissions: string[] = [],
	): boolean {
		if (userRole === Role.INDIVIDUAL) {
			return false;
		}
		return (
			writePermissions.includes('*') || writePermissions.includes(resourceId)
		);
	}
}

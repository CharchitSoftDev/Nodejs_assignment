import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '@common/decorators/is-public';

@Injectable()
export class ReIssueTokenGuard extends AuthGuard('re-issue-token-strategy') {
	constructor(private reflector: Reflector) {
		super();
	}

	public canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const isPublic = this.reflector.get(IS_PUBLIC, context.getHandler());

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}
}

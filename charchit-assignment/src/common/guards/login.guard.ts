/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class LoginGuard extends AuthGuard('login-strategy') {
	public canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		return super.canActivate(context);
	}

	public handleRequest(error, user) {
		if (error) {
			throw error;
		}

		return user;
	}
}

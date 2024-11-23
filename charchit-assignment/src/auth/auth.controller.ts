import { GooglePayload } from '@auth/validators/payload.validator';
import { IsPublic } from '@common/decorators/is-public';
import { LoginGuard } from '@common/guards/login.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Validator } from '@src/configs/validator.guard';
import { AuthService } from './auth.service';
import { UserLoginResponse } from './types/auth-service.type';
import { LoginSchema } from './validators/login.schema';

@ApiTags('Login')
@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * API for user login
	 * @param user
	 * @returns
	 */
	@IsPublic()
	@Post('/login')
	@UseGuards(new Validator(LoginSchema, 'body'), LoginGuard)
	public async login(@Body('user') user: GooglePayload): Promise<UserLoginResponse> {
		const userData = await this.authService.findOrCreateUser(user);

		return userData;
	}
}

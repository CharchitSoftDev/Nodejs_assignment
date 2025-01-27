import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Global()
@Module({
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtService,
	],
})
export class AuthModule {}

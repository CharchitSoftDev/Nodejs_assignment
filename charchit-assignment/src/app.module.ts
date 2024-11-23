import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import { AuthModule } from '@auth/auth.module';
import { AccessTokenGuard } from '@common/guards/access-token.guard';
import { RoleGuard } from '@common/guards/role.guard';
import { HealthModule } from '@health/health.module';
import { LoggerMiddleware } from '@middleware/logger.middleware';
import { UserModule } from '@src/users/user.module';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { LastActivityInterceptor } from '@interceptors/last-activity.interceptor';
import { ReIssueTokenGuard } from '@common/guards/re-issue-token.guard';
import { AdminModule } from '@src/admin/admin.module';

@Module({
	imports: [
		AuthModule,
		HealthModule,
		UserModule,
		AdminModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AccessTokenGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ReIssueTokenGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RoleGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: LastActivityInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseInterceptor,
		},
	],
})
export class AppModule implements NestModule {
	public configure(consumer: MiddlewareConsumer): void {
		consumer.apply(LoggerMiddleware).forRoutes('*');
	}
}

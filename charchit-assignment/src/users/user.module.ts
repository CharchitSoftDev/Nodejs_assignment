import { Module } from '@nestjs/common';
import { ThirdPartyModule } from '@third-party/third-party.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
	imports: [ThirdPartyModule],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}

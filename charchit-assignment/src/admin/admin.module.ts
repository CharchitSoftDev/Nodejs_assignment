import { Module } from '@nestjs/common';
import { ThirdPartyModule } from '@src/third-party/third-party.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
	controllers: [AdminController],
	providers: [AdminService, ThirdPartyModule],
	imports: [ThirdPartyModule],
})
export class AdminModule {}

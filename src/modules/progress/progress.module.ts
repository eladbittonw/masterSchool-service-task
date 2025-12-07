import { Module } from '@nestjs/common';
import { ProgressService } from './services/progress.service';
import { ProgressController } from './controllers/progress.controller';
import { ProcessModule } from '../process/process.module';
import { UserStatusGuard } from './guards/user-status.guard';
import { UsersService } from '../users/services/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ProcessModule, UsersModule],
  controllers: [ProgressController],
  providers: [ProgressService, UserStatusGuard, UsersService],
})
export class ProgressModule {}

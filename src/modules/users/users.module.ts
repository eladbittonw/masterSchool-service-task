import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { ProgressModule } from '../progress/progress.module';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

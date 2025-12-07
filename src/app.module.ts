import { Module } from '@nestjs/common';
import { ProcessModule } from './modules/process/process.module';
import { UsersModule } from './modules/users/users.module';
import { ProgressModule } from './modules/progress/progress.module';

@Module({
  imports: [ProcessModule, UsersModule, ProgressModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

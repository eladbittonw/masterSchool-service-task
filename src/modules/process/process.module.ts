import { Module } from '@nestjs/common';
import { ProcessService } from './services/process.service';
import { ProcessController } from './controllers/process.controller';

@Module({
  providers: [ProcessService],
  controllers: [ProcessController],
  exports: [ProcessService],
})
export class ProcessModule {}

import { Controller, Get, Inject } from '@nestjs/common';
import { ProcessService } from '../services/process.service';

@Controller('process')
export class ProcessController {
  constructor(@Inject() private processService: ProcessService) {}

  @Get()
  getFullProcess() {
    const fullProcessDisplay = this.processService.getProcess();
    const totalStepsNumber = this.processService.getTotalSteps();
    const totalTasksNumber = this.processService.getTotalVisibleTasks();

    return { fullProcessDisplay, totalStepsNumber, totalTasksNumber };
  }
}

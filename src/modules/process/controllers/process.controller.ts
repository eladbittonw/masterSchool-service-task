import { Controller, Get, Inject } from '@nestjs/common';
import { ProcessService } from '../services/process.service';
import { DisplayStep, FullProcessType } from '../interfaces/process.interface';

@Controller('process')
export class ProcessController {
  constructor(@Inject() private processService: ProcessService) {}

  // Gets the full process flow
  @Get()
  getFullProcess(): FullProcessType {
    // Gets the full process to display
    const fullProcessDisplay: DisplayStep[] = this.processService.getProcess();

    //Gets the total steps number
    const totalStepsNumber: number = this.processService.getTotalSteps();

    // Gets the total tasks number
    const totalTasksNumber: number = this.processService.getTotalVisibleTasks();

    return {
      response: { fullProcessDisplay, totalStepsNumber, totalTasksNumber },
    };
  }
}

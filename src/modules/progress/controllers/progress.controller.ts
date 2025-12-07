import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ProgressService } from '../services/progress.service';
import {
  NextProgressResponseType,
  ProgressStatusInterface,
  UserStatusResponseInterface,
  userStatusType,
} from '../interfaces/user-progress.interface';
import { completeStepPayloadDto } from '../../../dtos/progress.dto';
import { ProcessService } from '../../process/services/process.service';
import { UserStatusGuard } from '../guards/user-status.guard';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from '../../../dtos/users.dto';

@Controller('progress')
export class ProgressController {
  constructor(
    private progressService: ProgressService,
    private processService: ProcessService,
    private usersService: UsersService,
  ) {}

  @Post('createUser')
  createUser(@Body() createUserDto: CreateUserDto): {
    response: { userId: string };
  } {
    // Create a new user in the user service
    const newUserId = this.usersService.createUser(createUserDto);

    // Initalize the user progress in the progress service
    const userId = this.progressService.initUser(newUserId);
    // return the new user ID
    return { response: { userId: newUserId } };
  }

  // Gets the user progress (current step + current task in the step)
  @Get('getUserProgress/:id/current')
  @UseGuards(UserStatusGuard)
  getUserProgress(@Param('id') userId: string): ProgressStatusInterface {
    const currentProgress: ProgressStatusInterface =
      this.progressService.getUserProgress(userId);
    return currentProgress;
  }

  // Gets the user status
  @Get('getUserStatus/:id/current')
  @UseGuards(UserStatusGuard)
  getUserProgressStatus(
    @Param('id') userId: string,
  ): UserStatusResponseInterface {
    const currentUserStatus: userStatusType =
      this.progressService.getUserStatus(userId);
    return { response: { currentUserStatus } };
  }

  @Put(':id/complete/:step')
  @UseGuards(UserStatusGuard)
  async markStepCompleted(
    @Param('id') userId: string,
    @Param('step') stepName: string,
    @Body() completeStepPayloadDto: completeStepPayloadDto,
  ) {
    const userStatus: userStatusType =
      this.progressService.getUserStatus(userId);
    if (userStatus === 'accepted' || userStatus === 'rejected') {
      return { error: 'User ' + userStatus + '!' };
    }
    const reqStepName: string = stepName;
    const reqTaskPayload: string = completeStepPayloadDto.stepPayload;

    const validateStep: boolean = this.progressService.validateStep(
      reqStepName,
      userId,
    );
    if (!validateStep) {
      return { error: 'User step incorrect!' };
    }
    const currentTask: string = this.progressService.getUserCurrentTask(userId);

    const validatePayload: boolean =
      await this.processService.validateTaskPayload(
        reqTaskPayload,
        currentTask,
        reqStepName,
      );

    if (!validatePayload) {
      return {
        error:
          'User payload for step ' +
          reqStepName +
          ' and task: ' +
          currentTask +
          ' incorrect!',
      };
    }

    const isCompleteTask = this.processService.completeTask({
      currentTask,
      currentStep: reqStepName,
      reqTaskPayload,
    });

    if (!isCompleteTask) {
      this.progressService.setUserStatus({
        userId,
        userStatus: 'rejected',
      });
      return { error: 'You got rejected' };
    }

    const { nextStep, nextTask, finish }: NextProgressResponseType =
      this.processService.getNextProgress({
        currentTask,
        currentStep: reqStepName,
        taskPayload: reqTaskPayload,
      });

    if (finish) {
      this.progressService.setUserStatus({
        userId,
        userStatus: 'accepted',
      });
      return { response: 'You got accepted' };
    }

    this.progressService.setNextProgress({
      userId,
      nextStep,
      nextTask,
    });
    return { response: 'You Completed the Task' };
  }
}

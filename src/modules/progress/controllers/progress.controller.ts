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
  ProgressStatusType,
  UserStatusResponseType,
  userStatusType,
} from '../interfaces/user-progress.interface';
import { completeStepPayloadDto } from '../../../dtos/progress.dto';
import { ProcessService } from '../../process/services/process.service';
import { UserStatusGuard } from '../guards/user-status.guard';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from '../../../dtos/users.dto';
import { response } from 'express';

@Controller('progress')
export class ProgressController {
  constructor(
    // progress Service
    private progressService: ProgressService,
    // process Service
    private processService: ProcessService,
    // users Service
    private usersService: UsersService,
  ) {}

  // Post request to create a user
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
  // Use the Guard to validate the user id
  @UseGuards(UserStatusGuard)
  getUserProgress(@Param('id') userId: string): {
    response: { currentProgress: ProgressStatusType };
  } {
    // Gets the current step + current task
    const currentProgress: ProgressStatusType =
      this.progressService.getUserProgress(userId);

    // Returns the current Progress
    return { response: { currentProgress } };
  }

  // Gets the user status
  @Get('getUserStatus/:id/current')
  // Use the Guard to validate the user id
  @UseGuards(UserStatusGuard)
  getUserProgressStatus(@Param('id') userId: string): UserStatusResponseType {
    // Gets the user current status
    const currentUserStatus: userStatusType =
      this.progressService.getUserStatus(userId);

    // Returns a response of the user state
    return { response: { currentUserStatus } };
  }

  // Put request to complete steps in the process
  @Put(':id/complete/:step')
  // Use the Guard to validate the user id
  @UseGuards(UserStatusGuard)
  async markStepCompleted(
    @Param('id') userId: string,
    @Param('step') stepName: string,
    @Body() completeStepPayloadDto: completeStepPayloadDto,
  ) {
    // Gets the user current status
    const userStatus: userStatusType =
      this.progressService.getUserStatus(userId);

    // check if he is alredy accepted / rejected
    if (userStatus === 'accepted' || userStatus === 'rejected') {
      return { error: 'User ' + userStatus + '!' };
    }
    // Gets the step name from the request
    const reqStepName: string = stepName;
    // Gets the Task payload
    const reqTaskPayload: string = completeStepPayloadDto.stepPayload;

    // Validate that the step provided is the correct step the user is in
    const validateStep: boolean = this.progressService.validateStep(
      reqStepName,
      userId,
    );
    // if not return error
    if (!validateStep) {
      return { error: 'User step incorrect!' };
    }
    // Gets the current task of the user
    const currentTask: string = this.progressService.getUserCurrentTask(userId);

    // Validate the  payload of the current task
    const validatePayload: boolean =
      await this.processService.validateTaskPayload({
        reqTaskPayload,
        currentTask,
        reqStepName,
      });

    // if not correct return error
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

    // Check if the pass condition is true with the correct payload
    const isCompleteTask = this.processService.completeTask({
      currentTask,
      currentStep: reqStepName,
      reqTaskPayload,
    });

    // If the task failed return rejected
    if (!isCompleteTask) {
      this.progressService.setUserStatus({
        userId,
        userStatus: 'rejected',
      });
      return { response: 'rejected' };
    }

    // Gets the next step asn task and checks if the user is finish
    const { nextStep, nextTask, finish }: NextProgressResponseType =
      this.processService.getNextProgress({
        currentTask,
        currentStep: reqStepName,
        taskPayload: reqTaskPayload,
      });

    // if the user is finish change the state to accepted
    if (finish) {
      this.progressService.setUserStatus({
        userId,
        userStatus: 'accepted',
      });
      return { response: 'accepted' };
    }

    // Move the user to the next step
    this.progressService.setNextProgress({
      userId,
      nextStep,
      nextTask,
    });
    return { response: { nextStep, nextTask } };
  }
}

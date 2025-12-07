import { Inject, Injectable } from '@nestjs/common';
import {
  ProgressStatusInterface,
  UserProgressInterface,
  userStatusType,
} from '../interfaces/user-progress.interface';
import { ProcessService } from '../../process/services/process.service';
import { logger } from '../../../../utils/logger/logger';

@Injectable()
export class ProgressService {
  constructor(@Inject() private processService: ProcessService) {}

  // Map of all the data of the users progress
  private usersProgress: Map<string, UserProgressInterface> = new Map();

  // Intilaze the user in the user progress map
  initUser(userId: string): string {
    // initalize the first step and task
    const { firstStep, firstTask } = this.processService.initUserSteps();

    // Create a new userProgress
    const newUserProgress: UserProgressInterface = {
      userID: userId,
      currentStep: firstStep,
      currentTask: firstTask,
      processVersion: 1, // needs to be an env value
      status: 'still in progress',
    };

    // Sets the user in the map
    this.usersProgress.set(userId, newUserProgress);

    // Returns the user ID
    return userId;
  }

  // Find a user in the map to validate
  findUser(userId: string): boolean {
    const currentUser = this.usersProgress.get(userId);
    if (currentUser) {
      return true;
    }
    return false;
  }

  // Gets the user progress (current step and current task )
  getUserProgress(userId: string): ProgressStatusInterface {
    // Get the user by id
    const currentUser = this.usersProgress.get(userId);
    // Get the user current step
    const currentStep = currentUser.currentStep;
    // Get the user current task
    const currentTask = currentUser.currentTask;
    // Return the 2 params
    return { currentStep, currentTask };
  }

  // Gets the user status
  getUserStatus(userId: string): userStatusType {
    // Gets the user status at this current state
    const currentUserStatus: userStatusType =
      this.usersProgress.get(userId).status;

    return currentUserStatus;
  }

  // Sets the user status
  setUserStatus({
    userId,
    userStatus,
  }: {
    userId: string;
    userStatus: userStatusType;
  }) {
    const currentUserStatus = this.usersProgress.get(userId);
    const updatedProgress: UserProgressInterface = {
      ...currentUserStatus,
      status: userStatus,
    };

    this.usersProgress.set(userId, updatedProgress);
  }

  // Validate the step name
  validateStep(stepName: string, userId: string): boolean {
    const currentUserProgress = this.usersProgress.get(userId);

    if (stepName !== currentUserProgress.currentStep) {
      logger.error('User step incorrect!');
      return false;
    }
    return true;
  }

  // Gets the user current name task
  getUserCurrentTask(userId: string): string {
    const currentUser = this.usersProgress.get(userId);

    return currentUser.currentTask;
  }

  // Sets the progress of a user after completing a task
  setNextProgress({ userId, nextStep, nextTask }) {
    const currentUser = this.usersProgress.get(userId);

    const updatedProgress: UserProgressInterface = {
      ...currentUser,
      currentStep: nextStep,
      currentTask: nextTask,
    };

    this.usersProgress.set(userId, updatedProgress);
  }
}

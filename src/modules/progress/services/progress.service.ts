import { Inject, Injectable } from '@nestjs/common';
import {
  ProgressStatusType,
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
    // Gets the user from the Map
    const currentUser = this.usersProgress.get(userId);
    // Check if the user not null
    if (currentUser) {
      return true;
    }
    return false;
  }

  // Gets the user progress (current step and current task )
  getUserProgress(userId: string): ProgressStatusType {
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
    // Return the user Status
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
    // Gets the user current object
    const currentUserStatus = this.usersProgress.get(userId);
    // Spread the user object and sets a new status
    const updatedProgress: UserProgressInterface = {
      ...currentUserStatus,
      status: userStatus,
    };
    //sets a new status
    this.usersProgress.set(userId, updatedProgress);
  }

  // Validate the step name
  validateStep(stepName: string, userId: string): boolean {
    // Gets current user
    const currentUserProgress = this.usersProgress.get(userId);
    // Check if the current step is the step that is in the request
    if (stepName !== currentUserProgress.currentStep) {
      logger.error('User step incorrect!');
      return false;
    }
    return true;
  }

  // Gets the user current name task
  getUserCurrentTask(userId: string): string {
    // Gets current user
    const currentUser = this.usersProgress.get(userId);
    // Returns current task name
    return currentUser.currentTask;
  }

  // Sets the progress of a user after completing a task
  setNextProgress({ userId, nextStep, nextTask }) {
    // Gets the current user
    const currentUser = this.usersProgress.get(userId);
    // Update the currentStep and currentTask
    const updatedProgress: UserProgressInterface = {
      ...currentUser,
      currentStep: nextStep,
      currentTask: nextTask,
    };
    // Update the data
    this.usersProgress.set(userId, updatedProgress);
  }
}

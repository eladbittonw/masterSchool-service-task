import { Injectable } from '@nestjs/common';
import { flowDefinition } from '../process-object/process-structure.interafce';
import { DisplayStep, Step, Task } from '../interfaces/process.interface';
import { logger } from '../../../../utils/logger/logger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  NextProgressResponseType,
  ProgressStatusInterface,
} from '../../progress/interfaces/user-progress.interface';
import { takeLast } from 'rxjs';

@Injectable()
export class ProcessService {
  private processDefinition: Step[] = flowDefinition;

  // initalize user progress
  initUserSteps() {
    const firstStep = this.processDefinition[0];
    const firstTask = firstStep.tasks[0];
    return {
      firstStep: firstStep.name,
      firstTask: firstTask.name,
    };
  }

  // Get the full structure of the process
  getProcess(): DisplayStep[] {
    return this.processDefinition.map((step) => ({
      name: step.name,
      tasks: step.tasks.map((task) => ({
        name: task.name,
      })),
    }));
  }

  // Gets the total steps of the data
  getTotalSteps(): number {
    return this.processDefinition.length;
  }

  // Get the Total visible Tasks
  getTotalVisibleTasks(userId?: string): number {
    return this.processDefinition.reduce((total, step) => {
      const visibleTasks = step.tasks.filter((task) => {
        // If task has isVisible function, check it
        return task.isVisible || typeof task.isVisible !== 'function';
      });
      return total + visibleTasks.length;
    }, 0);
  }

  private findTaskByName({
    taskName,
    stepName,
  }: {
    taskName: string;
    stepName: string;
  }): Task {
    // First find the step by name
    const step = this.processDefinition.find((step) => step.name === stepName);
    if (!step) {
      return null;
    }
    // Then find the task within that step
    const task = step.tasks.find((task) => task.name === taskName);
    return task;
  }

  async validateTaskPayload(
    taskPayload: any,
    currentTask: string,
    reqStepName: string,
  ): Promise<boolean> {
    // Gets the task object to get the task payload Dto
    const task: Task = this.findTaskByName({
      taskName: currentTask,
      stepName: reqStepName,
    });

    // Check if the task is valid
    if (!task) {
      logger.error(`Task "${currentTask}" not found in process definition`);
      return false;
    }

    try {
      // Create an instance of the DTO class with the payload data
      const dtoInstance = plainToInstance(task.payloadType, taskPayload);
      console.log('dto Instence = ', dtoInstance);
      // Validate the instance using class-validator
      const validationErrors = await validate(dtoInstance);
      console.log(validationErrors);

      // Return true if no validation errors, false if there are errors
      return validationErrors.length === 0;
    } catch (error) {
      // If validation throws an error (e.g., invalid DTO class), return false
      logger.error('Error validating task payload:', error);
      return false;
    }
  }

  completeTask({ currentStep, currentTask, reqTaskPayload }) {
    const taskObj: Task = this.findTaskByName({
      taskName: currentTask,
      stepName: currentStep,
    });

    const isTaskCompleted = taskObj.passCondition(reqTaskPayload);
    return isTaskCompleted;
  }

  getNextProgress({
    currentTask,
    currentStep,
    taskPayload,
  }): NextProgressResponseType {
    // Find the current step
    const currentStepIndex = this.processDefinition.findIndex(
      (step) => step.name === currentStep,
    );
    const step = this.processDefinition[currentStepIndex];

    // Find the current task index within the step
    const currentTaskIndex = step.tasks.findIndex(
      (task) => task.name === currentTask,
    );

    // Check if there's a next task in the same step
    if (currentTaskIndex < step.tasks.length - 1) {
      const nextStep = step.tasks[currentTaskIndex + 1];
      const isNextTaskVisible =
        typeof nextStep.isVisible === 'function'
          ? nextStep.isVisible(taskPayload)
          : nextStep.isVisible;

      console.log(
        'Is next task is visable: ',
        isNextTaskVisible,
        ', task payload = ' + taskPayload,
      );
      if (isNextTaskVisible) {
        // Move to next task in same step
        const nextTask = step.tasks[currentTaskIndex + 1];
        return {
          nextStep: currentStep,
          nextTask: nextTask.name,
          finish: false,
        };
      }
    }

    // Check if there's a next step
    if (currentStepIndex < this.processDefinition.length - 1) {
      // Move to first task of next step
      const nextStep = this.processDefinition[currentStepIndex + 1];
      const firstTaskOfNextStep = nextStep.tasks[0];
      return {
        nextStep: nextStep.name,
        nextTask: firstTaskOfNextStep.name,
        finish: false,
      };
    }

    // No more steps or tasks - process is complete
    return {
      nextStep: '',
      nextTask: '',
      finish: true,
    };
  }
}

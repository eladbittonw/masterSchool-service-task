import { Injectable } from '@nestjs/common';
import { processDef } from '../process-object/process-structure.interafce';
import {
  DisplayStep,
  FindTaskType,
  Step,
  Task,
  ValidateTaskPayloadType,
} from '../interfaces/process.interface';
import { logger } from '../../../../utils/logger/logger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  NextProgressResponseType,
  ProgressStatusType,
} from '../../progress/interfaces/user-progress.interface';
import { takeLast } from 'rxjs';

@Injectable()
export class ProcessService {
  private processFlow: Step[] = processDef;

  // initalize user progress
  initUserSteps() {
    // Gets the first task and step
    const firstStep = this.processFlow[0];
    const firstTask = firstStep.tasks[0];

    // Return the first task and step
    return {
      firstStep: firstStep.name,
      firstTask: firstTask.name,
    };
  }

  // Get the full structure of the process
  getProcess(): DisplayStep[] {
    // Gets the steps and tasks to display
    return this.processFlow.map((step) => ({
      name: step.name,
      tasks: step.tasks.map((task) => ({
        name: task.name,
      })),
    }));
  }

  // Gets the total steps of the data
  getTotalSteps(): number {
    return this.processFlow.length;
  }

  // Get the Total visible Tasks
  getTotalVisibleTasks(): number {
    return this.processFlow.reduce((total, step) => {
      const visibleTasks = step.tasks.filter((task) => {
        // If task has isVisible function, check it
        return (
          task.isVisible === true ||
          (typeof task.isVisible !== 'function' && task.isVisible)
        );
      });
      return total + visibleTasks.length;
    }, 0);
  }

  // Gets the task by her name
  private findTaskByName({ taskName, stepName }: FindTaskType): Task {
    // Gets the step by name
    const step = this.processFlow.find((step) => step.name === stepName);
    if (!step) {
      return null;
    }
    // Gets the task by name
    const task = step.tasks.find((task) => task.name === taskName);
    return task;
  }

  // Validate the payload of the tasks
  async validateTaskPayload({
    reqTaskPayload: taskPayload,
    currentTask,
    reqStepName,
  }: ValidateTaskPayloadType): Promise<boolean> {
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
      const dtoInstance: any = plainToInstance(task.payloadType, taskPayload);
      // Validate the instance using class-validator
      const validationErrors = await validate(dtoInstance);

      // Return true if no validation errors, false if there are errors
      return validationErrors.length === 0;
    } catch (error) {
      // If validation throws an error return false
      logger.error('Error validating task payload:', error);
      return false;
    }
  }

  // Check if the task is completed
  completeTask({ currentStep, currentTask, reqTaskPayload }): boolean {
    // Find Task by the name
    const taskObj: Task = this.findTaskByName({
      taskName: currentTask,
      stepName: currentStep,
    });
    // Check if the condition pass with the payload
    const isTaskCompleted: boolean = taskObj.passCondition(reqTaskPayload);
    return isTaskCompleted;
  }

  // Get the next progress task for the user
  getNextProgress({
    currentTask,
    currentStep,
    taskPayload,
  }): NextProgressResponseType {
    // Gets the current step
    const currentStepIndex = this.processFlow.findIndex(
      (step) => step.name === currentStep,
    );
    const step = this.processFlow[currentStepIndex];

    // Gets the current task
    const currentTaskIndex = step.tasks.findIndex(
      (task) => task.name === currentTask,
    );

    // Check if there's a next task in the same step
    if (currentTaskIndex < step.tasks.length - 1) {
      const nextStep = step.tasks[currentTaskIndex + 1];
      // Check if the next Task is visible and if its a function if the condition is true
      const isNextTaskVisible =
        typeof nextStep.isVisible === 'function'
          ? nextStep.isVisible(taskPayload)
          : nextStep.isVisible;

      console.log(
        'Is next task is visable: ',
        isNextTaskVisible,
        ', task payload = ' + taskPayload,
      );
      // If the task is visible move to her
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

    // Check if there is a next step
    if (currentStepIndex < this.processFlow.length - 1) {
      // Move to first task of next step
      const nextStep = this.processFlow[currentStepIndex + 1];
      const firstTaskOfNextStep = nextStep.tasks[0];
      return {
        nextStep: nextStep.name,
        nextTask: firstTaskOfNextStep.name,
        finish: false,
      };
    }

    // No more steps or tasks process is complete
    return {
      nextStep: '',
      nextTask: '',
      finish: true,
    };
  }
}

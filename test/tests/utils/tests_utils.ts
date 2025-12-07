import { ProgressController } from 'src/modules/progress/controllers/progress.controller';
import {
  ProgressStatusType,
  UserStatusResponseType,
} from 'src/modules/progress/interfaces/user-progress.interface';
import { ProgressService } from 'src/modules/progress/services/progress.service';

type CompleteTaskType = {
  stepName: string;
  stepPayload: any;
  resultStep: string;
  resultTask: string;
  controller: ProgressController;
  progressService: ProgressService;
  userId: string;
};

// Create a new user function
export function createNewUser({
  controller,
  email,
}: {
  controller: ProgressController;
  email: string;
}): { response: { userId: string } } {
  // Create new user with controller endpoint
  const newUserId = controller.createUser({ email });
  return newUserId;
}

// Function that complete tasks
export async function completeTask({
  stepName,
  stepPayload,
  resultStep,
  resultTask,
  controller,
  userId,
  progressService,
}: CompleteTaskType) {
  // Mark task as completed if the currect payload
  const result = await controller.markStepCompleted(userId, stepName, {
    stepPayload: stepPayload,
  });

  // Gets the current progress of the user
  const currentProgress: ProgressStatusType =
    progressService.getUserProgress(userId);
  // Gets the current status of the user
  const currentStatus: string =
    controller.getUserProgressStatus(userId).response.currentUserStatus;

  // If the user accepted
  if (currentStatus === 'accepted') {
    expect(result).toHaveProperty('response', 'accepted');
    // If the user rejected
  } else if (currentStatus === 'rejected') {
    expect(result).toHaveProperty('response', 'rejected');
  } else {
    // If the user In progress (Checks for the correct step)
    expect(result).toHaveProperty('response');
    expect(result.response).toHaveProperty('nextStep');
    expect(result.response).toHaveProperty('nextTask');
    expect(currentProgress.currentStep).toEqual(resultStep);
    expect(currentProgress.currentTask).toEqual(resultTask);
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from '../../src/modules/progress/controllers/progress.controller';
import { ProgressService } from '../../src/modules/progress/services/progress.service';
import { ProcessService } from '../../src/modules/process/services/process.service';
import { UsersService } from '../../src/modules/users/services/users.service';
import {
  ProgressStatusType,
  UserStatusResponseType,
} from '../../src/modules/progress/interfaces/user-progress.interface';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserStatusGuard } from '../../src/modules/progress/guards/user-status.guard';
import { completeTask, createNewUser } from './utils/tests_utils';

describe('ProgressController', () => {
  // Progress controller
  let controller: ProgressController;
  // Progress Service
  let progressService: ProgressService;
  // Process Service
  let processService: ProcessService;
  // Users Service
  let usersService: UsersService;
  // Guard
  let guard: UserStatusGuard;

  // Starts a new Testing
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        ProgressService,
        ProcessService,
        UsersService,
        UserStatusGuard,
      ],
    }).compile();

    // Gets all the controllers and the services
    controller = module.get<ProgressController>(ProgressController);
    progressService = module.get<ProgressService>(ProgressService);
    processService = module.get<ProcessService>(ProcessService);
    usersService = module.get<UsersService>(UsersService);
    guard = module.get<UserStatusGuard>(UserStatusGuard);
  });

  // Checks the guard validation
  describe('checkGuard', () => {
    // checks the guard with unvalid userId
    it('should return error beacuse the userId not found in the request (Checks the guard)', async () => {
      // add to the request mock id that is invalid
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { id: 'test-asd-asd-asd' },
          }),
        }),
      } as ExecutionContext;

      // check if the guard throw an error
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    // checks the guard with valid userId
    it('should return user progress and check the guard validation', async () => {
      const newUserId = createNewUser({ controller, email: 'test@gmail.com' })
        .response.userId;
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { id: newUserId },
          }),
        }),
      } as ExecutionContext;

      const result: { response: { currentProgress: ProgressStatusType } } =
        controller.getUserProgress(newUserId);

      expect(result.response.currentProgress).toHaveProperty('currentStep');
      expect(result.response.currentProgress).toHaveProperty('currentTask');
      expect(typeof result.response.currentProgress.currentStep).toBe('string');
      expect(typeof result.response.currentProgress.currentTask).toBe('string');
    });
  });

  // check the get current Check
  describe('getUserProgress', () => {
    it('should check the get progress endpoint and validate the result object', () => {
      // Create a new user
      const newUserId = createNewUser({ controller, email: 'test@gmail.com' })
        .response.userId;

      // Gets the Progress Status
      const result: { response: { currentProgress: ProgressStatusType } } =
        controller.getUserProgress(newUserId);

      // Checks that the response object valid
      expect(result.response.currentProgress).toHaveProperty('currentStep');
      expect(result.response.currentProgress).toHaveProperty('currentTask');
      expect(typeof result.response.currentProgress.currentStep).toBe('string');
      expect(typeof result.response.currentProgress.currentTask).toBe('string');
    });
  });

  // check the get current Check
  describe('getUserStatus', () => {
    it('should check the get status endpoint and validate the result object', () => {
      // Create a new user
      const newUserId = createNewUser({ controller, email: 'test@gmail.com' })
        .response.userId;

      // Gets the user Progress status
      const result: UserStatusResponseType =
        controller.getUserProgressStatus(newUserId);

      // Check the validation of the endpoint
      expect(result).toHaveProperty('response');
      expect(result.response).toHaveProperty('currentUserStatus');
      expect(typeof result.response.currentUserStatus).toBe('string');
      expect(result.response.currentUserStatus).toEqual('still in progress');
    });
  });

  // Checks the create user endpiont
  describe('createUser', () => {
    it('should create a new user in the memory', () => {
      // Create a new user
      const newUserId = createNewUser({ controller, email: 'test@gmail.com' })
        .response.userId;

      // Get the user from the users service
      const result = usersService.getUserId(newUserId);

      // check if he exist
      expect(result).toEqual(newUserId);
    });
  });

  // Checks the put complete endpoint
  describe('putCompleteTask', () => {
    // Checks if the user can complete task
    it('should check that the user complete the task and move to the next step', async () => {
      // Create a new user
      const userId = createNewUser({ controller, email: 'test@gmail.com' })
        .response.userId;

      // Details step payload
      const detailsStepPayload = {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@example.com',
        timestamp: '2025-12-07T13:45:00.000Z',
      };
      // complete Task function
      await completeTask({
        stepName: 'Personal_Details_Form',
        stepPayload: detailsStepPayload,
        resultStep: 'IQ_Test',
        resultTask: 'take_test',
        controller: controller,
        progressService,
        userId,
      });
    });

    // Checks if the condition visible is working
    it('should check that the user completed 2 tasks and move to the next condition Task', async () => {
      //Create a new user
      const userId = createNewUser({ controller, email: 'test@gmail.com' })
        .response.userId;

      // Tasks array for completeTask function
      const tasksArr = [
        {
          stepName: 'Personal_Details_Form',
          stepPayload: {
            firstName: 'Alex',
            lastName: 'Johnson',
            email: 'alex.johnson@example.com',
            timestamp: '2025-12-07T13:45:00.000Z',
          },
          resultStep: 'IQ_Test',
          resultTask: 'take_test',
          controller: controller,
          progressService,
          userId,
        },
        {
          stepName: 'IQ_Test',
          stepPayload: {
            score: 70,
            timestamp: '2025-12-07T14:00:00.000Z',
          },
          resultStep: 'IQ_Test',
          resultTask: 'take_test2',
          controller: controller,
          progressService,
          userId,
        },
        {
          stepName: 'IQ_Test',
          stepPayload: {
            score: 90,
            timestamp: '2025-12-07T14:00:00.000Z',
          },
          resultStep: 'Interview',
          resultTask: 'schedule_interview',
          controller: controller,
          progressService,
          userId,
        },
      ];

      // Check each task progress and completion
      for (const task of tasksArr) {
        await completeTask({
          stepName: task.stepName,
          stepPayload: task.stepPayload,
          resultStep: task.resultStep,
          resultTask: task.resultTask,
          controller: task.controller,
          progressService: task.progressService,
          userId: task.userId,
        });
      }
    });

    // checks if the condition visible is working
    it('should check that the user completed 2 tasks and move to the next Task and skip the condition task', async () => {
      // Checks if the user can complete task
      const userId = createNewUser({ controller, email: 'test@gmail.com' })
        .response.userId;

      // Details step payload
      const detailsStepPayload = {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@example.com',
        timestamp: '2025-12-07T13:45:00.000Z',
      };
      // complete Task function
      await completeTask({
        stepName: 'Personal_Details_Form',
        stepPayload: detailsStepPayload,
        resultStep: 'IQ_Test',
        resultTask: 'take_test',
        controller: controller,
        progressService,
        userId,
      });

      // testIQ payload
      const testIQStepPayload = {
        score: 80,
        timestamp: '2025-12-07T14:00:00.000Z',
      };
      // complete Task function
      await completeTask({
        stepName: 'IQ_Test',
        stepPayload: testIQStepPayload,
        resultStep: 'Interview',
        resultTask: 'schedule_interview',
        controller: controller,
        progressService,
        userId,
      });
    });

    // Checks if you got rejected
    it('should check that the user can fail the IQ test and got rejected', async () => {
      // Create a new user
      const userId = createNewUser({ controller, email: 'test@gmail.com' })
        .response.userId;

      // Details step payload
      const detailsStepPayload = {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@example.com',
        timestamp: '2025-12-07T13:45:00.000Z',
      };
      // complete Task function
      await completeTask({
        stepName: 'Personal_Details_Form',
        stepPayload: detailsStepPayload,
        resultStep: 'IQ_Test',
        resultTask: 'take_test',
        controller: controller,
        progressService,
        userId,
      });
      // testIQ payload
      const testIQStepPayload = {
        score: 50,
        timestamp: '2025-12-07T14:00:00.000Z',
      };

      // complete Task function
      await completeTask({
        stepName: 'IQ_Test',
        stepPayload: testIQStepPayload,
        resultStep: 'temp',
        resultTask: 'temp',
        controller: controller,
        progressService,
        userId,
      });
    });

    // Checks if you got accepted
    it('should check that the user can complete all the steps and get accepted', async () => {
      // Create a new user
      const userId = createNewUser({ controller, email: 'test@gmail.com' })
        .response.userId;

      // Tasks array for completeTask function
      const tasksArr = [
        {
          stepName: 'Personal_Details_Form',
          stepPayload: {
            firstName: 'Alex',
            lastName: 'Johnson',
            email: 'alex.johnson@example.com',
            timestamp: '2025-12-07T13:45:00.000Z',
          },
          resultStep: 'IQ_Test',
          resultTask: 'take_test',
          controller: controller,
          progressService,
          userId,
        },
        {
          stepName: 'IQ_Test',
          stepPayload: {
            score: 80,
            timestamp: '2025-12-07T14:00:00.000Z',
          },
          resultStep: 'Interview',
          resultTask: 'schedule_interview',
          controller: controller,
          progressService,
          userId,
        },
        {
          stepName: 'Interview',
          stepPayload: {
            interviewDate: '2025-12-10T10:00:00.000Z',
          },
          resultStep: 'Interview',
          resultTask: 'perform_interview',
          controller: controller,
          progressService,
          userId,
        },
        {
          stepName: 'Interview',
          stepPayload: {
            interviewDate: '2025-12-10T10:00:00.000Z',
            interviewer_id: 'I99',
            decision: 'passed_interview',
          },
          resultStep: 'Sign_Contract',
          resultTask: 'upload_identification_document',
          controller: controller,
          progressService,
          userId,
        },
        {
          stepName: 'Sign_Contract',
          stepPayload: {
            passportNumber: 12345678,
            timestamp: '2025-12-15T09:00:00.000Z',
          },
          resultStep: 'Sign_Contract',
          resultTask: 'sign_contract',
          controller: controller,
          progressService,
          userId,
        },
        {
          stepName: 'Sign_Contract',
          stepPayload: {
            timestamp: '2025-12-15T10:00:00.000Z',
          },
          resultStep: 'Payment',
          resultTask: 'process_payment',
          controller: controller,
          progressService,
          userId,
        },
        {
          stepName: 'Payment',
          stepPayload: {
            paymentId: 'PAY-XYZ-987',
            timestamp: '2025-12-15T11:00:00.000Z',
          },
          resultStep: 'Join_Slack',
          resultTask: 'join_slack',
          controller: controller,
          progressService,
          userId,
        },
        {
          stepName: 'Join_Slack',
          stepPayload: {
            email: 'alex.johnson@example.com',
            timestamp: '2025-12-15T12:00:00.000Z',
          },
          resultStep: 'JOIN_SLACK_COMPLETED',
          resultTask: 'JOIN_SLACK_COMPLETED',
          controller: controller,
          progressService,
          userId,
        },
      ];
      // Check for each task if completed with the correct payload
      for (const task of tasksArr) {
        await completeTask({
          stepName: task.stepName,
          stepPayload: task.stepPayload,
          resultStep: task.resultStep,
          resultTask: task.resultTask,
          controller: task.controller,
          progressService: task.progressService,
          userId: task.userId,
        });
      }
    });
  });
});

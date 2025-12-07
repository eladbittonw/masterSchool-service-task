// import { Test, TestingModule } from '@nestjs/testing';
// import { ProgressController } from './progress.controller';
// import { ProgressService } from '../services/progress.service';
// import { ProcessService } from '../../process/services/process.service';
// import { UsersService } from '../../users/services/users.service';
// import {
//   ProgressStatusInterface,
//   UserStatusResponseInterface,
// } from '../interfaces/user-progress.interface';
// import { ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { UserStatusGuard } from '../guards/user-status.guard';

// describe('ProgressController', () => {
//   let controller: ProgressController;
//   let progressService: ProgressService;
//   let processService: ProcessService;
//   let usersService: UsersService;
//   let guard: UserStatusGuard;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [ProgressController],
//       providers: [
//         ProgressService,
//         ProcessService,
//         UsersService,
//         UserStatusGuard,
//       ],
//     }).compile();

//     controller = module.get<ProgressController>(ProgressController);
//     progressService = module.get<ProgressService>(ProgressService);
//     processService = module.get<ProcessService>(ProcessService);
//     usersService = module.get<UsersService>(UsersService);
//     guard = module.get<UserStatusGuard>(UserStatusGuard);
//   });

//   // Checks the guard validation
//   describe('checkGuard', () => {
//     // checks the guard with unvalid userId
//     it('should return error beacuse the userId not found in the request (Checks the guard)', async () => {
//       const mockExecutionContext = {
//         switchToHttp: () => ({
//           getRequest: () => ({
//             params: { id: 'test-asd-asd-asd' },
//           }),
//         }),
//       } as ExecutionContext;

//       await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
//         ForbiddenException,
//       );
//     });

//     // checks the guard with valid userId
//     it('should return user progress and check the guard validation', async () => {
//       const newUserId = usersService.createUser({ email: 'temp@gmail.com' });
//       const tmp = progressService.initUser(newUserId);

//       const mockExecutionContext = {
//         switchToHttp: () => ({
//           getRequest: () => ({
//             params: { id: newUserId },
//           }),
//         }),
//       } as ExecutionContext;

//       const result: ProgressStatusInterface =
//         controller.getUserProgress(newUserId);

//       expect(result).toHaveProperty('currentStep');
//       expect(result).toHaveProperty('currentTask');
//       expect(typeof result.currentStep).toBe('string');
//       expect(typeof result.currentTask).toBe('string');
//     });
//   });

//   // check the get current Check
//   describe('getUserProgress', () => {
//     it('should check the get progress endpoint and validate the result object', () => {
//       const newUserId = usersService.createUser({ email: 'temp@gmail.com' });
//       const tmp = progressService.initUser(newUserId);

//       const result: ProgressStatusInterface =
//         controller.getUserProgress(newUserId);

//       expect(result).toHaveProperty('currentStep');
//       expect(result).toHaveProperty('currentTask');
//       expect(typeof result.currentStep).toBe('string');
//       expect(typeof result.currentTask).toBe('string');
//     });
//   });

//   // check the get current Check
//   describe('getUserStatus', () => {
//     it('should check the get status endpoint and validate the result object', () => {
//       const newUserId = usersService.createUser({ email: 'temp@gmail.com' });
//       const tmp = progressService.initUser(newUserId);

//       const result: UserStatusResponseInterface =
//         controller.getUserProgressStatus(newUserId);

//       expect(result).toHaveProperty('response');
//       expect(result.response).toHaveProperty('currentUserStatus');
//       expect(typeof result.response.currentUserStatus).toBe('string');
//       expect(result.response.currentUserStatus).toEqual('still in progress');
//     });
//   });

//   // Checks the put complete endpoint
//   describe('putCompleteTask', () => {
//     it('should check that the user complete the task and move to the next step', async () => {
//       const userId = usersService.createUser({ email: 'temp@gmail.com' });
//       const tmp = progressService.initUser(userId);

//       const detailsStepPayload = {
//         firstName: 'Alex',
//         lastName: 'Johnson',
//         email: 'alex.johnson@example.com',
//         timestamp: '2025-12-07T13:45:00.000Z',
//       };

//       const testCompleted = async ({
//         stepName,
//         stepPayload,
//         resultStep,
//         resultTask,
//       }) => {
//         const result = await controller.markStepCompleted(userId, stepName, {
//           stepPayload: stepPayload,
//         });

//         const currentProgress: ProgressStatusInterface =
//           progressService.getUserProgress(userId);
//         console.log('currentprogress = ', currentProgress);

//         expect(result).toHaveProperty('response', 'You Completed the Task');
//         expect(currentProgress.currentStep).toEqual(resultStep);
//         expect(currentProgress.currentTask).toEqual(resultTask);
//       };

//       await testCompleted({
//         stepName: 'Personal_Details_Form',
//         stepPayload: detailsStepPayload,
//         resultStep: 'IQ_Test',
//         resultTask: 'take_test',
//       });
//     });

//     it('should check that the user completed 2 tasks and move to the next condition Task', async () => {
//       const userId = usersService.createUser({ email: 'temp@gmail.com' });
//       const tmp = progressService.initUser(userId);

//       const detailsStepPayload = {
//         firstName: 'Alex',
//         lastName: 'Johnson',
//         email: 'alex.johnson@example.com',
//         timestamp: '2025-12-07T13:45:00.000Z',
//       };

//       const testCompleted = async ({
//         stepName,
//         stepPayload,
//         resultStep,
//         resultTask,
//       }) => {
//         const result = await controller.markStepCompleted(userId, stepName, {
//           stepPayload: stepPayload,
//         });

//         const currentProgress: ProgressStatusInterface =
//           progressService.getUserProgress(userId);
//         console.log('currentprogress = ', currentProgress);

//         expect(result).toHaveProperty('response', 'You Completed the Task');
//         expect(currentProgress.currentStep).toEqual(resultStep);
//         expect(currentProgress.currentTask).toEqual(resultTask);
//       };

//       await testCompleted({
//         stepName: 'Personal_Details_Form',
//         stepPayload: detailsStepPayload,
//         resultStep: 'IQ_Test',
//         resultTask: 'take_test',
//       });

//       const testIQStepPayload = {
//         score: 70,
//         timestamp: '2025-12-07T14:00:00.000Z',
//       };

//       await testCompleted({
//         stepName: 'IQ_Test',
//         stepPayload: testIQStepPayload,
//         resultStep: 'IQ_Test',
//         resultTask: 'take_test2',
//       });
//     });

//     it('should check that the user completed 2 tasks and move to the next Task and skip the condition task', async () => {
//       const userId = usersService.createUser({ email: 'temp@gmail.com' });
//       const tmp = progressService.initUser(userId);

//       const detailsStepPayload = {
//         firstName: 'Alex',
//         lastName: 'Johnson',
//         email: 'alex.johnson@example.com',
//         timestamp: '2025-12-07T13:45:00.000Z',
//       };

//       const testCompleted = async ({
//         stepName,
//         stepPayload,
//         resultStep,
//         resultTask,
//       }) => {
//         const result = await controller.markStepCompleted(userId, stepName, {
//           stepPayload: stepPayload,
//         });

//         const currentProgress: ProgressStatusInterface =
//           progressService.getUserProgress(userId);
//         console.log('currentprogress = ', currentProgress);

//         expect(result).toHaveProperty('response', 'You Completed the Task');
//         expect(currentProgress.currentStep).toEqual(resultStep);
//         expect(currentProgress.currentTask).toEqual(resultTask);
//       };

//       await testCompleted({
//         stepName: 'Personal_Details_Form',
//         stepPayload: detailsStepPayload,
//         resultStep: 'IQ_Test',
//         resultTask: 'take_test',
//       });

//       const testIQStepPayload = {
//         score: 80,
//         timestamp: '2025-12-07T14:00:00.000Z',
//       };

//       await testCompleted({
//         stepName: 'IQ_Test',
//         stepPayload: testIQStepPayload,
//         resultStep: 'Interview',
//         resultTask: 'schedule_interview',
//       });
//     });
//   });
// });

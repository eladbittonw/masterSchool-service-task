import { Test, TestingModule } from '@nestjs/testing';
import { ProcessController } from '../../src/modules/process/controllers/process.controller';
import { ProcessService } from '../../src/modules/process/services/process.service';
import { FullProcessType } from 'src/modules/process/interfaces/process.interface';

describe('ProcessController', () => {
  let controller: ProcessController;
  let processService: ProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessController],
      providers: [ProcessService],
    }).compile();

    controller = module.get<ProcessController>(ProcessController);
    processService = module.get<ProcessService>(ProcessService);
  });

  // Checks that the return of the full process flow is good
  it('should return the full process flow', () => {
    // Gets the full process flow
    const result: FullProcessType = controller.getFullProcess();

    // Check the structure of the response
    expect(result).toHaveProperty('response');
    expect(result.response).toHaveProperty('fullProcessDisplay');
    expect(result.response).toHaveProperty('totalStepsNumber');
    expect(result.response).toHaveProperty('totalTasksNumber');
  });
});

import {
  IQTestDto,
  JoinSlackDto,
  PerformInterviewDto,
  PersonalDetailsDto,
  ProcessPaymentDto,
  ScheduleIntreviewDto,
  SecondIQTestDto,
  SignContractDto,
  UploadIdentificationDocumentDto,
} from '../../../dtos/progress.dto';
import { Step } from '../interfaces/process.interface';

// HI, please read the instructions for creating a new task -

// Step object - {name, task}:
//    name: The name of the step,
//    task: The task details of the step (Task Object),

// Task object - {name, passCondition, isVisible, payloadType}
//     name: The name of the task,
//     passCondition: This is the condition to pass the task, the payload is what ever you decide in the type Dtos
//     isVisible: This checks if the task is visible, it can be a condition with payload - the payload is the previous task payload
//     payloadType: This is the payload type for this Task make sure to add the dto type in the dtos file: onboarding-service-task/src/dtos/progress.dto.ts

export const processDef: Step[] = [
  {
    name: 'Personal_Details_Form',
    tasks: [
      {
        name: 'submit_form',
        passCondition: (payload) => true,
        isVisible: true,
        payloadType: PersonalDetailsDto,
      },
    ],
  },
  {
    name: 'IQ_Test',
    tasks: [
      {
        name: 'take_test',
        passCondition: (payload) =>
          payload.score > 75 || (payload.score < 75 && payload.score > 60),
        isVisible: true,
        payloadType: IQTestDto,
      },
      {
        name: 'take_test2',
        passCondition: (payload) => payload.score > 75,
        isVisible: (payload) => payload.score < 75 && payload.score > 60,
        payloadType: SecondIQTestDto,
      },
    ],
  },
  {
    name: 'Interview',
    tasks: [
      {
        name: 'schedule_interview',
        passCondition: (payload) => true, // always passes when completed
        isVisible: true,
        payloadType: ScheduleIntreviewDto,
      },
      {
        name: 'perform_interview',
        passCondition: (payload) => payload.decision === 'passed_interview',
        isVisible: true,
        payloadType: PerformInterviewDto,
      },
    ],
  },
  {
    name: 'Sign_Contract',
    tasks: [
      {
        name: 'upload_identification_document',
        passCondition: (payload) => true, // always passes when completed
        isVisible: true,
        payloadType: UploadIdentificationDocumentDto,
      },
      {
        name: 'sign_contract',
        passCondition: (payload) => true, // always passes when completed
        isVisible: true,
        payloadType: SignContractDto,
      },
    ],
  },
  {
    name: 'Payment',
    tasks: [
      {
        name: 'process_payment',
        passCondition: (payload) => true, // always passes when completed
        isVisible: true,
        payloadType: ProcessPaymentDto,
      },
    ],
  },
  {
    name: 'Join_Slack',
    tasks: [
      {
        name: 'join_slack',
        passCondition: (payload) => true, // always passes when completed
        isVisible: true,
        payloadType: JoinSlackDto,
      },
    ],
  },
];

// Step interface
interface Step {
  name: string;
  tasks: Task[];
}

//  Task interface
interface Task {
  name: string;
  passCondition: (payload: any) => boolean; // give a type for every payload
  taskPayload?: any;
  status?: string;
  isVisible: ((payload: any) => boolean) | boolean;
  payloadType?: new () => any; // Reference to the DTO class
}

// Display Step interface
interface DisplayStep {
  name: string;
  tasks: DisplayTask[];
}

// Full Process type Response
type FullProcessType = {
  response: {
    fullProcessDisplay: DisplayStep[];
    totalStepsNumber: number;
    totalTasksNumber: number;
  };
};

// Validate task payload task function params type
type ValidateTaskPayloadType = {
  reqTaskPayload: any;
  currentTask: string;
  reqStepName: string;
};

// Find task function params type
type FindTaskType = {
  taskName: string;
  stepName: string;
};

// Display Task interface
type DisplayTask = Pick<Task, 'name'>;

export {
  Step,
  DisplayStep,
  Task,
  FullProcessType,
  ValidateTaskPayloadType,
  FindTaskType,
};

interface Step {
  name: string;
  tasks: Task[];
}

interface Task {
  name: string;
  passCondition: (payload: any) => boolean; // give a type for every payload
  taskPayload?: any;
  status?: string;
  isVisible: ((payload: any) => boolean) | boolean;
  payloadType?: new () => any; // Reference to the DTO class
}

interface DisplayStep {
  name: string;
  tasks: DisplayTask[];
}

type DisplayTask = Pick<Task, 'name'>;

export { Step, DisplayStep, Task };

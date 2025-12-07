// User status Type
type userStatusType = 'accepted' | 'rejected' | 'still in progress';

// Users progress Interface
interface UserProgressInterface {
  userID: string;
  processVersion: number;
  currentStep: string;
  currentTask: string;
  status: userStatusType;
}

//
type ProgressStatusType = {
  currentStep: string;
  currentTask: string;
};

type UserStatusResponseType = {
  response: { currentUserStatus: userStatusType };
};

type NextProgressResponseType = {
  nextStep: string;
  nextTask: string;
  finish: boolean;
};

type NestStepResponseType = {
  nextStep: string;
  nextTask: string;
};

export {
  UserProgressInterface,
  ProgressStatusType,
  userStatusType,
  NextProgressResponseType,
  UserStatusResponseType,
  NestStepResponseType,
};

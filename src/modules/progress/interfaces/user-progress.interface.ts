type userStatusType = 'accepted' | 'rejected' | 'still in progress';

interface UserProgressInterface {
  userID: string;
  processVersion: number;
  currentStep: string;
  currentTask: string;
  status: userStatusType;
}

type ProgressStatusInterface = {
  currentStep: string;
  currentTask: string;
};

type UserStatusResponseInterface = {
  response: { currentUserStatus: userStatusType };
};

type NextProgressResponseType = {
  nextStep: string;
  nextTask: string;
  finish: boolean;
};

export {
  UserProgressInterface,
  ProgressStatusInterface,
  userStatusType,
  NextProgressResponseType,
  UserStatusResponseInterface,
};

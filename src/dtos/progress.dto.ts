import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDate,
  Max,
  Min,
  IsNumber,
} from 'class-validator';

//change this to upper letter
class completeStepPayloadDto {
  @IsNotEmpty()
  stepPayload: any;
}

class PersonalDetailsDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}

class IQTestDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  score: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}
class SecondIQTestDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}

class ScheduleIntreviewDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  interviewDate: Date;
}

class PerformInterviewDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  interviewDate: Date;

  @IsNotEmpty()
  @IsString()
  interviewer_id: string;

  @IsNotEmpty()
  @IsString()
  decision: 'passed' | 'passed_interview';
}

class UploadIdentificationDocumentDto {
  @IsNumber()
  @IsNotEmpty()
  passportNumber: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}

class SignContractDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}

// Payment Step DTO
class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}

// Join Slack Step DTO
class JoinSlackDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}

export {
  completeStepPayloadDto,
  JoinSlackDto,
  PersonalDetailsDto,
  IQTestDto,
  ScheduleIntreviewDto,
  PerformInterviewDto,
  UploadIdentificationDocumentDto,
  SignContractDto,
  ProcessPaymentDto,
  SecondIQTestDto,
};

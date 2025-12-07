<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

MasterSchool - service task onboarding home assignment (nest js)

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

## Run tests

```bash
$ yarn run test
```

## Api endpoints

This endpoint create a new user
return: userid
```bash
Post -
http://127.0.0.1:<Port>/progress/createUser
```

This endpoint gets the current progress of a user (current step + current task)
return: currentStep, currentTask
```bash
Get -
http://127.0.0.1:<Port>/progress/getUserProgress/<userId>/current
```

This endpoint gets the current status of a user (accepted, rejected, or still in progress)
return: accepted || rejected || still in progress
```bash
Get -
http://127.0.0.1:<Port>/progress/getUserStatus/<userId>/current
```

This endpoint gets the full structure of the process flow and the number of steps and tasks
return: fullProcessDisplay, totalStepsNumber, totalTasksNumber
```bash
Get -
http://127.0.0.1:<Port>/process/
```

This endpoint tries to complete a task with a payload.
return: nextStep, nextTask | error (if the task wasn't completed) | "accepted" | "rejected"
```bash
Put -
http://127.0.0.1:<Port>/progress/<userId>/complete/<stepName>

Body -
stepPayload: {<stepPayload>}
```


## Notes

process flow structue:

1. The task is being classified by its payload and the current task.
2. IsVisible payload is using the previous task payload for creating a condition, like the example with the IQ_test.
3. Payload type is deaclerd in the Dtos file, when creating a new task you need to make sure you are also creating a new dto type for the payload and using it in the payloadType field "onboarding-service-task/src/dtos/progress.dto.ts".
4. Full explantion can be also found in the file itself.

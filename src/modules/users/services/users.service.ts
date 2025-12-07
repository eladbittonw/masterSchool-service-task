import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../../dtos/users.dto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../../utils/logger/logger';
import { UserInterface } from '../interfaces/user.interface';

@Injectable()
export class UsersService {
  // Only if checking email uniqe*****
  private users: Map<string, UserInterface> = new Map();

  // creates user in the system and return an id
  createUser(createUserDto: CreateUserDto): string {
    // Create a new id
    let newId = uuidv4();
    // make sure the id is uniqe
    if (this.users.get(newId)) {
      logger.error('ID already exists');
      // Create a new id
      newId = uuidv4();
    }
    // Create user object
    const newUser: UserInterface = {
      id: newId,
      email: createUserDto.email,
    };

    // Sets in the Map the new user data
    this.users.set(newId, newUser);
    // return the user ID for progress service
    return newId;
  }

  getUserId(userId: string) {
    return this.users.get(userId).id;
  }
}

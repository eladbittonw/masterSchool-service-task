import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
//import { UsersService } from '../../users/services/users.service';
import { ProgressService } from '../services/progress.service';

@Injectable()
export class UserStatusGuard implements CanActivate {
  // Gets the progressService
  constructor(private progressService: ProgressService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Gets the request data
    const request = context.switchToHttp().getRequest();

    // Gets the user id from the data
    const userId = request.params.id;

    // Checks if the user id is not null
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    // Check if user exists in progress tracking
    const currentUser = this.progressService.findUser(userId);
    if (!currentUser) {
      throw new ForbiddenException('User not found in users tracking');
    }

    return true;
  }
}

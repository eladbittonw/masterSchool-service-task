import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export { CreateUserDto };

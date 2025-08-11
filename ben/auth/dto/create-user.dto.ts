import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ description: "The user's first name" })
  firstName?: string;

  @ApiProperty({ description: "The user's phone number" })
  phoneNumber?: string;

  @ApiProperty({ description: "The user's last name" })
  lastName?: string;

  @ApiProperty({ description: "The user's email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: "The user's idToken" })
  @IsNotEmpty()
  @IsString()
  idToken: string;


  @ApiProperty({ description: "The user's password" })
  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}

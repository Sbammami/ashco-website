import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Email address is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsNotEmpty({ message: 'Message is required' })
  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  message: string;

  @IsOptional()
  @IsString()
  service?: string;
}

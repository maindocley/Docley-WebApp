import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;
}

export class UserProfileDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsBoolean()
  is_premium: boolean;

  @IsOptional()
  @IsString()
  role?: string;

  @IsString()
  created_at: string;
}

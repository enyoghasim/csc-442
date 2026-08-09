import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

// Accepts either a lecturer's email or a student's regNumber in the same field — the service
// layer looks up whichever one matches (see UsersRepository.findByIdentifier).
export class LoginRequest {
  @ApiProperty({
    description: 'Lecturer email or student regNumber, whichever matches',
    example: '2019/1/12345CS',
  })
  @IsString()
  @MinLength(1, { message: 'Enter your email or matric number' })
  identifier!: string;

  @ApiProperty({ example: 'hunter2' })
  @IsString()
  @MinLength(1, { message: 'Enter your password' })
  password!: string;
}

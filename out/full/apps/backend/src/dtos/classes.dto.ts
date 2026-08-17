import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateClassRequest {
  @ApiProperty({ example: 'Software Engineering' })
  @IsString()
  @MinLength(1, { message: 'Enter a class name' })
  name!: string;

  @ApiProperty({ example: 'CSC 422' })
  @IsString()
  @MinLength(1, { message: 'Enter a class code' })
  code!: string;
}

export class PatchClassRequest extends PartialType(CreateClassRequest) {}

export class EnrollStudentRequest {
  @ApiProperty({
    description: "Student's regNumber",
    example: '2019/1/12345CS',
  })
  @IsString()
  @MinLength(1, { message: 'Enter a student regNumber' })
  regNumber!: string;
}

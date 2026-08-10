import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CheckInRequest {
  @ApiProperty({ description: 'The class session the QR code belongs to' })
  @IsUUID()
  classSessionId!: string;

  @ApiProperty({
    description: 'The current rotating token scanned from the QR code',
  })
  @IsString()
  @MinLength(1)
  token!: string;
}

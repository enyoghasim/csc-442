import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsUUID } from 'class-validator';

export class ScheduleClassSessionRequest {
  @ApiProperty({ description: 'Class this session belongs to' })
  @IsUUID()
  classId!: string;

  @ApiProperty({ example: '2026-08-12T09:00:00.000Z' })
  @IsISO8601()
  startsAt!: string;

  @ApiProperty({ example: '2026-08-12T11:00:00.000Z' })
  @IsISO8601()
  endsAt!: string;
}

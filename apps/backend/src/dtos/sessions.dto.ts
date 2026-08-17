import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

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

export class ListSessionsQuery {
  @ApiProperty({ required: false, description: 'Cursor (ISO timestamp string or UUID) for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ required: false, description: 'Number of items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

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

// Query params for GET /api/attendance/me — the calendar fetches one month at a time, so this
// scopes the response instead of returning a student's entire history in one call.
export class AttendanceHistoryQuery {
  @ApiProperty({ description: '1-12', example: 8, minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 2026, minimum: 2000, maximum: 2100 })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;
}

// Query params for GET /api/attendance/classes/:classId/matrix(/export) — narrows the matrix to a
// chosen subset of sessions instead of the class's entire history. Comma-separated in the query
// string since it's a GET; transformed into a string[] here so the controller/service only ever
// see the real shape.
export class ClassMatrixQuery {
  @ApiProperty({
    required: false,
    description:
      'Comma-separated class-session IDs to include; omit for every session',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsUUID('4', { each: true })
  sessionIds?: string[];
}

import { Injectable } from '@nestjs/common';
import { AttendanceRecordsRepository } from '../../repositories/attendance-records/attendance-records.repository';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRecordsRepository: AttendanceRecordsRepository,
  ) {}

  // TODO: validate QR token + enrollment + class session window, write attendance record
  // (Sprint 3); student attendance history (Sprint 4)
}

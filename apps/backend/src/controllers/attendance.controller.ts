import { Controller, Get } from '@nestjs/common';
import { AttendanceService } from '../services/attendance/attendance.service';
import { successResponse } from '../common/utils/response-factory';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  list() {
    // TODO (Sprint 3/4): QR check-in, attendance history
    return successResponse([], 'TODO: implement attendance');
  }
}

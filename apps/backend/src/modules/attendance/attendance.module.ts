import { Module } from '@nestjs/common';
import { AttendanceController } from '../../controllers/attendance.controller';
import { AttendanceService } from '../../services/attendance/attendance.service';
import { AttendanceRecordsRepository } from '../../repositories/attendance-records/attendance-records.repository';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRecordsRepository],
})
export class AttendanceModule {}

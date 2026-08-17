import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AttendanceController } from '../../controllers/attendance.controller';
import { AttendanceService } from '../../services/attendance/attendance.service';
import { AttendanceRecordsRepository } from '../../repositories/attendance-records/attendance-records.repository';
import { EnrollmentsRepository } from '../../repositories/enrollments/enrollments.repository';
import { AuthModule } from '../auth/auth.module';
import { ClassesModule } from '../classes/classes.module';
import { ClassSessionsModule } from '../class-sessions/class-sessions.module';

@Module({
  imports: [
    AuthModule,
    ClassesModule,
    // ClassSessionsModule exports ClassSessionsService (session ownership check, reused by the
    // roster endpoint) and ClassSessionsRepository (check-in's active-window check).
    ClassSessionsModule,
    // 5 check-in attempts per minute per IP — generous for a single genuine scan-and-retry, but
    // enough to blunt scripted abuse of the endpoint.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 5 }]),
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceRecordsRepository,
    EnrollmentsRepository,
  ],
})
export class AttendanceModule {}

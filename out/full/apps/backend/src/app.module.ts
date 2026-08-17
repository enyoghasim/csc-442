import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ClassSessionsModule } from './modules/class-sessions/class-sessions.module';
import { AttendanceModule } from './modules/attendance/attendance.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    ClassesModule,
    ClassSessionsModule,
    AttendanceModule,
  ],
})
export class AppModule {}

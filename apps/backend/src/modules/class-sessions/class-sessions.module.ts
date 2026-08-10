import { Module } from '@nestjs/common';
import { SessionsController } from '../../controllers/sessions.controller';
import { ClassSessionsService } from '../../services/class-sessions/class-sessions.service';
import { ClassSessionsRepository } from '../../repositories/class-sessions/class-sessions.repository';
import { AuthModule } from '../auth/auth.module';
import { ClassesModule } from '../classes/classes.module';

@Module({
  // AuthModule: UsersRepository + RolesGuard. ClassesModule: ClassesRepository (session
  // scheduling/QR-token issuance both check the requesting lecturer owns the session's class).
  imports: [AuthModule, ClassesModule],
  controllers: [SessionsController],
  providers: [ClassSessionsService, ClassSessionsRepository],
  // AttendanceModule needs both — a session roster/check-in touches class-sessions directly.
  exports: [ClassSessionsService, ClassSessionsRepository],
})
export class ClassSessionsModule {}

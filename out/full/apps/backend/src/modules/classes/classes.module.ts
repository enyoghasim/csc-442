import { Module } from '@nestjs/common';
import { ClassesController } from '../../controllers/classes.controller';
import { ClassesService } from '../../services/classes/classes.service';
import { ClassesRepository } from '../../repositories/classes/classes.repository';
import { EnrollmentsRepository } from '../../repositories/enrollments/enrollments.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  // AuthModule exports UsersRepository (needed by ClassesService's role lookup) and RolesGuard
  // (needed by @UseGuards(RolesGuard) in ClassesController).
  imports: [AuthModule],
  controllers: [ClassesController],
  providers: [ClassesService, ClassesRepository, EnrollmentsRepository],
  // ClassesRepository is needed by ClassSessionsModule/AttendanceModule for ownership checks
  // (a session/attendance report belongs to a class, which belongs to a lecturer).
  exports: [ClassesRepository],
})
export class ClassesModule {}

import { Module } from '@nestjs/common';
import { ClassesController } from '../../controllers/classes.controller';
import { ClassesService } from '../../services/classes/classes.service';
import { ClassesRepository } from '../../repositories/classes/classes.repository';
import { EnrollmentsRepository } from '../../repositories/enrollments/enrollments.repository';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, ClassesRepository, EnrollmentsRepository],
})
export class ClassesModule {}

import { Module } from '@nestjs/common';
import { SessionsController } from '../../controllers/sessions.controller';
import { ClassSessionsService } from '../../services/class-sessions/class-sessions.service';
import { ClassSessionsRepository } from '../../repositories/class-sessions/class-sessions.repository';

@Module({
  controllers: [SessionsController],
  providers: [ClassSessionsService, ClassSessionsRepository],
})
export class ClassSessionsModule {}

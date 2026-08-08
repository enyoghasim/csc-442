import { Controller, Get } from '@nestjs/common';
import { ClassesService } from '../services/classes/classes.service';
import { successResponse } from '../common/utils/response-factory';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  list() {
    // TODO (Sprint 2): create/list/update classes, enroll students
    return successResponse([], 'TODO: implement classes');
  }
}

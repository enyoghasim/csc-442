import { Injectable } from '@nestjs/common';
import { ClassesRepository } from '../../repositories/classes/classes.repository';

@Injectable()
export class ClassesService {
  constructor(private readonly classesRepository: ClassesRepository) {}

  // TODO: create/list/update classes, enroll students (Sprint 2)
}

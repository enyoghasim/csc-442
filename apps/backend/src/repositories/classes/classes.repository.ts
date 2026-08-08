import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ClassesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // TODO: findById, findByLecturer, insert, update, etc.
}

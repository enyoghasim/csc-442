import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // TODO: findByClass, findByStudent, insert, etc.
}

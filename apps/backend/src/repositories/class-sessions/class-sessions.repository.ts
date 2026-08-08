import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ClassSessionsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // TODO: findById, findActiveByClass, insert, etc.
}

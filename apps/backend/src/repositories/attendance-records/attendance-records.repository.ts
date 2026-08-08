import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AttendanceRecordsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // TODO: findByClassSession, findByStudent, insert, etc.
}

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // TODO: findById, findByEmail, insert, etc. Accept an optional `executor: DbExecutor =
  // this.databaseService.db` param so callers can pass a transaction handle.
}

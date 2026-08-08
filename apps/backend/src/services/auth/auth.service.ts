import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../repositories/users/users.repository';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  // TODO: login(email, password) — verify credentials (bcrypt) against a seeded user, return the
  // user for the controller to attach to req.session. logout() is just req.session.destroy() in
  // the controller — no service method needed there.
}

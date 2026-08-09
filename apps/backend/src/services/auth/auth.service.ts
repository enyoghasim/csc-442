import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  UsersRepository,
  User,
} from '../../repositories/users/users.repository';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async login(identifier: string, password: string): Promise<User> {
    const user = await this.usersRepository.findByIdentifier(identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches)
      throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new UnauthorizedException('Session user no longer exists');
    return user;
  }
}

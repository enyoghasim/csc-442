import { Module } from '@nestjs/common';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth/auth.service';
import { UsersRepository } from '../../repositories/users/users.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersRepository],
})
export class AuthModule {}

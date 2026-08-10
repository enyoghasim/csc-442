import { Module } from '@nestjs/common';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth/auth.service';
import { UsersRepository } from '../../repositories/users/users.repository';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, RolesGuard],
  // Exported so domain modules can `@UseGuards(SessionAuthGuard, RolesGuard)` once their
  // routes need role-restricted access (RolesGuard needs UsersRepository via DI to resolve).
  exports: [UsersRepository, RolesGuard],
})
export class AuthModule {}

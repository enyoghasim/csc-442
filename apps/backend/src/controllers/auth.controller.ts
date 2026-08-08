import { Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth/auth.service';
import { successResponse } from '../common/utils/response-factory';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login() {
    // TODO (Sprint 1): validate credentials via AuthService, then session.userId = user.id,
    // session.role = user.role. Dashboard reads the resulting httpOnly cookie; mobile reads the
    // returned session id and attaches it as `Authorization: Session <id>` on future requests.
    return successResponse(null, 'TODO: implement login');
  }

  @Post('logout')
  logout() {
    // TODO (Sprint 1): req.session.destroy()
    return successResponse(null, 'TODO: implement logout');
  }
}

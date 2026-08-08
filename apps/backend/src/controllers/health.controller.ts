import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../services/health/health.service';
import { successResponse } from '../common/utils/response-factory';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check() {
    return successResponse(this.healthService.check());
  }
}

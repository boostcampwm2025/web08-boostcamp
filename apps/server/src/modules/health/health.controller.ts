import { Controller, Get } from '@nestjs/common';
import { API_ENDPOINTS } from '@codejam/common';

@Controller(API_ENDPOINTS.HEALTH)
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@Controller()
@ApiTags('Health')
export class AppController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint for Railway' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return await this.healthService.checkHealth();
  }

  @Get('health')
  @ApiOperation({ summary: 'Dedicated /health endpoint for Railway' })
  @ApiResponse({ status: 200, description: 'Healthcheck OK' })
  health() {
    return { status: 'ok' };
  }
}

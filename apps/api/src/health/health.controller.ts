import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export interface HealthStatusResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
}

@ApiTags('Health')
@Controller()
export class HealthController {
  private _isReady = true;

  public setReady(ready: boolean): void {
    this._isReady = ready;
  }

  @Get('healthz')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe (shallow process check)' })
  @ApiResponse({ status: 200, description: 'Process is alive' })
  public getLiveness(): HealthStatusResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readyz')
  @ApiOperation({ summary: 'Readiness probe (traffic detachment check)' })
  @ApiResponse({ status: 200, description: 'Ready to receive traffic' })
  @ApiResponse({ status: 503, description: 'Not ready to receive traffic' })
  public getReadiness(): HealthStatusResponse {
    if (!this._isReady) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

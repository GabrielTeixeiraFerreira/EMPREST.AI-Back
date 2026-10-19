import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { RootMessageResponse, SystemService } from './system.service';

@Controller()
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getRoot(): RootMessageResponse {
    return this.systemService.getRootMessage();
  }
}


import { Injectable } from '@nestjs/common';

export interface RootMessageResponse {
  message: string;
}

@Injectable()
export class SystemService {
  getRootMessage(): RootMessageResponse {
    return {
      message: 'Hello World',
    };
  }
}


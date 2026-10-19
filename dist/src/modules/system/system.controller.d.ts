import { RootMessageResponse, SystemService } from './system.service';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getRoot(): RootMessageResponse;
}

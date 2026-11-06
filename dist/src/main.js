"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('v1', { exclude: ['/'] });
    app.enableCors({
        origin: (requestOrigin, callback) => {
            const configuredOrigins = process.env.CORS_ORIGIN
                ?.split(',')
                .map((origin) => origin.trim())
                .filter(Boolean) ?? [];
            const isDevelopmentOrigin = process.env.NODE_ENV !== 'production' &&
                (!requestOrigin ||
                    requestOrigin === 'null' ||
                    /^https?:\/\/localhost(:\d+)?$/.test(requestOrigin));
            if (configuredOrigins.includes(requestOrigin ?? '') || isDevelopmentOrigin) {
                callback(null, true);
                return;
            }
            callback(new Error('Origin not allowed by CORS'));
        },
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map
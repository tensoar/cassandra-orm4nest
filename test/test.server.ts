// test.server.ts
import 'reflect-metadata'; // 引入元数据支持
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import OrmTestModule from "./orm-test.module";

async function bootstrap() {
    const port = 30000;
    const app = await NestFactory.create<NestExpressApplication>(OrmTestModule);
    await app.listen(port, () => console.log(`server listening on port :${port}`));
}
bootstrap();
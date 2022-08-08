// orm-test.module.ts
import { Module } from "@nestjs/common";
import { auth } from "cassandra-driver";

import { CassandraOrmModule } from "../lib";
import DeviceController from "./device.controller";
import Device from "./device.entity";
import DeviceService from "./device.service";
import env from "./env.util";

@Module({
    imports: [
        CassandraOrmModule.forRoot({
            contactPoints: [...env.host.split(',')],
            authProvider: new auth.PlainTextAuthProvider(env.username, env.password),
            localDataCenter: env.datacenter
        }),
        CassandraOrmModule.forFeature([
            Device,
        ])
    ],
    controllers: [DeviceController],
    providers: [DeviceService]
})
export default class OrmTestModule {}
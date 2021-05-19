// orm-test.module.ts
import { Module } from "@nestjs/common";
import { auth } from "cassandra-driver";

import CassandraOrmModule from "../lib/module/cassandra-orm.module";
import DeviceController from "./device.controller";
import Device from "./device.entity";
import DeviceService from "./device.service";

@Module({
    imports: [
        CassandraOrmModule.forRoot({
            contactPoints: ['localhost'],
            authProvider: new auth.PlainTextAuthProvider('username', 'password'),
            localDataCenter: 'datacenter1'
        }),
        CassandraOrmModule.forFeature([
            Device
        ])
    ],
    controllers: [DeviceController],
    providers: [DeviceService]
})
export default class OrmTestModule {}
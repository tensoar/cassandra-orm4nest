// device.service.ts
import { Injectable } from "@nestjs/common";
import { Client } from "cassandra-driver";

import { InjectClient, InjectMapper, BaseService } from "../lib";
import Device from "./device.entity";

@Injectable()
export default class DeviceService extends BaseService<Device> { // 继承服务基类
    constructor(
        @InjectMapper(Device) private readonly mapper,
        @InjectClient() client: Client
    ) {
        super(client, mapper, Device); // 父类构造
    }
}
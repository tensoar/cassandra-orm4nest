import { Client } from "cassandra-driver";
import { BaseService } from "../lib";
import Device from "./device.entity";
export default class DeviceService extends BaseService<Device> {
    private readonly mapper;
    constructor(mapper: any, client: Client);
}

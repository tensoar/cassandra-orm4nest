import { Client, mapping } from "cassandra-driver";
import { BaseService } from "../lib";
import Device from "./device.entity";
export default class DeviceService extends BaseService<Device> {
    private readonly mapper;
    constructor(mapper: mapping.Mapper, client: Client);
    private execDeleteByDeviceNumber;
    deleteBySerialNumber(serialNumber: string): Promise<import("cassandra-driver").types.ResultSet>;
}

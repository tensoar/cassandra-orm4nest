// device.service.ts
import { Injectable } from "@nestjs/common";
import { Client, mapping } from "cassandra-driver";

import { InjectClient, InjectMapper, BaseService } from "../lib";
import Device from "./device.entity";

@Injectable()
export default class DeviceService extends BaseService<Device> { // 继承服务基类
    constructor(
        @InjectMapper(Device) private readonly mapper: mapping.Mapper,
        @InjectClient() client: Client
    ) {
        super(client, mapper, Device); // 父类构造
    }

    // cassandra-driver在执行remove时必须写全所有分区键与集群键(应该是为了效率考虑),但cassandra没有此限制(cassandra只对update有限制)
    // 可以通过映射执行原始语句绕过限制
    // device有serial_number与create_time两个主键，通过原始cql
    // 当然,此情况也可直接通过delete函数删除,delete是将删除语句转为原始的cql语句进行删除
    private execDeleteByDeviceNumber = this.mapCqlAsExecution('delete from wt_test.device where serial_number = :serial_number');
    public async deleteBySerialNumber(serialNumber: string) {
        return this.execDeleteByDeviceNumber({serialNumber});
    }
}
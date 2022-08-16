// device.controller.ts
import { Controller, Get } from "@nestjs/common";
import { mapping } from 'cassandra-driver';
import { assert } from "console";

import Device from "./device.entity";
import DeviceService from "./device.service";

const q = mapping.q;

@Controller('device')
export default class DeviceController {
    constructor(
        private readonly deviceService: DeviceService,
    ){}

    @Get('doSomthing')
    async doSomething() {
        const device1 = new Device();
        device1.serialNumber = 'dev1';
        device1.createTime = new Date();
        device1.isOnline = false;
        device1.version = "v1";

        const device2 = new Device();
        device2.serialNumber = 'dev2';
        device2.createTime = new Date();
        device2.isOnline = true;
        device2.version = "v1";

        console.log('----------< Save Many >-----------');
        await this.deviceService.saveMany([device1, device2]);

        console.log('----------< Find All >---_--------');
        const allDevices = await this.deviceService.findAll();
        assert(allDevices.length === 2, 'assert saveMany');

        console.log('--------< Find Real All >-----------');
        const allRealDevices = await this.deviceService.findRealAll();
        assert(allRealDevices.length === 2, 'assert findRealAll');

        console.log('---------< Find Many >------------');
        const devs1 = await this.deviceService.findMany({serialNumber: 'dev1', createTime: q.lte(device1.createTime)});
        assert(devs1.length === 1 && devs1[0].serialNumber == 'dev1', 'assert findMany');

        console.log('--------< Find Real Many >-----------');
        const devs2 = await this.deviceService.findRealMany({serialNumber: 'dev2', createTime: q.gte(device2.createTime)}, {fields: ['serialNumber', 'createTime', 'version'],});
        assert(devs2.length === 1 && devs2[0].serialNumber === 'dev2', 'assert findRealMany');

        console.log('-----------< Update >--------------');
        const dev2 = devs2[0];
        dev2.version = 'v2';
        dev2.isOnline = !dev2.isOnline;
        await this.deviceService.update(dev2, {fields: ['serialNumber', 'createTime', 'version']});
        const v2New = await this.deviceService.findOne({serialNumber: 'dev2'});
        assert(v2New.version === 'v2' && v2New.isOnline === true, 'assert update');

        const dev1 = devs1[0];
        dev1.isOnline = false;
        await this.deviceService.updateMany([{
            value: dev1,
            docInfo: {fields: ['serialNumber', 'createTime', 'isOnline']} 
        }]);
        const dev1New = await this.deviceService.findOne({serialNumber: 'dev1'});
        assert(dev1New.isOnline === false, 'assert updateMany');

        console.log('-----------< Remove >-------------');
        await this.deviceService.remove({serialNumber: 'dev1', createTime: q.gte(device1.createTime)});
        assert((await this.deviceService.findAll()).length === 1, 'assert remove');

        console.log('---------< Remove Many >-----------');
        await this.deviceService.removeMany([{value: {serialNumber: 'dev2', createTime: q.gte(device1.createTime)}}]);
        assert((await this.deviceService.findAll()).length === 0, 'assert removeMany');

        console.log('---------< Map Delete >-----------');
        await this.deviceService.saveMany([device1, device2]);
        await this.deviceService.deleteBySerialNumber(device1.serialNumber);
        assert((await this.deviceService.findAll()).length === 1, 'assert Map Delete');
        await this.deviceService.deleteBySerialNumber(device2.serialNumber);
        assert((await this.deviceService.findAll()).length === 0, 'assert Map Delete');

        return { msg: "all finished ..."};
    }
}
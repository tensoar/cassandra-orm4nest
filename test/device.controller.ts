// device.controller.ts
import { Controller, Get, Req } from "@nestjs/common";
import { mapping } from 'cassandra-driver';
import { assert } from "console";

import Device from "./device.entity";
import DeviceService from "./device.service";

const q = mapping.q;

@Controller('device')
export default class DeviceController {
    constructor(
        private readonly deviceService: DeviceService
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

        console.log('----------saveMany-----------');
        await this.deviceService.saveMany([device1, device2]);

        console.log('----------findAll-----------');
        const allDevices = await this.deviceService.findAll();
        assert(allDevices.length == 2, 'assert 1');

        console.log('----------findRealAll-----------');
        const allRealDevices = await this.deviceService.findRealAll();
        assert(allRealDevices.length == 2, 'assert 2');

        console.log('----------findMany-----------');
        const devs1 = await this.deviceService.findMany({serialNumber: 'dev1', createTime: q.lte(device1.createTime)});
        assert(devs1.length == 1 && devs1[0].serialNumber == 'dev1', 'assert 3');

        console.log('----------findRealMany-----------');
        const devs2 = await this.deviceService.findRealMany({serialNumber: 'dev2', createTime: q.gte(device2.createTime)});
        assert(devs2.length == 1 && devs2[0].serialNumber == 'dev2', 'assert 4');

        console.log('----------update-----------');
        const dev2 = devs2[0];
        dev2.version = 'v2';
        dev2.isOnline = !dev2.isOnline;
        await this.deviceService.update(dev2, {fields: ['serialNumber', 'createTime', 'version']});
        const v2New = await this.deviceService.findOne({serialNumber: 'dev2'});
        assert(v2New.version == 'v2' && v2New.isOnline == true, 'assert 5');

        const dev1 = devs1[0];
        dev1.isOnline = false;
        await this.deviceService.updateMany([{
            value: dev1,
            docInfo: {fields: ['serialNumber', 'createTime', 'isOnline']} 
        }]);
        const dev1New = await this.deviceService.findOne({serialNumber: 'dev1'});
        assert(dev1New.isOnline == false);

        console.log('----------remove1-----------');
        await this.deviceService.remove({serialNumber: 'dev1', createTime: q.gte(device1.createTime)});
        assert((await this.deviceService.findAll()).length == 1, 'assert 6');

        console.log('----------remove2-----------');
        await this.deviceService.removeMany([{value: {serialNumber: 'dev2', createTime: q.gte(device1.createTime)}}]);
        assert((await this.deviceService.findAll()).length == 0, 'assert 7');
        return { msg: "all finished ..."};
    }
}
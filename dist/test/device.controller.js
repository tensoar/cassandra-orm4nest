"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const cassandra_driver_1 = require("cassandra-driver");
const console_1 = require("console");
const device_entity_1 = require("./device.entity");
const device_service_1 = require("./device.service");
const q = cassandra_driver_1.mapping.q;
let DeviceController = class DeviceController {
    constructor(deviceService) {
        this.deviceService = deviceService;
    }
    async doSomething() {
        const device1 = new device_entity_1.default();
        device1.serialNumber = 'dev1';
        device1.createTime = new Date();
        device1.isOnline = false;
        device1.version = "v1";
        const device2 = new device_entity_1.default();
        device2.serialNumber = 'dev2';
        device2.createTime = new Date();
        device2.isOnline = true;
        device2.version = "v1";
        console.log('----------< saveMany >-----------');
        await this.deviceService.saveMany([device1, device2]);
        console.log('----------< findAll >---_--------');
        const allDevices = await this.deviceService.findAll();
        (0, console_1.assert)(allDevices.length == 2, 'assert saveMany');
        console.log('--------< findRealAll >-----------');
        const allRealDevices = await this.deviceService.findRealAll();
        (0, console_1.assert)(allRealDevices.length == 2, 'assert findRealAll');
        console.log('---------< findMany >------------');
        const devs1 = await this.deviceService.findMany({ serialNumber: 'dev1', createTime: q.lte(device1.createTime) });
        (0, console_1.assert)(devs1.length == 1 && devs1[0].serialNumber == 'dev1', 'assert findMany');
        console.log('--------< findRealMany >-----------');
        const devs2 = await this.deviceService.findRealMany({ serialNumber: 'dev2', createTime: q.gte(device2.createTime) });
        (0, console_1.assert)(devs2.length == 1 && devs2[0].serialNumber == 'dev2', 'assert findRealMany');
        console.log('----------update-----------');
        const dev2 = devs2[0];
        dev2.version = 'v2';
        dev2.isOnline = !dev2.isOnline;
        await this.deviceService.update(dev2, { fields: ['serialNumber', 'createTime', 'version'] });
        const v2New = await this.deviceService.findOne({ serialNumber: 'dev2' });
        (0, console_1.assert)(v2New.version == 'v2' && v2New.isOnline == true, 'assert update');
        const dev1 = devs1[0];
        dev1.isOnline = false;
        await this.deviceService.updateMany([{
                value: dev1,
                docInfo: { fields: ['serialNumber', 'createTime', 'isOnline'] }
            }]);
        const dev1New = await this.deviceService.findOne({ serialNumber: 'dev1' });
        (0, console_1.assert)(dev1New.isOnline == false, 'assert updateMany');
        console.log('-----------< remove >-------------');
        await this.deviceService.remove({ serialNumber: 'dev1', createTime: q.gte(device1.createTime) });
        (0, console_1.assert)((await this.deviceService.findAll()).length == 1, 'assert remove');
        console.log('---------< removeMany >-----------');
        await this.deviceService.removeMany([{ value: { serialNumber: 'dev2', createTime: q.gte(device1.createTime) } }]);
        (0, console_1.assert)((await this.deviceService.findAll()).length == 0, 'assert removeMany');
        return { msg: "all finished ..." };
    }
};
__decorate([
    (0, common_1.Get)('doSomthing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "doSomething", null);
DeviceController = __decorate([
    (0, common_1.Controller)('device'),
    __metadata("design:paramtypes", [device_service_1.default])
], DeviceController);
exports.default = DeviceController;
//# sourceMappingURL=device.controller.js.map
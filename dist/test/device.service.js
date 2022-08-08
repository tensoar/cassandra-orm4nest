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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const cassandra_driver_1 = require("cassandra-driver");
const lib_1 = require("../lib");
const device_entity_1 = require("./device.entity");
let DeviceService = class DeviceService extends lib_1.BaseService {
    constructor(mapper, client) {
        super(client, mapper, device_entity_1.default);
        this.mapper = mapper;
        this.execDeleteByDeviceNumber = this.mapCqlAsExecution('delete from wt_test.device where serial_number = :serial_number');
    }
    async deleteBySerialNumber(serialNumber) {
        return this.execDeleteByDeviceNumber({ serialNumber });
    }
};
DeviceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, lib_1.InjectMapper)(device_entity_1.default)),
    __param(1, (0, lib_1.InjectClient)()),
    __metadata("design:paramtypes", [cassandra_driver_1.mapping.Mapper, cassandra_driver_1.Client])
], DeviceService);
exports.default = DeviceService;
//# sourceMappingURL=device.service.js.map
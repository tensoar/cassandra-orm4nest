"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const cassandra_driver_1 = require("cassandra-driver");
const lib_1 = require("../lib");
const device_controller_1 = require("./device.controller");
const device_entity_1 = require("./device.entity");
const device_service_1 = require("./device.service");
const env_util_1 = require("./env.util");
let OrmTestModule = class OrmTestModule {
};
OrmTestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            lib_1.CassandraOrmModule.forRoot({
                contactPoints: [...env_util_1.default.host.split(',')],
                authProvider: new cassandra_driver_1.auth.PlainTextAuthProvider(env_util_1.default.username, env_util_1.default.password),
                localDataCenter: env_util_1.default.datacenter
            }),
            lib_1.CassandraOrmModule.forFeature([
                device_entity_1.default,
            ])
        ],
        controllers: [device_controller_1.default],
        providers: [device_service_1.default]
    })
], OrmTestModule);
exports.default = OrmTestModule;
//# sourceMappingURL=orm-test.module.js.map
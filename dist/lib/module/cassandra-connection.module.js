"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CassandraConnectionModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const cassandra_driver_1 = require("cassandra-driver");
const constants_helper_1 = require("../helper/constants.helper");
let CassandraConnectionModule = CassandraConnectionModule_1 = class CassandraConnectionModule {
    static forRegister(options) {
        const DseClientOptionsProvider = {
            provide: constants_helper_1.DSE_CLIENT_OPTIONS_PROVIDER_NAME,
            useValue: options
        };
        const CassandraClientProvider = {
            provide: constants_helper_1.CASSANDRA_CLIENT_PROVIDER_NAME,
            useFactory: async () => {
                const client = new cassandra_driver_1.Client(options);
                await client.connect().then(() => {
                    common_1.Logger.log(`cassandra connected to contact point: ${options.contactPoints.join(',')}`, 'CassandraClient');
                }).catch(e => {
                    console.log(e);
                    common_1.Logger.log(`connect to cassandra failed with contact point: ${options.contactPoints.join(',')}`, 'CassandraClient');
                });
                return client;
            }
        };
        return {
            module: CassandraConnectionModule_1,
            providers: [DseClientOptionsProvider, CassandraClientProvider],
            exports: [DseClientOptionsProvider, CassandraClientProvider]
        };
    }
};
CassandraConnectionModule = CassandraConnectionModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], CassandraConnectionModule);
exports.default = CassandraConnectionModule;
//# sourceMappingURL=cassandra-connection.module.js.map
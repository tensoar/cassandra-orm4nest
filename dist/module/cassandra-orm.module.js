"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CassandraOrmModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const providers_helper_1 = require("../helper/providers.helper");
const cassandra_connection_module_1 = require("./cassandra-connection.module");
let CassandraOrmModule = CassandraOrmModule_1 = class CassandraOrmModule {
    static forRoot(options) {
        return {
            module: CassandraOrmModule_1,
            imports: [cassandra_connection_module_1.default.forRegister(options)]
        };
    }
    static forFeature(Entities) {
        const mapperProviders = (0, providers_helper_1.getMapperProviders)(Entities);
        return {
            module: CassandraOrmModule_1,
            providers: mapperProviders,
            exports: mapperProviders
        };
    }
};
CassandraOrmModule = CassandraOrmModule_1 = __decorate([
    (0, common_1.Module)({})
], CassandraOrmModule);
exports.default = CassandraOrmModule;
//# sourceMappingURL=cassandra-orm.module.js.map
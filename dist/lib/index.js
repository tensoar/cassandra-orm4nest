"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = exports.InjectClient = exports.Column = exports.InjectMapper = exports.BaseService = exports.CassandraOrmModule = void 0;
require("reflect-metadata");
var cassandra_orm_module_1 = require("./module/cassandra-orm.module");
Object.defineProperty(exports, "CassandraOrmModule", { enumerable: true, get: function () { return cassandra_orm_module_1.default; } });
var base_service_curd_1 = require("./curd/base-service.curd");
Object.defineProperty(exports, "BaseService", { enumerable: true, get: function () { return base_service_curd_1.default; } });
var Inject_mapper_decorator_1 = require("./decorator/Inject-mapper.decorator");
Object.defineProperty(exports, "InjectMapper", { enumerable: true, get: function () { return Inject_mapper_decorator_1.default; } });
var column_decorator_1 = require("./decorator/column.decorator");
Object.defineProperty(exports, "Column", { enumerable: true, get: function () { return column_decorator_1.default; } });
var inject_client_decorator_1 = require("./decorator/inject-client.decorator");
Object.defineProperty(exports, "InjectClient", { enumerable: true, get: function () { return inject_client_decorator_1.default; } });
var entity_decorator_1 = require("./decorator/entity.decorator");
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return entity_decorator_1.default; } });
//# sourceMappingURL=index.js.map
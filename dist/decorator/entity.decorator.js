"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Entity(options) {
    return target => {
        Reflect.defineMetadata('keyspace', options.keyspace, target);
        Reflect.defineMetadata('table', options.table, target);
    };
}
exports.default = Entity;
//# sourceMappingURL=entity.decorator.js.map
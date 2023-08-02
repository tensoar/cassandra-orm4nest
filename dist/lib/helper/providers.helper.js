"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMapperProviders = exports.getMapperInjectName = void 0;
const cassandra_driver_1 = require("cassandra-driver");
const metadata_storage_helper_1 = require("./metadata-storage.helper");
function getMapperInjectName(Entity) {
    return `${Reflect.getMetadata('keyspace', Entity)}_${Reflect.getMetadata('table', Entity)}Mapper`;
}
exports.getMapperInjectName = getMapperInjectName;
function getMapperProviders(Entities) {
    return (Entities || []).map(Entity => ({
        provide: getMapperInjectName(Entity),
        inject: ['CassandraClient'],
        useFactory: (cassandraClient) => {
            const tableName = Reflect.getMetadata('table', Entity);
            const keyspace = Reflect.getMetadata('keyspace', Entity);
            const columnMetas = metadata_storage_helper_1.default.getColumMetadatasOfClass(Entity.name);
            const columns = {};
            for (let meta of columnMetas) {
                if (!meta.fromModel && !meta.isJonStr && !meta.toModel) {
                    columns[meta.dbName] = meta.propertyName;
                }
                else {
                    const colInfo = {
                        name: meta.propertyName,
                    };
                    if (meta.isJonStr) {
                        colInfo['fromModel'] = JSON.stringify;
                        colInfo['toModel'] = JSON.parse;
                    }
                    if (meta.fromModel) {
                        colInfo['fromModel'] = meta.fromModel;
                    }
                    if (meta.toModel) {
                        colInfo['toModel'] = meta.toModel;
                    }
                    columns[meta.dbName] = colInfo;
                }
            }
            const mappingOptions = {
                models: {
                    [tableName]: {
                        keyspace,
                        tables: [tableName],
                        columns: columns,
                        mappings: new cassandra_driver_1.mapping.UnderscoreCqlToCamelCaseMappings(),
                    }
                }
            };
            return new cassandra_driver_1.mapping.Mapper(cassandraClient, mappingOptions);
        }
    }));
}
exports.getMapperProviders = getMapperProviders;
//# sourceMappingURL=providers.helper.js.map
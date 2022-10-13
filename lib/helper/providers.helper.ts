// provider.helper.ts
import { Client, mapping } from "cassandra-driver";
import MetadataStorageHelper from "./metadata-storage.helper";
import { ModelColumnOptions } from "./types.helper";

/**
 * 获取实体类对应的mapper的注入名称
 * @param Entity 实体类
 * @returns {string}
 */
export function getMapperInjectName(Entity: ObjectConstructor) {
    return `${Reflect.getMetadata('keyspace', Entity)}_${Reflect.getMetadata('table', Entity)}Mapper`;
}

/**
 * 读取类的元数据，生成mapper提供者
 * @param entities 实体类
 */
export function getMapperProviders(Entities: ObjectConstructor[]) {
    return (Entities || []).map(Entity => ({
        provide: getMapperInjectName(Entity),
        inject: ['CassandraClient'], // 注入cassandra客户端
        useFactory: (cassandraClient: Client) => {
            const tableName = Reflect.getMetadata('table', Entity) as string;
            const keyspace = Reflect.getMetadata('keyspace', Entity) as string;
            // 拿出实体中所有属性的元数据
            const columnMetas = MetadataStorageHelper.getColumMetadatasOfClass(Entity.name);
            // 数据库中列名与实体中列名的对应关系
            const columns: {[key: string]: string | ModelColumnOptions} = {};
            for (let meta of columnMetas) {
                if (!meta.fromModel && !meta.isJonStr && !meta.toModel) {
                    columns[meta.dbName] = meta.propertyName;
                } else {
                    const colInfo: ModelColumnOptions = {
                        name: meta.propertyName,
                    }
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
                        columns: columns, // 映射规则优先于mappings
                        mappings: new mapping.UnderscoreCqlToCamelCaseMappings(),  // 字段映射方式，数据库中下划线的命名方式会映射为对象中的驼峰命名方式
                    }
                }
            }
            // 生成mapper对象
            return new mapping.Mapper(cassandraClient, mappingOptions);
        }
    }));
}
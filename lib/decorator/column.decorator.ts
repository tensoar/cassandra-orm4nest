// column.decorator.ts
import { CASSANDRA_COLUMN_METADATA } from "../constants";
import MetadataStorageHelper from "../helper/metadata-storage.helper";

export type CassandraBaseType =
  | 'ascii'
  | 'bigint'
  | 'blob'
  | 'boolean'
  | 'date'
  | 'decimal'
  | 'double'
  | 'duration'
  | 'float'
  | 'inet'
  | 'int'
  | 'smallint'
  | 'text'
  | 'time'
  | 'timestamp'
  | 'timeuuid'
  | 'tinyint'
  | 'uuid'
  | 'varchar'
  | 'varint';

export interface CassandraGenericType {
  kind: 'list' | 'set' | 'map';
  valueType: CassandraFieldType;
  keyType?: CassandraFieldType; // map独有
  frozen?: boolean; // 是否冻结 frozen<>
}

export interface CassandraUdtType {
  kind: 'udt';
  udtName: string;
  keyspace?: string;
  frozen?: boolean;
}

export interface CassandraTupleType {
  kind: 'tuple';
  types: CassandraFieldType[];
  frozen?: boolean;
}

export type CassandraFieldType =
  | CassandraBaseType
  | CassandraGenericType
  | CassandraUdtType
  | CassandraTupleType;

interface ColumnDecoratorOptions {
    name: string; // 数据库中字段名称
    type: CassandraFieldType;
    partitionKey?: boolean; // 分区键
    clusteringKey?: boolean; // 聚类排序键
    clusteringOrder?: 'ASC' | 'DESC';
    static?: boolean; // 静态列
    index?: boolean | { name?: string; type: 'normal' | 'sasi' };
    ttl?: number;
    toModel?: (property: any) => any, // 转换函数，默认为null，用于设置数据库值到实体中属性值的转换规则
    fromModel?: (colum: any) => any, // 转换函数，默认为null，用于设置实体中属性值到数据库中字段值的转换规则
}

export default function Column(options?: ColumnDecoratorOptions) {
    // target为实体对象，key为属性名 
    return (target: Object, key: string) => {
        const columns = Reflect.getMetadata(CASSANDRA_COLUMN_METADATA, target.constructor) || {};
        columns[key] = options;
        Reflect.defineMetadata(CASSANDRA_COLUMN_METADATA, columns, target.constructor);
    }
}
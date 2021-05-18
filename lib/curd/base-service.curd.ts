// base-service.curd.ts

import { Client, mapping, QueryOptions, types } from "cassandra-driver";
// cassandra-driver内部实现的cql语句生成函数,默认没有导出，因此需要完整路径导入
import { QueryGenerator } from "cassandra-driver/lib/mapping/q"

import MetadataStorageHelper, { ColumnMetadataOptions } from "lib/helper/metadata-storage.helper";

type EntityConditionOptions<T> = {[key in keyof T]?: T[key] | mapping.q.QueryOperator};

/**
 * 服务基类
 */
export default class BaseService<T> {
    private readonly _mapper: mapping.Mapper;
    private readonly _client: Client;
    private readonly _Entity: any;

    protected readonly tableName: string;
    protected readonly keyspaceName: string;
    protected readonly modelMapper: mapping.ModelMapper<T>;
    protected readonly columnMetas: ColumnMetadataOptions[];
    constructor(client:  Client, mapper: mapping.Mapper, Entity: any) {
        this._client = client;
        this._mapper = mapper;
        this._Entity = Entity;

        this.keyspaceName = Reflect.getMetadata('keyspace', Entity) as string;
        this.tableName = Reflect.getMetadata('table', Entity) as string;
        this.columnMetas = MetadataStorageHelper.getColumMetadatasOfClass(Entity.name);
        this.modelMapper = mapper.forModel(this.tableName);
    }

    /**
     * 
     * @param row 数据库记录，将数据库记录转为实体
     * @returns {T}
     */
    protected row2entity(row: Iterable<{[key: string]: any}> | types.Row): T {
        const entity = new this._Entity();
        for (let meta of this.columnMetas) {
            entity[meta.propertyName] = row[meta.dbName];
        }
        return entity;
    }

    async saveOne(entity: T, docInfo?: mapping.InsertDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        await this.modelMapper.insert(entity, docInfo, execOptions);
    }

    async saveMany(entities: T[], docInfo?: mapping.InsertDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        // 做批量时cassandra有大小限制,在配置文件的batch_size_fail_threshold_in_kb项中可以配置，默认50kb，超过设置大小会导致批量配置失败
        const batches = entities.map(entity => this.modelMapper.batching.insert(entity, docInfo));
        await this._mapper.batch(batches, execOptions);
    }

    /**
     * 查询所有，需要注意的是由于cassandra-driver中mapper的机制，该方法不是返回的真正的全表数据，而是默认返回前5000条，
     * 表超过5000条记录时若要返回真正的全部数据，用findRealAll方法
     * @param docInfo 文档查询配置
     * @param execOptions 执行配置
     * @returns {T[]}
     */
    async findAll(docInfo?: mapping.FindDocInfo, execOptions?: mapping.MappingExecutionOptions): Promise<T[]> {
        return (await this.modelMapper.findAll(docInfo, execOptions)).toArray();
    }

    /**
     * 条件查询，需要注意的是由于cassandra-driver中mapper的机制，数据查询有5000条的数据限制，查询结果超过5000条只返回前5000条，
     * 超过5000条记录时若要返回真正的全部数据，用findRealMany方法
     * @param options 查询条件
     * @param docInfo 文档查询配置
     * @param execOptions 执行配置
     * @returns 
     */
    async findMany(conditions: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo, execOptions?: mapping.MappingExecutionOptions)  {
        return (await this.modelMapper.find(conditions, docInfo, execOptions)).toArray();
    }

    async findOne(conditions: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        return this.modelMapper.get(conditions, docInfo, execOptions);
    }

    private getDbNameOfProperty(propertyName: string) {
        const meta = this.columnMetas.find(m => m.propertyName === propertyName);
        if (!meta) {
            throw new Error(`field ${propertyName} is not exist in ${this._Entity.name} `);
        }
        return meta.dbName;
    }


    async findRealMany(conditions: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo, options?: QueryOptions): Promise<T[]> {  
        const cp =  this.makeQueryCqlAndParams(conditions, docInfo);
        return this.findThroughEachRow(cp.cql, cp.params, options);
    }

    async findRealAll(docInfo?: mapping.FindDocInfo, options?: QueryOptions): Promise<T[]> {
        const cp =  this.makeQueryCqlAndParams(null, docInfo);
        return this.findThroughEachRow(cp.cql, cp.params, options);
    }

    async update(values: EntityConditionOptions<T>, docInfo?: mapping.UpdateDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        const result = await this.modelMapper.update(values, docInfo, execOptions);
        return result.toArray();
    }

    async remove(values: EntityConditionOptions<T>, docInfo?: mapping.UpdateDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        const result = await this.modelMapper.remove(values, docInfo, execOptions);
        return result.toArray();
    }

    /**
     * 用eachRow查询所有记录，由于此方法直接执行的cql语句，因此在使用时需要进行属性名到数据库记录名的转换
     * @param {string} cql cql语句
     * @param {any} params 参数
     * @param {QueryOptions} options 查询参数
     * @returns {Promise<T[]>}
     */
    private findThroughEachRow(cql: string, params: any, options?: QueryOptions): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const results: T[] = [];
            this._client.eachRow(cql, params, options, (_, row) => {
                results.push(this.row2entity(row));
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    if (result && result.nextPage) {
                        result.nextPage();
                    } else {
                        resolve(results);
                    }
                }
            });
        })
    }
    
    /**
     * 生成查询cql语句与参数，将属性名转为记录名
     * 转化过程采用cassandra-driver内部实现的转换函数
     * @param conditions 查询条件
     * @param docInfo 文档查询配置
     * @returns 
     */
     private makeQueryCqlAndParams(conditions?: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo): {cql: string, params: any[]} {
        const propertiesInfo: Array<{columnName: string, value: any}> = [];
        if (conditions) {
            for (let key of Object.keys(conditions)) {
                const dbName = this.getDbNameOfProperty(key);
                propertiesInfo.push({
                    columnName: dbName,
                    value: conditions[key]
                });
            }
        }
        const fieldsInfo: string[] = [];
        if (docInfo && docInfo.fields) {
            for (let field of docInfo.fields) {
                fieldsInfo.push(this.getDbNameOfProperty(field));
            }
        }

        const orders: string[][] = [];
        if (docInfo && docInfo.orderBy) {
            for (let key of Object.keys(docInfo.orderBy)) {
                orders.push([this.getDbNameOfProperty(key), docInfo.orderBy[key]]);
            }
        }
        const limit = docInfo && docInfo.limit ? docInfo.limit : null;
        return {
            cql: QueryGenerator.getSelect(this.tableName, this.keyspaceName, propertiesInfo, fieldsInfo, orders, limit),
            params: QueryGenerator.selectParamsGetter(propertiesInfo, limit)
        };
    }
}
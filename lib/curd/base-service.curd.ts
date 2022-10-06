// base-service.curd.ts

import { Client, mapping, QueryOptions, types } from "cassandra-driver";
// cassandra-driver内部实现的cql语句生成函数,默认没有导出，因此需要完整路径导入
import * as QueryGenerator from "cassandra-driver/lib/mapping/query-generator"
import * as DocInfoAdapter from "cassandra-driver/lib/mapping/doc-info-adapter";

import MetadataStorageHelper, { ColumnMetadataOptions } from "../helper/metadata-storage.helper";
import { ParamsHandler } from "../helper/types.helper";

type EntityConditionOptions<T> = {[key in keyof T]?: T[key] | mapping.q.QueryOperator};

/**
 * 服务基类
 */
export default class BaseService<T> {
    private readonly _mapper: mapping.Mapper & {_modelMappingInfos: Map<string, any>};
    private readonly _client: Client;
    private readonly _Entity: any;

    protected readonly tableName: string;
    protected readonly keyspaceName: string;
    protected readonly modelMapper: mapping.ModelMapper<T>;
    protected readonly columnMetas: ColumnMetadataOptions[];
    constructor(client:  Client, mapper: mapping.Mapper, Entity: any) {
        this._client = client;
        this._mapper = mapper as any;
        this._Entity = Entity;

        this.keyspaceName = Reflect.getMetadata('keyspace', Entity) as string;
        this.tableName = Reflect.getMetadata('table', Entity) as string;
        this.columnMetas = MetadataStorageHelper.getColumMetadatasOfClass(Entity.name);
        this.modelMapper = mapper.forModel(this.tableName);
    }

    /**
     * 保存一个实体对象到数据库
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.ModelMapper/#insert
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/features/mapper/queries/#insert
     * @param entity 实体对象
     * @param docInfo 文档查询配置
     * @param execOptions 执行配置
     */
    async saveOne(entity: T, docInfo?: mapping.InsertDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        await this.modelMapper.insert(entity, docInfo, execOptions);
    }

     /**
     * 批量保存多个实体对象到数据库
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.ModelMapper/#insert
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.Mapper/#batch
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/features/mapper/queries/#insert
     * @see https://docs.datastax.com/en/developer/nodejs-driver/entities/features/mapper/queries/#group-mutations-in-a-batch
     * @param entities 实体对象数据
     * @param docInfo 文档查询配置
     * @param execOptions 执行配置
     */
    async saveMany(entities: T[], docInfo?: mapping.InsertDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        // 做批量时cassandra有大小限制,在配置文件的batch_size_fail_threshold_in_kb项中可以配置，默认50kb，超过设置大小会导致批量配置失败
        const batches = entities.map(entity => this.modelMapper.batching.insert(entity, docInfo));
        await this._mapper.batch(batches, execOptions);
    }

    /**
     * 查询所有，需要注意的是由于cassandra-driver中mapper的机制，该方法不是返回的真正的全表数据，而是默认返回前5000条，
     * 表超过5000条记录时若要返回真正的全部数据，用findRealAll方法
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.ModelMapper/#find-all
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
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.ModelMapper/#find
     * @param conditions 查询条件
     * @param docInfo 文档查询配置
     * @param execOptions 执行配置
     * @returns 
     */
    async findMany(conditions: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo, execOptions?: mapping.MappingExecutionOptions)  {
        return (await this.modelMapper.find(conditions, docInfo, execOptions)).toArray();
    }

    /**
     * 查询一条 limit 1
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.ModelMapper/#find
     * @param conditions 查询条件
     * @param docInfo 文档查询配置
     * @param execOptions 执行配置
     * @returns 
     */
    async findOne(conditions: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        const di: mapping.FindDocInfo = docInfo || {limit: 1};
        if (!di.limit) {
            di.limit = 1;
        }
        const res = await this.modelMapper.find(conditions, di, execOptions);
        return res.toArray()[0] || null;
    }

    /**
     * 根据实体属性名称获取对应的数据库字段名称
     * @param propertyName 实体属性名称
     * @returns 数据库字段名称
     */
    private getDbNameOfProperty(propertyName: string) {
        const meta = this.columnMetas.find(m => m.propertyName === propertyName);
        if (!meta) {
            throw new Error(`field ${propertyName} is not exist in ${this._Entity.name} `);
        }
        return meta.dbName;
    }

    /**
     * 条件查询,区别于findMany默认只返回前5000条,此方法会转换为eachRow方法查询,因此会返回所有结果
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/class.Client/#each-row
     * @param conditions 查询条件
     * @param docInfo 文档查询配置
     * @param options 执行配置
     * @returns 结果数组
     */
    async findRealMany(conditions: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo, options?: QueryOptions): Promise<T[]> {  
        const cp =  this.makeQueryCqlAndParams(conditions, docInfo);
        return this.findThroughEachRow(cp.cql, cp.params, options);
    }

    /**
     * 查询全表,区别于findMany默认只返回前5000条,此方法会转换为eachRow方法查询,因此会返回所有结果
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/class.Client/#each-row
     * @param docInfo 文档查询配置
     * @param options 执行配置
     * @returns 结果数组
     */
    async findRealAll(docInfo?: mapping.FindDocInfo, options?: QueryOptions): Promise<T[]> {
        const cp =  this.makeQueryCqlAndParams(null, docInfo);
        return this.findThroughEachRow(cp.cql, cp.params, options);
    }

    /**
     * 执行更新操作,同cassandra-driver的update方法
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.ModelMapper/#update
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/features/mapper/queries/#update
     * @param values 实体对象,会自动将主键作为条件,更新其它属性的值
     * @param docInfo 文档查询配置
     * @param execOptions 执行配置
     * @returns 
     */
    async update(values: EntityConditionOptions<T>, docInfo?: mapping.UpdateDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        const result = await this.modelMapper.update(values, docInfo, execOptions);
        return result.toArray();
    }

    /**
     * 批量条件更新(batch)
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.ModelMapper/#update
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.Mapper/#batch
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/features/mapper/queries/#update
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/features/mapper/queries/#group-mutations-in-a-batch
     * @param values 实体对象数据,会自动将主键作为条件,更新其它属性的值
     * @param execOptions 文档查询配置
     * @returns 
     */
    async updateMany(values: Array<{value: EntityConditionOptions<T>, docInfo?: mapping.UpdateDocInfo}>, execOptions?: mapping.MappingExecutionOptions) {
        const batches = values.map(v => this.modelMapper.batching.update(v.value, v.docInfo || null));
        const result = await this._mapper.batch(batches, execOptions);
        return result.toArray();
    }

    /**
     * 删除操作,同同cassandra-driver的remove方法
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.ModelMapper/#remove
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/features/mapper/queries/#delete
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/features/mapper/queries/#group-mutations-in-a-batch
     * @param values 实体对象数据,会自动将主键作为条件
     * @param docInfo 文档查询配置
     * @param execOptions 执行配置
     * @returns 
     */
    async remove(values: EntityConditionOptions<T>, docInfo?: mapping.UpdateDocInfo, execOptions?: mapping.MappingExecutionOptions) {
        const result = await this.modelMapper.remove(values, docInfo, execOptions);
        return result.toArray();
    }

    /**
     * 批量删除(batch)
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.ModelMapper/#remove
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/module.mapping/class.Mapper/#batch
     * @param values 实体对象数据,会自动将主键作为条件
     * @param execOptions 执行配置
     * @returns 
     */
    async removeMany(values: Array<{value:  EntityConditionOptions<T>, docInfo?: mapping.UpdateDocInfo}>, execOptions?: mapping.MappingExecutionOptions) {
        const batches = values.map(v => this.modelMapper.batching.remove(v.value, v.docInfo || null));
        const result = await this._mapper.batch(batches, execOptions);
        return result.toArray();
    }

    /**
     * 删除,不同于remove,会转换为原生的cql语句去执行
     * @see https://docs.datastax.com/en/developer/nodejs-driver/latest/api/class.Client/#execute
     * @param conditions 删除条件
     * @param docInfo 文档查询配置
     * @returns
     */
    async delete(conditions: EntityConditionOptions<T>, docInfo?: mapping.RemoveDocInfo) {
        const {cql, params} = await this.makeDeleteCqlAndParams(conditions, docInfo);
        return this._client.execute(cql, params);
    }

    /**
     * 将cql语句映射为可执行函数
     * @param cql cql语句
     * @param paramsHandler 参数处理器
     * @param executionOptions 执行配置
     * @returns 可执行函数
     */
    protected mapCqlAsExecution (cql: string, paramsHandler?: ParamsHandler<T>, executionOptions?: QueryOptions) {
        if (paramsHandler !== null && paramsHandler !== undefined && typeof paramsHandler !== 'function') {
            throw new Error('paramsHandler must be null or function ...');
        } else {
            paramsHandler = (params?: Partial<T>) => this.defaultParamsHandler(params);
        }
        return (params?: Partial<T>) => {
            const realParams = paramsHandler(params);
            return this._client.execute(cql, realParams, executionOptions);
        };
    }

    protected defaultParamsHandler(params: Partial<T>) {
        const realParams: Record<string, any> = {};
        for (const key of Object.keys(params)) {
            const meta = this.columnMetas.find(m => m.propertyName === key);
            if (meta) {
                realParams[meta.dbName] = params[key];
            } else {
                realParams[key] = params[key];
            }
        }
        return realParams;
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
            this._client.eachRow(cql, params || null, options, (_, row) => {
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
     * 根据实体描述生成原始cql查询语句与参数
     * 转化过程采用cassandra-driver内部实现的转换函数
     * @param conditions 查询条件
     * @param docInfo 文档查询配置
     * @returns 
     */
     private makeQueryCqlAndParams(conditions?: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo): {cql: string, params: any[]} {
        const mappingInfo = this._mapper._modelMappingInfos.get(this.tableName);
        let propertiesInfo: Array<{columnName: string, value: any}> = [];
        if (conditions) {
            propertiesInfo = DocInfoAdapter.getPropertiesInfo(Object.keys(conditions), null, conditions, mappingInfo);
        }
        const fieldsInfo: Array<{columnName: string}> = [];
        if (docInfo && docInfo.fields) {
            for (let field of docInfo.fields) {
                fieldsInfo.push({columnName: this.getDbNameOfProperty(field)});
            }
        }

        const orders: string[][] = [];
        if (docInfo && docInfo.orderBy) {
            for (let key of Object.keys(docInfo.orderBy)) {
                orders.push([this.getDbNameOfProperty(key), docInfo.orderBy[key]]);
            }
        }
        const limit = docInfo && docInfo.limit ? docInfo.limit : null;
        // const p = QueryGenerator.selectParamsGetter(propertiesInfo, limit);
        // const cql = QueryGenerator.getSelect(this.tableName, this.keyspaceName, propertiesInfo, fieldsInfo, orders, limit);
        // console.log(p)
        return {
            cql: QueryGenerator.getSelect(this.tableName, this.keyspaceName, propertiesInfo, fieldsInfo, orders, limit),
            params: QueryGenerator.selectParamsGetter(propertiesInfo, limit)(conditions, docInfo, mappingInfo)
        };
    }

    private async makeDeleteCqlAndParams(conditions: EntityConditionOptions<T>, docInfo?: mapping.RemoveDocInfo): Promise<{cql: string, params: any[]}> {
        let query = `DELETE FROM ${this.keyspaceName}.${this.tableName} WHERE `;
        const mappingInfo = this._mapper._modelMappingInfos.get(this.tableName);
        const propertiesInfo = DocInfoAdapter.getPropertiesInfo(Object.keys(conditions), docInfo, conditions, mappingInfo);
        query += QueryGenerator._getConditionWithOperators(propertiesInfo);
        const tableMeta = await this._client.metadata.getTable(this.keyspaceName, this.tableName);
        const primaryKeys = new Set(tableMeta.partitionKeys.concat(tableMeta.clusteringKeys).map(c => c.name));;
        return {
            cql: query,
            params: QueryGenerator._deleteParamsGetter(primaryKeys, propertiesInfo, docInfo? docInfo.when || [] : [])(conditions, docInfo, mappingInfo)
        };
    }
    
    /**
     * 将数据库记录转为实体
     * @param row 数据库记录
     * @returns {T}
     */
     protected row2entity(row: Iterable<{[key: string]: any}> | types.Row): T {
        const entity = new this._Entity();
        for (let meta of this.columnMetas) {
            entity[meta.propertyName] = row[meta.dbName];
        }
        return entity;
    }
}
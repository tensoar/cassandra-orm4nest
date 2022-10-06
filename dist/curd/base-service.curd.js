"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QueryGenerator = require("cassandra-driver/lib/mapping/query-generator");
const DocInfoAdapter = require("cassandra-driver/lib/mapping/doc-info-adapter");
const metadata_storage_helper_1 = require("../helper/metadata-storage.helper");
class BaseService {
    constructor(client, mapper, Entity) {
        this._client = client;
        this._mapper = mapper;
        this._Entity = Entity;
        this.keyspaceName = Reflect.getMetadata('keyspace', Entity);
        this.tableName = Reflect.getMetadata('table', Entity);
        this.columnMetas = metadata_storage_helper_1.default.getColumMetadatasOfClass(Entity.name);
        this.modelMapper = mapper.forModel(this.tableName);
    }
    async saveOne(entity, docInfo, execOptions) {
        await this.modelMapper.insert(entity, docInfo, execOptions);
    }
    async saveMany(entities, docInfo, execOptions) {
        const batches = entities.map(entity => this.modelMapper.batching.insert(entity, docInfo));
        await this._mapper.batch(batches, execOptions);
    }
    async findAll(docInfo, execOptions) {
        return (await this.modelMapper.findAll(docInfo, execOptions)).toArray();
    }
    async findMany(conditions, docInfo, execOptions) {
        return (await this.modelMapper.find(conditions, docInfo, execOptions)).toArray();
    }
    async findOne(conditions, docInfo, execOptions) {
        const di = docInfo || { limit: 1 };
        if (!di.limit) {
            di.limit = 1;
        }
        const res = await this.modelMapper.find(conditions, di, execOptions);
        return res.toArray()[0] || null;
    }
    getDbNameOfProperty(propertyName) {
        const meta = this.columnMetas.find(m => m.propertyName === propertyName);
        if (!meta) {
            throw new Error(`field ${propertyName} is not exist in ${this._Entity.name} `);
        }
        return meta.dbName;
    }
    async findRealMany(conditions, docInfo, options) {
        const cp = this.makeQueryCqlAndParams(conditions, docInfo);
        return this.findThroughEachRow(cp.cql, cp.params, options);
    }
    async findRealAll(docInfo, options) {
        const cp = this.makeQueryCqlAndParams(null, docInfo);
        return this.findThroughEachRow(cp.cql, cp.params, options);
    }
    async update(values, docInfo, execOptions) {
        const result = await this.modelMapper.update(values, docInfo, execOptions);
        return result.toArray();
    }
    async updateMany(values, execOptions) {
        const batches = values.map(v => this.modelMapper.batching.update(v.value, v.docInfo || null));
        const result = await this._mapper.batch(batches, execOptions);
        return result.toArray();
    }
    async remove(values, docInfo, execOptions) {
        const result = await this.modelMapper.remove(values, docInfo, execOptions);
        return result.toArray();
    }
    async removeMany(values, execOptions) {
        const batches = values.map(v => this.modelMapper.batching.remove(v.value, v.docInfo || null));
        const result = await this._mapper.batch(batches, execOptions);
        return result.toArray();
    }
    async delete(conditions, docInfo) {
        const { cql, params } = await this.makeDeleteCqlAndParams(conditions, docInfo);
        return this._client.execute(cql, params);
    }
    mapCqlAsExecution(cql, paramsHandler, executionOptions) {
        if (paramsHandler !== null && paramsHandler !== undefined && typeof paramsHandler !== 'function') {
            throw new Error('paramsHandler must be null or function ...');
        }
        else {
            paramsHandler = (params) => this.defaultParamsHandler(params);
        }
        return (params) => {
            const realParams = paramsHandler(params);
            return this._client.execute(cql, realParams, executionOptions);
        };
    }
    defaultParamsHandler(params) {
        const realParams = {};
        for (const key of Object.keys(params)) {
            const meta = this.columnMetas.find(m => m.propertyName === key);
            if (meta) {
                realParams[meta.dbName] = params[key];
            }
            else {
                realParams[key] = params[key];
            }
        }
        return realParams;
    }
    findThroughEachRow(cql, params, options) {
        return new Promise((resolve, reject) => {
            const results = [];
            this._client.eachRow(cql, params || null, options, (_, row) => {
                results.push(this.row2entity(row));
            }, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (result && result.nextPage) {
                        result.nextPage();
                    }
                    else {
                        resolve(results);
                    }
                }
            });
        });
    }
    makeQueryCqlAndParams(conditions, docInfo) {
        const mappingInfo = this._mapper._modelMappingInfos.get(this.tableName);
        let propertiesInfo = [];
        if (conditions) {
            propertiesInfo = DocInfoAdapter.getPropertiesInfo(Object.keys(conditions), null, conditions, mappingInfo);
        }
        const fieldsInfo = [];
        if (docInfo && docInfo.fields) {
            for (let field of docInfo.fields) {
                fieldsInfo.push({ columnName: this.getDbNameOfProperty(field) });
            }
        }
        const orders = [];
        if (docInfo && docInfo.orderBy) {
            for (let key of Object.keys(docInfo.orderBy)) {
                orders.push([this.getDbNameOfProperty(key), docInfo.orderBy[key]]);
            }
        }
        const limit = docInfo && docInfo.limit ? docInfo.limit : null;
        return {
            cql: QueryGenerator.getSelect(this.tableName, this.keyspaceName, propertiesInfo, fieldsInfo, orders, limit),
            params: QueryGenerator.selectParamsGetter(propertiesInfo, limit)(conditions, docInfo, mappingInfo)
        };
    }
    async makeDeleteCqlAndParams(conditions, docInfo) {
        let query = `DELETE FROM ${this.keyspaceName}.${this.tableName} WHERE `;
        const mappingInfo = this._mapper._modelMappingInfos.get(this.tableName);
        const propertiesInfo = DocInfoAdapter.getPropertiesInfo(Object.keys(conditions), docInfo, conditions, mappingInfo);
        query += QueryGenerator._getConditionWithOperators(propertiesInfo);
        const tableMeta = await this._client.metadata.getTable(this.keyspaceName, this.tableName);
        const primaryKeys = new Set(tableMeta.partitionKeys.concat(tableMeta.clusteringKeys).map(c => c.name));
        ;
        return {
            cql: query,
            params: QueryGenerator._deleteParamsGetter(primaryKeys, propertiesInfo, docInfo ? docInfo.when || [] : [])(conditions, docInfo, mappingInfo)
        };
    }
    row2entity(row) {
        const entity = new this._Entity();
        for (let meta of this.columnMetas) {
            entity[meta.propertyName] = row[meta.dbName];
        }
        return entity;
    }
}
exports.default = BaseService;
//# sourceMappingURL=base-service.curd.js.map
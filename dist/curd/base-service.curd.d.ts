import { Client, mapping, QueryOptions, types } from "cassandra-driver";
import { ColumnMetadataOptions } from "../helper/metadata-storage.helper";
import { ParamsHandler } from "../helper/types.helper";
declare type EntityConditionOptions<T> = {
    [key in keyof T]?: T[key] | mapping.q.QueryOperator;
};
export default class BaseService<T> {
    private readonly _mapper;
    private readonly _client;
    private readonly _Entity;
    protected readonly tableName: string;
    protected readonly keyspaceName: string;
    protected readonly modelMapper: mapping.ModelMapper<T>;
    protected readonly columnMetas: ColumnMetadataOptions[];
    constructor(client: Client, mapper: mapping.Mapper, Entity: any);
    saveOne(entity: T, docInfo?: mapping.InsertDocInfo, execOptions?: mapping.MappingExecutionOptions): Promise<void>;
    saveMany(entities: T[], docInfo?: mapping.InsertDocInfo, execOptions?: mapping.MappingExecutionOptions): Promise<void>;
    findAll(docInfo?: mapping.FindDocInfo, execOptions?: mapping.MappingExecutionOptions): Promise<T[]>;
    findMany(conditions: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo, execOptions?: mapping.MappingExecutionOptions): Promise<T[]>;
    findOne(conditions: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo, execOptions?: mapping.MappingExecutionOptions): Promise<T>;
    private getDbNameOfProperty;
    findRealMany(conditions: EntityConditionOptions<T>, docInfo?: mapping.FindDocInfo, options?: QueryOptions): Promise<T[]>;
    findRealAll(docInfo?: mapping.FindDocInfo, options?: QueryOptions): Promise<T[]>;
    update(values: EntityConditionOptions<T>, docInfo?: mapping.UpdateDocInfo, execOptions?: mapping.MappingExecutionOptions): Promise<T[]>;
    updateMany(values: Array<{
        value: EntityConditionOptions<T>;
        docInfo?: mapping.UpdateDocInfo;
    }>, execOptions?: mapping.MappingExecutionOptions): Promise<any[]>;
    remove(values: EntityConditionOptions<T>, docInfo?: mapping.UpdateDocInfo, execOptions?: mapping.MappingExecutionOptions): Promise<T[]>;
    removeMany(values: Array<{
        value: EntityConditionOptions<T>;
        docInfo?: mapping.UpdateDocInfo;
    }>, execOptions?: mapping.MappingExecutionOptions): Promise<any[]>;
    delete(conditions: EntityConditionOptions<T>, docInfo?: mapping.RemoveDocInfo): Promise<types.ResultSet>;
    protected mapCqlAsExecution(cql: string, paramsHandler?: ParamsHandler<T>, executionOptions?: QueryOptions): (params?: Partial<T>) => Promise<types.ResultSet>;
    protected defaultParamsHandler(params: Partial<T>): Record<string, any>;
    private findThroughEachRow;
    private makeQueryCqlAndParams;
    private makeDeleteCqlAndParams;
    protected row2entity(row: Iterable<{
        [key: string]: any;
    }> | types.Row): T;
}
export {};

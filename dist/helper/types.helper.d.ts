import { ArrayOrObject } from "cassandra-driver";
export type ParamsHandler<E> = (params: Partial<E>) => ArrayOrObject;
export type ModelColumnOptions = {
    name: string;
    toModel?: (columnValue: any) => any;
    fromModel?: (modelValue: any) => any;
};
export type TypedFindDocInfo<E> = {
    fields?: (keyof E)[];
    orderBy?: {
        [key in keyof E]?: 'desc' | 'asc';
    };
    limit?: number;
};
export type TypedInsertDocInfo<E> = {
    fields?: (keyof E)[];
    ttl?: number;
    ifNotExists: boolean;
};

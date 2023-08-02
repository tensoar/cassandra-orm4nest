import { ArrayOrObject } from "cassandra-driver";
export declare type ParamsHandler<E> = (params: Partial<E>) => ArrayOrObject;
export declare type ModelColumnOptions = {
    name: string;
    toModel?: (columnValue: any) => any;
    fromModel?: (modelValue: any) => any;
};
export declare type TypedFindDocInfo<E> = {
    fields?: (keyof E)[];
    orderBy?: {
        [key in keyof E]?: 'desc' | 'asc';
    };
    limit?: number;
};

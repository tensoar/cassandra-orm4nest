import { ArrayOrObject } from "cassandra-driver";
export declare type ParamsHandler<E> = (params: Partial<E>) => ArrayOrObject;
export declare type ModelColumnOptions = {
    name: string;
    toModel?: (columnValue: any) => any;
    fromModel?: (modelValue: any) => any;
};

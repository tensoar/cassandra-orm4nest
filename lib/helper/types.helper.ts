import { ArrayOrObject } from "cassandra-driver";

export type ParamsHandler<E> = (params: Partial<E>) => ArrayOrObject

export type ModelColumnOptions = {
    name: string;
    toModel?: (columnValue: any) => any;
    fromModel?: (modelValue: any) => any;
};

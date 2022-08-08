import { ArrayOrObject } from "cassandra-driver";
export declare type ParamsHandler<E> = (params: Partial<E>) => ArrayOrObject;

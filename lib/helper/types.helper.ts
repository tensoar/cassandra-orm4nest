import { ArrayOrObject } from "cassandra-driver";

export type ParamsHandler<E> = (params: Partial<E>) => ArrayOrObject

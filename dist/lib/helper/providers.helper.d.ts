import { Client, mapping } from "cassandra-driver";
export declare function getMapperInjectName(Entity: ObjectConstructor): string;
export declare function getMapperProviders(Entities: ObjectConstructor[]): {
    provide: string;
    inject: string[];
    useFactory: (cassandraClient: Client) => mapping.Mapper;
}[];

// cassandra-orm.module.ts
import { DynamicModule, Module } from "@nestjs/common";
import { DseClientOptions } from "cassandra-driver";

import { getMapperProviders } from "../helper/providers.helper";
import CassandraConnectionModule from "./cassandra-connection.module";

@Module({})
export default class CassandraOrmModule {
    /**
     * 
     * @param {DseClientOptions} options 数据库配置
     * @returns {DynamicModule}
     */
    static forRoot(options: DseClientOptions): DynamicModule {
        return {
            module: CassandraOrmModule,
            imports: [CassandraConnectionModule.forRegister(options)]
        };
    }

    /**
     * 
     * @param {any} Entities 实体类
     * @returns {DynamicModule}
     */
    static forFeature(Entities: any[]): DynamicModule {
        // 获取所有实体的mapper提供者
        const mapperProviders = getMapperProviders(Entities);
        return {
            module: CassandraOrmModule,
            providers: mapperProviders,
            exports: mapperProviders  // 将提供者导出
        }
    }
}
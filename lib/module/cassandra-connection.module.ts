// cassandra-connection.module.ts
import { DynamicModule, Global, Logger, Module } from "@nestjs/common";
import { Client, DseClientOptions } from "cassandra-driver";
import { CASSANDRA_CLIENT_PROVIDER_NAME, DSE_CLIENT_OPTIONS_PROVIDER_NAME } from "../helper/constants.helper";

@Global()
@Module({})
export default class CassandraConnectionModule {

    /**
     * 模块配置入口
     * @param {DseClientOptions} options 数据库配置
     * @returns {DynamicModule}
     */
    static forRegister(options: DseClientOptions): DynamicModule {
        // 将数据库配置封装为提供者
        const DseClientOptionsProvider = {
            provide: DSE_CLIENT_OPTIONS_PROVIDER_NAME,
            useValue: options
        };
        // 客户端提供者
        const CassandraClientProvider = {
            provide: CASSANDRA_CLIENT_PROVIDER_NAME,
            useFactory: async() => {
                const client = new Client(options);
                await client.connect().then(() => {
                    Logger.log(`cassandra connected to contact point: ${options.contactPoints.join(',')}`, 'CassandraClient');
                }).catch(e => {
                    console.log(e);
                    Logger.log(`connect to cassandra failed with contact point: ${options.contactPoints.join(',')}`, 'CassandraClient');
                });
                return client;
            }
        }
        return {
            module: CassandraConnectionModule,
            providers: [DseClientOptionsProvider, CassandraClientProvider],
            exports: [DseClientOptionsProvider, CassandraClientProvider]
        }
    }
}
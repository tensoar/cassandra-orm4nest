import { DynamicModule } from "@nestjs/common";
import { DseClientOptions } from "cassandra-driver";
export default class CassandraOrmModule {
    static forRoot(options: DseClientOptions): DynamicModule;
    static forFeature(Entities: any[]): DynamicModule;
}

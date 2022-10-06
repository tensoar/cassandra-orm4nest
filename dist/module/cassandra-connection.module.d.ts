import { DynamicModule } from "@nestjs/common";
import { DseClientOptions } from "cassandra-driver";
export default class CassandraConnectionModule {
    static forRegister(options: DseClientOptions): DynamicModule;
}

// inject-client.decorator.ts
import { Inject } from "@nestjs/common";
import { CASSANDRA_CLIENT_PROVIDER_NAME } from "../helper/constants.helper";

export default function InjectClient() {
    // 根据名称注入
    return Inject(CASSANDRA_CLIENT_PROVIDER_NAME);
}
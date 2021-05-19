// inject-client.decorator.ts
import { Inject } from "@nestjs/common";

export default function InjectClient() {
    // 根据名称注入
    return Inject('CassandraClient');
}
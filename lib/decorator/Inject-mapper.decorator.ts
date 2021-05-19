// inject-mapper.decorator.ts
import { Inject } from "@nestjs/common";

import { getMapperInjectName } from "../helper/providers.helper";

export default function InjectMapper(Entity: any) {
    // 根据名称注入
    return Inject(getMapperInjectName(Entity));
}
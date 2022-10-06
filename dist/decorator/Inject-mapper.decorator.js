"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const providers_helper_1 = require("../helper/providers.helper");
function InjectMapper(Entity) {
    return (0, common_1.Inject)((0, providers_helper_1.getMapperInjectName)(Entity));
}
exports.default = InjectMapper;
//# sourceMappingURL=Inject-mapper.decorator.js.map
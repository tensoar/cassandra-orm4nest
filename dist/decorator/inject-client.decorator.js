"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
function InjectClient() {
    return (0, common_1.Inject)('CassandraClient');
}
exports.default = InjectClient;
//# sourceMappingURL=inject-client.decorator.js.map
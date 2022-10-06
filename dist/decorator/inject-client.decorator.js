"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_helper_1 = require("../helper/constants.helper");
function InjectClient() {
    return (0, common_1.Inject)(constants_helper_1.CASSANDRA_CLIENT_PROVIDER_NAME);
}
exports.default = InjectClient;
//# sourceMappingURL=inject-client.decorator.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metadata_storage_helper_1 = require("../helper/metadata-storage.helper");
function Column(options) {
    return (target, key) => {
        const className = target.constructor.name;
        metadata_storage_helper_1.default.addColumMetadata(className, {
            propertyName: key,
            dbName: options ? options.name : key,
            isJonStr: options ? options.isJonStr || false : false,
            toModel: options ? options.toModel || null : null,
            fromModel: options ? options.fromModel || null : null
        });
    };
}
exports.default = Column;
//# sourceMappingURL=column.decorator.js.map
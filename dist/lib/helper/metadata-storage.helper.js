"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MetadataStorageHelper {
    static getClassMetadataKey(className) {
        return `CassandraOrm_${className}`;
    }
    static addColumMetadata(className, options) {
        const key = this.getClassMetadataKey(className);
        let metas = this.metadatasMap.get(key);
        if (!metas) {
            metas = [];
            this.metadatasMap.set(key, metas);
        }
        if (options instanceof Array) {
            metas.push(...options);
        }
        else {
            metas.push(options);
        }
    }
    static getColumMetadata(className, propertyName) {
        const key = this.getClassMetadataKey(className);
        const metas = this.metadatasMap.get(key);
        if (!metas) {
            throw new Error(`this is no metadatas for Objet: ${className}`);
        }
        return metas.find(m => m.propertyName === propertyName);
    }
    static getColumMetadatasOfClass(className) {
        const key = this.getClassMetadataKey(className);
        return this.metadatasMap.get(key);
    }
}
exports.default = MetadataStorageHelper;
MetadataStorageHelper.metadatasMap = new Map();
//# sourceMappingURL=metadata-storage.helper.js.map
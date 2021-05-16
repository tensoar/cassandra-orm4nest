// metadata-storage.helper.ts

interface ColumnMetadataOptions {
    dbName: string, // 字段在数据库中的名称
    propertyName: string  // 对应到实体的属性名
}

export default class MetadataStorageHelper {
    
    // 存储类中每个属性的元数据
    private static metadatasMap: Map<string, ColumnMetadataOptions[]> = new Map<string, ColumnMetadataOptions[]>();


    /**
     * 获取类在metadatasMap中的key值
     */
    static getClassMetadataKey(className: string) {
        return `CassandraOrm_${className}`;
    }

    /**
     * 添加属性的元数据信息
     * @param className 类名称
     * @param options 元数据信息
     */
    public static addColumMetadata(className: string, options: ColumnMetadataOptions | ColumnMetadataOptions[]) {
        const key = this.getClassMetadataKey(className);
        let metas = this.metadatasMap.get(key);
        if (!metas) {
            metas = [];
            this.metadatasMap.set(key, metas);
        }
        if (options instanceof Array) {
            metas.push(...options);
        } else {
            metas.push(options)
        }
    }

    /**
     * 获取属性的元数据
     * @param className 类名
     * @param propertyName 属性名
     * @returns 
     */
    public static getColumMetadata(className: string, propertyName: string) {
        const key = this.getClassMetadataKey(className);
        const metas = this.metadatasMap.get(key);
        if (!metas) {
            throw new Error(`this is no metadatas for Objet: ${className}`);
        }
        return metas.find(m => m.propertyName === propertyName);
    }

    /**
     * 获取类的所有属性的元数据
     * @param className 类名
     */
    public static getColumMetadatasOfClass(className: string) {
        const key = this.getClassMetadataKey(className);
        return this.metadatasMap.get(key);
    }
}
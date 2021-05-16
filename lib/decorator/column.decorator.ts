import MetadataStorageHelper from "../helper/metadata-storage.helper";

interface ColumnDecoratorOptions {
    name: string; // 数据库中字段名称
}

export default function Column(options: ColumnDecoratorOptions) {
    // target为实体对象，key为属性名 
    return (target: Object, key: string) => {
        const className = target.constructor.name;
        MetadataStorageHelper.addColumMetadata(className, {
            propertyName: key,
            dbName: options.name
        });
    }
}
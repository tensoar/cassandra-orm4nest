// column.decorator.ts
import MetadataStorageHelper from "../helper/metadata-storage.helper";

interface ColumnDecoratorOptions {
    name: string; // 数据库中字段名称
    isJonStr?: boolean, // 是否是JSON字符串，若数据库字段类型是字符串但存储的是JSON，可以设为true，则实体中属性字段类型可设为对象，在操作库时可自动来回转换
    toModel?: (property: any) => any, // 转换函数，默认为null，用于设置数据库值到实体中属性值的转换规则
    fromModel?: (colum: any) => any, // 转换函数，默认为null，用于设置实体中属性值到数据库中字段值的转换规则
}

export default function Column(options?: ColumnDecoratorOptions) {
    // target为实体对象，key为属性名 
    return (target: Object, key: string) => {
        const className = target.constructor.name;
        MetadataStorageHelper.addColumMetadata(className, {
            propertyName: key,
            dbName: options ? options.name: key,
            isJonStr: options ? options.isJonStr || false : false,
            toModel: options? options.toModel || null : null,
            fromModel: options? options.fromModel || null : null
        });
    }
}
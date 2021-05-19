// entity.decorator.ts
interface TableDecoratorOptions {
    keyspace: string, // 所属命名空间
    table: string // 所属数据库
}

export default function Entity(options: TableDecoratorOptions): ClassDecorator {
    return target => {
        // 设置元数据
        Reflect.defineMetadata('keyspace', options.keyspace, target);
        Reflect.defineMetadata('table', options.table, target);
    }
}
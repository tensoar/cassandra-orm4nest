interface TableDecoratorOptions {
    keyspace: string;
    table: string;
}
export default function Entity(options: TableDecoratorOptions): ClassDecorator;
export {};

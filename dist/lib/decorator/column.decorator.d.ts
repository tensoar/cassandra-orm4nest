interface ColumnDecoratorOptions {
    name: string;
    isJonStr?: boolean;
    toModel?: (property: any) => any;
    fromModel?: (colum: any) => any;
}
export default function Column(options?: ColumnDecoratorOptions): (target: Object, key: string) => void;
export {};

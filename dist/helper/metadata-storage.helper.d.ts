export interface ColumnMetadataOptions {
    dbName: string;
    isJonStr?: boolean;
    toModel?: (property: any) => any;
    fromModel?: (colum: any) => any;
    propertyName: string;
}
export default class MetadataStorageHelper {
    private static metadatasMap;
    static getClassMetadataKey(className: string): string;
    static addColumMetadata(className: string, options: ColumnMetadataOptions | ColumnMetadataOptions[]): void;
    static getColumMetadata(className: string, propertyName: string): ColumnMetadataOptions;
    static getColumMetadatasOfClass(className: string): ColumnMetadataOptions[];
}

// user.entity.ts
import Column from "../lib/decorator/column.decorator";
import Entity from "../lib/decorator/table.decorator";

@Entity({
    keyspace: 'wt_test',
    table: 'device'
})
export default class Device {
    @Column({name: 'serial_number'})
    serialNumber: string;

    @Column({name: 'create_time'})
    createTime: Date;

    @Column()
    version: string;

    @Column({name: 'is_online'})
    isOnline: boolean;
}
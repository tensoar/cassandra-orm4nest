// device.entity.ts
import { Column, Entity } from "../lib";

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
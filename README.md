# cassandra-orm4nest

[![NPM version](https://img.shields.io/npm/v/cassandra-orm4nest.svg?style=flat)](https://www.npmjs.com/package/cassandra-orm4nest)
[![NPM monthly downloads](https://img.shields.io/npm/dm/cassandra-orm4nest.svg?style=flat)](https://npmjs.org/package/cassandra-orm4nest)
[![NPM total downloads](https://img.shields.io/npm/dt/cassandra-orm4nest.svg?style=flat)](https://npmjs.org/package/cassandra-orm4nest)

Cassandra ORM wrapper for nestjs based on `cassandra-driver` package.

[中文说明](./README_CN.md)

## Install

use npm:

```bash
npm i cassandra-orm4nest --save
```

use yarn:

```bash
yarn add cassandra-orm4nest
```

## Usage

### Entity Definition

use `@Entity` and `@Column` decorator define an entity:

```typescript
// device.entity.ts
import { Column, Entity } from "cassandra-orm4nest";

@Entity({
    keyspace: 'test',
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
```

### Module Definition

Just like typeorm, you can use `forRoot` method to configure the database and use `forFeature` method to register entities:

```typescript
// orm-test.module.ts
import { Module } from "@nestjs/common";
import { auth } from "cassandra-driver";

import { CassandraOrmModule } from "cassandra-orm4nest";
import DeviceController from "device.controller";
import Device from "device.entity";
import DeviceService from "device.service";

@Module({
    imports: [
        CassandraOrmModule.forRoot({ // database configuration
            contactPoints: ['localhost'],
            authProvider: new auth.PlainTextAuthProvider('username', 'password'),
            localDataCenter: 'datacenter1'
        }),
        CassandraOrmModule.forFeature([ // register entities
            Device
        ])
    ],
    controllers: [DeviceController], // related controller
    providers: [DeviceService] // related service
})
export default class OrmTestModule {}
```

### Service Defination

Entities registered in `forFeature` method will generate corresponding mapper objects witch type is mapping.ModelMapper and can be injected by `@InjectMapper` decorator.

```typescript
import { Injectable } from "@nestjs/common";
import { Client } from "cassandra-driver";

import { InjectClient, InjectMapper, BaseService } from "cassandra-orm4nest";
import Device from "device.entity";

@Injectable()
export default class DeviceService extends BaseService<Device> {
    constructor(
        @InjectMapper(Device) private readonly mapper, // inject mapper object
        @InjectClient() client: Client // inject cassandra connection client
    ) {
        super(client, mapper, Device); // inherit the parent class constructor
    }
}
```

As you can see, we can extend the `BaseService` class that implements the basic CRUD methods, includes:

* `saveOne`: Save a single entity.
* `saveMany`: Save multiple entities.
* `finadAll`: Query the full table, it is quivalent to the `findAll` method in the `ModelMapper` class in `cassandra-driver`, there is a limit on the number of results for a single query, default is 5000.
* `findRealAll`: Query the full table, unlike `findAll`, there is no limit on the number of results for a single query, because it will converted to `eachRow` method to perform query operations.
* `findMany`: Query based on conditions, it is quivalent to the `find` method in the `ModelMapper` class in `cassandra-driver`, there is a limit on the number of results for a single query, default is 5000.
* `findRealMany`:  Query based on conditions, unlike `findMany`, there is no limit on the number of results for a single query, because it will converted to `eachRow` method to perform query operations.
* `findOne`: : Query based on conditions, return the first item that meets the condition.
* `update`: Update based on conditions, it is quivalent to the `update` method in the `ModelMapper` class in `cassandra-driver`.
* `updateMany`: Perform multiple conditional update operations.
* `remove`: Remove based on conditions, it is quivalent to the `remove` method in the `ModelMapper` class in `cassandra-driver`.
* `removeMany`: Perform multiple conditional remove operations.

### Usage In Controller

Inject service directly into the control layer:

```typescript
// device.controller.ts
import DeviceService from "device.service"
export default class DeviceController {
    constructor(
        private readonly deviceService: DeviceService // inject
    ){}

    @Get('doSomthing')
    async doSomething() {
        // TODO
    }
}
```

## Test Demo

There is a demo in test folder.

Import schema:

```bash
 cqlsh <host> -u <username> -p <password> < test/schema.cql
```

Run test server:

```bash
npm run test -- --host <db host> --username <db username> --password <db password> --datacenter <db datacenter>
```

Access URL in the browser:

```bash
http://localhost:30000/device/doSomthing
```

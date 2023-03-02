# cassandra-orm4nest

`Nest`下`cassandra`的`orm`封装(底层基于`cassandra-driver`)，封装方式参照了`typeorm`。

## 安装

使用`npm`:

```bash
npm i cassandra-orm4nest --save
```

使用`yarn`:

```bash
yarn add cassandra-orm4nest
```

## 使用

### 实体定义

提供了`@Entity`与`@Column`注解定义与表格、字段的映射关系。

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

### `module`定义

与`typeorm`实现类似，提供了`forRoot`方法配置数据库，`forFeature`方法注册实体。`forRoot`参数暴露的`cassandra-driver`连接选项，因而与`cassandra`的`Client`参数一致。

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
        CassandraOrmModule.forRoot({
            contactPoints: ['localhost'],
            authProvider: new auth.PlainTextAuthProvider('username', 'password'),
            localDataCenter: 'datacenter1'
        }),
        CassandraOrmModule.forFeature([ // 需要生成mapper的实体
            Device
        ])
    ],
    controllers: [DeviceController], // controller实现
    providers: [DeviceService] // service实现
})
export default class OrmTestModule {}
```

### `service`层定义

在`forFeature`中注册了的实体都会生成相应的`mapper`对象。

* 提供了`@InjectMapper`注解用于注入实体的`mapper`对象，得到的`mapper`对象类型为`cassandra-driver`中`mapping.ModelMapper`对象。
* 提供了`@InjectClient`注解可直接注入`cassandra`的连接客户端对象，类型为`cassandra`中的`Client`对象。
* 提供了`BaseService`服务基类，可直接被实体的服务类继承，提供了基本的`CURD`方法，包括：
  * `saveOne`: 保存单个实体
  * `saveMany`: 保存多个实体
  * `finadAll`: 查询全表，直接暴露的`ModelMapper`的`findAll`，受`cassandra-driver`默认查询条数的限制，默认只返回前`5000`条。
  * `findRealAll`: 查询全表，返回全部数据，通过`eachRow`进行查询，不受默认条数限制。
  * `findMany`: 批量条件查询，与`findAll`情况一致，受默认条数限制。
  * `findRealMany`: 批量条件查询，与`findRealAll`情况一致，不受默认条数限制。
  * `findOne`: 条件查询第一条。
  * `update`: 常规条件更新
  * `updateMany`: 批量条件更新，一次执行多个条件更新
  * `remove`: 常规条件移除
  * `removeMany`: 批量条件删除，一次执行多个条件
  * `delete`: 转为原始`cql`命令后执行删除操作,相较于`remove`,可以不必写全所有主键

```typescript
import { Injectable } from "@nestjs/common";
import { Client } from "cassandra-driver";

import { InjectClient, InjectMapper, BaseService } from "cassandra-orm4nest";
import Device from "device.entity";

@Injectable()
export default class DeviceService extends BaseService<Device> { // 继承服务基类，服务基类提供了基本的CURD方法
    constructor(
        @InjectMapper(Device) private readonly mapper,
        @InjectClient() client: Client
    ) {
        super(client, mapper, Device); // 父类构造
    }
}
```

### `controller`层使用

直接在构造函数中注入服务类即可。

```typescript
// device.controller.ts
import DeviceService from "device.service"
export default class DeviceController {
    constructor(
        private readonly deviceService: DeviceService // 直接注入
    ){}

    @Get('doSomthing')
    async doSomething() {
        // TODO
    }
}
```

## 运行测试

导入`test/schema.cql`至数据库：

```bash
cqlsh <host> -u <username> -p <password> < schema.cql
```

启动测试接口：

```bash
npm run test -- --host <db host> --username <db username> --password <db password> --datacenter <db datacenter>
```

访问连接：

```bash
http://localhost:30000/device/doSomthing
```

> 完整见`test`下示例

## 致谢

* JetBrains提供免费的开源许可证

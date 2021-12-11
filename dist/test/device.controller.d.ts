import DeviceService from "./device.service";
export default class DeviceController {
    private readonly deviceService;
    constructor(deviceService: DeviceService);
    doSomething(): Promise<{
        msg: string;
    }>;
}

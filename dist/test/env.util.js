"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimist = require("minimist");
const argv = minimist(process.argv.slice(2));
if (!argv['host']) {
    throw new Error("cassandra host was not provided ...");
}
if (!argv['username']) {
    throw new Error("cassandra username was not provided ...");
}
if (!argv['password']) {
    throw new Error("cassandra password was not provided ...");
}
const env = {
    host: argv['host'],
    username: argv['username'],
    password: argv['password'],
    datacenter: argv['datacenter'] || 'datacenter1'
};
exports.default = env;
//# sourceMappingURL=env.util.js.map
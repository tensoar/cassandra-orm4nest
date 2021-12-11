import * as minimist from "minimist";

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
    host: argv['host'] as string,
    username: argv['username'] as string,
    password: argv['password'] as string,
    datacenter: argv['datacenter'] as string || 'datacenter1'
}

export default env;

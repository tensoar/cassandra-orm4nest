CREATE KEYSPACE IF NOT EXISTS wt_test WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 1};
CREATE TABLE wt_test.device (
    serial_number varchar,
    create_time timestamp,
    version varchar,
    is_online boolean,
    PRIMARY KEY ((serial_number), create_time)
) WITH CLUSTERING ORDER BY (create_time DESC);

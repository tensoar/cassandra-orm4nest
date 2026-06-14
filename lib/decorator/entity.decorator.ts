import { CASSANDRA_ENTITY_METADATA } from "../constants";

// entity.decorator.ts
export type CassandraCompressionAlgorithm =
  | 'LZ4Compressor'
  | 'SnappyCompressor'
  | 'DeflateCompressor'
  | 'NoCompression';

export interface CassandraCompressionOptions {
  /** 压缩算法名 */
  class: CassandraCompressionAlgorithm;
  /** 块大小，单位KB，可选 */
  chunk_length_in_kb?: number;
  /** 压缩阈值，未达到该大小不压缩 */
  crc_check_chance?: number;
  /** 是否启用分块压缩 */
  enabled?: boolean;
}

export interface CompactionSTCS {
  class: 'SizeTieredCompactionStrategy';
  bucket_high?: number;
  bucket_low?: number;
  max_threshold?: number;
  min_threshold?: number;
  min_sstable_size_in_mb?: number;
}

/** LCS：层级合并策略 */
export interface CompactionLCS {
  class: 'LeveledCompactionStrategy';
  sstable_size_in_mb?: number;
  max_level?: number;
}

/** TWCS：时间窗口合并策略（时序数据） */
export interface CompactionTWCS {
  class: 'TimeWindowCompactionStrategy';
  compaction_window_unit?: 'MINUTES' | 'HOURS' | 'DAYS';
  compaction_window_size?: number;
  expiration_timestamp_unit?: 'SECONDS' | 'MILLISECONDS' | 'MICROSECONDS' | 'NANOSECONDS';
  tombstone_compaction_interval?: number;
  tombstone_threshold?: number;
}

/** ICS 增量合并策略 */
export interface CompactionICS {
  class: 'IncrementalCompactionStrategy';
  max_threshold?: number;
  min_threshold?: number;
}

export type CassandraCompactionOptions =
  | CompactionSTCS
  | CompactionLCS
  | CompactionTWCS
  | CompactionICS;

export interface EntityDecoratorOptions {
    keyspace?: string;
    table?: string;
    comment?: string;
    bloomFilterFpChance?: number;
    compaction?: CassandraCompactionOptions;
    compression?: CassandraCompressionOptions;
    gcGraceSeconds?: number;
    defaultTtl?: number;
    memtable_flush_period_in_ms?: number;
    speculative_retry?: 'NONE' | '99PERCENTILE' | '99.9PERCENTILE' | 'QUORUM' | string;
}


export default function Entity(options: EntityDecoratorOptions = {}): ClassDecorator {
    return target => {
        Reflect.defineMetadata(CASSANDRA_ENTITY_METADATA, options, target);
    }
}
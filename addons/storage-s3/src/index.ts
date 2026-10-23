import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { S3Client, HeadBucketCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export type StorageContentType = 'text/plain' | 'application/json' | 'application/octet-stream';
export interface StorageS3 {
  putObject(key: string, bytes: Uint8Array, contentType: StorageContentType, signal?: AbortSignal): Promise<{key: string; bytes: number}>;
  getObject(key: string, signal?: AbortSignal): Promise<{bytes: Buffer; contentType: StorageContentType} | null>;
  deleteObject(key: string, signal?: AbortSignal): Promise<void>;
  close(): void;
}
export interface StorageS3Options {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  keyPrefix: string;
  maxObjectBytes?: number;
  operationTimeoutMs?: number;
  registerRoutes?: (scope: FastifyInstance, storage: StorageS3) => Promise<void> | void;
}
type Config = Omit<StorageS3Options,'maxObjectBytes'|'operationTimeoutMs'|'registerRoutes'> & {
  maxObjectBytes: number; operationTimeoutMs: number;
};
const TYPES = new Set<StorageContentType>(['text/plain','application/json','application/octet-stream']);
const SEGMENT = /^[a-z0-9][a-z0-9_-]{0,79}$/;

function checkedKey(value: string, prefix = false): string {
  const message = prefix ? 'Storage S3 invalid prefix' : 'Storage S3 invalid key';
  if (typeof value !== 'string' || !value || value.length > 160 ||
      (prefix && !value.endsWith('/'))) throw new Error(message);
  const source = prefix ? value.slice(0,-1) : value;
  if (!source || !source.split('/').every(part => SEGMENT.test(part))) throw new Error(message);
  return value;
}
function configuration(opts: StorageS3Options): Config {
  if (!opts || typeof opts !== 'object') throw new Error('Storage S3 invalid configuration');
  let endpoint: URL;
  try { endpoint = new URL(opts.endpoint); }
  catch { throw new Error('Storage S3 invalid configuration'); }
  const loopback=['localhost','127.0.0.1','[::1]'].includes(endpoint.hostname);
  if (!(endpoint.protocol === 'https:' || (endpoint.protocol === 'http:' && loopback)) ||
      !endpoint.hostname || endpoint.username || endpoint.password ||
      endpoint.search || endpoint.hash || endpoint.pathname !== '/') {
    throw new Error('Storage S3 invalid configuration');
  }
  if (typeof opts.bucket !== 'string' || opts.bucket.length < 3 || opts.bucket.length > 63 ||
      !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(opts.bucket) || opts.bucket.includes('..') ||
      typeof opts.region !== 'string' || !/^[a-z][a-z0-9-]{1,31}$/.test(opts.region) ||
      typeof opts.accessKeyId !== 'string' || !opts.accessKeyId.trim() ||
      typeof opts.secretAccessKey !== 'string' || !opts.secretAccessKey.trim()) {
    throw new Error('Storage S3 invalid configuration');
  }
  const maxObjectBytes=opts.maxObjectBytes??16384;
  const operationTimeoutMs=opts.operationTimeoutMs??3000;
  if (!Number.isSafeInteger(maxObjectBytes) || maxObjectBytes<1 || maxObjectBytes>1048576 ||
      !Number.isSafeInteger(operationTimeoutMs) ||
      operationTimeoutMs<100 || operationTimeoutMs>30000) {
    throw new Error('Storage S3 invalid configuration');
  }
  checkedKey(opts.keyPrefix,true);
  return {
    endpoint:endpoint.origin,region:opts.region,bucket:opts.bucket,
    accessKeyId:opts.accessKeyId,secretAccessKey:opts.secretAccessKey,
    keyPrefix:opts.keyPrefix,maxObjectBytes,operationTimeoutMs,
  };
}
function activeSignal(signal: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  if (signal?.aborted) throw new Error('Storage S3 aborted');
  const timeout=AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal,timeout]) : timeout;
}
function stopBody(stream: unknown): void {
  (stream as {destroy?: () => void})?.destroy?.();
}
function missingKey(error: unknown): boolean {
  return !!error && typeof error==='object' && 'name' in error && error.name==='NoSuchKey';
}

/** Explicit client creation, no network side effects at import time. */
export async function openStorageS3(opts: StorageS3Options): Promise<StorageS3> {
  const cfg=configuration(opts);
  const client=new S3Client({
    endpoint:cfg.endpoint,region:cfg.region,forcePathStyle:true,
    credentials:{accessKeyId:cfg.accessKeyId,secretAccessKey:cfg.secretAccessKey},
    maxAttempts:1,requestChecksumCalculation:'WHEN_REQUIRED',
    responseChecksumValidation:'WHEN_REQUIRED',
  });
  try {
    await client.send(new HeadBucketCommand({Bucket:cfg.bucket}),{
      abortSignal:AbortSignal.timeout(cfg.operationTimeoutMs),
    });
  } catch {
    client.destroy();
    throw new Error('Storage S3 initialization failed');
  }
  let closed=false;
  const objectKey=(relative: string)=>{
    if (closed) throw new Error('Storage S3 closed');
    return cfg.keyPrefix+checkedKey(relative);
  };
  return {
    async putObject(key,bytes,contentType,signal) {
      const full=objectKey(key);
      if (!(bytes instanceof Uint8Array) || bytes.byteLength<1 ||
          bytes.byteLength>cfg.maxObjectBytes) throw new Error('Storage S3 invalid size');
      if (!TYPES.has(contentType)) throw new Error('Storage S3 invalid content type');
      const abort=activeSignal(signal,cfg.operationTimeoutMs);
      try {
        await client.send(new PutObjectCommand({
          Bucket:cfg.bucket,Key:full,Body:Buffer.from(bytes),
          ContentType:contentType,ContentLength:bytes.byteLength,
        }),{abortSignal:abort});
      } catch {
        if (abort.aborted) throw new Error('Storage S3 aborted');
        throw new Error('Storage S3 operation failed');
      }
      return {key,bytes:bytes.byteLength};
    },
    async getObject(key,signal) {
      const full=objectKey(key);
      const abort=activeSignal(signal,cfg.operationTimeoutMs);
      try {
        const response=await client.send(
          new GetObjectCommand({Bucket:cfg.bucket,Key:full}),{abortSignal:abort});
        if (!response.Body) throw new Error('Storage S3 operation failed');
        if (typeof response.ContentLength === 'number' &&
            response.ContentLength>cfg.maxObjectBytes) {
          stopBody(response.Body);
          throw new Error('Storage S3 size exceeded');
        }
        const chunks: Buffer[]=[];
        let length=0;
        try {
          for await (const item of response.Body as unknown as AsyncIterable<Uint8Array>) {
            const chunk=Buffer.from(item);
            length+=chunk.byteLength;
            if (length>cfg.maxObjectBytes) {
              stopBody(response.Body);
              throw new Error('Storage S3 size exceeded');
            }
            chunks.push(chunk);
          }
        } catch(error) {
          if (error instanceof Error && error.message==='Storage S3 size exceeded') throw error;
          throw new Error('Storage S3 operation failed');
        }
        const contentType=TYPES.has(response.ContentType as StorageContentType)
          ? response.ContentType as StorageContentType : 'application/octet-stream';
        return {bytes:Buffer.concat(chunks,length),contentType};
      } catch(error) {
        if (error instanceof Error && error.message==='Storage S3 size exceeded') throw error;
        if (missingKey(error)) return null;
        if (abort.aborted) throw new Error('Storage S3 aborted');
        throw new Error('Storage S3 operation failed');
      }
    },
    async deleteObject(key,signal) {
      const full=objectKey(key);
      const abort=activeSignal(signal,cfg.operationTimeoutMs);
      try {
        await client.send(new DeleteObjectCommand({Bucket:cfg.bucket,Key:full}),
          {abortSignal:abort});
      } catch {
        if (abort.aborted) throw new Error('Storage S3 aborted');
        throw new Error('Storage S3 operation failed');
      }
    },
    close(){
      if (closed) return;
      closed=true;
      client.destroy();
    },
  };
}

/** Fastify-scope ownership, opt-in and no global decorators or routes. */
export function createStorageS3Plugin(opts: StorageS3Options): FastifyPluginAsync {
  return async function storageS3Scope(scope) {
    const storage=await openStorageS3(opts);
    scope.addHook('onClose', async()=>{storage.close();});
    try { await opts.registerRoutes?.(scope,storage); }
    catch {
      storage.close();
      throw new Error('Storage S3 registration failed');
    }
  };
}

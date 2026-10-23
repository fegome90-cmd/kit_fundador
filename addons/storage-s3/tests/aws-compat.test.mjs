import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openStorageS3 } from '../dist/index.js';

const options = {
  endpoint: process.env.R3_S3_ENDPOINT,
  region: 'us-east-1',
  bucket: process.env.R3_S3_BUCKET,
  accessKeyId: process.env.R3_S3_ACCESS_KEY,
  secretAccessKey: process.env.R3_S3_SECRET_KEY,
  keyPrefix: 'iam/',
  maxObjectBytes: 256,
  operationTimeoutMs: 1500,
};
for (const [key, value] of Object.entries(options)) {
  assert.ok(value, 'Missing synthetic R3 fixture: ' + key);
}
const badBuckets = [
  '192.168.5.4', 'example.-wrong', 'example-.wrong',
  'xn--reserved', 'sthree-testing', 'amzn-s3-demo-example',
  'name-s3alias', 'name--ol-s3', 'name.mrap',
  'name--x-s3', 'name--table-s3', 'my..bucket',
];

test('AWS general purpose bucket names are rejected before contacting S3', async () => {
  for (const bucket of badBuckets) {
    await assert.rejects(
      () => openStorageS3({ ...options, bucket }),
      /Storage S3 invalid configuration/,
      'Unsafe bucket name reached network: ' + bucket,
    );
  }
});

test('object-only IAM works without HeadBucket and keeps GetObject AccessDenied distinct from 404', async () => {
  const received = [];
  const server = createServer((request, response) => {
    received.push(request.method);
    if (request.method === 'HEAD') {
      response.writeHead(403);
      response.end();
      return;
    }
    if (request.method === 'GET') {
      response.writeHead(403, { 'content-type': 'application/xml' });
      response.end('<Error><Code>AccessDenied</Code><Message>Denied</Message></Error>');
      return;
    }
    response.writeHead(204);
    response.end();
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const addr = server.address();
  assert.ok(addr && typeof addr === 'object');
  const endpoint = 'http://127.0.0.1:' + addr.port;
  let storage;
  try {
    // Default must NOT ask for s3:ListBucket, which an object-only principal lacks.
    storage = await openStorageS3({ ...options, endpoint });
    assert.deepEqual(received, [], 'Opening object-only client contacted bucket');
    await assert.rejects(
      () => storage.getObject('private/file'),
      /Storage S3 operation failed/,
      '403 must never masquerade as a missing object',
    );
    assert.ok(received.includes('GET'));
    assert.ok(!received.includes('HEAD'), 'Unexpected ListBucket-dependent HEAD');
    // Explicit preflight remains available for deployments requiring verification.
    await assert.rejects(
      () => openStorageS3({ ...options, endpoint, verifyBucketOnOpen: true }),
      /Storage S3 initialization failed/,
    );
    assert.ok(received.includes('HEAD'), 'Opt-in HeadBucket was not sent');
  } finally {
    storage?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

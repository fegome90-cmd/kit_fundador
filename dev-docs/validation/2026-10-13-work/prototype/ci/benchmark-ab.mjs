import { Queue, createPostgresBackend } from 'bullmq';
import Redis from 'ioredis';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL required');
const redis = new Redis({host:'127.0.0.1',port:56379,maxRetriesPerRequest:1});
try {
  await redis.config('SET','appendonly','yes');
  await redis.config('SET','appendfsync','always');
  await redis.config('SET','maxmemory-policy','noeviction');
  const [aof,fsync,policy] = await Promise.all([
    redis.config('GET','appendonly'),
    redis.config('GET','appendfsync'),
    redis.config('GET','maxmemory-policy')
  ]);
  console.log('VALKEY_DURABILITY',JSON.stringify({aof,fsync,policy}));
} finally { await redis.quit(); }

const n = 200;
const concurrency = 4;
const trials = 3;
const records = [];

async function startWorker(backend,queueName) {
  const file = backend === 'PostgreSQL' ? 'ci/pg-worker.mjs' : 'dist/worker.js';
  const expected = backend === 'PostgreSQL' ? 'PG_WORKER_READY' : 'WORKER_READY';
  const child = spawn(process.execPath,[file],{env:{...process.env,QUEUE_NAME:queueName,CONCURRENCY:String(concurrency)},stdio:['ignore','pipe','pipe']});
  let output='';
  try {
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('worker launch timeout '+backend+' '+output.slice(-900))),15000);
      child.stdout.on('data',data=>{output+=data.toString();if(output.includes(expected)){clearTimeout(timeout);resolve();}});
      child.stderr.on('data',data=>{output+=data.toString();});
      child.once('exit',(code,signal)=>{clearTimeout(timeout);reject(new Error('worker exit '+backend+' '+code+'/'+signal+' '+output.slice(-900)));});
    });
    return child;
  } catch (error) { child.kill('SIGKILL'); throw error; }
}
async function stopWorker(child) {
  if (!child || child.exitCode!==null || child.signalCode!==null) return;
  const exit = new Promise(resolve=>child.once('exit',resolve));
  child.kill('SIGTERM');
  await Promise.race([exit,sleep(12000).then(()=>{if(child.exitCode===null)child.kill('SIGKILL');})]);
}

async function trial(backend,kind,index) {
  const queueName='ci-ab-'+backend.toLowerCase()+'-'+kind+'-'+index+'-'+randomUUID().slice(0,8);
  const options = backend==='PostgreSQL'
    ? {connection:{connectionString:DATABASE_URL,schema:'bullmq',max:4}}
    : {connection:{host:'127.0.0.1',port:56379,maxRetriesPerRequest:1}};
  const queue = backend==='PostgreSQL'
    ? new Queue(queueName,options,createPostgresBackend)
    : new Queue(queueName,options);
  let worker;
  try {
    await queue.waitUntilReady();
    await queue.pause();
    const jobs=Array.from({length:n},(_,value)=>({name:'double',data:{value}}));
    const begin=performance.now();
    if(kind==='bulk') await queue.addBulk(jobs);
    else for(const j of jobs) await queue.add(j.name,j.data);
    const enqueueMs=performance.now()-begin;
    worker=await startWorker(backend,queueName);
    const consumeStart=performance.now();
    await queue.resume();
    const deadline=Date.now()+45000;
    while(await queue.getCompletedCount()!==n) {
      if(Date.now()>deadline) throw new Error('processing deadline '+backend+'/'+kind);
      await sleep(20);
    }
    const processingMs=performance.now()-consumeStart;
    const completed=await queue.getJobs(['completed'],0,n);
    assert.equal(completed.length,n,'completed job count');
    for(const job of completed) assert.equal(job.returnvalue,job.data.value*2,'computed result');
    const durations=completed.map(j=>j.finishedOn-j.processedOn).sort((a,b)=>a-b);
    const row={backend,kind,trial:index,count:n,concurrency,persistence:backend==='Valkey'?'AOF/appendfsync always':'PostgreSQL WAL default',enqueueMs,enqueueJobsPerSecond:n*1000/enqueueMs,processingMs,processingJobsPerSecond:n*1000/processingMs,jobProcessingP95Ms:durations[Math.floor(n*.95)]};
    records.push(row);
    console.log('AB_TRIAL',JSON.stringify(row));
  } finally {
    await stopWorker(worker);
    await queue.close();
  }
}

for(const kind of ['sequential','bulk']) {
  for(let i=1;i<=trials;i++){
    const order=i%2?['PostgreSQL','Valkey']:['Valkey','PostgreSQL'];
    for(const backend of order) await trial(backend,kind,i);
  }
}
const median = values => [...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
const summary=[];
for (const backend of ['PostgreSQL','Valkey']) for (const kind of ['sequential','bulk']) {
  const values=records.filter(x=>x.backend===backend&&x.kind===kind);
  summary.push({backend,kind,runs:values.length,enqueueMedianJobsPerSecond:median(values.map(x=>x.enqueueJobsPerSecond)),processingMedianJobsPerSecond:median(values.map(x=>x.processingJobsPerSecond)),processingP95ResolutionMs:median(values.map(x=>x.jobProcessingP95Ms))});
}
const report={provenance:'GitHub Actions isolated Linux runner, PostgreSQL16+Valkey8 on same machine',warning:'Synthetic arithmetic jobs; processing throughput includes resume/poll; job p95 excludes wait time. Single runner, no auth load, not production capacity.',n,trials,concurrency,summary,records};
writeFileSync('ci-benchmark-ab.json',JSON.stringify(report,null,2));
console.log('AB_COMPARISON_COMPLETE',JSON.stringify(summary));

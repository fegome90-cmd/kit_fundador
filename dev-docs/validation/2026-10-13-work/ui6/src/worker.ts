import { Worker, UnrecoverableError } from 'bullmq';
import { mkdirSync, openSync, writeSync, closeSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
type Payload={value:number,failUntil?:number,delay?:number,effect?:string,ackDelay?:number};
const worker=new Worker<Payload,number>(process.env.QUEUE_NAME!,async job=>{
  if(!Number.isFinite(job.data.value))throw new UnrecoverableError('Invalid value');
  if(job.attemptsMade<(job.data.failUntil??0))throw new Error('planned retry');
  if(job.data.delay)await new Promise(r=>setTimeout(r,job.data.delay));
  if(job.data.effect){
    const dir=resolve('../effects');mkdirSync(dir,{recursive:true});const file=resolve(dir,job.data.effect);
    if(!existsSync(file)){const fd=openSync(file,'wx');writeSync(fd,JSON.stringify({jobId:job.id,value:job.data.value}));closeSync(fd);}
    await job.updateProgress(1);
  }
  if(job.data.ackDelay)await new Promise(r=>setTimeout(r,job.data.ackDelay));
  return job.data.value*2;
},{connection:{host:'127.0.0.1',port:56379,maxRetriesPerRequest:null},concurrency:Number(process.env.CONCURRENCY??4),lockDuration:1200,stalledInterval:500,maxStalledCount:1});
worker.on('error',e=>console.error('worker error '+e.message));
await worker.waitUntilReady();console.log('WORKER_READY');
process.on('SIGTERM',async()=>{await worker.close();console.log('WORKER_CLOSED');process.exit(0);});

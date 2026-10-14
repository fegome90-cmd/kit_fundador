import { Queue } from 'bullmq';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const root=resolve('..'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const queue=new Queue('persistence-lab',{connection:{host:'127.0.0.1',port:56379,maxRetriesPerRequest:1,enableOfflineQueue:false,retryStrategy:()=>100}});
await queue.waitUntilReady();await queue.pause();
await queue.addBulk(Array.from({length:100},(_,value)=>({name:'persist',data:{value}})));
const worker=spawn(process.execPath,['dist/worker.js'],{env:{...process.env,QUEUE_NAME:'persistence-lab'},stdio:['ignore','pipe','pipe']});
await new Promise(r=>worker.stdout.on('data',d=>{if(d.toString().includes('WORKER_READY'))r();}));
process.kill(Number(process.env.LAB_VALKEY_PID),'SIGKILL');await sleep(150);
const begin=Date.now();let rejected=false;try{await queue.add('offline',{value:999});}catch{rejected=true;}assert.ok(rejected);assert.ok(Date.now()-begin<3000);
const rejectionMs=Date.now()-begin,restartBegin=Date.now();
const server=spawn(resolve(root,'valkey/src/valkey-server'),['--bind','127.0.0.1','--port','56379','--dir',resolve(root,'valkey-data'),'--appendonly','yes','--appendfsync','always','--maxmemory-policy','noeviction'],{stdio:'ignore'});
try{
 await sleep(400);const end=Date.now()+10000;while(true){try{if(await queue.getWaitingCount()===100)break;}catch{}if(Date.now()>end)throw new Error('persisted count unavailable');await sleep(100);}
 await queue.resume();while(await queue.getCompletedCount()!==100){if(Date.now()>end)throw new Error('worker reconnect timeout');await sleep(50);}
 const result={persistedQueued:100,recoveredCompleted:100,producerOutageRejected:true,producerOutageRejectionMs:rejectionMs,backendRestartAndDrainMs:Date.now()-restartBegin,workerReconnect:true,policy:'noeviction',appendfsync:'always'};
 console.log(JSON.stringify(result));writeFileSync('../evidence/persistence-result.json',JSON.stringify(result,null,2));
}finally{await new Promise(r=>{worker.once('exit',r);worker.kill('SIGTERM');});await queue.obliterate({force:true});await queue.close();server.kill('SIGTERM');}

import { Queue } from 'bullmq';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const runs=[];
for(const kind of ['sequential','bulk'])for(let trial=1;trial<=3;trial++){
 const name='bench-'+kind+'-'+Date.now();const queue=new Queue(name,{connection:{host:'127.0.0.1',port:56379}});let worker;
 try{
  await queue.pause();const count=500;const begin=performance.now();
  if(kind==='bulk')await queue.addBulk(Array.from({length:count},(_,value)=>({name:'double',data:{value}})));
  else for(let value=0;value<count;value++)await queue.add('double',{value});
  const enqueueMs=performance.now()-begin;
  worker=spawn(process.execPath,['dist/worker.js'],{env:{...process.env,QUEUE_NAME:name,CONCURRENCY:'4'},stdio:['ignore','pipe','pipe']});
  await new Promise((r,j)=>{worker.stdout.on('data',d=>{if(d.toString().includes('WORKER_READY'))r();});worker.on('exit',c=>j(new Error('worker '+c)));});
  const consumeStart=performance.now();await queue.resume();const deadline=Date.now()+30000;
  while(await queue.getCompletedCount()!==count){if(Date.now()>deadline)throw new Error('benchmark timeout');await sleep(10);}
  const processingMs=performance.now()-consumeStart;const jobs=await queue.getJobs(['completed'],0,count);
  assert.equal(jobs.length,count);for(const j of jobs)assert.equal(j.returnvalue,j.data.value*2);
  const duration=jobs.map(j=>j.finishedOn-j.processedOn).sort((a,b)=>a-b);
  const row={backend:'Valkey',kind,trial,count,concurrency:4,appendfsync:'always',enqueueMs,enqueueJobsPerSecond:count*1000/enqueueMs,processingMs,processingJobsPerSecond:count*1000/processingMs,jobProcessingP50Ms:duration[Math.floor(count*.50)],jobProcessingP95Ms:duration[Math.floor(count*.95)]};runs.push(row);console.log(JSON.stringify(row));
 }finally{if(worker){await new Promise(r=>{worker.once('exit',r);worker.kill('SIGTERM');});}await queue.obliterate({force:true});await queue.close();}
}
writeFileSync('../evidence/benchmark-valkey.json',JSON.stringify({note:'Single-host native Valkey, no PostgreSQL comparison. Processing latencies exclude waiting in paused queue; 500 no-op arithmetic jobs x 3 repetitions per enqueue mode.',runs},null,2));

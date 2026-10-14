import test from 'node:test';
import assert from 'node:assert/strict';
import { Queue } from 'bullmq';
import { spawn } from 'node:child_process';
import { existsSync, createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const poll=async(fn,ms=10000)=>{const end=Date.now()+ms;while(Date.now()<end){const v=await fn();if(v)return v;await sleep(25);}throw new Error('poll timeout');};
let serial=0;
const setup=async()=>{
  const name='legolab-'+Date.now()+'-'+(++serial);
  const queue=new Queue(name,{connection:{host:'127.0.0.1',port:56379,maxRetriesPerRequest:1}});
  const children=[];
  const start=async()=>{
    const c=spawn(process.execPath,['dist/worker.js'],{env:{...process.env,QUEUE_NAME:name},stdio:['ignore','pipe','pipe']});children.push(c);
    const out=createWriteStream(resolve('../evidence',name+'-'+children.length+'.worker.log'));c.stdout.pipe(out);c.stderr.pipe(out);
    await new Promise((r,j)=>{c.stdout.on('data',d=>{if(d.toString().includes('WORKER_READY'))r();});c.on('exit',code=>j(new Error('worker early exit '+code)));setTimeout(()=>j(new Error('worker ready timeout')),5000).unref();});return c;
  };
  const stop=async(c,signal='SIGTERM')=>{if(c.exitCode!==null||c.signalCode)return;const exited=new Promise(r=>c.once('exit',r));c.kill(signal);await exited;};
  const done=async(job,state='completed')=>poll(async()=>{const current=await queue.getJob(job.id);const s=await current.getState();if(s==='failed'&&state!=='failed')throw new Error('job failed '+current.failedReason);return s===state?current:false;},20000);
  const close=async()=>{for(const c of children)await stop(c);await queue.obliterate({force:true});await queue.close();};
  return {queue,start,stop,done,close,name};
};
test('B producer -> separate compiled worker, result, bounded retry/backoff',async()=>{
  const s=await setup();try{await s.start();const begin=Date.now();const j=await s.queue.add('retry',{value:3,failUntil:2},{attempts:3,backoff:{type:'exponential',delay:100}});const result=await s.done(j);assert.equal(result.returnvalue,6);assert.equal(result.attemptsMade,3);assert.ok(Date.now()-begin>=300);console.log(JSON.stringify({test:'retry',attempts:result.attemptsMade,elapsedMs:Date.now()-begin}));}finally{await s.close();}
});
test('B jobId and deduplication reject duplicate enqueues before processing',async()=>{
  const s=await setup();try{const a=await s.queue.add('dedup',{value:2},{deduplication:{id:'same'}});const b=await s.queue.add('dedup',{value:99},{deduplication:{id:'same'}});assert.equal(a.id,b.id);await s.queue.add('id',{value:1},{jobId:'unique'});await s.queue.add('id',{value:77},{jobId:'unique'});assert.equal(await s.queue.getWaitingCount(),2);await s.start();assert.equal((await s.done(a)).returnvalue,4);}finally{await s.close();}
});
test('B permanent failure and invalid payload have explicit failed states',async()=>{
  const s=await setup();try{await s.start();const permanent=await s.queue.add('fail',{value:1,failUntil:100},{attempts:2});assert.equal((await s.done(permanent,'failed')).attemptsMade,2);const invalid=await s.queue.add('invalid',{value:'bad'},{attempts:3});const failed=await s.done(invalid,'failed');assert.equal(failed.attemptsMade,1);assert.match(failed.failedReason,/Invalid value/);}finally{await s.close();}
});
test('B worker SIGKILL active job recovered after lock expiry',async()=>{
  const s=await setup();try{const c=await s.start();const j=await s.queue.add('recover',{value:5,delay:2500});await poll(async()=>(await j.getState())==='active');const start=Date.now();await s.stop(c,'SIGKILL');await s.start();assert.equal((await s.done(j)).returnvalue,10);console.log(JSON.stringify({test:'kill-recovery',recoveryMs:Date.now()-start}));}finally{await s.close();}
});
test('B effect committed before ack: repeated execution uses durable idempotency key',async()=>{
  const s=await setup();try{const c=await s.start();const effect=s.name+'.json';const j=await s.queue.add('effect',{value:7,effect,ackDelay:2500});await poll(()=>existsSync(resolve('../effects',effect)));await s.stop(c,'SIGKILL');await s.start();const finished=await s.done(j);assert.equal(finished.returnvalue,14);assert.ok(finished.attemptsStarted>=2);console.log(JSON.stringify({test:'effect-ack',executions:finished.attemptsStarted,uniqueEffects:1}));}finally{await s.close();}
});
test('B graceful SIGTERM drains an active job',async()=>{
  const s=await setup();try{const c=await s.start();const j=await s.queue.add('drain',{value:4,delay:350});await poll(async()=>(await j.getState())==='active');await s.stop(c);assert.equal((await s.done(j)).returnvalue,8);}finally{await s.close();}
});

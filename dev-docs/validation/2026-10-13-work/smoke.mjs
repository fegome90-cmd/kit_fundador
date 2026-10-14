import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const [cwd,docs='off',jobs='off']=process.argv.slice(2);
const child=spawn(process.execPath,['dist/server.js'],{cwd,env:{...process.env,PORT:'0',DOCS:docs,JOBS:jobs},stdio:['ignore','pipe','pipe']});let output='';
child.stderr.on('data',d=>output+=d);
try{
 const url=await new Promise((r,j)=>{child.stdout.on('data',d=>{output+=d;const m=output.match(/LAB_LISTEN (http:\/\/[^\s]+)/);if(m)r(m[1]);});child.on('exit',c=>j(new Error('exit '+c+':'+output)));setTimeout(()=>j(new Error('timeout '+output)),5000).unref();});
 assert.equal((await fetch(url+'/health')).status,200);
 const spec=await fetch(url+'/docs/json');assert.equal(spec.status,docs==='on'?200:404);
 if(docs==='on')assert.ok((await spec.json()).paths['/health']);
 console.log(JSON.stringify({cwd,compiledStart:true,health:200,docs,jobs,frontendRequired:false}));
}finally{if(child.exitCode===null){await new Promise(r=>{child.once('exit',r);child.kill('SIGTERM');});}}

import { createPostgresBackend, withBackend, Queue, Worker } from 'bullmq';
type Payload={value:number};
const pg=withBackend(createPostgresBackend);
export const makeA=()=>new pg.Queue<Payload,number>('lab',{connection:{host:'127.0.0.1',port:55432,user:'lab',database:'legolab',max:3}});
export const makeB=()=>new Queue<Payload,number>('lab',{connection:{host:'127.0.0.1',port:56379,maxRetriesPerRequest:1}});
export const workerA=()=>new pg.Worker<Payload,number>('lab',async j=>j.data.value*2,{connection:{host:'127.0.0.1',port:55432,user:'lab',database:'legolab',max:3}});
export const workerB=()=>new Worker<Payload,number>('lab',async j=>j.data.value*2,{connection:{host:'127.0.0.1',port:56379,maxRetriesPerRequest:null}});

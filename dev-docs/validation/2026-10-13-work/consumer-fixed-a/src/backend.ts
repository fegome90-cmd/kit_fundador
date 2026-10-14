import { withBackend, createPostgresBackend } from 'bullmq';
export const { Queue, Worker }=withBackend(createPostgresBackend);
export const connection={host:'127.0.0.1',port:55432,user:'lab',database:'legolab'};

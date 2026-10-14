import Fastify from 'fastify';
const app=Fastify({logger:false});
app.get('/health',async()=>({ok:true}));
const address=await app.listen({host:'127.0.0.1',port:Number(process.env.PORT??0)});console.log('LAB_LISTEN '+address);
process.on('SIGTERM',async()=>{await app.close();process.exit(0);});

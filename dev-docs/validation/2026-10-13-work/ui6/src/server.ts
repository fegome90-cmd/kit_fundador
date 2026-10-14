import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import { fromNodeHeaders } from 'better-auth/node';
import { auth, pool } from './auth.js';
const app=Fastify({logger:false,bodyLimit:1024});
if(process.env.DB==='on'&&!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
await app.register(cors,{origin:['http://localhost:3000'],credentials:true});
if(process.env.DOCS==='on')await app.register(swagger,{openapi:{info:{title:'LEGO isolated PoC',version:'0.0.0'},components:{securitySchemes:{session:{type:'apiKey',in:'cookie',name:'better-auth.session_token'}}}}});
app.setErrorHandler((err,req,reply)=>{const status=(err as {statusCode?:number}).statusCode??500;return reply.code(status).send({error:status<500?'Request rejected':'Internal error'});});
app.get('/health',{schema:{response:{200:{type:'object',properties:{ok:{type:'boolean'}}}}}},async()=>({ok:true}));
app.get('/ready',async(req,reply)=>{if(process.env.DB==='on'){try{await pool.query('SELECT 1');}catch{return reply.code(503).send({ok:false});}}return {ok:true};});
app.post('/echo',{schema:{body:{type:'object',properties:{text:{type:'string'}},required:['text'],additionalProperties:false}}},async req=>req.body);
app.get('/boom',async()=>{throw new Error('LAB_INTERNAL_SECRET');});
if(process.env.AUTH){
  app.route({method:['GET','POST'],url:'/api/auth/*',schema:{hide:true},handler:async(req,reply)=>{
    // Trusted configured authority; do not derive public URL from client Host.
    const url=new URL(req.url,auth.options.baseURL as string);
    const response=await auth.handler(new Request(url,{method:req.method,headers:fromNodeHeaders(req.headers),...(req.body?{body:JSON.stringify(req.body)}:{})}));
    reply.code(response.status);
    for(const [key,value] of response.headers)if(key!=='set-cookie')reply.header(key,value);
    const cookies=response.headers.getSetCookie();if(cookies.length)reply.header('set-cookie',cookies);
    return reply.send(await response.text());
  }});
}
app.get('/private',async(req,reply)=>{
  if(!req.headers.cookie)return reply.code(401).send({error:'Unauthorized'});
  const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
  if(!session)return reply.code(401).send({error:'Unauthorized'});
  return {userId:session.user.id};
});
app.get('/admin',async(req,reply)=>{
  const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
  if(!session)return reply.code(401).send({error:'Unauthorized'});
  if(session.user.role!=='admin')return reply.code(403).send({error:'Forbidden'});
  return {ok:true};
});
if(process.env.DOCS==='on')await app.register(swaggerUI,{routePrefix:'/docs'});
app.addHook('onClose',()=>pool.end());
const address=await app.listen({port:Number(process.env.PORT??4310),host:'127.0.0.1'});
console.log('LAB_LISTEN '+address);
process.on('SIGTERM',async()=>{await app.close();process.exit(0);});

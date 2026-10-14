import { type FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
export async function beforeRoutes(app:FastifyInstance){await app.register(swagger,{openapi:{info:{title:'LEGO isolated PoC',version:'0.0.0'},components:{securitySchemes:{session:{type:'apiKey',in:'cookie',name:'better-auth.session_token'}}}}});}
export async function afterRoutes(app:FastifyInstance){await app.register(swaggerUI,{routePrefix:'/docs'});}

from pathlib import Path
import json
root=Path(__file__).resolve().parent
src=root/'prototype'
reg=root/'registry';reg.mkdir(exist_ok=True)
# Pin to independently tested Swagger UI 6.1.2 lockfile; 5.2.6 has known advisories.
package=json.loads((root/'ui6'/'package.json').read_text());deps=package['dependencies'];dev=package['devDependencies']
def f(path): return {'path':path,'type':'registry:file','target':'~/'+path,'content':(src/path).read_text()}
def item(name,files,packages,requires=[]):
    d={'$schema':'https://ui.shadcn.com/schema/registry-item.json','name':name,'type':'registry:item','title':name,'description':'Isolated validation fixture; not a published Kit item','files':files,'dependencies':[p+'@'+deps[p] for p in packages], 'registryDependencies':['http://127.0.0.1:4380/'+r+'.json' for r in requires]}
    if name=='core-fastify': d['devDependencies']=[p+'@'+dev[p] for p in ['typescript','@types/node','@types/pg']]
    (reg/(name+'.json')).write_text(json.dumps(d,indent=2)+'\n');return d
# server.ts is an explicit full-recipe entrypoint. Individual items only copy their
# files; the aggregate item owns the composition. No runtime registry is added.
items=[]
items.append(item('core-fastify',[f('tsconfig.json'),f('pnpm-workspace.yaml')],['fastify','@fastify/cors']))
items.append(item('api-docs',[f('src/docs.ts')],['@fastify/swagger','@fastify/swagger-ui'],['core-fastify']))
db_item=item('db-postgres',[f('drizzle.config.ts'),f('drizzle/0000_last_kat_farrell.sql'),
    f('drizzle/meta/_journal.json'),f('drizzle/meta/0000_snapshot.json')],['drizzle-orm','pg'],['core-fastify'])
db_item['devDependencies']=['drizzle-kit@'+dev['drizzle-kit']]
(reg/'db-postgres.json').write_text(json.dumps(db_item,indent=2)+'\n')
items.append(db_item)
items.append(item('auth-better-auth',[f('src/auth.ts'),f('src/auth-schema.ts')],['better-auth','@better-auth/drizzle-adapter'],['db-postgres']))
baseA="import { withBackend, createPostgresBackend } from 'bullmq';\nexport const { Queue, Worker }=withBackend(createPostgresBackend);\nexport const connection={connectionString:process.env.DATABASE_URL,schema:'bullmq',max:4};\n"
baseB="export { Queue, Worker } from 'bullmq';\nconst u=process.env.QUEUE_URL?new URL(process.env.QUEUE_URL):undefined;\nexport const connection={host:u?.hostname??'127.0.0.1',port:Number(u?.port??56379),password:u?.password||undefined,maxRetriesPerRequest:null};\n"
def jobfile(content):return {'path':'src/backend.ts','type':'registry:file','target':'~/src/backend.ts','content':content}
worker = """import { Worker, connection } from './backend.js';
const worker=new Worker('registry-probe',async job=>{
  const value=job.data?.value;
  if(typeof value!=='number'||!Number.isFinite(value))throw new Error('Invalid value');
  return value*2;
},{connection,concurrency:4});
worker.on('error',e=>console.error('worker failed: '+e.message));
await worker.waitUntilReady();console.log('ASSEMBLED_WORKER_READY');
process.on('SIGTERM',async()=>{await worker.close();process.exit(0)});
"""
workerfile={'path':'src/worker.ts','type':'registry:file','target':'~/src/worker.ts','content':worker}
items.append(item('jobs-postgres',[jobfile(baseA),workerfile],['bullmq'],['db-postgres']))
items.append(item('jobs-valkey',[jobfile(baseB),workerfile],['bullmq','ioredis'],['core-fastify']))
for v,backend in [('a','jobs-postgres'),('b','jobs-valkey')]:
    server=f('src/server.ts');server['content']="import { Queue, connection } from './backend.js';\n"+server['content']+"\nconst queue=new Queue('registry-compile-probe',{connection});await queue.close();\n"
    # The backend constructor above is exercised only when full services are available.
    server['content']=server['content'].replace("\nconst queue=new Queue('registry-compile-probe',{connection});await queue.close();\n", "")
    server['content']=server['content'].replace("app.addHook('onClose',()=>pool.end());", "if(process.env.JOBS==='on'){const queue=new Queue('registry-probe',{connection});await queue.waitUntilReady();app.addHook('onClose',()=>queue.close());}\napp.addHook('onClose',()=>pool.end());")
    items.append(item('lego-full-'+v,[server],[],['api-docs','auth-better-auth',backend]))
(reg/'registry.json').write_text(json.dumps({'$schema':'https://ui.shadcn.com/schema/registry.json','name':'kit-lego-validation','homepage':'https://github.com/fegome90-cmd/kit_fundador','items':items},indent=2)+'\n')
print('Generated 8 local universal registry fixtures; services.py creates fresh consumers per run')

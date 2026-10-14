import urllib.request, json, concurrent.futures, pathlib
root=pathlib.Path(__file__).resolve().parent
pins={'fastify':'5.12.7','@fastify/swagger':'9.9.2','@fastify/swagger-ui':'5.2.6','@fastify/cors':'11.3.1','drizzle-orm':'0.45.4','drizzle-kit':'0.31.11','better-auth':'1.7.7','@better-auth/drizzle-adapter':'1.7.7','bullmq':'6.3.14','pg':None,'ioredis':None,'typescript':None,'@types/node':None,'@types/pg':None,'shadcn':None,'auth':None,'@apidevtools/swagger-parser':None}
def get(item):
    name,version=item
    with urllib.request.urlopen('https://registry.npmjs.org/'+name.replace('/','%2f'),timeout=40) as f: doc=json.load(f)
    major={'ioredis':5,'typescript':5,'@types/node':24}.get(name)
    stable=[v for v in doc['versions'] if '-' not in v and v.split('.')[0]==str(major)]
    v=version or (max(stable,key=lambda v:tuple(map(int,v.split('.')))) if major else doc['dist-tags']['latest']); d=doc['versions'][v]
    return name,{k:d.get(k) for k in ['name','version','engines','license','peerDependencies','peerDependenciesMeta','dist']}
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as e:
    data=dict(e.map(get,pins.items()))
(root/'evidence'/'package-metadata.json').write_text(json.dumps(data,indent=2)+'\n')
runtime=['fastify','@fastify/swagger','@fastify/swagger-ui','@fastify/cors','drizzle-orm','better-auth','@better-auth/drizzle-adapter','bullmq','pg','ioredis']
dev=[n for n in pins if n not in runtime]
package={'name':'kit-lego-isolated-validation','version':'0.0.0','private':True,'type':'module','engines':{'node':'>=24 <25'},'packageManager':'pnpm@11.25.0','scripts':{'types':'tsc --noEmit','build':'tsc','test':'node --test tests/*.test.mjs'},'dependencies':{n:data[n]['version'] for n in runtime},'devDependencies':{n:data[n]['version'] for n in dev}}
(root/'prototype'/'package.json').write_text(json.dumps(package,indent=2)+'\n')
print(json.dumps({n:d['version'] for n,d in data.items()},indent=2))

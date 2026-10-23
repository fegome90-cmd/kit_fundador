import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, basename, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertNoLifecycleHooks } from '../../../scripts/lego-package-lifecycle-policy.mjs';

const addon=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(readFileSync(join(addon,'package.json'),'utf8'));
assert.equal(manifest.private,true);
assert.equal(manifest.name,'@kit-fundador/storage-s3');
assert.equal(manifest.packageManager,'pnpm@11.25.0');
assert.equal(manifest.main,'./dist/index.js');
assert.equal(manifest.types,'./dist/index.d.ts');
assert.equal(manifest.exports?.['.']?.types,'./dist/index.d.ts');
assert.equal(manifest.exports?.['.']?.default,'./dist/index.js');
assert.deepEqual(manifest.files,['dist','README.md']);
assertNoLifecycleHooks(manifest.scripts);
function run(cwd,tool,args){
  const result=spawnSync(tool,args,{cwd,env:process.env,stdio:'inherit'});
  if(result.error)throw result.error;
  assert.equal(result.status,0,tool+' '+args.join(' ')+' failed');
}
function put(path,value){writeFileSync(path,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');}
const scratch=mkdtempSync(join(tmpdir(),'lego-r3-external-'));
try{
  run(addon,'pnpm',['pack','--pack-destination',scratch]);
  const archives=readdirSync(scratch).filter(name=>name.endsWith('.tgz'));
  assert.equal(archives.length,1,'Expected exactly one private tarball');
  const archive=join(scratch,archives[0]);
  const names=execFileSync('tar',['-tzf',archive],{encoding:'utf8'}).trim().split(/\r?\n/);
  for(const expected of ['package/package.json','package/dist/index.js','package/dist/index.d.ts','package/README.md']){
    assert.ok(names.includes(expected),'Missing packaged file '+expected);
  }
  assert.ok(!names.some(p=>p.includes('node_modules/') || /(^|\/)\.env/.test(p) ||
    p.startsWith('/') || p.includes('../')),'Invalid private tarball contents');

  const manifestConsumer={
    name:'lego-r3-external-consumer',version:'0.0.0',private:true,type:'module',
    packageManager:'pnpm@11.25.0',
    dependencies:{fastify:'5.12.7','@kit-fundador/storage-s3':'file:../'+basename(archive)},
    devDependencies:{typescript:'5.9.3','@types/node':'24.19.2'},
  };
  const consumer=join(scratch,'first');
  mkdirSync(consumer);
  put(join(consumer,'package.json'),manifestConsumer);
  put(join(consumer,'tsconfig.json'),{
    compilerOptions:{
      target:'ES2022',module:'NodeNext',moduleResolution:'NodeNext',
      strict:true,skipLibCheck:false,noEmit:true,types:['node']
    },
    include:['smoke.ts']
  });
  put(join(consumer,'smoke.ts'),[
    "import { createStorageS3Plugin, type StorageS3Options, type StorageS3 } from '@kit-fundador/storage-s3';",
    "import type { FastifyPluginAsync } from 'fastify';",
    "const options: StorageS3Options = {",
    "  endpoint:'http://127.0.0.1:9000',region:'us-east-1',bucket:'test-ci-bucket',",
    "  accessKeyId:'example',secretAccessKey:'synthetic',keyPrefix:'demo/',",
    "};",
    "const plugin: FastifyPluginAsync=createStorageS3Plugin(options);",
    "declare const storage: StorageS3;",
    "const size: number = (await storage.putObject('key', new Uint8Array([1]), 'application/octet-stream')).bytes;",
    "void size; void plugin;",
  ].join('\n')+'\n');
  run(consumer,'pnpm',['install','--no-frozen-lockfile','--strict-peer-dependencies','--ignore-scripts']);

  const replay=join(scratch,'replay');
  cpSync(consumer,replay,{recursive:true,filter:path=>
    !path.slice(consumer.length).split(sep).includes('node_modules')
  });
  run(replay,'pnpm',['install','--frozen-lockfile','--strict-peer-dependencies','--ignore-scripts']);
  run(replay,'pnpm',['exec','tsc','--noEmit','-p','tsconfig.json']);
  run(replay,'node',['--input-type=module','--eval',
    "import assert from 'node:assert/strict';"+
    "const module=await import('@kit-fundador/storage-s3');"+
    "assert.equal(typeof module.createStorageS3Plugin,'function');"+
    "assert.equal(typeof module.openStorageS3,'function');"+
    "console.log('LEGO_R3_EXTERNAL_ESM_PASS');"
  ]);
  console.log('LEGO_R3_PRIVATE_PACKAGE_PASS');
}finally{rmSync(scratch,{recursive:true,force:true});}

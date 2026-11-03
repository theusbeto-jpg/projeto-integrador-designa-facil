import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp,rm,cp as copy,readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { once } from 'node:events';

test('fluxo completo com banco novo, sessões, permissões e persistência',async t=>{
  const directory=await mkdtemp(resolve('.test-demo-'));
  const moduleUrl=pathToFileURL(resolve('server/index.mjs')).href;
  await copy('dist',resolve(directory,'dist'),{recursive:true});
  let child;
  t.after(async()=>{if(child&&!child.killed){child.kill();await once(child,'exit').catch(()=>{});}await rm(directory,{recursive:true,force:true});});
  const start=async()=>{
    child=spawn(process.execPath,['--input-type=module','-e',`import {createDemoServer} from ${JSON.stringify(moduleUrl)}; const s=createDemoServer({port:0});s.listen(0,'127.0.0.1',()=>console.log('PORT:'+s.address().port));`],{cwd:directory,windowsHide:true});
    let output='',errors='';child.stderr.on('data',b=>errors+=b);
    return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Servidor não iniciou: '+errors)),15000);child.stdout.on('data',b=>{output+=b;const m=/PORT:(\d+)/.exec(output);if(m){clearTimeout(timer);resolve('http://127.0.0.1:'+m[1]);}});child.once('exit',code=>{clearTimeout(timer);reject(new Error('Servidor encerrou: '+code+' '+errors));});});
  };
  let base=await start();
  const request=(path,body,cookie,extra={})=>fetch(base+path,{...(body?{method:'POST',body:JSON.stringify(body)}:{}),headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...extra}});
  const login=async identifier=>{const response=await request('/api/auth/login',{identifier,secret:'DemoAcademica!2026'});assert.equal(response.status,200);assert.match(response.headers.get('set-cookie'),/HttpOnly/);return response.headers.get('set-cookie').split(';')[0];};
  await t.test('página e recursos compilados',async()=>{const r=await request('/');assert.equal(r.status,200);const html=await r.text();assert.match(html,/Demonstração acadêmica/);const asset=/src="([^"]+\.js)"/.exec(html)?.[1];assert.ok(asset);assert.equal((await request(asset)).status,200);});
  await t.test('anônimo e cabeçalhos forjados são rejeitados',async()=>{assert.equal((await request('/api/state')).status,401);assert.equal((await request('/api/state',null,null,{'oai-authenticated-user-id':'fake','oai-authenticated-user-email':'admin@example.invalid'})).status,401);});
  await t.test('senha inválida e sessão falsa são rejeitadas',async()=>{assert.equal((await request('/api/auth/login',{identifier:'admin@example.invalid',secret:'errada'})).status,401);assert.equal((await request('/api/state',null,'df_demo_session='+'a'.repeat(64))).status,401);});
  const admin=await login('admin@example.invalid'),viewer=await login('aluno@example.invalid');
  await t.test('dados fictícios e nenhum hash na resposta',async()=>{const r=await request('/api/state',null,admin);assert.equal(r.status,200);const text=await r.text(),data=JSON.parse(text);assert.equal(data.members.length,12);assert.equal(data.weeks.length,4);assert.equal(data.user.role,'admin');assert.ok(data.members.every(m=>m.name.startsWith('Participante ')));assert.doesNotMatch(text,/password_hash|token_hash|access_code_hash/);});
  await t.test('leitor não altera cadastros e não recebe contatos alheios',async()=>{const r=await request('/api/state',null,viewer);const data=await r.json();assert.ok(data.members.filter(m=>m.id!==data.user.id).every(m=>m.email===null&&m.whatsapp_phone===null));assert.notEqual((await request('/api/state',{action:'createMember',payload:{name:'Pessoa fictícia bloqueada'}},viewer)).status,200);});
  await t.test('origem externa é bloqueada antes de alterar dados',async()=>assert.equal((await request('/api/state',{action:'createMember',payload:{name:'Teste'}},admin,{Origin:'https://example.invalid'})).status,403));
  await t.test('administrador cria cadastro e consulta persistência',async()=>{const response=await request('/api/state',{action:'createMember',payload:{name:'Cadastro fictício de teste',email:'teste@example.invalid',gender:'masculino',congregationStatus:'publicador_batizado',role:'publicador',participationStatus:'ativo',privileges:['leitura']}},admin);assert.equal(response.status,200,await response.clone().text());assert.ok((await response.json()).members.some(m=>m.name==='Cadastro fictício de teste'));});
  await t.test('integrações e recuperação de produção estão desativadas',async()=>{for(const action of ['syncJwPrograms','syncWatchtowerStudies','importPublicMeetingHistory','createInvitation']){const r=await request('/api/state',{action,payload:{}},admin);assert.notEqual(r.status,200);}});
  await t.test('sessão expirada não pode ser usada',async()=>{const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(resolve(directory,'.data/demo.sqlite'));db.prepare('UPDATE app_sessions SET expires_at=? WHERE member_id=?').run('2000-01-01T00:00:00.000Z','demo-003');db.close();assert.equal((await request('/api/state',null,viewer)).status,401);});
  await t.test('logout revoga a sessão',async()=>{assert.equal((await request('/api/auth/logout',{},admin)).status,200);assert.equal((await request('/api/state',null,admin)).status,401);});
  await t.test('reinício mantém dados locais',async()=>{child.kill();await once(child,'exit');base=await start();const cookie=await login('admin@example.invalid');const r=await request('/api/state',null,cookie);assert.ok((await r.json()).members.some(m=>m.name==='Cadastro fictício de teste'));});
  await t.test('armazenamento usa scrypt com sais diferentes',async()=>{const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(resolve(directory,'.data/demo.sqlite'));const hashes=db.prepare('SELECT password_hash FROM invitations').all().map(r=>r.password_hash);db.close();assert.equal(new Set(hashes).size,3);assert.ok(hashes.every(h=>/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(h)));});
});

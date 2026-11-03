import { readdir,readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

// Verificação preventiva por padrões. Não substitui revisão humana e não publica arquivos.
const ignored=new Set(['.git','node_modules','dist','.server','.data']);
const findings=[];let files=0;
const patterns=[
  ['chave privada',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['token GitHub',/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ['chave de serviço',/\b(?:sk_(?:live|test)_[A-Za-z0-9]{16,}|AKIA[A-Z0-9]{16}|sk-proj-[A-Za-z0-9_-]{20,})\b/],
  ['JWT',/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['e-mail externo',/[A-Za-z0-9._%+-]+@(?!example\.invalid\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/],
  ['identificador de hospedagem',/appgprj_[a-f0-9]{20,}/],
  ['URL de banco com credencial',/(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s/]+:[^\s@]+@/],
];
async function scan(directory='') {
  for(const entry of await readdir(directory||'.',{withFileTypes:true})){
    if(ignored.has(entry.name)||entry.name.startsWith('.test-demo-'))continue;
    const file=join(directory,entry.name);
    if(entry.isSymbolicLink())throw new Error('Link simbólico não permitido: '+file);
    if(entry.isDirectory()){if(['.openai','.vercel','.wrangler','auditoria-privada'].includes(entry.name))findings.push([file,'configuração privada']);else await scan(file);continue;}
    if(/\.(?:sqlite.*|db|pem|key|log|zip)$/i.test(entry.name)||(/^\.env/.test(entry.name)&&entry.name!=='.env.example')){findings.push([file,'arquivo não publicável']);continue;}
    if(file.replaceAll('\\','/')==='scripts/check-publication.mjs')continue;
    const content=await readFile(file,'utf8');files++;
    for(const [label,pattern] of patterns)if(pattern.test(content))findings.push([file,label]);
  }
}
await scan();
const pkg=JSON.parse(await readFile('package.json','utf8'));
assert.equal(pkg.private,true,'npm deve permanecer privado');
assert.deepEqual(Object.keys(pkg.dependencies).sort(),['react','react-dom']);
assert.ok(!Object.keys(pkg.scripts).some(key=>/publish|deploy/i.test(key)));
if(findings.length){console.error(JSON.stringify(findings,null,2));process.exitCode=1;}else console.log(`Verificação aprovada: ${files} arquivos; nenhum padrão bloqueado encontrado.`);

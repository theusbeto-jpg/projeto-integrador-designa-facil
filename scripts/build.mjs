import ts from 'typescript';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
const entries=['app/api/state/route.ts','app/appAuth.ts','app/privilegeDefinitions.ts','app/assignmentGuidance.ts','app/songbook.ts','server/database.ts','server/seed.ts'];
for(const file of entries){const source=await readFile(file,'utf8');const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g,(_all,start,p,end)=>start+p+'.js'+end);const target='.server/'+file.replace(/\.ts$/,'.js');await mkdir(dirname(target),{recursive:true});await writeFile(target,output);}
if(!process.argv.includes('--server-only')){const {build}=await import('vite');await build();}

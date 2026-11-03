import { spawn } from 'node:child_process';
await import('./build.mjs');
const api=spawn(process.execPath,['server/index.mjs','--dev'],{stdio:'inherit',windowsHide:true});
const {createServer}=await import('vite');const vite=await createServer();await vite.listen();vite.printUrls();
const close=async()=>{api.kill();await vite.close();process.exit();};process.on('SIGINT',close);process.on('SIGTERM',close);

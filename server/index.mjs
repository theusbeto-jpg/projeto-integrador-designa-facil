import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GET, POST, initializeDemo } from '../.server/app/api/state/route.js';
import { localDatabase } from '../.server/server/database.js';
import { createOwnLoginSession,clearOwnLoginSession,UnauthorizedError } from '../.server/app/appAuth.js';

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
const root=resolve('dist'),attempts=new Map();
await initializeDemo();
export function createDemoServer({port=3000,development=false}={}) {
  const allowedHosts=new Set([`127.0.0.1:${port}`,`localhost:${port}`]);
  if(development){allowedHosts.add('localhost:5173');allowedHosts.add('127.0.0.1:5173');}
  const server = http.createServer(async(req,res)=>{
    const send=(status,body,headers={})=>{res.writeHead(status,{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...headers});res.end(body);};
    try {
      if(!allowedHosts.has(req.headers.host))return send(403,'Host não autorizado');
      const base=`http://${req.headers.host}`,url=new URL(req.url,base);
      if(req.method==='POST') {
        if((req.headers.origin&&req.headers.origin!==base)||!String(req.headers['content-type']).startsWith('application/json'))return send(403,'Origem ou formato não autorizado');
      }
      if(url.pathname.startsWith('/api/')) {
        if(!['GET','POST'].includes(req.method))return send(405,'Método não permitido');
        let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>100000)return send(413,'Requisição muito grande');}
        const request=new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body}: {})});
        let response;
        if(url.pathname==='/api/state')response=await(req.method==='GET'?GET:POST)(request);
        else if(req.method==='POST'&&url.pathname==='/api/auth/login') {
          const key=req.socket.remoteAddress;
          const item=attempts.get(key)??{count:0,until:Date.now()+60000};
          if(item.until<Date.now()){item.count=0;item.until=Date.now()+60000;}
          item.count++;attempts.set(key,item);if(item.count>10)return send(429,JSON.stringify({error:'Aguarde um minuto para tentar novamente.'}),{'Content-Type':'application/json'});
          const data=JSON.parse(body);
          const login=await createOwnLoginSession(localDatabase,request,String(data.identifier??''),String(data.secret??''));
          response=Response.json({ok:true,user:login.user},{headers:{'set-cookie':login.cookie}});
        } else if(req.method==='POST'&&url.pathname==='/api/auth/logout')response=Response.json({ok:true},{headers:{'set-cookie':await clearOwnLoginSession(localDatabase,request)}});
        else return send(404,'Não encontrado');
        return send(response.status,Buffer.from(await response.arrayBuffer()),Object.fromEntries(response.headers));
      }
      if(req.method!=='GET'&&req.method!=='HEAD')return send(405,'Método não permitido');
      const filename=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
      if(!filename.startsWith(root+sep))return send(403,'Caminho não autorizado');
      const data=await readFile(filename).catch(()=>null);
      if(!data)return send(404,'Não encontrado');
      send(200,req.method==='HEAD'?'':data,{'Content-Type':types[extname(filename)]??'application/octet-stream'});
    } catch(error){send(error instanceof UnauthorizedError?401:error instanceof SyntaxError?400:500,JSON.stringify({error:error instanceof UnauthorizedError?error.message:'Não foi possível concluir a operação.'}),{'Content-Type':'application/json'});}
  });
  server.on('listening',()=>{const actual=server.address().port;allowedHosts.add(`127.0.0.1:${actual}`);allowedHosts.add(`localhost:${actual}`);});
  return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const development=process.argv.includes('--dev'),port=development?3001:3000;createDemoServer({port,development}).listen(port,'127.0.0.1',()=>console.log(`Demonstração local: http://127.0.0.1:${port}`));}

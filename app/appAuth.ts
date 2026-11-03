import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';

export type AppRole = 'admin' | 'coordenador' | 'publicador';
export type EditableModule = 'designacao_vm' | 'reuniao_publica' | 'mecanicas' | 'campo' | 'pastoreio';
export const EDITABLE_MODULES: EditableModule[] = ['designacao_vm','reuniao_publica','mecanicas','campo','pastoreio'];
export type AppUser = { id:string; displayName:string; email:string|null; role:AppRole; canEdit:boolean; editableModules:EditableModule[]; authenticated:boolean };
export class UnauthorizedError extends Error {}
export function deriveEditableModules(role:AppRole, raw:string|null|undefined): EditableModule[] {
  if(role === 'admin') return [...EDITABLE_MODULES];
  try { const parsed:unknown=JSON.parse(raw??'[]');return Array.isArray(parsed)?EDITABLE_MODULES.filter(key=>parsed.includes(key)):[]; } catch { return []; }
}
export function passwordHash(password:string) {
  const salt=randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;
}
function verify(password:string,stored:string) {
  const [salt,hash]=stored.split(':');
  if(!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(hash,'hex'));
}
function tokenHash(value:string) { return createHash('sha256').update(value).digest('hex'); }
function token(request:Request) { return /(?:^|;\s*)df_demo_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get('cookie')??'')?.[1]??''; }
function cookie(value:string,age:number) { return `df_demo_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}`; }
type Member={id:string;name:string;email:string|null;role:AppRole;active:number;editable_modules:string|null};
function user(member:Member):AppUser { return {id:member.id,displayName:member.name,email:member.email,role:member.role,canEdit:member.role==='admin',editableModules:deriveEditableModules(member.role,member.editable_modules),authenticated:true}; }
export async function ensureCurrentUser(db:D1Database,request:Request):Promise<AppUser> {
  const value=token(request);if(!value)throw new UnauthorizedError('Entre com uma conta fictícia do README.');
  const member=await db.prepare('SELECT m.* FROM app_sessions s JOIN members m ON m.id=s.member_id AND m.congregation_id=s.congregation_id WHERE s.token_hash=? AND s.expires_at>? AND m.active=1 AND m.congregation_id=?').bind(tokenHash(value),new Date().toISOString(),'cong-demo').first<Member>();
  if(!member)throw new UnauthorizedError('Sessão inválida ou expirada.');
  return user(member);
}
export async function createOwnLoginSession(db:D1Database,request:Request,identifier:string,password:string) {
  const account=await db.prepare('SELECT i.password_hash,m.* FROM invitations i JOIN members m ON m.id=i.member_id WHERE lower(i.email)=? AND i.congregation_id=? AND m.congregation_id=? AND m.active=1 AND i.status=?').bind(identifier.trim().toLowerCase(),'cong-demo','cong-demo','aceito').first<Member&{password_hash:string}>();
  // Executa scrypt também para usuários inexistentes, evitando um caminho rápido de enumeração.
  const dummy='00000000000000000000000000000000:'+ '0'.repeat(128);
  const valid=verify(password,account?.password_hash??dummy);
  if(!account||!valid)throw new UnauthorizedError('Login ou senha inválidos.');
  const value=randomBytes(32).toString('hex');const now=new Date().toISOString();
  await db.prepare('DELETE FROM app_sessions WHERE expires_at<=?').bind(now).run();
  await db.prepare('INSERT INTO app_sessions (id,congregation_id,member_id,token_hash,expires_at,created_at,last_seen_at) VALUES (?,?,?,?,?,?,?)').bind(randomBytes(16).toString('hex'),'cong-demo',account.id,tokenHash(value),new Date(Date.now()+28800000).toISOString(),now,now).run();
  return {user:user(account),cookie:cookie(value,28800)};
}
export async function clearOwnLoginSession(db:D1Database,request:Request) { const value=token(request);if(value)await db.prepare('DELETE FROM app_sessions WHERE token_hash=?').bind(tokenHash(value)).run();return cookie('',0); }
export async function renewAppSession(_db:D1Database,_request:Request) { return null as string|null; }

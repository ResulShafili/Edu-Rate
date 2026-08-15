import { createHash, randomBytes, randomUUID } from "node:crypto";
import { databasePool } from "./database.js";

export type AuthPurpose = "verify_email" | "reset_password" | "activate_account";
type MemorySession = { id:string; userId:string; hash:string; expiresAt:number; revokedAt?:number; userAgent:string; ipAddress:string; createdAt:string; lastSeenAt:string };
type MemoryAction = { userId:string; purpose:AuthPurpose; hash:string; expiresAt:number; used:boolean };
const memorySessions = new Map<string, MemorySession>();
const memoryActions = new Map<string, MemoryAction>();

const digest = (value:string) => createHash("sha256").update(value).digest("hex");
const opaqueToken = () => randomBytes(32).toString("base64url");

export async function createSession(userId:string, userAgent="", ipAddress="") {
  const token=opaqueToken(); const tokenHash=digest(token); const id=randomUUID();
  const expiresAt=new Date(Date.now()+30*24*60*60*1000);
  if(!databasePool){memorySessions.set(tokenHash,{id,userId,hash:tokenHash,expiresAt:expiresAt.getTime(),userAgent:userAgent.slice(0,300),ipAddress:ipAddress.slice(0,80),createdAt:new Date().toISOString(),lastSeenAt:new Date().toISOString()});return {id,token,expiresAt:expiresAt.toISOString()};}
  await databasePool.query("INSERT INTO auth_sessions(id,user_id,token_hash,user_agent,ip_address,expires_at) VALUES($1,$2,$3,$4,$5,$6)",[id,userId,tokenHash,userAgent.slice(0,300),ipAddress.slice(0,80),expiresAt]);
  return {id,token,expiresAt:expiresAt.toISOString()};
}

export async function registerSessionToken(userId:string,token:string,id:string,userAgent="",ipAddress=""){
  const tokenHash=digest(token);const expiresAt=new Date(Date.now()+30*24*60*60*1000);
  if(!databasePool){memorySessions.set(tokenHash,{id,userId,hash:tokenHash,expiresAt:expiresAt.getTime(),userAgent:userAgent.slice(0,300),ipAddress:ipAddress.slice(0,80),createdAt:new Date().toISOString(),lastSeenAt:new Date().toISOString()});return;}
  await databasePool.query("INSERT INTO auth_sessions(id,user_id,token_hash,user_agent,ip_address,expires_at) VALUES($1,$2,$3,$4,$5,$6)",[id,userId,tokenHash,userAgent.slice(0,300),ipAddress.slice(0,80),expiresAt]);
}

export async function resolveSession(token:string){
  const tokenHash=digest(token);
  if(!databasePool){const item=memorySessions.get(tokenHash);if(!item||item.revokedAt||item.expiresAt<=Date.now())return null;item.lastSeenAt=new Date().toISOString();return {id:item.id,userId:item.userId};}
  const result=await databasePool.query(`UPDATE auth_sessions SET last_seen_at=NOW() WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>NOW() RETURNING id,user_id`,[tokenHash]);
  return result.rows[0]?{id:String(result.rows[0].id),userId:String(result.rows[0].user_id)}:null;
}

export async function listSessions(userId:string,currentId?:string){
  if(!databasePool)return [...memorySessions.values()].filter((x)=>x.userId===userId&&!x.revokedAt&&x.expiresAt>Date.now()).map((x)=>({id:x.id,userAgent:x.userAgent,ipAddress:x.ipAddress,createdAt:x.createdAt,lastSeenAt:x.lastSeenAt,current:x.id===currentId}));
  const result=await databasePool.query("SELECT id,user_agent,ip_address,created_at,last_seen_at FROM auth_sessions WHERE user_id=$1 AND revoked_at IS NULL AND expires_at>NOW() ORDER BY last_seen_at DESC",[userId]);
  return result.rows.map((x)=>({id:String(x.id),userAgent:String(x.user_agent),ipAddress:String(x.ip_address),createdAt:new Date(x.created_at).toISOString(),lastSeenAt:new Date(x.last_seen_at).toISOString(),current:String(x.id)===currentId}));
}

export async function revokeSession(userId:string,id:string){if(!databasePool){const item=[...memorySessions.values()].find((x)=>x.userId===userId&&x.id===id);if(!item)return false;item.revokedAt=Date.now();return true;}const r=await databasePool.query("UPDATE auth_sessions SET revoked_at=NOW() WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL",[id,userId]);return Boolean(r.rowCount);}
export async function revokeAllSessions(userId:string,exceptId?:string){if(!databasePool){for(const item of memorySessions.values())if(item.userId===userId&&item.id!==exceptId)item.revokedAt=Date.now();return;}await databasePool.query("UPDATE auth_sessions SET revoked_at=NOW() WHERE user_id=$1 AND revoked_at IS NULL AND ($2::uuid IS NULL OR id<>$2)",[userId,exceptId??null]);}

export async function createActionToken(userId:string,purpose:AuthPurpose,ttlMs:number){const token=opaqueToken();const hash=digest(token);const expiresAt=new Date(Date.now()+ttlMs);if(!databasePool){memoryActions.set(hash,{userId,purpose,hash,expiresAt:expiresAt.getTime(),used:false});return token;}await databasePool.query("UPDATE auth_action_tokens SET used_at=NOW() WHERE user_id=$1 AND purpose=$2 AND used_at IS NULL",[userId,purpose]);await databasePool.query("INSERT INTO auth_action_tokens(id,user_id,purpose,token_hash,expires_at) VALUES($1,$2,$3,$4,$5)",[randomUUID(),userId,purpose,hash,expiresAt]);return token;}
export async function consumeActionToken(token:string,purpose:AuthPurpose){const hash=digest(token);if(!databasePool){const item=memoryActions.get(hash);if(!item||item.used||item.purpose!==purpose||item.expiresAt<=Date.now())return null;item.used=true;return item.userId;}const r=await databasePool.query("UPDATE auth_action_tokens SET used_at=NOW() WHERE token_hash=$1 AND purpose=$2 AND used_at IS NULL AND expires_at>NOW() RETURNING user_id",[hash,purpose]);return r.rows[0]?String(r.rows[0].user_id):null;}

export async function cleanupExpiredSecurityData(){
  if(!databasePool){
    for(const [hash,item] of memorySessions)if(item.expiresAt<Date.now()-7*24*60*60*1000)memorySessions.delete(hash);
    for(const [hash,item] of memoryActions)if(item.expiresAt<Date.now()-24*60*60*1000)memoryActions.delete(hash);
    return;
  }
  await databasePool.query("DELETE FROM auth_sessions WHERE expires_at < NOW() - INTERVAL '7 days' OR revoked_at < NOW() - INTERVAL '30 days'");
  await databasePool.query("DELETE FROM auth_action_tokens WHERE expires_at < NOW() - INTERVAL '1 day' OR used_at < NOW() - INTERVAL '7 days'");
  await databasePool.query("DELETE FROM content_reports WHERE status IN ('resolved','dismissed') AND updated_at < NOW() - INTERVAL '180 days'");
}

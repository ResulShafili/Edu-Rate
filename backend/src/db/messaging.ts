import { randomUUID } from "node:crypto";
import { ApiError } from "../lib/api-error.js";
import { databasePool } from "./database.js";

export type CommunityUser={id:string;name:string;role:string;faculty:string;program:string;city:string};
export type Connection={id:string;requesterId:string;recipientId:string;status:"pending"|"accepted"|"blocked";createdAt:string};
export type Conversation={id:string;peer:CommunityUser;lastMessage:string;updatedAt:string;unreadCount:number};
export type Message={id:string;conversationId:string;senderId:string;body:string;createdAt:string};

const connections=new Map<string,Connection>();
const conversations=new Map<string,{id:string;participants:[string,string];updatedAt:string}>();
const messages=new Map<string,Message[]>();
const now=()=>new Date().toISOString();
const iso=(value:unknown)=>new Date(String(value)).toISOString();

export async function listCommunityUsers(currentUserId:string):Promise<CommunityUser[]> {
  if(!databasePool) return [];
  const result=await databasePool.query(`SELECT id,name,role,faculty,program,city FROM users
    WHERE id<>$1 AND status='Aktiv' ORDER BY updated_at DESC LIMIT 100`,[currentUserId]);
  return result.rows.map((r)=>({id:String(r.id),name:String(r.name),role:String(r.role),faculty:String(r.faculty),program:String(r.program),city:String(r.city)}));
}

export async function listConnections(userId:string):Promise<Connection[]> {
  if(!databasePool) return [...connections.values()].filter((c)=>c.requesterId===userId||c.recipientId===userId);
  const result=await databasePool.query("SELECT * FROM connections WHERE requester_id=$1 OR recipient_id=$1 ORDER BY created_at DESC",[userId]);
  return result.rows.map((r)=>({id:String(r.id),requesterId:String(r.requester_id),recipientId:String(r.recipient_id),status:r.status,createdAt:iso(r.created_at)}));
}

export async function createConnection(requesterId:string,recipientId:string):Promise<Connection> {
  if(requesterId===recipientId) throw new ApiError(422,"SELF_CONNECTION","Öz hesabına əlaqə göndərmək olmaz.");
  if(!databasePool) { const existing=[...connections.values()].find((c)=>(c.requesterId===requesterId&&c.recipientId===recipientId)||(c.requesterId===recipientId&&c.recipientId===requesterId)); if(existing)return existing; const c={id:randomUUID(),requesterId,recipientId,status:"pending" as const,createdAt:now()}; connections.set(c.id,c); return c; }
  const target=await databasePool.query("SELECT 1 FROM users WHERE id=$1 AND status='Aktiv'",[recipientId]);
  if(!target.rowCount) throw new ApiError(404,"USER_NOT_FOUND","Aktiv istifadəçi tapılmadı.");
  const existing=await databasePool.query(`SELECT * FROM connections WHERE
    (requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1) LIMIT 1`,[requesterId,recipientId]);
  if(existing.rows[0]) return {id:String(existing.rows[0].id),requesterId:String(existing.rows[0].requester_id),recipientId:String(existing.rows[0].recipient_id),status:existing.rows[0].status,createdAt:iso(existing.rows[0].created_at)};
  const result=await databasePool.query("INSERT INTO connections(id,requester_id,recipient_id) VALUES($1,$2,$3) RETURNING *",[randomUUID(),requesterId,recipientId]);
  const r=result.rows[0]; return {id:String(r.id),requesterId:String(r.requester_id),recipientId:String(r.recipient_id),status:r.status,createdAt:iso(r.created_at)};
}

export async function acceptConnection(id:string,userId:string):Promise<Connection|null> {
  if(!databasePool) { const c=connections.get(id); if(!c||c.recipientId!==userId)return null; c.status="accepted"; return c; }
  const result=await databasePool.query("UPDATE connections SET status='accepted',updated_at=NOW() WHERE id=$1 AND recipient_id=$2 AND status='pending' RETURNING *",[id,userId]);
  const r=result.rows[0]; return r?{id:String(r.id),requesterId:String(r.requester_id),recipientId:String(r.recipient_id),status:r.status,createdAt:iso(r.created_at)}:null;
}

export async function deleteConnection(id:string,userId:string):Promise<boolean> {
  if(!databasePool){const c=connections.get(id);return Boolean(c&&(c.requesterId===userId||c.recipientId===userId)&&connections.delete(id));}
  const result=await databasePool.query("DELETE FROM connections WHERE id=$1 AND (requester_id=$2 OR recipient_id=$2)",[id,userId]); return Boolean(result.rowCount);
}

async function assertConnected(a:string,b:string) {
  if(!databasePool) { if(![...connections.values()].some((c)=>c.status==="accepted"&&((c.requesterId===a&&c.recipientId===b)||(c.requesterId===b&&c.recipientId===a)))) throw new ApiError(403,"CONNECTION_REQUIRED","Mesaj üçün əlaqə qəbul edilməlidir."); return; }
  const result=await databasePool.query(`SELECT 1 FROM connections WHERE status='accepted' AND
    ((requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1))`,[a,b]);
  if(!result.rowCount) throw new ApiError(403,"CONNECTION_REQUIRED","Mesaj üçün əlaqə qəbul edilməlidir.");
}

export async function createConversation(userId:string,peerId:string):Promise<{id:string}> {
  await assertConnected(userId,peerId);
  if(!databasePool){const found=[...conversations.values()].find((c)=>c.participants.includes(userId)&&c.participants.includes(peerId));if(found)return{id:found.id};const c={id:randomUUID(),participants:[userId,peerId] as [string,string],updatedAt:now()};conversations.set(c.id,c);return{id:c.id};}
  const found=await databasePool.query(`SELECT cp1.conversation_id FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id=cp2.conversation_id
    WHERE cp1.user_id=$1 AND cp2.user_id=$2 LIMIT 1`,[userId,peerId]);
  if(found.rows[0]) return {id:String(found.rows[0].conversation_id)};
  const client=await databasePool.connect(); try{await client.query("BEGIN");const candidate=randomUUID();const directKey=[userId,peerId].sort().join(":");const inserted=await client.query("INSERT INTO conversations(id,direct_key) VALUES($1,$2) ON CONFLICT (direct_key) DO UPDATE SET direct_key=EXCLUDED.direct_key RETURNING id",[candidate,directKey]);const id=String(inserted.rows[0].id);await client.query("INSERT INTO conversation_participants(conversation_id,user_id) VALUES($1,$2),($1,$3) ON CONFLICT DO NOTHING",[id,userId,peerId]);await client.query("COMMIT");return{id};}catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
}

export async function listConversations(userId:string):Promise<Conversation[]> {
  if(!databasePool)return [];
  const result=await databasePool.query(`SELECT c.id,c.updated_at,u.id peer_id,u.name,u.role,u.faculty,u.program,u.city,
    COALESCE((SELECT body FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC,id DESC LIMIT 1),'') last_message,
    (SELECT COUNT(*)::int FROM messages m WHERE m.conversation_id=c.id AND m.sender_id<>$1 AND m.created_at>COALESCE(me.last_read_at,'epoch')) unread_count
    FROM conversations c JOIN conversation_participants me ON me.conversation_id=c.id AND me.user_id=$1
    JOIN conversation_participants other ON other.conversation_id=c.id AND other.user_id<>$1 JOIN users u ON u.id=other.user_id
    ORDER BY c.updated_at DESC`,[userId]);
  return result.rows.map((r)=>({id:String(r.id),peer:{id:String(r.peer_id),name:String(r.name),role:String(r.role),faculty:String(r.faculty),program:String(r.program),city:String(r.city)},lastMessage:String(r.last_message),updatedAt:iso(r.updated_at),unreadCount:Number(r.unread_count)}));
}

async function assertParticipant(conversationId:string,userId:string){if(!databasePool){const c=conversations.get(conversationId);if(!c?.participants.includes(userId))throw new ApiError(403,"CONVERSATION_FORBIDDEN","Bu söhbətə giriş yoxdur.");return;}const result=await databasePool.query("SELECT 1 FROM conversation_participants WHERE conversation_id=$1 AND user_id=$2",[conversationId,userId]);if(!result.rowCount)throw new ApiError(403,"CONVERSATION_FORBIDDEN","Bu söhbətə giriş yoxdur.");}

export async function listMessages(conversationId:string,userId:string,before?:string,limit=40):Promise<Message[]> {await assertParticipant(conversationId,userId);if(!databasePool)return(messages.get(conversationId)??[]).slice(-limit);const values:unknown[]=[conversationId,limit];const cursor=before?"AND (created_at,id)<(SELECT created_at,id FROM messages WHERE id=$3)":"";if(before)values.push(before);const result=await databasePool.query(`SELECT * FROM messages WHERE conversation_id=$1 ${cursor} ORDER BY created_at DESC,id DESC LIMIT $2`,values);return result.rows.reverse().map((r)=>({id:String(r.id),conversationId:String(r.conversation_id),senderId:String(r.sender_id),body:String(r.body),createdAt:iso(r.created_at)}));}

export async function createMessage(conversationId:string,senderId:string,body:string):Promise<Message>{await assertParticipant(conversationId,senderId);const participants=await conversationParticipants(conversationId);const peerId=participants.find((id)=>id!==senderId);if(!peerId)throw new ApiError(409,"CONVERSATION_INVALID","Söhbətin qarşı tərəfi tapılmadı.");await assertConnected(senderId,peerId);const message={id:randomUUID(),conversationId,senderId,body:body.trim(),createdAt:now()};if(!databasePool){messages.set(conversationId,[...(messages.get(conversationId)??[]),message]);return message;}const result=await databasePool.query("INSERT INTO messages(id,conversation_id,sender_id,body) VALUES($1,$2,$3,$4) RETURNING *",[message.id,conversationId,senderId,message.body]);await databasePool.query("UPDATE conversations SET updated_at=NOW() WHERE id=$1",[conversationId]);const r=result.rows[0];return{id:String(r.id),conversationId:String(r.conversation_id),senderId:String(r.sender_id),body:String(r.body),createdAt:iso(r.created_at)};}

export async function markRead(conversationId:string,userId:string){await assertParticipant(conversationId,userId);if(databasePool)await databasePool.query("UPDATE conversation_participants SET last_read_at=NOW() WHERE conversation_id=$1 AND user_id=$2",[conversationId,userId]);}

export async function conversationParticipants(conversationId:string){if(!databasePool)return conversations.get(conversationId)?.participants??[];const r=await databasePool.query("SELECT user_id FROM conversation_participants WHERE conversation_id=$1",[conversationId]);return r.rows.map((x)=>String(x.user_id));}

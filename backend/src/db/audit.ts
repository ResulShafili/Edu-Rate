import { randomUUID } from "node:crypto";
import { databasePool } from "./database.js";

export async function writeAudit(actorId:string,action:string,entityType:string,entityId:string,metadata:Record<string,unknown>={}){
  if(!databasePool)return;
  await databasePool.query("INSERT INTO audit_log(id,actor_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5,$6::jsonb)",[randomUUID(),actorId,action,entityType,entityId,JSON.stringify(metadata)]);
}

export async function listAudit(limit=20){
  if(!databasePool)return [];
  const result=await databasePool.query("SELECT a.*,u.name actor_name FROM audit_log a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT $1",[limit]);
  return result.rows.map((row)=>({id:String(row.id),action:String(row.action),entityType:String(row.entity_type),entityId:String(row.entity_id),actor:String(row.actor_name??"Sistem"),metadata:row.metadata??{},occurredAt:new Date(row.created_at).toISOString()}));
}

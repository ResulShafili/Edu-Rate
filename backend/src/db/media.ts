import { randomUUID } from "node:crypto";
import { databasePool } from "./database.js";

export type MediaKind="avatar"|"club"|"announcement";
export type MediaAsset={id:string;kind:MediaKind;ownerId:string;publicId:string;secureUrl:string;format:string;bytes:number;width:number;height:number;createdBy:string;createdAt:string};
const memory=new Map<string,MediaAsset>();
const key=(kind:MediaKind,ownerId:string)=>`${kind}:${ownerId}`;

export async function getMedia(kind:MediaKind,ownerId:string):Promise<MediaAsset|null>{
  if(!databasePool)return memory.get(key(kind,ownerId))??null;
  const result=await databasePool.query("SELECT * FROM media_assets WHERE owner_type=$1 AND owner_id=$2 LIMIT 1",[kind,ownerId]);
  return result.rows[0]?map(result.rows[0]):null;
}

export async function saveMedia(input:Omit<MediaAsset,"id"|"createdAt">):Promise<{asset:MediaAsset;replacedPublicId:string|null}>{
  const previous=await getMedia(input.kind,input.ownerId);
  if(!databasePool){const asset={...input,id:randomUUID(),createdAt:new Date().toISOString()};memory.set(key(input.kind,input.ownerId),asset);return{asset,replacedPublicId:previous?.publicId??null};}
  const result=await databasePool.query(`INSERT INTO media_assets(id,owner_type,owner_id,public_id,secure_url,format,bytes,width,height,created_by)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT(owner_type,owner_id) DO UPDATE SET public_id=EXCLUDED.public_id,secure_url=EXCLUDED.secure_url,format=EXCLUDED.format,bytes=EXCLUDED.bytes,width=EXCLUDED.width,height=EXCLUDED.height,created_by=EXCLUDED.created_by,created_at=NOW()
    RETURNING *`,[randomUUID(),input.kind,input.ownerId,input.publicId,input.secureUrl,input.format,input.bytes,input.width,input.height,input.createdBy]);
  return{asset:map(result.rows[0]),replacedPublicId:previous?.publicId??null};
}

export async function removeMedia(kind:MediaKind,ownerId:string):Promise<MediaAsset|null>{
  const current=await getMedia(kind,ownerId);if(!current)return null;
  if(!databasePool){memory.delete(key(kind,ownerId));return current;}
  const result=await databasePool.query("DELETE FROM media_assets WHERE owner_type=$1 AND owner_id=$2 RETURNING *",[kind,ownerId]);
  return result.rows[0]?map(result.rows[0]):null;
}

function map(row:Record<string,unknown>):MediaAsset{return{id:String(row.id),kind:row.owner_type as MediaKind,ownerId:String(row.owner_id),publicId:String(row.public_id),secureUrl:String(row.secure_url),format:String(row.format),bytes:Number(row.bytes),width:Number(row.width),height:Number(row.height),createdBy:String(row.created_by),createdAt:new Date(String(row.created_at)).toISOString()};}

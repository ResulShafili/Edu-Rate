"use client";

import useSWR from "swr";
import type { MediaAsset } from "./media-upload";

async function loadCurrentAvatar():Promise<MediaAsset|null>{
  const response=await fetch("/api/media/avatar/me",{cache:"no-store"});
  const payload=await response.json() as {data?:MediaAsset|null};
  return response.ok?payload.data??null:null;
}

export function useCurrentAvatar(userId?:string){
  return useSWR(userId?`profile-avatar:${userId}`:null,loadCurrentAvatar,{revalidateOnFocus:false});
}

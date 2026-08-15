export type MediaKind="avatar"|"club"|"announcement";
export type MediaAsset={id:string;kind:MediaKind;ownerId:string;secureUrl:string;width:number;height:number;bytes:number};
const allowed=new Set(["image/jpeg","image/png","image/webp"]);

export async function uploadSecureImage(file:File,kind:MediaKind,ownerId?:string):Promise<MediaAsset>{
  const maxBytes=kind==="avatar"?2*1024*1024:5*1024*1024;
  if(!allowed.has(file.type))throw new Error("Yalnız JPG, PNG və WebP şəkilləri qəbul olunur.");
  if(file.size<=0||file.size>maxBytes)throw new Error(`Şəkil ${kind==="avatar"?"2":"5"} MB-dan böyük ola bilməz.`);
  const signed=await json<{cloudName:string;apiKey:string;uploadUrl:string;timestamp:number;publicId:string;signature:string;allowedFormats:string;transformation:string;uploadPreset:string}>("/api/media/sign",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({kind,ownerId})});
  const form=new FormData();form.set("file",file);form.set("api_key",signed.apiKey);form.set("timestamp",String(signed.timestamp));form.set("public_id",signed.publicId);form.set("signature",signed.signature);form.set("overwrite","false");form.set("allowed_formats",signed.allowedFormats);form.set("transformation",signed.transformation);form.set("upload_preset",signed.uploadPreset);
  const uploadedResponse=await fetch(signed.uploadUrl,{method:"POST",body:form,credentials:"omit"});
  const uploaded=await uploadedResponse.json() as {public_id?:string;version?:number;signature?:string;error?:{message?:string}};
  if(!uploadedResponse.ok||!uploaded.public_id||!uploaded.version||!uploaded.signature)throw new Error(uploaded.error?.message??"Şəkil yaddaşa göndərilmədi.");
  return json<MediaAsset>("/api/media/confirm",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({kind,ownerId,publicId:uploaded.public_id,version:uploaded.version,signature:uploaded.signature})});
}

async function json<T>(url:string,init?:RequestInit):Promise<T>{const response=await fetch(url,init);const payload=await response.json() as {data?:T;error?:{message?:string}};if(!response.ok||!payload.data)throw new Error(payload.error?.message??"Şəkil əməliyyatı tamamlanmadı.");return payload.data;}

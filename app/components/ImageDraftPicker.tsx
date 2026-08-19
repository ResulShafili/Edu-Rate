"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ImageDraftPickerProps={file:File|null;onChange:(file:File|null)=>void;label?:string;compact?:boolean;inputName?:string};

export function ImageDraftPicker({file,onChange,label="Şəkil",compact=false,inputName}:ImageDraftPickerProps){
  const inputRef=useRef<HTMLInputElement>(null);const previewRef=useRef("");const [preview,setPreview]=useState("");const [error,setError]=useState("");
  useEffect(()=>()=>{if(previewRef.current)URL.revokeObjectURL(previewRef.current);},[]);
  function choose(next?:File){setError("");if(!next)return;if(!["image/jpeg","image/png","image/webp"].includes(next.type)){setError("Yalnız JPG, PNG və WebP şəkilləri qəbul olunur.");if(inputRef.current)inputRef.current.value="";return;}if(next.size>5*1024*1024){setError("Şəkil 5 MB-dan böyük ola bilməz.");if(inputRef.current)inputRef.current.value="";return;}if(previewRef.current)URL.revokeObjectURL(previewRef.current);previewRef.current=URL.createObjectURL(next);setPreview(previewRef.current);onChange(next);}
  function remove(){if(previewRef.current)URL.revokeObjectURL(previewRef.current);previewRef.current="";setPreview("");onChange(null);setError("");if(inputRef.current)inputRef.current.value="";}
  return <div className={`image-draft-picker${compact?" is-compact":""}`}><span className="image-draft-label">{label}</span>{file&&preview?<span className="image-draft-preview" style={{backgroundImage:`linear-gradient(135deg,rgba(8,37,31,.06),rgba(8,37,31,.35)),url("${preview}")`}} aria-label="Seçilmiş şəkil önizləməsi"/>:null}<div className="image-draft-actions"><label><ImagePlus size={16}/>{file?"Şəkli dəyiş":"Şəkil seç"}<input ref={inputRef} name={inputName} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event)=>choose(event.target.files?.[0])}/></label>{file?<button type="button" onClick={remove}><Trash2 size={15}/>Şəkli sil</button>:null}</div><small>JPG, PNG və ya WebP · maksimum 5 MB</small>{error?<p role="alert">{error}</p>:null}</div>;
}

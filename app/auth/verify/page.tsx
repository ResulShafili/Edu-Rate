"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
export default function VerifyEmailPage(){const token=useSearchParams().get("token");const [message,setMessage]=useState(token?"E-poçt ünvanın təsdiqlənir…":"Təsdiq keçidi yoxdur.");useEffect(()=>{if(!token)return;void fetch("/api/auth/actions/verify-email/confirm",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token})}).then(async(r)=>{const p=await r.json() as {error?:{message?:string}};if(!r.ok)throw new Error(p.error?.message);setMessage("E-poçt ünvanın təsdiqləndi. İndi daxil ola bilərsən.");}).catch(e=>setMessage(e instanceof Error&&e.message?e.message:"Təsdiq tamamlanmadı."));},[token]);return <main id="main-content" className="route-page legal-page"><article><h1>E-poçt təsdiqi</h1><p role="status">{message}</p><p><Link href="/auth">Daxil ol</Link></p></article></main>}

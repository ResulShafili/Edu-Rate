import { env } from "../config/env.js";

export async function sendAccountEmail(input:{to:string;subject:string;html:string}){
  if(!env.RESEND_API_KEY){
    if(env.NODE_ENV==="production")throw new EmailDeliveryError("E-poçt xidməti aktiv deyil. Render-də RESEND_API_KEY əlavə edilməlidir.");
    console.info(`[email disabled] ${input.subject} -> ${input.to}`);
    return;
  }
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:env.EMAIL_FROM,to:[input.to],subject:input.subject,html:input.html}),signal:AbortSignal.timeout(10_000)});
  if(!response.ok){const detail=await response.text().catch(()=>"");console.error("Resend delivery failed",response.status,detail.slice(0,500));throw new EmailDeliveryError(response.status===403?"Göndərən domen Resend-də təsdiqlənməyib. EMAIL_FROM ünvanını yoxlayın.":"E-poçt xidməti məktubu qəbul etmədi. Bir qədər sonra yenidən yoxlayın.");}
}

export class EmailDeliveryError extends Error{}

export function accountActionUrl(path:string,token:string){const url=new URL(path,env.PUBLIC_APP_URL);url.searchParams.set("token",token);return url.toString();}

import { env } from "../config/env.js";

export async function sendAccountEmail(input:{to:string;subject:string;html:string}){
  if(!env.RESEND_API_KEY){
    if(env.NODE_ENV==="production")throw new Error("RESEND_API_KEY konfiqurasiya edilməyib.");
    console.info(`[email disabled] ${input.subject} -> ${input.to}`);
    return;
  }
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:env.EMAIL_FROM,to:[input.to],subject:input.subject,html:input.html}),signal:AbortSignal.timeout(10_000)});
  if(!response.ok)throw new Error(`E-poçt göndərilmədi (${response.status}).`);
}

export function accountActionUrl(path:string,token:string){const url=new URL(path,env.PUBLIC_APP_URL);url.searchParams.set("token",token);return url.toString();}

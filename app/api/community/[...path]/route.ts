import { ApiHttpError, apiError, apiNoContent, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic="force-dynamic";
type Context={params:Promise<{path:string[]}>};

async function handle(request:Request,context:Context){
  try{
    if(request.method!=="GET")assertTrustedMutation(request);
    const token=readRemoteCredentialToken(request);if(!token)throw new ApiHttpError(401,"UNAUTHENTICATED","İcma funksiyaları üçün hesaba daxil ol.");
    const {path}=await context.params;const method=request.method as "GET"|"POST"|"PATCH"|"DELETE";
    const body=(method==="POST"||method==="PATCH")&&request.body?await readJsonBody<unknown>(request):undefined;
    const query=new URL(request.url).searchParams.toString();
    const data=await requestRemoteApi<unknown>(`/api/community/${path.map(encodeURIComponent).join("/")}${query?`?${query}`:""}`,{method,body,token});
    return data===undefined?apiNoContent():apiSuccess(data,method==="POST"?201:200);
  }catch(error){return apiError(error);}
}
export const GET=handle;export const POST=handle;export const PATCH=handle;export const DELETE=handle;

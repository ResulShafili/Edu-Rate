import { ApiHttpError,apiError,apiSuccess,readJsonBody } from "../../../../../lib/api/http";
import { assertTrustedMutation } from "../../../../../lib/api/security";
import { readRemoteCredentialToken,requestRemoteApi } from "../../../../../lib/auth/remote-credential";
type Context={params:Promise<{id:string;action:string}>};
async function mutate(request:Request,context:Context){try{assertTrustedMutation(request);const token=readRemoteCredentialToken(request);if(!token)throw new ApiHttpError(401,"UNAUTHENTICATED","Reaksiya üçün daxil ol.");const {id,action}=await context.params;if(action!=="view"&&action!=="reaction")throw new ApiHttpError(404,"NOT_FOUND","Sorğu tapılmadı.");const method=action==="view"?"POST":"PATCH";const body=method==="PATCH"?await readJsonBody<unknown>(request):undefined;return apiSuccess(await requestRemoteApi(`/api/network/announcements/${encodeURIComponent(id)}/${action}`,{method,body,token}));}catch(error){return apiError(error)}}
export const POST=mutate;export const PATCH=mutate;

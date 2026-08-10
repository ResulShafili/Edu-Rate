import { ApiHttpError,apiError,apiSuccess } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import { readRemoteCredentialToken,requestRemoteApi } from "../../../lib/auth/remote-credential";

export async function POST(request:Request){try{assertTrustedMutation(request);const token=readRemoteCredentialToken(request);if(!token)throw new ApiHttpError(401,"UNAUTHENTICATED","Canlı söhbət üçün daxil ol.");const data=await requestRemoteApi<{ticket:string;expiresIn:number}>("/api/realtime/ticket",{method:"POST",token});const configured=process.env.EDURATE_API_BASE_URL?.trim()||"https://edurate-api.onrender.com";return apiSuccess({...data,socketUrl:new URL(configured).origin},201);}catch(error){return apiError(error);}}

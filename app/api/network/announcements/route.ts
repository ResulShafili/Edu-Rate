import { ApiHttpError,apiError,apiSuccess,readJsonBody } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import { readRemoteCredentialToken,requestRemoteApi } from "../../../lib/auth/remote-credential";

export async function POST(request:Request){try{assertTrustedMutation(request);const token=readRemoteCredentialToken(request);if(!token)throw new ApiHttpError(401,"UNAUTHENTICATED","Elan göndərmək üçün daxil ol.");const body=await readJsonBody<unknown>(request);return apiSuccess(await requestRemoteApi("/api/network/announcements",{method:"POST",body,token}),202);}catch(error){return apiError(error)}}

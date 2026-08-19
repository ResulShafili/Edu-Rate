import { ApiHttpError,apiError,apiSuccess,readJsonBody } from "../../lib/api/http";
import { assertTrustedMutation } from "../../lib/api/security";
import { readRemoteCredentialToken,requestRemoteApi } from "../../lib/auth/remote-credential";

export async function POST(request:Request){try{assertTrustedMutation(request);const token=readRemoteCredentialToken(request);if(!token)throw new ApiHttpError(401,"UNAUTHENTICATED","Tədbir yaratmaq üçün daxil ol.");const body=await readJsonBody<unknown>(request);return apiSuccess(await requestRemoteApi("/api/events",{method:"POST",body,token}),201);}catch(error){return apiError(error)}}

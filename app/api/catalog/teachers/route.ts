import { apiError,apiSuccess } from "../../../lib/api/http";
import { requestRemoteApi } from "../../../lib/auth/remote-credential";
export const dynamic="force-dynamic";
export async function GET(){try{return apiSuccess(await requestRemoteApi<unknown[]>("/api/teachers"));}catch(error){return apiError(error);}}

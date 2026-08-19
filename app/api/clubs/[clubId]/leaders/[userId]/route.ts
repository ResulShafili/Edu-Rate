import { ApiHttpError, apiError, apiSuccess } from "../../../../../lib/api/http";
import { assertTrustedMutation } from "../../../../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../../../lib/auth/remote-credential";

type Context={params:Promise<{clubId:string;userId:string}>};
async function mutate(request:Request,context:Context,method:"PATCH"|"DELETE"){
  try{assertTrustedMutation(request);const token=readRemoteCredentialToken(request);if(!token)throw new ApiHttpError(401,"UNAUTHENTICATED","Liderləri idarə etmək üçün daxil ol.");
    const {clubId,userId}=await context.params;return apiSuccess(await requestRemoteApi(`/api/clubs/${encodeURIComponent(clubId)}/leaders/${encodeURIComponent(userId)}`,{method,token}));
  }catch(error){return apiError(error);}
}
export async function PATCH(request:Request,context:Context){return mutate(request,context,"PATCH");}
export async function DELETE(request:Request,context:Context){return mutate(request,context,"DELETE");}

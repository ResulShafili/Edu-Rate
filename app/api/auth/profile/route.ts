import type { ProfileUpdateInput } from "../../../data/user";
import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import {
  mapRemoteUserToProfile,
  readRemoteCredentialToken,
  requestRemoteApi,
  type RemoteApiUser,
} from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) {
      throw new ApiHttpError(401, "UNAUTHENTICATED", "Profil məlumatlarını yeniləmək üçün daxil ol.");
    }

    const input = await readJsonBody<ProfileUpdateInput>(request);
    const result = await requestRemoteApi<{ user: RemoteApiUser }>("/api/auth/profile", {
      method: "PATCH",
      token,
      body: input,
    });
    return apiSuccess({ user: mapRemoteUserToProfile(result.user) });
  } catch (error) {
    return apiError(error);
  }
}

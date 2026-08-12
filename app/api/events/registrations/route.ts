import { ApiHttpError, apiError, apiSuccess } from "../../../lib/api/http";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

type RegisteredEvent = {
  id: string;
  availableSpots: number;
};

export async function GET(request: Request) {
  try {
    const token = readRemoteCredentialToken(request);
    if (!token) {
      throw new ApiHttpError(401, "UNAUTHENTICATED", "Tədbir qeydiyyatlarını görmək üçün hesaba daxil ol.");
    }

    const registrations = await requestRemoteApi<RegisteredEvent[]>("/api/events/registrations/me", { token });
    return apiSuccess(registrations);
  } catch (error) {
    return apiError(error);
  }
}

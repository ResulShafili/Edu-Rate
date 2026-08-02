import { ApiHttpError } from "./http";
import { isTrustedMutationRequest } from "../security/request-origin";

export function assertTrustedMutation(request: Request) {
  if (!isTrustedMutationRequest(request, [
    process.env.EDURATE_APP_ORIGIN ?? "",
    process.env.NEXT_PUBLIC_SITE_URL ?? "",
  ])) {
    throw new ApiHttpError(403, "CSRF_REJECTED", "Sorğunun mənbəyi təsdiqlənmədi.");
  }
}

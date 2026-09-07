import { apiError, apiNoContent } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import {
  getRemoteCredentialCookieOptions,
  remoteCredentialCookie,
  readRemoteCredentialToken,
  requestRemoteApi,
} from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

/**
 * Hesabın tamamilə silinməsi (GDPR "unudulma hüququ").
 *
 * Şifrə təsdiqi backend tərəfdə yoxlanılır; burada yalnız sorğunu ötürürük və
 * uğurlu silinmədən sonra giriş çərəzini təmizləyirik ki, brauzerdə etibarsız
 * sessiya qalmasın.
 */
export async function DELETE(request: Request) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    const body = (await request.json().catch(() => ({}))) as { password?: string };

    await requestRemoteApi<void>("/api/auth/account", {
      method: "DELETE",
      token,
      body: { password: body.password ?? "" },
    });

    const response = apiNoContent();
    response.cookies.set(remoteCredentialCookie.name, "", {
      ...getRemoteCredentialCookieOptions(request),
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}

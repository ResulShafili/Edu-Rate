"use client";

import { useEffect, useState } from "react";
import { parseAdminSessionPayload } from "../lib/auth/admin-session";
import {
  AdminAccessState,
  type AdminAccessDeniedState,
} from "./AdminAccessState";
import { AdminDashboard } from "./AdminDashboard";
import { AdminSkeleton } from "./AdminSkeleton";

type AdminClientAccessGateProps = {
  sessionUrl: string;
};

type ClientAccessState =
  | { status: "checking" }
  | { status: "granted"; principal: { displayName: string; email: string } }
  | AdminAccessDeniedState;

const SESSION_CHECK_TIMEOUT_MS = 7_000;

export function AdminClientAccessGate({
  sessionUrl,
}: AdminClientAccessGateProps) {
  const [access, setAccess] = useState<ClientAccessState>({
    status: "checking",
  });

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const timeout = window.setTimeout(
      () => controller.abort(),
      SESSION_CHECK_TIMEOUT_MS,
    );

    async function checkSession() {
      try {
        const response = await fetch(sessionUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
          cache: "no-store",
          redirect: "error",
          signal: controller.signal,
        });

        if (disposed) return;
        if (response.status === 401) {
          setAccess({ status: "signed-out", signInHref: "/auth" });
          return;
        }
        if (response.status === 403) {
          setAccess({ status: "forbidden" });
          return;
        }
        if (!response.ok) {
          setAccess({ status: "unavailable" });
          return;
        }

        const result = parseAdminSessionPayload(await response.json());
        if (disposed) return;

        if (result.status === "granted") {
          setAccess(result);
        } else {
          setAccess({
            status: result.status === "forbidden" ? "forbidden" : "unavailable",
          });
        }
      } catch {
        if (!disposed) setAccess({ status: "unavailable" });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void checkSession();

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [sessionUrl]);

  if (access.status === "checking") {
    return (
      <div className="admin-client-access-gate is-checking">
        <AdminSkeleton scope="gate" />
      </div>
    );
  }

  if (access.status === "granted") {
    return (
      <div className="admin-client-access-gate is-granted">
        <AdminDashboard administrator={access.principal} demoMode={false} />
      </div>
    );
  }

  return (
    <div className={`admin-client-access-gate is-${access.status}`}>
      <AdminAccessState access={access} />
    </div>
  );
}

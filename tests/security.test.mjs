import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canEditUserRole,
  getAdminCapabilities,
  isAssignableUserRole,
} from "../app/lib/auth/admin-role.ts";
import { buildContentSecurityPolicy } from "../app/lib/security/content-security-policy.ts";
import { isTrustedMutationRequest } from "../app/lib/security/request-origin.ts";

describe("frontend security boundaries", () => {
  it("same-origin mutation sorğusunu qəbul edir", () => {
    const request = new Request("https://edu-rate-nu.vercel.app/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://edu-rate-nu.vercel.app",
        "sec-fetch-site": "same-origin",
      },
    });
    assert.equal(isTrustedMutationRequest(request), true);
  });

  it("cross-site mutation sorğusunu CSRF kimi rədd edir", () => {
    const request = new Request("https://edu-rate-nu.vercel.app/api/auth/login", {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        "sec-fetch-site": "cross-site",
      },
    });
    assert.equal(isTrustedMutationRequest(request), false);
  });

  it("production CSP yalnız nonce ilə script icrasına icazə verir", () => {
    const policy = buildContentSecurityPolicy("test-nonce", false);
    assert.match(policy, /script-src 'self' 'nonce-test-nonce' 'strict-dynamic'/);
    assert.doesNotMatch(policy, /script-src[^;]*'unsafe-inline'/);
    assert.doesNotMatch(policy, /script-src[^;]*'unsafe-eval'/);
    assert.match(policy, /frame-ancestors 'none'/);
    assert.match(policy, /object-src 'none'/);
  });

  it("admin köməkçisinin istifadəçi səlahiyyətlərini aşağı rollarla məhdudlaşdırır", () => {
    const capabilities = getAdminCapabilities("assistant_admin");
    assert.equal(capabilities.canAccessPanel, true);
    assert.equal(capabilities.canManageContent, true);
    assert.equal(capabilities.canManageUsers, true);
    assert.equal(capabilities.canCreateUsers, false);
    assert.equal(capabilities.canEditPrivilegedUsers, false);
    assert.equal(capabilities.canDeleteUsers, false);
    assert.equal(capabilities.canAssignElevatedRoles, false);
    assert.equal(canEditUserRole("assistant_admin", "student"), true);
    assert.equal(canEditUserRole("assistant_admin", "mentor"), true);
    assert.equal(canEditUserRole("assistant_admin", "teacher"), true);
    assert.equal(canEditUserRole("assistant_admin", "assistant_admin"), false);
    assert.equal(canEditUserRole("assistant_admin", "admin"), false);
    assert.equal(isAssignableUserRole("admin"), false);
  });
});

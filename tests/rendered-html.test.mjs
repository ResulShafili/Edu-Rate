import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete EduRate experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>EduRate/i);
  assert.match(html, /Come for the/);
  assert.match(html, /Find your next/);
  assert.match(html, /Meet the people/);
  assert.match(html, /peer directory/i);
  assert.match(html, /Open conversation with/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("keeps Phase 2 modular and production-branded", async () => {
  const [page, layout, experience, connections, directory, chat, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/EventExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ConnectionsExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PeerDirectory.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ChatDock.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<EventExperience\s*\/>/);
  assert.match(layout, /EduRate/);
  assert.match(experience, /<ConnectionsExperience\s*\/>/);
  assert.match(connections, /<PeerDirectory/);
  assert.match(connections, /<ChatDock/);
  assert.match(directory, /aria-busy/);
  assert.match(directory, /peer-card-/);
  assert.match(chat, /role="log"/);
  assert.match(chat, /TypingIndicator/);
  assert.match(chat, /aria-controls="chat-settings-panel"/);
  assert.match(packageJson, /"name": "edurate"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
});

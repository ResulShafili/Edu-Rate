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
  assert.match(html, /Find a mentor/);
  assert.match(html, /Amina Rahman/);
  assert.match(html, /Submit a ticket/);
  assert.match(html, /How are mentor matches chosen\?/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("keeps every phase modular, accessible, and production-branded", async () => {
  const [
    page,
    layout,
    experience,
    connections,
    directory,
    chat,
    guidance,
    mentorship,
    support,
    packageJson,
  ] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/EventExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ConnectionsExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PeerDirectory.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ChatDock.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/GuidanceExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MentorshipDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SupportCenter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<EventExperience\s*\/>/);
  assert.match(layout, /EduRate/);
  assert.match(experience, /<ConnectionsExperience\s*\/>/);
  assert.match(experience, /<GuidanceExperience\s*\/>/);
  assert.match(connections, /<PeerDirectory/);
  assert.match(connections, /<ChatDock/);
  assert.match(guidance, /<MentorshipDashboard\s*\/>/);
  assert.match(guidance, /<SupportCenter\s*\/>/);
  assert.match(directory, /aria-busy/);
  assert.match(directory, /peer-card-/);
  assert.match(chat, /role="log"/);
  assert.match(chat, /TypingIndicator/);
  assert.match(chat, /aria-controls="chat-settings-panel"/);
  assert.match(mentorship, /aria-expanded=\{expanded\}/);
  assert.match(mentorship, /aria-controls=\{detailsId\}/);
  assert.match(mentorship, /aria-live="polite"/);
  assert.match(mentorship, /Request mentorship/);
  assert.match(support, /<h3>/);
  assert.match(support, /aria-expanded=\{open\}/);
  assert.match(support, /aria-controls=\{answerId\}/);
  assert.match(support, /role="region"/);
  assert.match(support, /role="progressbar"/);
  assert.match(support, /<label htmlFor="ticket-name">Your name<\/label>/);
  assert.match(support, /<label htmlFor="ticket-email">Email address<\/label>/);
  assert.match(support, /<label htmlFor="ticket-topic">What can we help with\?<\/label>/);
  assert.match(support, /<label htmlFor="ticket-message">Tell us what happened<\/label>/);
  assert.match(packageJson, /"name": "edurate"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og-phase3.png", import.meta.url));
});

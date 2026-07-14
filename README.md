# EduRate

EduRate is a premium community platform for curated learning experiences,
peer discovery, thoughtful one-to-one conversation, and guided growth.

## Product surface

- Animated editorial landing experience
- Filterable events calendar with 3D cards and detail drawer
- Responsive peer directory with organic skeleton loading
- Connect and message interactions for every peer
- Floating chat with animated messages, typing presence, smooth scrolling,
  compact mode, notification preferences, and conversation controls
- Expandable mentor profiles with expertise, availability, and animated
  mentorship-request feedback
- Accessible FAQ accordions and a support-ticket form with floating labels,
  validation, animated completion progress, and a polished success state
- Keyboard, touch, reduced-motion, and mobile support

## Technology

- React 19 and Next.js-compatible vinext runtime
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide icons
- Cloudflare-compatible ESM output for Sites hosting

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run build
npm test
```

## Architecture

The site keeps event discovery, community connections, mentorship, and support
modular. Phase 2 is composed through `ConnectionsExperience`, with separate
peer-directory and chat-dock components plus typed domain data. Phase 3 is
composed through `GuidanceExperience`, which owns focused mentorship and support
surfaces without coupling them to the landing-page shell.

Chat, mentorship requests, and support-ticket submission are currently
frontend interaction boundaries by design. Their states demonstrate the full
user experience, but they are not durable backend workflows yet. Each component
is ready to connect to authenticated persistence, realtime transport, and
support or mentorship APIs when those services are introduced.

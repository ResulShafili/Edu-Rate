# EduRate

EduRate is a premium community platform for curated learning experiences,
peer discovery, and thoughtful one-to-one conversation.

## Product surface

- Animated editorial landing experience
- Filterable events calendar with 3D cards and detail drawer
- Responsive peer directory with organic skeleton loading
- Connect and message interactions for every peer
- Floating chat with animated messages, typing presence, smooth scrolling,
  compact mode, notification preferences, and conversation controls
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

The site keeps event discovery and community connections modular. Phase 2 is
composed through `ConnectionsExperience`, with separate peer-directory and
chat-dock components plus typed domain data. The current conversation demo is
client-side by design; the component boundary is ready for a realtime transport
and authenticated persistence when that backend phase is introduced.

export type PeerStatus = "online" | "away" | "offline";

export type Peer = {
  id: string;
  name: string;
  initials: string;
  role: string;
  focus: string;
  bio: string;
  city: string;
  status: PeerStatus;
  accent: string;
  glow: string;
  mutuals: number;
  tags: string[];
  openingMessage: string;
  reply: string;
};

export const peers: Peer[] = [
  {
    id: "amara-osei",
    name: "Amara Osei",
    initials: "AO",
    role: "Systems researcher",
    focus: "Human-centred AI",
    bio: "Exploring how intelligent tools can expand, rather than replace, human judgment.",
    city: "Berlin",
    status: "online",
    accent: "#b9a7ff",
    glow: "rgba(185, 167, 255, 0.34)",
    mutuals: 14,
    tags: ["AI ethics", "Research"],
    openingMessage: "I saved you a seat for Human / Machine. Are you still thinking of joining?",
    reply: "Perfect — I’ll share my notes beforehand. It’ll be lovely to continue the conversation there.",
  },
  {
    id: "mina-park",
    name: "Mina Park",
    initials: "MP",
    role: "Independent designer",
    focus: "Material futures",
    bio: "Making experimental materials feel useful, warm, and part of everyday life.",
    city: "Copenhagen",
    status: "online",
    accent: "#c8ff4d",
    glow: "rgba(200, 255, 77, 0.3)",
    mutuals: 9,
    tags: ["Design", "Materials"],
    openingMessage: "Your question after the Future Forms session stayed with me. Want to compare notes?",
    reply: "I’d love that. I’m collecting a few references now — I’ll send the most useful ones over.",
  },
  {
    id: "kaito-mori",
    name: "Kaito Mori",
    initials: "KM",
    role: "Creative technologist",
    focus: "Spatial computing",
    bio: "Building playful interfaces that make digital spaces feel more physical and social.",
    city: "Tokyo",
    status: "away",
    accent: "#77b8ff",
    glow: "rgba(119, 184, 255, 0.32)",
    mutuals: 21,
    tags: ["Creative code", "XR"],
    openingMessage: "I just tried the prototype we talked about — the spatial audio changed everything.",
    reply: "Yes, exactly. Let me package the demo so you can explore it properly this week.",
  },
  {
    id: "nia-laurent",
    name: "Nia Laurent",
    initials: "NL",
    role: "Wellbeing strategist",
    focus: "Sustainable ambition",
    bio: "Helping creative teams build cultures where great work and healthy lives can coexist.",
    city: "Paris",
    status: "online",
    accent: "#7de5d1",
    glow: "rgba(125, 229, 209, 0.3)",
    mutuals: 7,
    tags: ["Wellbeing", "Culture"],
    openingMessage: "The reflection exercise from Soft Reset is ready. Shall I send you a copy?",
    reply: "Sending it now. Take your time with it — there’s no perfect way to answer any of the prompts.",
  },
  {
    id: "leon-vale",
    name: "León Vale",
    initials: "LV",
    role: "Sound artist",
    focus: "Immersive performance",
    bio: "Composing responsive environments where an audience becomes part of the instrument.",
    city: "Lisbon",
    status: "offline",
    accent: "#ff9e7a",
    glow: "rgba(255, 158, 122, 0.3)",
    mutuals: 18,
    tags: ["Sound", "Installation"],
    openingMessage: "I’m shaping the final room for Afterlight and remembered your idea about silence.",
    reply: "That’s the one. A little absence makes the next sound feel enormous — thank you for seeing it.",
  },
  {
    id: "iris-bell",
    name: "Iris Bell",
    initials: "IB",
    role: "Product philosopher",
    focus: "Technology & society",
    bio: "Asking better questions about what we build, why we build it, and who gets to decide.",
    city: "London",
    status: "online",
    accent: "#f7d56f",
    glow: "rgba(247, 213, 111, 0.3)",
    mutuals: 11,
    tags: ["Futures", "Writing"],
    openingMessage: "I’m hosting a tiny reading circle next Thursday. Your perspective would add a lot.",
    reply: "Wonderful. I’ll send the short reading list — it’s intentionally light, with plenty of room to talk.",
  },
  {
    id: "maya-chen",
    name: "Maya Chen",
    initials: "MC",
    role: "Generative artist",
    focus: "Living systems",
    bio: "Creating evolving visual worlds from code, weather data, and small acts of participation.",
    city: "Amsterdam",
    status: "away",
    accent: "#f09cff",
    glow: "rgba(240, 156, 255, 0.3)",
    mutuals: 16,
    tags: ["Generative art", "Code"],
    openingMessage: "The shared canvas is open again. I left a new system in there for you to break.",
    reply: "That’s exactly the kind of chaos it needs. I can’t wait to see what you find in it.",
  },
  {
    id: "ren-ito",
    name: "Ren Ito",
    initials: "RI",
    role: "Industrial designer",
    focus: "Everyday rituals",
    bio: "Designing quiet objects that reward attention and become better through repeated use.",
    city: "Kyoto",
    status: "online",
    accent: "#a7d88b",
    glow: "rgba(167, 216, 139, 0.3)",
    mutuals: 6,
    tags: ["Objects", "Craft"],
    openingMessage: "I found the small workshop we discussed. They still make every piece by hand.",
    reply: "I thought you’d appreciate them. I’ll introduce you — they’re wonderfully generous with their process.",
  },
];

export type EventCategory = "Design" | "Technology" | "Culture" | "Wellness";

export type Event = {
  id: string;
  category: EventCategory;
  date: string;
  month: string;
  time: string;
  title: string;
  location: string;
  city: string;
  description: string;
  longDescription: string;
  accent: string;
  glow: string;
  speakers: string[];
  capacity: string;
};

export const categories = [
  "All",
  "Design",
  "Technology",
  "Culture",
  "Wellness",
] as const;

export type EventFilter = (typeof categories)[number];

export const events: Event[] = [
  {
    id: "future-forms",
    category: "Design",
    date: "18",
    month: "SEP",
    time: "18:30",
    title: "Future Forms",
    location: "Aperture Hall",
    city: "Copenhagen",
    description: "An evening exploring the shapes, systems, and stories defining tomorrow.",
    longDescription:
      "A tactile gathering for the design-curious. Step inside a living exhibition of material experiments, spatial interfaces, and conversations with the people creating a more thoughtful tomorrow.",
    accent: "#c8ff4d",
    glow: "rgba(200, 255, 77, 0.28)",
    speakers: ["Mina Park", "Noah El-Amin", "Eva Krüger"],
    capacity: "180 guests",
  },
  {
    id: "human-machine",
    category: "Technology",
    date: "22",
    month: "SEP",
    time: "19:00",
    title: "Human / Machine",
    location: "The Foundry",
    city: "Berlin",
    description: "A candid salon on intelligence, imagination, and what stays beautifully human.",
    longDescription:
      "Beyond the hype cycle, this intimate salon asks better questions about our relationship with intelligent tools. Expect practical provocations, sharp debate, and a room full of generous minds.",
    accent: "#b9a7ff",
    glow: "rgba(185, 167, 255, 0.3)",
    speakers: ["Iris Bell", "Kaito Mori", "Amara Osei"],
    capacity: "120 guests",
  },
  {
    id: "afterlight",
    category: "Culture",
    date: "28",
    month: "SEP",
    time: "21:00",
    title: "Afterlight",
    location: "Museo Cielo",
    city: "Lisbon",
    description: "An immersive night of sound, projection, movement, and collective wonder.",
    longDescription:
      "When the museum closes, Afterlight begins. Wander through responsive installations, live performances, and shifting fields of sound created by artists from five continents.",
    accent: "#ff9e7a",
    glow: "rgba(255, 158, 122, 0.3)",
    speakers: ["Sora Studio", "León Vale", "Aïcha Rae"],
    capacity: "350 guests",
  },
  {
    id: "soft-reset",
    category: "Wellness",
    date: "04",
    month: "OCT",
    time: "09:30",
    title: "Soft Reset",
    location: "Casa Flora",
    city: "Mallorca",
    description: "A slow morning designed to restore attention, energy, and a sense of possibility.",
    longDescription:
      "A half-day retreat for busy minds. Guided movement, breathwork, nourishing food, and deliberate quiet come together in a sunlit sanctuary overlooking the Mediterranean.",
    accent: "#7de5d1",
    glow: "rgba(125, 229, 209, 0.28)",
    speakers: ["Nia Laurent", "Mar Soler", "Studio Still"],
    capacity: "48 guests",
  },
  {
    id: "strange-loops",
    category: "Technology",
    date: "11",
    month: "OCT",
    time: "17:45",
    title: "Strange Loops",
    location: "Signal House",
    city: "London",
    description: "Live experiments at the edge of code, music, and emergent creative systems.",
    longDescription:
      "Part concert, part lab, Strange Loops brings creative technologists on stage to build, break, and remix new systems in real time—with the audience shaping the result.",
    accent: "#77b8ff",
    glow: "rgba(119, 184, 255, 0.3)",
    speakers: ["Ordinal", "Maya Chen", "Tomas Grey"],
    capacity: "220 guests",
  },
  {
    id: "new-rituals",
    category: "Design",
    date: "16",
    month: "OCT",
    time: "18:00",
    title: "New Rituals",
    location: "Atelier 04",
    city: "Paris",
    description: "Designers reimagine the everyday objects and gestures that make a life.",
    longDescription:
      "A warm, object-led exhibition about the quiet choreography of daily life. Meet the designers giving familiar rituals new meaning through craft, technology, and care.",
    accent: "#f7d56f",
    glow: "rgba(247, 213, 111, 0.28)",
    speakers: ["Oona Wells", "Bureau Matin", "Ren Ito"],
    capacity: "95 guests",
  },
];

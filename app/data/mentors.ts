export type Mentor = {
  id: string;
  name: string;
  initials: string;
  role: string;
  focus: string;
  bio: string;
  location: string;
  timezone: string;
  experience: string;
  responseTime: string;
  availability: string[];
  expertise: string[];
  outcome: string;
  accent: string;
  glow: string;
};

export const mentors: Mentor[] = [
  {
    id: "amina-rahman",
    name: "Amina Rahman",
    initials: "AR",
    role: "Product strategy mentor",
    focus: "From research to a clear product story",
    bio: "Amina helps early-stage teams turn generous research into focused products people can understand, trust, and use.",
    location: "Berlin, Germany",
    timezone: "UTC+2",
    experience: "12 years in product",
    responseTime: "Usually replies within 4 hours",
    availability: ["Tue · 17:00–19:00", "Thu · 16:00–18:00"],
    expertise: ["Product strategy", "User research", "Narrative", "Roadmapping"],
    outcome: "“Amina helped me turn a scattered thesis into a product direction I could finally explain with confidence.”",
    accent: "#c8ff4d",
    glow: "rgba(200, 255, 77, 0.28)",
  },
  {
    id: "mateo-silva",
    name: "Mateo Silva",
    initials: "MS",
    role: "Creative technology mentor",
    focus: "Ideas that move from screen to space",
    bio: "Mateo brings a calm, experimental approach to prototypes that blend code, sound, interaction, and the physical world.",
    location: "Lisbon, Portugal",
    timezone: "UTC+1",
    experience: "10 years building experiences",
    responseTime: "Usually replies within a day",
    availability: ["Wed · 18:00–20:00", "Sat · 10:00–12:00"],
    expertise: ["Creative coding", "Spatial interfaces", "Prototyping", "Interaction design"],
    outcome: "“One thoughtful session with Mateo unlocked the interaction our prototype had been missing for weeks.”",
    accent: "#ff9e7a",
    glow: "rgba(255, 158, 122, 0.28)",
  },
  {
    id: "priya-nair",
    name: "Dr. Priya Nair",
    initials: "PN",
    role: "Responsible AI mentor",
    focus: "Rigorous research with human consequences",
    bio: "Priya supports researchers and builders who want to make intelligent systems more legible, equitable, and useful in the real world.",
    location: "London, United Kingdom",
    timezone: "UTC+1",
    experience: "14 years in AI research",
    responseTime: "Usually replies within 8 hours",
    availability: ["Mon · 17:30–19:30", "Fri · 15:00–17:00"],
    expertise: ["Responsible AI", "Research design", "Model evaluation", "Ethics"],
    outcome: "“Priya challenged my assumptions without dimming the idea—and helped me design a study I was proud to defend.”",
    accent: "#b9a7ff",
    glow: "rgba(185, 167, 255, 0.3)",
  },
  {
    id: "kwame-mensah",
    name: "Kwame Mensah",
    initials: "KM",
    role: "Systems design mentor",
    focus: "Making complexity feel navigable",
    bio: "Kwame helps social-impact teams see the relationships beneath a problem and find the smallest intervention that can create momentum.",
    location: "Accra, Ghana",
    timezone: "UTC",
    experience: "11 years in systems practice",
    responseTime: "Usually replies within 6 hours",
    availability: ["Tue · 14:00–16:00", "Fri · 13:00–15:00"],
    expertise: ["Systems mapping", "Facilitation", "Social innovation", "Service ecosystems"],
    outcome: "“Kwame gave our team a shared language for the problem—and a practical first move we could make the next morning.”",
    accent: "#7de5d1",
    glow: "rgba(125, 229, 209, 0.28)",
  },
  {
    id: "yuki-tanaka",
    name: "Yuki Tanaka",
    initials: "YT",
    role: "Service design mentor",
    focus: "Quietly exceptional end-to-end journeys",
    bio: "Yuki guides designers through the invisible details that make services feel coherent, considerate, and genuinely easy to return to.",
    location: "Tokyo, Japan",
    timezone: "UTC+9",
    experience: "13 years in service design",
    responseTime: "Usually replies within 12 hours",
    availability: ["Wed · 19:00–21:00", "Sun · 09:00–11:00"],
    expertise: ["Service design", "Journey mapping", "Design critique", "Experience strategy"],
    outcome: "“Yuki noticed the three small moments everyone else overlooked; fixing them changed the entire experience.”",
    accent: "#77b8ff",
    glow: "rgba(119, 184, 255, 0.3)",
  },
  {
    id: "sofia-marin",
    name: "Sofía Marín",
    initials: "SM",
    role: "Creative career mentor",
    focus: "A career that still feels like your own",
    bio: "Sofía helps independent creatives articulate their value, choose opportunities with intention, and build sustainable rhythms around ambitious work.",
    location: "Buenos Aires, Argentina",
    timezone: "UTC−3",
    experience: "9 years coaching creatives",
    responseTime: "Usually replies within a day",
    availability: ["Thu · 18:00–20:00", "Sat · 11:00–13:00"],
    expertise: ["Career clarity", "Portfolio stories", "Creative business", "Sustainable practice"],
    outcome: "“Sofía helped me stop presenting a list of projects and start telling the story of the practitioner I’m becoming.”",
    accent: "#f7d56f",
    glow: "rgba(247, 213, 111, 0.28)",
  },
];

export type SupportFaq = {
  id: string;
  question: string;
  answer: string;
};

export const supportFaqs: SupportFaq[] = [
  {
    id: "mentor-match",
    question: "How are mentor matches chosen?",
    answer:
      "We look at your goals, working style, timezone, and the kind of perspective you want to add. Every request is reviewed by a community host before an introduction is made.",
  },
  {
    id: "response-time",
    question: "When should I expect a reply?",
    answer:
      "Most community questions receive a personal response within one working day. Mentorship requests usually take two to three days so we can make a considered introduction.",
  },
  {
    id: "change-booking",
    question: "Can I change an event booking?",
    answer:
      "Yes. Send us the event name and the email used for your reservation. We can transfer your place or release it back to the community up to 24 hours before the event.",
  },
  {
    id: "safe-space",
    question: "How does EduRate keep the community safe?",
    answer:
      "Every member agrees to our community principles. Reports are reviewed by a real person, conversations stay private, and you can pause or end any connection without explanation.",
  },
];

export const ticketTopics = [
  "Mentorship",
  "Events & bookings",
  "Community & chat",
  "Account support",
  "Something else",
] as const;


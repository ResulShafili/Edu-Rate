export type SupportFaq = {
  id: string;
  question: string;
  answer: string;
};

export const supportFaqs: SupportFaq[] = [
  {
    id: "mentor-match",
    question: "Mentor uyğunluğu necə müəyyən edilir?",
    answer:
      "Məqsədlərini, iş üslubunu, saat qurşağını və qazanmaq istədiyin baxış bucağını nəzərə alırıq. Tanışlıqdan əvvəl hər müraciəti icma nümayəndəsi nəzərdən keçirir.",
  },
  {
    id: "response-time",
    question: "Nə vaxt cavab gözləməliyəm?",
    answer:
      "İcma ilə bağlı sualların əksəriyyətinə bir iş günü ərzində şəxsən cavab veririk. Düşünülmüş bir tanışlıq qurmaq üçün mentorluq müraciətlərini adətən iki-üç gün ərzində cavablandırırıq.",
  },
  {
    id: "change-booking",
    question: "Tədbir qeydiyyatımı dəyişə bilərəm?",
    answer:
      "Bəli. Tədbirin adını və qeydiyyat zamanı istifadə etdiyin e-poçt ünvanını bizə göndər. Tədbirə 24 saat qalana qədər yerini başqasına keçirə və ya yenidən icma üçün aça bilərik.",
  },
  {
    id: "safe-space",
    question: "EduRate icmada təhlükəsizliyi necə qoruyur?",
    answer:
      "Hər üzv icma prinsiplərimizə əməl etməyi qəbul edir. Şikayətləri real insan nəzərdən keçirir, söhbətlər məxfi qalır və istənilən əlaqəni səbəb bildirmədən dayandıra və ya bitirə bilərsən.",
  },
];

export const ticketTopics = [
  "Mentorluq",
  "Tədbirlər və qeydiyyat",
  "İcma və söhbət",
  "Hesab dəstəyi",
  "Digər məsələ",
] as const;

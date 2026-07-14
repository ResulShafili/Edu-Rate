export const REVIEW_MAX_LENGTH = 1_200;

export type ReviewModerationCode =
  | "empty"
  | "too-long"
  | "profanity"
  | "direct-insult"
  | "url"
  | "spam"
  | "excessive-repetition";

export type ReviewModerationIssue = {
  code: ReviewModerationCode;
  reason: string;
  suggestion: string;
};

export type ReviewModerationResult = {
  accepted: boolean;
  normalizedText: string;
  issues: ReviewModerationIssue[];
  reason: string | null;
  suggestion: string | null;
};

const issueCopy: Record<ReviewModerationCode, Omit<ReviewModerationIssue, "code">> = {
  empty: {
    reason: "Rəy mətni boşdur.",
    suggestion: "Dərsdə müşahidə etdiyin bir məqamı qısa və konkret şəkildə paylaş.",
  },
  "too-long": {
    reason: `Rəy ${REVIEW_MAX_LENGTH} simvoldan uzun ola bilməz.`,
    suggestion: "Əsas müşahidəni və faydalı olacaq bir təklifi saxlayaraq mətni qısalt.",
  },
  profanity: {
    reason: "Rəydə nalayiq ifadə aşkarlandı.",
    suggestion:
      "Hissini təhqirsiz ifadə et: “Bu dərs təcrübəsi gözləntimi qarşılamadı, çünki...”",
  },
  "direct-insult": {
    reason: "Rəydə şəxsə yönəlmiş təhqir aşkarlandı.",
    suggestion:
      "Müəllimin şəxsiyyətini deyil, müşahidə etdiyin davranışı yaz: “İzah mənim üçün sürətli idi; daha çox nümunə faydalı olardı.”",
  },
  url: {
    reason: "Rəylərdə keçid və ya e-poçt ünvanı paylaşmaq olmaz.",
    suggestion: "Keçidi sil və yalnız dərs təcrübənlə bağlı fikrini saxla.",
  },
  spam: {
    reason: "Mətn reklam və ya əlaqə məlumatı xarakterli görünür.",
    suggestion: "Əlaqə məlumatını və tanıtım mətnini sil, yalnız müəllimlə bağlı təcrübəni paylaş.",
  },
  "excessive-repetition": {
    reason: "Rəydə eyni söz, işarə və ya ifadə həddindən artıq təkrarlanır.",
    suggestion: "Təkrarları sil və fikrini bir-iki aydın cümlə ilə ifadə et.",
  },
};

const characterFold: Record<string, string> = {
  ə: "e",
  ı: "i",
  ş: "s",
  ç: "c",
  ö: "o",
  ü: "u",
  ğ: "g",
};

const leetFold: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

const profanityRules = [
  /^sik(?:tir|dir|im|er|eyim|irem)?(?:sen|siniz)?$/,
  /^qehbe(?:sen|dir|lik)?$/,
  /^orospu(?:sun|dur|luk)?$/,
  /^peyser(?:sen|dir)?$/,
  /^gijdillaq(?:san|siniz|dir)?$/,
  /^gotveren(?:sen|siniz|dir)?$/,
  /^pic(?:sen|siniz|dir)$/,
  /^fuck(?:ing|ed|er|off)?$/,
  /^shit(?:ty)?$/,
  /^asshole(?:s)?$/,
  /^bitch(?:es|y)?$/,
  /^bastard(?:s)?$/,
] as const;

// “Piç” diakritikasını saxlayaraq yoxlanılır; “pic” (şəkil qısaltması) bloklanmır.
const diacriticProfanityPattern =
  /(?:^|[^\p{L}])p(?:i|1)ç(?:sən|siniz|dir)?(?:$|[^\p{L}])/iu;

const directInsultRules = [
  /^axmaq(?:san|siniz|dir|di)?$/,
  /^sefeh(?:sen|siniz|dir)?$/,
  /^gic(?:sen|siniz|dir)?$/,
  /^beyinsiz(?:sen|siniz|dir)?$/,
  /^idiot(?:san|siniz|dur|s)?$/,
  /^moron(?:san|sun|siniz|s)?$/,
  /^stupid(?:sen|siniz)?$/,
  /^dumb(?:san|sun)?$/,
  /^aptal(?:sin|siniz|dir)?$/,
  /^salak(?:sin|siniz|tir)?$/,
  /^gerizekali(?:sin|siniz|dir)?$/,
] as const;

const directInsultPhrases = [
  /\bsen malsin\b/,
  /\bsiz malsiniz\b/,
  /\bhec ne bilmirsen\b/,
  /\bhec ne bilmirsiniz\b/,
] as const;

const urlPattern =
  /(?:https?:\/\/|www\.|\b[a-z\d](?:[a-z\d-]*[a-z\d])?\.(?:az|com|net|org|io|me|co|ru|tr)\b)/iu;
const emailPattern = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/u;
const phonePattern = /(?:\+?\d[\s().-]*){9,}/u;
const socialPattern = /\b(?:whatsapp|telegram|instagram|tiktok)\b/iu;
const handlePattern = /(?:^|\s)@[a-z\d_]{3,}\b/iu;
const promotionalTokens = new Set([
  "reklam",
  "kampaniya",
  "endirim",
  "promo",
  "pulsuz",
  "qazan",
  "klik",
  "click",
  "subscribe",
  "follow",
]);

function makeIssue(code: ReviewModerationCode): ReviewModerationIssue {
  return { code, ...issueCopy[code] };
}

function foldToken(token: string) {
  const foldedCharacters = token.replace(/[əışçöüğ]/gu, (character) => characterFold[character]);
  const containsLetter = /\p{L}/u.test(foldedCharacters);

  return (containsLetter
    ? foldedCharacters.replace(/[013457@$]/gu, (character) => leetFold[character])
    : foldedCharacters
  )
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[’'`]/gu, "");
}

/**
 * Mətni müqayisə üçün eyni formaya salır. Nəticə istifadəçiyə göstərilmək üçün deyil;
 * yalnız böyük/kiçik hərf, Azərbaycan–Türk diakritikası və sadə leet yazılışlarını
 * etibarlı şəkildə müqayisə etmək üçündür.
 */
export function normalizeReviewText(input: string) {
  const lowered = input.normalize("NFKC").toLocaleLowerCase("az");
  const parts = lowered.match(/[\p{L}\p{N}@$’'`]+/gu) ?? [];
  return parts.map(foldToken).filter(Boolean).join(" ").replace(/\s+/gu, " ").trim();
}

function getModerationTokens(normalizedText: string) {
  const tokens = normalizedText.split(" ").filter(Boolean);
  const compacted: string[] = [];

  for (let start = 0; start < tokens.length; start += 1) {
    if (tokens[start].length !== 1) continue;

    let joined = "";
    for (let cursor = start; cursor < tokens.length && cursor < start + 10; cursor += 1) {
      if (tokens[cursor].length !== 1) break;
      joined += tokens[cursor];
      if (joined.length >= 3) compacted.push(joined);
    }
  }

  return { tokens, moderationTokens: [...tokens, ...compacted] };
}

function matchesAnyToken(tokens: string[], rules: readonly RegExp[]) {
  return tokens.some((token) => rules.some((rule) => rule.test(token)));
}

function hasRepeatedPhrase(tokens: string[]) {
  for (let size = 2; size <= 4; size += 1) {
    for (let start = 0; start + size * 3 <= tokens.length; start += 1) {
      const phrase = tokens.slice(start, start + size).join(" ");
      const second = tokens.slice(start + size, start + size * 2).join(" ");
      const third = tokens.slice(start + size * 2, start + size * 3).join(" ");
      if (phrase === second && phrase === third) return true;
    }
  }

  return false;
}

function hasExcessiveRepetition(rawText: string, normalizedText: string, tokens: string[]) {
  if (/([!?.,])\1{5,}/u.test(rawText)) return true;
  if (/([a-z])\1{5,}/u.test(normalizedText)) return true;

  let consecutiveCount = 1;
  for (let index = 1; index < tokens.length; index += 1) {
    consecutiveCount = tokens[index] === tokens[index - 1] ? consecutiveCount + 1 : 1;
    if (consecutiveCount >= 4) return true;
  }

  if (hasRepeatedPhrase(tokens)) return true;

  if (tokens.length >= 10) {
    const uniqueRatio = new Set(tokens).size / tokens.length;
    if (uniqueRatio <= 0.2) return true;
  }

  return false;
}

function looksLikeSpam(rawText: string, tokens: string[]) {
  if (phonePattern.test(rawText)) return true;
  if (handlePattern.test(rawText) && socialPattern.test(rawText)) return true;

  const mentionOrTagCount = rawText.match(/(?:^|\s)[@#][\p{L}\p{N}_]{2,}/gu)?.length ?? 0;
  if (mentionOrTagCount >= 4) return true;

  const promotionCount = tokens.reduce(
    (count, token) => count + (promotionalTokens.has(token) ? 1 : 0),
    0,
  );
  return promotionCount >= 3;
}

export function moderateReview(input: string): ReviewModerationResult {
  const trimmedText = input.trim();
  const normalizedText = normalizeReviewText(trimmedText);
  const { tokens, moderationTokens } = getModerationTokens(normalizedText);
  const issues: ReviewModerationIssue[] = [];

  if (!trimmedText) issues.push(makeIssue("empty"));
  if (trimmedText.length > REVIEW_MAX_LENGTH) issues.push(makeIssue("too-long"));
  if (urlPattern.test(trimmedText) || emailPattern.test(trimmedText)) issues.push(makeIssue("url"));

  if (
    matchesAnyToken(moderationTokens, profanityRules) ||
    diacriticProfanityPattern.test(trimmedText)
  ) {
    issues.push(makeIssue("profanity"));
  }

  const containsDirectInsult =
    matchesAnyToken(moderationTokens, directInsultRules) ||
    directInsultPhrases.some((phrase) => phrase.test(normalizedText));
  if (containsDirectInsult) issues.push(makeIssue("direct-insult"));

  if (hasExcessiveRepetition(trimmedText, normalizedText, tokens)) {
    issues.push(makeIssue("excessive-repetition"));
  }

  if (looksLikeSpam(trimmedText, tokens)) issues.push(makeIssue("spam"));

  return {
    accepted: issues.length === 0,
    normalizedText,
    issues,
    reason: issues[0]?.reason ?? null,
    suggestion: issues[0]?.suggestion ?? null,
  };
}

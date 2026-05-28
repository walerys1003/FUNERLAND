/**
 * Polish-language content moderation heuristics.
 * Designed for funeral marketplace context (zero-tolerance for spam/profanity in reviews).
 *
 * Returns a flag set with confidence scores 0..1 — caller decides action threshold.
 *
 * NOTE: These are deterministic, dependency-free heuristics. A real production
 * setup should additionally run OpenAI Moderation API or PerspectiveAPI as a second pass.
 */

export type FlagReason = 'profanity' | 'spam' | 'pii' | 'all-caps' | 'off-topic' | 'link-spam' | 'gibberish';

export type ModerationFlag = {
  reason: FlagReason;
  score: number; // 0..1 — higher = more confident
  matchedTerms?: string[];
  excerpt?: string;
};

export type ModerationResult = {
  /** Recommended decision based on max score */
  decision: 'approve' | 'review' | 'reject';
  /** Highest score across all flags */
  topScore: number;
  flags: ModerationFlag[];
};

// ---------- Polish profanity (mild list — caller can extend) ----------
// We use stems + small diacritic-aware regex matchers.
// Source: well-known PL slur stems (kept short here to avoid offensive content in source).
const PROFANITY_STEMS = [
  'kurw', 'kurew', 'pierdol', 'pierdal', 'jeb',  'chuj', 'chuju', 'cipa', 'cipy',
  'pizda', 'pizd', 'spierda', 'wypierda', 'zajeb', 'zajeb', 'huj', 'huja',
  'debil', 'idiot', 'kretyn', 'matkojeb', 'skurwy', 'skurwi', 'chujow', 'pojeb',
  'oszust', 'zlodzie', 'złodzie',
];

// Common spam terms (gambling / pharma / generic).
const SPAM_TERMS = [
  'kasyno', 'casino', 'viagra', 'cialis', 'cbd', 'bitcoin', 'crypto',
  'kredyt chwilówk', 'pożyczk online', 'odzyskaj swoje pieniądze',
  'inwestuj teraz', 'gwarantowany zysk', 'darmowe ', 'wygraj iphone',
];

// Off-topic for funeral context (red flags in a "zakład pogrzebowy" review).
const OFF_TOPIC_TERMS = [
  'restauracja', 'restauracj', 'pizza', 'kebab', 'fryzjer', 'samochód',
  'samochod', 'mecz', 'kasyno', 'hotel',
];

// PII patterns (we don't want users posting other people's phone/email/PESEL/NIP/REGON)
const PESEL_RE = /\b\d{11}\b/;
const PHONE_RE = /\b(?:\+?48[\s-]?)?(?:\d[\s-]?){9,11}\d\b/;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const URL_RE = /\bhttps?:\/\/\S+/gi;
// NIP — 10 digits (possibly separated by dashes/spaces), with checksum check
const NIP_RE = /\b\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b/;
// REGON — 9 or 14 digits
const REGON_RE = /\b\d{9}(?:\d{5})?\b/;
// IBAN PL — PL + 26 digits (often space-separated)
const IBAN_PL_RE = /\b(?:PL)?[\s-]?\d{2}(?:[\s-]?\d{4}){6}\b/i;
// Polish ID card number: 3 letters + 6 digits (CAN/series-number)
const ID_CARD_RE = /\b[A-Z]{3}\s?\d{6}\b/;

/** Validate NIP checksum (proper Polish tax ID). */
function isValidNIP(s: string): boolean {
  const digits = s.replace(/\D/g, '');
  if (digits.length !== 10) return false;
  const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * w[i];
  return sum % 11 === parseInt(digits[9], 10);
}

/** Validate PESEL checksum. */
function isValidPESEL(s: string): boolean {
  if (s.length !== 11 || !/^\d{11}$/.test(s)) return false;
  const w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(s[i], 10) * w[i];
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(s[10], 10);
}

/** Leetspeak / obfuscation cleaner: k*u*r*w*a → kurwa, k.u.r.w.a → kurwa */
function unleet(text: string): string {
  return text
    .replace(/[*@!.+\-_]/g, '') // drop common separators
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b');
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s.,!?@+:/-]/g, ' ');
}

/** Compute character/word repetition score (0..1). High = obvious spam pattern. */
function repetitionScore(text: string, words: string[]): number {
  let score = 0;

  // 1) Consecutive repeated chars (aaaaaa, !!!!!!!)
  const charRepeats = text.match(/(.)\1{4,}/g) || [];
  if (charRepeats.length > 0) score = Math.max(score, 0.5 + 0.1 * charRepeats.length);

  // 2) Same word repeated ≥ 4 times in a row
  let runLen = 1;
  let maxRun = 1;
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1]) {
      runLen++;
      if (runLen > maxRun) maxRun = runLen;
    } else {
      runLen = 1;
    }
  }
  if (maxRun >= 4) score = Math.max(score, 0.6 + 0.05 * (maxRun - 4));

  // 3) Top-3 word frequency dominance
  if (words.length >= 12) {
    const counts = new Map<string, number>();
    for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
    const top3 = Array.from(counts.values())
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((a, b) => a + b, 0);
    if (top3 / words.length > 0.6) score = Math.max(score, 0.65);
  }

  return Math.min(1, score);
}

/** Main entry — analyze a review or any user-generated text. */
export function moderateText(text: string): ModerationResult {
  const flags: ModerationFlag[] = [];
  const original = (text || '').trim();
  if (!original) {
    return { decision: 'approve', topScore: 0, flags: [] };
  }
  const norm = normalize(original);
  const words = norm.split(/\s+/).filter(Boolean);
  // Leet-cleaned variant catches obfuscated profanity: "k*u*r*w*a", "ku.rwa", "ku1wa"
  const leetClean = normalize(unleet(original));

  // -- 1) Profanity (matches both normalized AND leet-cleaned variants) --
  const profMatches: string[] = [];
  for (const stem of PROFANITY_STEMS) {
    if (norm.includes(stem) || leetClean.includes(stem)) profMatches.push(stem);
  }
  if (profMatches.length > 0) {
    const score = Math.min(1, 0.6 + 0.1 * profMatches.length);
    flags.push({
      reason: 'profanity',
      score,
      matchedTerms: profMatches,
      excerpt: original.slice(0, 120),
    });
  }

  // -- 2) Spam terms --
  const spamMatches = SPAM_TERMS.filter((s) => norm.includes(s));
  if (spamMatches.length > 0) {
    flags.push({
      reason: 'spam',
      score: Math.min(1, 0.5 + 0.15 * spamMatches.length),
      matchedTerms: spamMatches,
    });
  }

  // -- 3) PII (PESEL/NIP/REGON/IBAN/ID/phone/email) — only confirmed valid PII raises score --
  const piiMatches: string[] = [];
  const peselM = original.match(PESEL_RE);
  if (peselM && isValidPESEL(peselM[0])) piiMatches.push('pesel');
  const nipM = original.match(NIP_RE);
  if (nipM && isValidNIP(nipM[0])) piiMatches.push('nip');
  if (REGON_RE.test(original) && !peselM && !nipM) piiMatches.push('regon');
  if (IBAN_PL_RE.test(original)) piiMatches.push('iban');
  if (ID_CARD_RE.test(original)) piiMatches.push('id-card');
  if (PHONE_RE.test(original) && !peselM) piiMatches.push('phone');
  if (EMAIL_RE.test(original)) piiMatches.push('email');
  if (piiMatches.length > 0) {
    // PESEL/NIP/IBAN/ID are hard PII → almost always reject
    const hardPii = ['pesel', 'nip', 'iban', 'id-card'].some((k) => piiMatches.includes(k));
    flags.push({
      reason: 'pii',
      score: hardPii ? 1.0 : 0.7,
      matchedTerms: piiMatches,
    });
  }

  // -- 4) Link spam (multiple URLs) --
  const urls = original.match(URL_RE) || [];
  if (urls.length >= 1) {
    const score = urls.length >= 2 ? 0.9 : 0.5;
    flags.push({
      reason: 'link-spam',
      score,
      matchedTerms: urls.slice(0, 3),
    });
  }

  // -- 5) All caps shouting --
  if (original.length >= 30) {
    const letters = original.replace(/[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, '');
    if (letters.length >= 20) {
      const upper = (letters.match(/[A-ZĄĆĘŁŃÓŚŹŻ]/g) || []).length;
      const ratio = upper / letters.length;
      if (ratio > 0.75) {
        flags.push({ reason: 'all-caps', score: 0.4 });
      }
    }
  }

  // -- 6) Off-topic --
  const otMatches = OFF_TOPIC_TERMS.filter((t) => norm.includes(t));
  if (otMatches.length >= 2) {
    flags.push({
      reason: 'off-topic',
      score: 0.45,
      matchedTerms: otMatches,
    });
  }

  // -- 7) Gibberish + repetition (combined entropy & repeated-pattern detection) --
  if (words.length >= 3) {
    const uniqRatio = new Set(words).size / words.length;
    if (uniqRatio < 0.3 && words.length >= 10) {
      flags.push({ reason: 'gibberish', score: 0.6 });
    }
  }
  const repScore = repetitionScore(original, words);
  if (repScore >= 0.5) {
    flags.push({
      reason: 'gibberish',
      score: repScore,
      excerpt: original.slice(0, 60),
    });
  }

  // -- Decision --
  const topScore = flags.reduce((m, f) => Math.max(m, f.score), 0);
  let decision: ModerationResult['decision'] = 'approve';
  if (topScore >= 0.85) decision = 'reject';
  else if (topScore >= 0.5) decision = 'review';

  return { decision, topScore, flags };
}

/** Friendly Polish label for a reason. */
export function reasonLabel(reason: FlagReason): string {
  switch (reason) {
    case 'profanity':
      return 'Wulgaryzmy';
    case 'spam':
      return 'Spam';
    case 'pii':
      return 'Dane osobowe';
    case 'all-caps':
      return 'Krzyczenie (caps)';
    case 'off-topic':
      return 'Off-topic';
    case 'link-spam':
      return 'Linki / spam';
    case 'gibberish':
      return 'Bełkot / repetycja';
    default:
      return reason;
  }
}

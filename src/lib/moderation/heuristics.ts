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

// PII patterns (we don't want users posting other people's phone/email/PESEL)
const PESEL_RE = /\b\d{11}\b/;
const PHONE_RE = /\b(?:\+?48[\s-]?)?(?:\d[\s-]?){9,11}\d\b/;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const URL_RE = /\bhttps?:\/\/\S+/gi;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s.,!?@+:/-]/g, ' ');
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

  // -- 1) Profanity --
  const profMatches: string[] = [];
  for (const stem of PROFANITY_STEMS) {
    if (norm.includes(stem)) profMatches.push(stem);
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

  // -- 3) PII --
  const piiMatches: string[] = [];
  if (PESEL_RE.test(original)) piiMatches.push('pesel');
  if (PHONE_RE.test(original)) piiMatches.push('phone');
  if (EMAIL_RE.test(original)) piiMatches.push('email');
  if (piiMatches.length > 0) {
    flags.push({
      reason: 'pii',
      score: piiMatches.includes('pesel') ? 1.0 : 0.7,
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

  // -- 7) Gibberish (very low word entropy or super-short) --
  if (words.length >= 3) {
    const uniqRatio = new Set(words).size / words.length;
    if (uniqRatio < 0.3 && words.length >= 10) {
      flags.push({ reason: 'gibberish', score: 0.6 });
    }
  }
  // Repeated character spam: "aaaaaaaaaa" or "!!!!!!!!!!"
  if (/(.)\1{6,}/.test(original)) {
    flags.push({ reason: 'gibberish', score: 0.7 });
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

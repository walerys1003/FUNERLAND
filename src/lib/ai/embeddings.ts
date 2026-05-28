/**
 * Embeddings utilities — OpenAI text-embedding-3-small (1536-dim).
 * Has a deterministic mock fallback (hashed tokens) for builds without OPENAI_API_KEY.
 *
 * In production this should write/read from Postgres (pgvector) via:
 *   create extension vector;
 *   create table embeddings (id text primary key, kind text, ref_id text, vec vector(1536));
 *   create index on embeddings using ivfflat (vec vector_cosine_ops);
 */

const MODEL = 'text-embedding-3-small';
const DIM = 1536;
const MOCK_DIM = 128; // tiny dim for in-memory mock

export type EmbeddingVector = number[];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic mock embedding — token-bag projected to MOCK_DIM dims. */
export function mockEmbed(text: string): EmbeddingVector {
  const vec = new Array(MOCK_DIM).fill(0);
  const tokens = text.toLowerCase().match(/[\p{L}\d]+/gu) || [];
  for (const tok of tokens) {
    const h = hashStr(tok);
    vec[h % MOCK_DIM] += 1;
    vec[(h >> 8) % MOCK_DIM] += 0.5;
  }
  // L2-normalize
  const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
  return vec.map((x) => x / norm);
}

export async function embed(text: string): Promise<{ vector: EmbeddingVector; dim: number; mock: boolean }> {
  if (!process.env.OPENAI_API_KEY) {
    return { vector: mockEmbed(text), dim: MOCK_DIM, mock: true };
  }
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, input: text.slice(0, 8000) }),
    });
    if (!res.ok) {
      return { vector: mockEmbed(text), dim: MOCK_DIM, mock: true };
    }
    const data = await res.json();
    const vec: number[] = data.data?.[0]?.embedding || [];
    if (!vec.length) return { vector: mockEmbed(text), dim: MOCK_DIM, mock: true };
    return { vector: vec, dim: DIM, mock: false };
  } catch {
    return { vector: mockEmbed(text), dim: MOCK_DIM, mock: true };
  }
}

export function cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/* ---------------- In-memory index (mock pgvector) ---------------- */

type IndexEntry = {
  id: string;
  kind: 'company' | 'article' | 'faq';
  refId: string;
  text: string;
  vec: EmbeddingVector;
  meta?: Record<string, any>;
};

class EmbeddingIndex {
  entries: IndexEntry[] = [];
  built = false;
  async build(items: Omit<IndexEntry, 'vec'>[]) {
    this.entries = [];
    for (const it of items) {
      const e = await embed(it.text);
      this.entries.push({ ...it, vec: e.vector });
    }
    this.built = true;
  }
  async search(query: string, opts: { kind?: IndexEntry['kind']; topK?: number } = {}) {
    const e = await embed(query);
    const candidates = this.entries.filter((x) => !opts.kind || x.kind === opts.kind);
    return candidates
      .map((x) => ({ ...x, score: cosineSimilarity(e.vector, x.vec) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, opts.topK || 5);
  }
}

const g = globalThis as any;
export const embeddingIndex: EmbeddingIndex = g.__pp_embed__ || (g.__pp_embed__ = new EmbeddingIndex());

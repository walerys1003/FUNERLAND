/**
 * Lightweight in-memory store used while Supabase is being wired in.
 * Keeps data alive across requests within a single Node process.
 *
 * For production: replace each `store.*` namespace with a Supabase
 * query in src/lib/supabase/server.ts.
 */

type Booking = {
  number: string;
  category: string;
  companySlug?: string;
  companyName?: string;
  slotStart?: string;
  slotEnd?: string;
  data: Record<string, any>;
  ip?: string;
  status: 'new' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
};

type Lead = {
  id: string;
  companySlug?: string;
  category?: string;
  city?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  source: 'booking' | 'zapytanie' | 'company-page' | 'ai-match';
  status: 'new' | 'contacted' | 'won' | 'lost';
  bookingNumber?: string;
  createdAt: string;
};

type MessageThread = {
  id: string;
  bookingNumber?: string;
  leadId?: string;
  companySlug: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  unreadForCompany: number;
  unreadForCustomer: number;
};

type Message = {
  id: string;
  threadId: string;
  authorRole: 'customer' | 'company' | 'system';
  authorName: string;
  body: string;
  attachments?: { name: string; url: string }[];
  createdAt: string;
  readAt?: string;
};

type Review = {
  id: string;
  companySlug: string;
  rating: number; // 1..5
  title: string;
  body: string;
  authorName: string;
  authorEmail: string;
  verified: boolean;
  bookingNumber?: string;
  status: 'pending' | 'published' | 'rejected' | 'flagged';
  createdAt: string;
  publishedAt?: string;
  reply?: { body: string; createdAt: string };
  /** Agent 6: auto-moderation result attached at submission time. */
  moderation?: {
    decision: 'approve' | 'review' | 'reject';
    topScore: number;
    flags: { reason: string; score: number; matchedTerms?: string[]; excerpt?: string }[];
  };
};

type Obituary = {
  id: string;
  slug: string;
  personName: string;
  birthDate?: string;
  deathDate: string;
  city: string;
  funeralDate?: string;
  funeralPlace?: string;
  text: string;
  authorName: string;
  authorEmail: string;
  photoUrl?: string;
  candles: number;
  tier: 'free' | 'premium';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
};

class InMemoryStore {
  bookings = new Map<string, Booking>();
  leads = new Map<string, Lead>();
  threads = new Map<string, MessageThread>();
  messages = new Map<string, Message[]>(); // threadId -> messages
  reviews = new Map<string, Review>();
  obituaries = new Map<string, Obituary>();
  candlesByObituary = new Map<string, Set<string>>(); // dedupe by IP
  condolences = new Map<string, Condolence[]>(); // obituaryId -> condolences
  memories = new Map<string, Memory[]>(); // obituaryId -> memories (photos/stories)
  condolencesByIp = new Map<string, Map<string, number>>(); // obituaryId -> (ipHash -> lastTs)

  // helpers
  list<T>(map: Map<string, T>, filter?: (v: T) => boolean): T[] {
    const out: T[] = [];
    for (const v of map.values()) if (!filter || filter(v)) out.push(v);
    return out;
  }
}

// Reuse instance across HMR reloads in dev
const g = globalThis as any;
export const store: InMemoryStore = g.__pp_store__ || (g.__pp_store__ = new InMemoryStore());

// --- helpers / generators ----------------------------------------------------

export function newId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

// --- typed accessors (sugar) -------------------------------------------------

export const bookingStore = {
  create(b: Omit<Booking, 'createdAt' | 'status'> & Partial<Pick<Booking, 'status'>>): Booking {
    const rec: Booking = { status: 'new', createdAt: new Date().toISOString(), ...b };
    store.bookings.set(rec.number, rec);
    return rec;
  },
  get(number: string) {
    return store.bookings.get(number);
  },
  list() {
    return store.list(store.bookings);
  },
  bookedSlotsForCompany(companySlug: string) {
    return store
      .list(store.bookings, (b) => b.companySlug === companySlug && b.status !== 'cancelled')
      .map((b) => b.slotStart!)
      .filter(Boolean);
  },
};

export const leadStore = {
  create(l: Omit<Lead, 'id' | 'createdAt' | 'status'>) {
    const id = newId('LEAD');
    const rec: Lead = { id, status: 'new', createdAt: new Date().toISOString(), ...l };
    store.leads.set(id, rec);
    return rec;
  },
  forCompany(companySlug: string) {
    return store.list(store.leads, (l) => l.companySlug === companySlug);
  },
  recent(limit = 20) {
    return store
      .list(store.leads)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },
  get(id: string) {
    return store.leads.get(id);
  },
  updateStatus(id: string, status: Lead['status']) {
    const l = store.leads.get(id);
    if (!l) return null;
    l.status = status;
    return l;
  },
};

export const messagingStore = {
  ensureThread(args: {
    companySlug: string;
    customerEmail: string;
    customerName: string;
    subject: string;
    bookingNumber?: string;
    leadId?: string;
  }): MessageThread {
    // dedupe by (companySlug, customerEmail, bookingNumber)
    for (const t of store.threads.values()) {
      if (
        t.companySlug === args.companySlug &&
        t.customerEmail === args.customerEmail &&
        (t.bookingNumber || '') === (args.bookingNumber || '')
      ) {
        return t;
      }
    }
    const id = newId('THR');
    const now = new Date().toISOString();
    const t: MessageThread = {
      id,
      companySlug: args.companySlug,
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      subject: args.subject,
      bookingNumber: args.bookingNumber,
      leadId: args.leadId,
      createdAt: now,
      updatedAt: now,
      unreadForCompany: 0,
      unreadForCustomer: 0,
    };
    store.threads.set(id, t);
    store.messages.set(id, []);
    return t;
  },
  post(threadId: string, m: Omit<Message, 'id' | 'createdAt' | 'threadId'>): Message | null {
    const t = store.threads.get(threadId);
    if (!t) return null;
    const id = newId('MSG');
    const msg: Message = { id, threadId, createdAt: new Date().toISOString(), ...m };
    const arr = store.messages.get(threadId) || [];
    arr.push(msg);
    store.messages.set(threadId, arr);
    t.updatedAt = msg.createdAt;
    if (m.authorRole === 'customer') t.unreadForCompany++;
    if (m.authorRole === 'company') t.unreadForCustomer++;
    return msg;
  },
  list(threadId: string) {
    return store.messages.get(threadId) || [];
  },
  threadsForCompany(companySlug: string) {
    return store.list(store.threads, (t) => t.companySlug === companySlug)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  threadsForCustomer(email: string) {
    return store.list(store.threads, (t) => t.customerEmail === email)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  markRead(threadId: string, role: 'company' | 'customer') {
    const t = store.threads.get(threadId);
    if (!t) return;
    if (role === 'company') t.unreadForCompany = 0;
    if (role === 'customer') t.unreadForCustomer = 0;
  },
};

export const reviewStore = {
  submit(r: Omit<Review, 'id' | 'createdAt' | 'status' | 'verified'> & { bookingNumber?: string }) {
    const id = newId('REV');
    const verified = !!(r.bookingNumber && store.bookings.has(r.bookingNumber));
    const rec: Review = {
      id,
      status: verified ? 'published' : 'pending',
      verified,
      createdAt: new Date().toISOString(),
      publishedAt: verified ? new Date().toISOString() : undefined,
      ...r,
    };
    store.reviews.set(id, rec);
    return rec;
  },
  forCompany(companySlug: string, includePending = false) {
    return store.list(
      store.reviews,
      (r) => r.companySlug === companySlug && (includePending || r.status === 'published'),
    );
  },
  pending(limit = 20) {
    return store
      .list(store.reviews, (r) => r.status === 'pending' || r.status === 'flagged')
      .sort((a, b) => {
        // flagged first (top moderation score), then by created_at desc
        const ad = a.status === 'flagged' ? (a.moderation?.topScore || 0) : 0;
        const bd = b.status === 'flagged' ? (b.moderation?.topScore || 0) : 0;
        if (ad !== bd) return bd - ad;
        return b.createdAt.localeCompare(a.createdAt);
      })
      .slice(0, limit);
  },
  /** Agent 6: list only auto-flagged reviews (highest moderation score first). */
  flagged(limit = 50) {
    return store
      .list(store.reviews, (r) => r.status === 'flagged')
      .sort(
        (a, b) =>
          (b.moderation?.topScore || 0) - (a.moderation?.topScore || 0) ||
          b.createdAt.localeCompare(a.createdAt),
      )
      .slice(0, limit);
  },
  recent(limit = 20) {
    return store
      .list(store.reviews)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },
  get(id: string) {
    return store.reviews.get(id);
  },
  reply(id: string, body: string) {
    const r = store.reviews.get(id);
    if (!r) return null;
    r.reply = { body, createdAt: new Date().toISOString() };
    return r;
  },
  approve(id: string) {
    const r = store.reviews.get(id);
    if (!r) return null;
    r.status = 'published';
    r.publishedAt = new Date().toISOString();
    return r;
  },
  averageForCompany(companySlug: string) {
    const arr = this.forCompany(companySlug);
    if (arr.length === 0) return { avg: 0, count: 0 };
    const sum = arr.reduce((a, r) => a + r.rating, 0);
    return { avg: Math.round((sum / arr.length) * 10) / 10, count: arr.length };
  },
};

// ─── Condolence book + Memory wall types ─────────────────────────────────
export type Condolence = {
  id: string;
  obituaryId: string;
  authorName: string;
  text: string;
  /** Optional relationship to deceased ("syn", "przyjaciel", "współpracownik"…) */
  relation?: string;
  /** Moderation status — public list only shows 'approved' */
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
};

export type Memory = {
  id: string;
  obituaryId: string;
  type: 'photo' | 'story';
  /** For 'photo': image URL; for 'story': caption/headline */
  title: string;
  /** Full description / story text (for 'story' or photo caption) */
  description?: string;
  /** Image URL (only photo type) */
  imageUrl?: string;
  authorName: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
};

export const obituaryStore = {
  publish(o: Omit<Obituary, 'id' | 'createdAt' | 'status' | 'candles' | 'slug'>) {
    const id = newId('OBI');
    const slug = `${o.personName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${id.toLowerCase()}`;
    const rec: Obituary = {
      id,
      slug,
      status: 'published',
      candles: 0,
      createdAt: new Date().toISOString(),
      ...o,
    };
    store.obituaries.set(id, rec);
    return rec;
  },
  list(filter?: { city?: string; tier?: 'free' | 'premium' }) {
    return store.list(store.obituaries, (o) => {
      if (filter?.city && o.city !== filter.city) return false;
      if (filter?.tier && o.tier !== filter.tier) return false;
      return o.status === 'published';
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getBySlug(slug: string) {
    return store.list(store.obituaries, (o) => o.slug === slug)[0];
  },
  lightCandle(obituaryId: string, ip: string) {
    const o = store.obituaries.get(obituaryId);
    if (!o) return null;
    const set = store.candlesByObituary.get(obituaryId) || new Set<string>();
    if (set.has(ip)) return { ok: false, candles: o.candles, reason: 'already' };
    set.add(ip);
    store.candlesByObituary.set(obituaryId, set);
    o.candles++;
    return { ok: true, candles: o.candles };
  },
};

// ─── Condolence book store ───────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute between posts from same IP
const RATE_LIMIT_DAILY = 5; // max 5 per IP per 24h per obituary (counted on the cap)

export const condolenceStore = {
  /** Add a condolence; auto-status = 'approved' (with light heuristics) or 'pending'. */
  add(input: {
    obituarySlug: string;
    authorName: string;
    text: string;
    relation?: string;
    ipHash: string;
  }): { ok: true; condolence: Condolence } | { ok: false; error: string } {
    const obit = store.list(store.obituaries, (o) => o.slug === input.obituarySlug)[0];
    if (!obit) return { ok: false, error: 'Nie znaleziono nekrologu' };

    // Rate limit per IP per obituary
    const ipMap = store.condolencesByIp.get(obit.id) || new Map<string, number>();
    const now = Date.now();
    const lastTs = ipMap.get(input.ipHash) || 0;
    if (now - lastTs < RATE_LIMIT_WINDOW_MS) {
      return { ok: false, error: 'Poczekaj chwilę przed kolejnym wpisem' };
    }
    // Daily cap from same IP
    const allFromIp = (store.condolences.get(obit.id) || []).filter(
      (c) => (c as any)._ipHash === input.ipHash && now - new Date(c.createdAt).getTime() < 86_400_000,
    );
    if (allFromIp.length >= RATE_LIMIT_DAILY) {
      return { ok: false, error: 'Dzienny limit kondolencji z tego adresu został osiągnięty' };
    }

    // Simple spam heuristics → mark as pending if suspicious
    const t = input.text.trim();
    const susceptToSpam =
      /https?:\/\//i.test(t) || // contains URL
      /\b(viagra|casino|kredyt|bitcoin)\b/i.test(t) ||
      t.length < 8;

    const id = newId('CND');
    const rec: Condolence = {
      id,
      obituaryId: obit.id,
      authorName: input.authorName.trim().slice(0, 80),
      text: t.slice(0, 1000),
      relation: input.relation?.trim().slice(0, 60),
      status: susceptToSpam ? 'pending' : 'approved',
      createdAt: new Date().toISOString(),
    };
    // Tag with ipHash for rate-limiting (not exposed publicly)
    (rec as any)._ipHash = input.ipHash;

    const list = store.condolences.get(obit.id) || [];
    list.push(rec);
    store.condolences.set(obit.id, list);
    ipMap.set(input.ipHash, now);
    store.condolencesByIp.set(obit.id, ipMap);

    return { ok: true, condolence: rec };
  },
  /** Public list — only approved condolences, newest first. */
  listForSlug(obituarySlug: string): Condolence[] {
    const obit = store.list(store.obituaries, (o) => o.slug === obituarySlug)[0];
    if (!obit) return [];
    const list = store.condolences.get(obit.id) || [];
    return list
      .filter((c) => c.status === 'approved')
      .map(({ ...c }) => {
        // strip internal _ipHash
        delete (c as any)._ipHash;
        return c;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  /** Admin/moderation list — includes pending */
  listAllForSlug(obituarySlug: string): Condolence[] {
    const obit = store.list(store.obituaries, (o) => o.slug === obituarySlug)[0];
    if (!obit) return [];
    return (store.condolences.get(obit.id) || [])
      .map(({ ...c }) => {
        delete (c as any)._ipHash;
        return c;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  /** Moderate — approve/reject by id */
  setStatus(id: string, status: 'approved' | 'rejected'): Condolence | null {
    for (const list of store.condolences.values()) {
      const c = list.find((x) => x.id === id);
      if (c) {
        c.status = status;
        return c;
      }
    }
    return null;
  },
  /** Cross-obituary list of pending items (admin moderation queue) */
  listPending(): (Condolence & { obituarySlug?: string; obituaryName?: string })[] {
    const out: any[] = [];
    for (const [obituaryId, list] of store.condolences.entries()) {
      const obit = store.obituaries.get(obituaryId);
      for (const c of list) {
        if (c.status !== 'pending') continue;
        const { ...copy } = c;
        delete (copy as any)._ipHash;
        out.push({
          ...copy,
          obituarySlug: obit?.slug,
          obituaryName: obit?.personName,
        });
      }
    }
    return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  /** Cross-obituary recent (all statuses) */
  listRecent(limit = 50): any[] {
    const out: any[] = [];
    for (const [obituaryId, list] of store.condolences.entries()) {
      const obit = store.obituaries.get(obituaryId);
      for (const c of list) {
        const { ...copy } = c;
        delete (copy as any)._ipHash;
        out.push({
          ...copy,
          obituarySlug: obit?.slug,
          obituaryName: obit?.personName,
        });
      }
    }
    return out
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },
};

// ─── Memory wall store (photos + stories) ────────────────────────────────
export const memoryStore = {
  add(input: {
    obituarySlug: string;
    type: 'photo' | 'story';
    title: string;
    description?: string;
    imageUrl?: string;
    authorName: string;
    ipHash: string;
  }): { ok: true; memory: Memory } | { ok: false; error: string } {
    const obit = store.list(store.obituaries, (o) => o.slug === input.obituarySlug)[0];
    if (!obit) return { ok: false, error: 'Nie znaleziono nekrologu' };

    if (input.type === 'photo' && !input.imageUrl) {
      return { ok: false, error: 'Brak adresu zdjęcia' };
    }
    if (input.type === 'story' && (!input.description || input.description.length < 20)) {
      return { ok: false, error: 'Historia musi mieć co najmniej 20 znaków' };
    }

    const id = newId('MEM');
    const rec: Memory = {
      id,
      obituaryId: obit.id,
      type: input.type,
      title: input.title.trim().slice(0, 120),
      description: input.description?.trim().slice(0, 2000),
      imageUrl: input.imageUrl,
      authorName: input.authorName.trim().slice(0, 80),
      status: 'pending', // photos require moderation
      createdAt: new Date().toISOString(),
    };
    (rec as any)._ipHash = input.ipHash;

    const list = store.memories.get(obit.id) || [];
    list.push(rec);
    store.memories.set(obit.id, list);
    return { ok: true, memory: rec };
  },
  listForSlug(obituarySlug: string, opts?: { includePending?: boolean }): Memory[] {
    const obit = store.list(store.obituaries, (o) => o.slug === obituarySlug)[0];
    if (!obit) return [];
    const list = store.memories.get(obit.id) || [];
    return list
      .filter((m) => opts?.includePending || m.status === 'approved')
      .map(({ ...m }) => {
        delete (m as any)._ipHash;
        return m;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  setStatus(id: string, status: 'approved' | 'rejected'): Memory | null {
    for (const list of store.memories.values()) {
      const m = list.find((x) => x.id === id);
      if (m) {
        m.status = status;
        return m;
      }
    }
    return null;
  },
  listPending(): (Memory & { obituarySlug?: string; obituaryName?: string })[] {
    const out: any[] = [];
    for (const [obituaryId, list] of store.memories.entries()) {
      const obit = store.obituaries.get(obituaryId);
      for (const m of list) {
        if (m.status !== 'pending') continue;
        const { ...copy } = m;
        delete (copy as any)._ipHash;
        out.push({
          ...copy,
          obituarySlug: obit?.slug,
          obituaryName: obit?.personName,
        });
      }
    }
    return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

export type { Booking, Lead, MessageThread, Message, Review, Obituary };

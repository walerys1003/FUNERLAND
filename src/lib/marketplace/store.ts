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
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
  publishedAt?: string;
  reply?: { body: string; createdAt: string };
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

export type { Booking, Lead, MessageThread, Message, Review, Obituary };

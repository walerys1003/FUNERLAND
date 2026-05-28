/**
 * Repository layer — abstracts away "Supabase vs in-memory store".
 *
 * - If `SUPABASE_SERVICE_ROLE_KEY` is configured, calls go to Supabase.
 * - Otherwise the existing in-memory store from `./store.ts` is used.
 *
 * This lets the entire codebase compile & run with NO env vars (dev / preview),
 * and seamlessly switch to Supabase when configured.
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  bookingStore,
  leadStore,
  messagingStore,
  reviewStore,
  obituaryStore,
  type Booking,
  type Lead,
  type Review,
  type Obituary,
  type MessageThread,
  type Message,
} from './store';

const USE_SUPABASE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

function admin() {
  return supabaseAdmin();
}

/* -------------------------- Bookings -------------------------- */

export const bookingRepo = {
  async create(b: {
    number: string;
    category: string;
    companySlug?: string;
    companyName?: string;
    slotStart?: string;
    slotEnd?: string;
    data: Record<string, any>;
    ip?: string;
  }): Promise<Booking> {
    if (!USE_SUPABASE) {
      return bookingStore.create(b) as Booking;
    }
    let companyId: string | null = null;
    if (b.companySlug) {
      const { data: c } = await admin()
        .from('companies')
        .select('id')
        .eq('slug', b.companySlug)
        .maybeSingle();
      companyId = c?.id ?? null;
    }
    const { data, error } = await admin()
      .from('bookings')
      .insert({
        number: b.number,
        category: b.category,
        company_id: companyId,
        slot_start: b.slotStart,
        slot_end: b.slotEnd,
        contact_name: b.data.name,
        contact_email: b.data.email,
        contact_phone: b.data.phone,
        contact_city: b.data.city,
        notes: b.data.notes,
        payload: b.data,
        ip: b.ip,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapBookingRow(data, b.companySlug, b.companyName);
  },

  async get(number: string): Promise<Booking | null> {
    if (!USE_SUPABASE) return bookingStore.get(number) || null;
    const { data, error } = await admin()
      .from('bookings')
      .select('*, companies(slug, name)')
      .eq('number', number)
      .maybeSingle();
    if (error) return null;
    if (!data) return null;
    return mapBookingRow(data, data.companies?.slug, data.companies?.name);
  },

  async bookedSlotsForCompany(companySlug: string): Promise<string[]> {
    if (!USE_SUPABASE) return bookingStore.bookedSlotsForCompany(companySlug);
    const { data: c } = await admin().from('companies').select('id').eq('slug', companySlug).maybeSingle();
    if (!c) return [];
    const { data } = await admin()
      .from('bookings')
      .select('slot_start')
      .eq('company_id', c.id)
      .neq('status', 'cancelled')
      .not('slot_start', 'is', null);
    return (data || []).map((r: any) => r.slot_start).filter(Boolean);
  },

  async listForUser(userId: string): Promise<Booking[]> {
    if (!USE_SUPABASE) {
      // in-memory: filter by email matching would require auth context — skip
      return [];
    }
    const { data } = await admin()
      .from('bookings')
      .select('*, companies(slug, name)')
      .eq('family_user_id', userId)
      .order('created_at', { ascending: false });
    return (data || []).map((d: any) => mapBookingRow(d, d.companies?.slug, d.companies?.name));
  },
};

function mapBookingRow(row: any, companySlug?: string, companyName?: string): Booking {
  return {
    number: row.number,
    category: row.category,
    companySlug,
    companyName,
    slotStart: row.slot_start,
    slotEnd: row.slot_end,
    data: row.payload || {},
    ip: row.ip,
    status: row.status,
    createdAt: row.created_at,
  } as Booking;
}

/* -------------------------- Leads -------------------------- */

export const leadRepo = {
  async create(l: {
    companySlug: string;
    bookingNumber?: string;
    category?: string;
    city?: string;
    name: string;
    email: string;
    phone: string;
    message?: string;
    source?: 'booking' | 'zapytanie' | 'company-page' | 'ai-match';
  }): Promise<Lead | null> {
    if (!USE_SUPABASE) {
      return leadStore.create({
        companySlug: l.companySlug,
        bookingNumber: l.bookingNumber,
        category: l.category,
        city: l.city,
        name: l.name,
        email: l.email,
        phone: l.phone,
        message: l.message,
        source: l.source || 'booking',
      }) as Lead;
    }
    const { data: c } = await admin().from('companies').select('id').eq('slug', l.companySlug).maybeSingle();
    if (!c) return null;
    let bookingId: string | null = null;
    if (l.bookingNumber) {
      const { data: b } = await admin()
        .from('bookings')
        .select('id')
        .eq('number', l.bookingNumber)
        .maybeSingle();
      bookingId = b?.id ?? null;
    }
    const { data, error } = await admin()
      .from('leads')
      .insert({
        company_id: c.id,
        booking_id: bookingId,
        category: l.category,
        city: l.city,
        contact_name: l.name,
        contact_email: l.email,
        contact_phone: l.phone,
        message: l.message,
        source: l.source || 'booking',
      })
      .select('*')
      .single();
    if (error) return null;
    return mapLeadRow(data, l.companySlug);
  },

  async forCompany(companySlug: string, status?: string): Promise<Lead[]> {
    if (!USE_SUPABASE) {
      let arr = leadStore.forCompany(companySlug);
      if (status) arr = arr.filter((l) => l.status === status);
      return arr;
    }
    const { data: c } = await admin().from('companies').select('id').eq('slug', companySlug).maybeSingle();
    if (!c) return [];
    let q = admin().from('leads').select('*').eq('company_id', c.id);
    if (status) q = q.eq('status', status);
    const { data } = await q.order('created_at', { ascending: false });
    return (data || []).map((r: any) => mapLeadRow(r, companySlug));
  },

  async updateStatus(id: string, status: Lead['status']): Promise<Lead | null> {
    if (!USE_SUPABASE) return leadStore.updateStatus(id, status);
    const { data, error } = await admin()
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();
    if (error) return null;
    return mapLeadRow(data);
  },

  async recent(limit = 20): Promise<Lead[]> {
    if (!USE_SUPABASE) return leadStore.recent(limit);
    const { data } = await admin()
      .from('leads')
      .select('*, companies(slug)')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map((r: any) => mapLeadRow(r, r.companies?.slug));
  },
};

function mapLeadRow(row: any, companySlug?: string): Lead {
  return {
    id: row.id,
    companySlug,
    category: row.category,
    city: row.city,
    name: row.contact_name,
    email: row.contact_email,
    phone: row.contact_phone,
    message: row.message,
    source: row.source,
    status: row.status,
    bookingNumber: row.booking_id || undefined,
    createdAt: row.created_at,
  } as Lead;
}

/* -------------------------- Reviews -------------------------- */

export const reviewRepo = {
  async submit(r: {
    companySlug: string;
    rating: number;
    title: string;
    body: string;
    authorName: string;
    authorEmail: string;
    bookingNumber?: string;
    moderation?: {
      decision: 'approve' | 'review' | 'reject';
      topScore: number;
      flags: { reason: string; score: number; matchedTerms?: string[]; excerpt?: string }[];
    };
  }): Promise<Review | null> {
    if (!USE_SUPABASE) return reviewStore.submit(r) as Review;
    const { data: c } = await admin().from('companies').select('id').eq('slug', r.companySlug).maybeSingle();
    if (!c) return null;
    let bookingId: string | null = null;
    let verified = false;
    if (r.bookingNumber) {
      const { data: b } = await admin()
        .from('bookings')
        .select('id')
        .eq('number', r.bookingNumber)
        .maybeSingle();
      if (b) {
        bookingId = b.id;
        verified = true;
      }
    }
    const { data, error } = await admin()
      .from('reviews')
      .insert({
        company_id: c.id,
        booking_id: bookingId,
        rating: r.rating,
        title: r.title,
        body: r.body,
        author_name: r.authorName,
        author_email: r.authorEmail,
        verified,
        status: verified ? 'published' : 'pending',
        published_at: verified ? new Date().toISOString() : null,
      })
      .select('*')
      .single();
    if (error) return null;
    return mapReviewRow(data, r.companySlug);
  },

  async forCompany(companySlug: string): Promise<Review[]> {
    if (!USE_SUPABASE) return reviewStore.forCompany(companySlug) as Review[];
    const { data: c } = await admin().from('companies').select('id').eq('slug', companySlug).maybeSingle();
    if (!c) return [];
    const { data } = await admin()
      .from('reviews')
      .select('*')
      .eq('company_id', c.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    return (data || []).map((d: any) => mapReviewRow(d, companySlug));
  },

  async averageForCompany(companySlug: string) {
    if (!USE_SUPABASE) return reviewStore.averageForCompany(companySlug);
    const reviews = await this.forCompany(companySlug);
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
  },

  async pending(limit = 20): Promise<Review[]> {
    if (!USE_SUPABASE) return reviewStore.pending(limit) as Review[];
    const { data } = await admin()
      .from('reviews')
      .select('*, companies(slug, name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map((d: any) => mapReviewRow(d, d.companies?.slug));
  },

  async approve(id: string): Promise<Review | null> {
    if (!USE_SUPABASE) return reviewStore.approve(id) as Review | null;
    const { data, error } = await admin()
      .from('reviews')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) return null;
    return mapReviewRow(data);
  },

  async reject(id: string): Promise<Review | null> {
    if (!USE_SUPABASE) {
      const r = reviewStore.get(id);
      if (!r) return null;
      r.status = 'rejected';
      return r as Review;
    }
    const { data, error } = await admin()
      .from('reviews')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select('*')
      .single();
    if (error) return null;
    return mapReviewRow(data);
  },
};

function mapReviewRow(row: any, companySlug?: string): Review {
  return {
    id: row.id,
    companySlug: companySlug || '',
    rating: row.rating,
    title: row.title,
    body: row.body,
    authorName: row.author_name,
    authorEmail: row.author_email,
    verified: row.verified,
    bookingNumber: row.booking_id || undefined,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at,
    reply: row.reply_body ? { body: row.reply_body, createdAt: row.reply_at } : undefined,
  } as Review;
}

/* -------------------------- Obituaries -------------------------- */

export const obituaryRepo = {
  async publish(o: {
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
    tier: 'free' | 'premium';
  }): Promise<Obituary> {
    if (!USE_SUPABASE)
      return obituaryStore.publish({
        personName: o.personName,
        birthDate: o.birthDate,
        deathDate: o.deathDate,
        city: o.city,
        funeralDate: o.funeralDate,
        funeralPlace: o.funeralPlace,
        text: o.text,
        authorName: o.authorName,
        authorEmail: o.authorEmail,
        photoUrl: o.photoUrl,
        tier: o.tier,
      }) as Obituary;
    const slug = `${o.personName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Math.random().toString(36).slice(2, 6)}`;
    const expires = o.tier === 'premium'
      ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
      : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const { data, error } = await admin()
      .from('obituaries')
      .insert({
        slug,
        person_name: o.personName,
        birth_date: o.birthDate || null,
        death_date: o.deathDate,
        city: o.city,
        funeral_date: o.funeralDate || null,
        funeral_place: o.funeralPlace,
        body: o.text,
        author_name: o.authorName,
        author_email: o.authorEmail,
        photo_url: o.photoUrl,
        tier: o.tier,
        expires_at: expires,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapObituaryRow(data);
  },

  async getBySlug(slug: string): Promise<Obituary | null> {
    if (!USE_SUPABASE) return (obituaryStore.getBySlug(slug) as Obituary) || null;
    const { data } = await admin().from('obituaries').select('*').eq('slug', slug).maybeSingle();
    return data ? mapObituaryRow(data) : null;
  },

  async list(filter?: { city?: string; tier?: 'free' | 'premium' }): Promise<Obituary[]> {
    if (!USE_SUPABASE) return obituaryStore.list(filter) as Obituary[];
    let q = admin().from('obituaries').select('*').eq('status', 'published');
    if (filter?.city) q = q.eq('city', filter.city);
    if (filter?.tier) q = q.eq('tier', filter.tier);
    const { data } = await q.order('created_at', { ascending: false }).limit(50);
    return (data || []).map(mapObituaryRow);
  },

  async lightCandle(slug: string, ipHash: string) {
    if (!USE_SUPABASE) {
      const obit = obituaryStore.getBySlug(slug);
      if (!obit) return null;
      return obituaryStore.lightCandle(obit.id, ipHash);
    }
    const { data: obit } = await admin().from('obituaries').select('id, candles').eq('slug', slug).maybeSingle();
    if (!obit) return null;
    const { error } = await admin().from('candles').insert({ obituary_id: obit.id, ip_hash: ipHash });
    if (error) {
      // unique violation = already lit
      return { ok: false, candles: obit.candles, reason: 'already' };
    }
    return { ok: true, candles: obit.candles + 1 };
  },
};

function mapObituaryRow(row: any): Obituary {
  return {
    id: row.id,
    slug: row.slug,
    personName: row.person_name,
    birthDate: row.birth_date,
    deathDate: row.death_date,
    city: row.city,
    funeralDate: row.funeral_date,
    funeralPlace: row.funeral_place,
    text: row.body,
    authorName: row.author_name,
    authorEmail: row.author_email,
    photoUrl: row.photo_url,
    candles: row.candles || 0,
    tier: row.tier,
    status: row.status,
    createdAt: row.created_at,
  } as Obituary;
}

/* -------------------------- Messaging -------------------------- */

export const messagingRepo = {
  async ensureThread(args: {
    companySlug: string;
    customerEmail: string;
    customerName: string;
    subject: string;
    bookingNumber?: string;
  }): Promise<MessageThread> {
    if (!USE_SUPABASE) return messagingStore.ensureThread(args) as MessageThread;
    const { data: c } = await admin().from('companies').select('id').eq('slug', args.companySlug).maybeSingle();
    if (!c) throw new Error('company not found');
    let bookingId: string | null = null;
    if (args.bookingNumber) {
      const { data: b } = await admin().from('bookings').select('id').eq('number', args.bookingNumber).maybeSingle();
      bookingId = b?.id ?? null;
    }
    // dedupe by (company_id, customer_email, booking_id)
    const { data: existing } = await admin()
      .from('message_threads')
      .select('*')
      .eq('company_id', c.id)
      .eq('customer_email', args.customerEmail)
      .eq('booking_id', bookingId || '00000000-0000-0000-0000-000000000000')
      .maybeSingle();
    if (existing) return mapThreadRow(existing, args.companySlug);
    const { data, error } = await admin()
      .from('message_threads')
      .insert({
        company_id: c.id,
        customer_email: args.customerEmail,
        customer_name: args.customerName,
        subject: args.subject,
        booking_id: bookingId,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapThreadRow(data, args.companySlug);
  },

  async threadsForCompany(companySlug: string): Promise<MessageThread[]> {
    if (!USE_SUPABASE) return messagingStore.threadsForCompany(companySlug) as MessageThread[];
    const { data: c } = await admin().from('companies').select('id').eq('slug', companySlug).maybeSingle();
    if (!c) return [];
    const { data } = await admin()
      .from('message_threads')
      .select('*')
      .eq('company_id', c.id)
      .order('updated_at', { ascending: false });
    return (data || []).map((t: any) => mapThreadRow(t, companySlug));
  },

  async threadsForCustomer(email: string): Promise<MessageThread[]> {
    if (!USE_SUPABASE) return messagingStore.threadsForCustomer(email) as MessageThread[];
    const { data } = await admin()
      .from('message_threads')
      .select('*, companies(slug)')
      .eq('customer_email', email)
      .order('updated_at', { ascending: false });
    return (data || []).map((t: any) => mapThreadRow(t, t.companies?.slug));
  },

  async listMessages(threadId: string): Promise<Message[]> {
    if (!USE_SUPABASE) return messagingStore.list(threadId) as Message[];
    const { data } = await admin()
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    return (data || []).map(mapMessageRow);
  },

  async post(
    threadId: string,
    m: {
      authorRole: 'customer' | 'company' | 'system';
      authorName: string;
      body: string;
      attachments?: { name: string; url: string }[];
    },
  ): Promise<Message | null> {
    if (!USE_SUPABASE) return messagingStore.post(threadId, m) as Message;
    const { data, error } = await admin()
      .from('messages')
      .insert({
        thread_id: threadId,
        author_role: m.authorRole,
        author_name: m.authorName,
        body: m.body,
      })
      .select('*')
      .single();
    if (error) return null;
    return mapMessageRow(data);
  },

  async markRead(threadId: string, role: 'company' | 'customer') {
    if (!USE_SUPABASE) {
      messagingStore.markRead(threadId, role);
      return;
    }
    const field = role === 'company' ? 'unread_for_company' : 'unread_for_customer';
    await admin().from('message_threads').update({ [field]: 0 }).eq('id', threadId);
  },
};

function mapThreadRow(row: any, companySlug?: string): MessageThread {
  return {
    id: row.id,
    companySlug: companySlug || '',
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    subject: row.subject,
    bookingNumber: row.booking_id || undefined,
    leadId: row.lead_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    unreadForCompany: row.unread_for_company,
    unreadForCustomer: row.unread_for_customer,
  } as MessageThread;
}

function mapMessageRow(row: any): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    authorRole: row.author_role,
    authorName: row.author_name,
    body: row.body,
    attachments: row.attachments,
    createdAt: row.created_at,
    readAt: row.read_at,
  } as Message;
}

/* -------------------------- Company widgets (Phase 3 Agent 8 follow-up) -------------------------- */

import type { WidgetVariant } from '@/lib/widget/token';

export type CompanyWidget = {
  id: string;
  companySlug: string;
  token: string;
  variant: WidgetVariant;
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  allowedOrigins: string[];
  views: number;
  clicks: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

// In-memory store for demo mode (no Supabase). Keyed by token for fast lookup.
const widgetMem = new Map<string, CompanyWidget>();

function mapWidgetRow(row: any, companySlug?: string): CompanyWidget {
  return {
    id: row.id,
    companySlug: companySlug || row.company_slug || '',
    token: row.token,
    variant: (row.variant || 'card') as WidgetVariant,
    theme: (row.theme || 'light') as 'light' | 'dark' | 'auto',
    primaryColor: row.primary_color || '#2E4F3E',
    allowedOrigins: row.allowed_origins || [],
    views: row.views || 0,
    clicks: row.clicks || 0,
    active: row.active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const widgetRepo = {
  /** Upsert a widget config (by company_id + variant unique constraint). */
  async upsert(input: {
    companySlug: string;
    token: string;
    variant: WidgetVariant;
    theme?: 'light' | 'dark' | 'auto';
    primaryColor?: string;
    allowedOrigins?: string[];
  }): Promise<CompanyWidget | null> {
    if (!USE_SUPABASE) {
      const now = new Date().toISOString();
      const w: CompanyWidget = {
        id: `wid_${Buffer.from(input.token).toString('base64').slice(0, 12)}`,
        companySlug: input.companySlug,
        token: input.token,
        variant: input.variant,
        theme: input.theme || 'light',
        primaryColor: input.primaryColor || '#2E4F3E',
        allowedOrigins: input.allowedOrigins || [],
        views: 0,
        clicks: 0,
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      widgetMem.set(input.token, w);
      return w;
    }
    const { data: c } = await admin()
      .from('companies')
      .select('id')
      .eq('slug', input.companySlug)
      .maybeSingle();
    if (!c) return null;

    // Try update existing (company_id + variant) — unique index
    const { data: existing } = await admin()
      .from('company_widgets')
      .select('id')
      .eq('company_id', c.id)
      .eq('variant', input.variant)
      .maybeSingle();

    const payload = {
      company_id: c.id,
      token: input.token,
      variant: input.variant,
      theme: input.theme || 'light',
      primary_color: input.primaryColor || '#2E4F3E',
      allowed_origins: input.allowedOrigins || [],
      active: true,
    };

    if (existing) {
      const { data, error } = await admin()
        .from('company_widgets')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error || !data) return null;
      return mapWidgetRow(data, input.companySlug);
    }
    const { data, error } = await admin()
      .from('company_widgets')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) return null;
    return mapWidgetRow(data, input.companySlug);
  },

  /** Look up widget by its public token (used by /widget/[token]/embed for origin check). */
  async byToken(token: string): Promise<CompanyWidget | null> {
    if (!USE_SUPABASE) return widgetMem.get(token) || null;
    const { data } = await admin()
      .from('company_widgets')
      .select('*, companies!inner(slug)')
      .eq('token', token)
      .maybeSingle();
    if (!data) return null;
    return mapWidgetRow(data, (data as any).companies?.slug);
  },

  /** List all widgets for a company (used in /panel-firmy/widget management). */
  async forCompany(companySlug: string): Promise<CompanyWidget[]> {
    if (!USE_SUPABASE) {
      return Array.from(widgetMem.values()).filter((w) => w.companySlug === companySlug);
    }
    const { data: c } = await admin()
      .from('companies')
      .select('id')
      .eq('slug', companySlug)
      .maybeSingle();
    if (!c) return [];
    const { data } = await admin()
      .from('company_widgets')
      .select('*')
      .eq('company_id', c.id)
      .order('created_at', { ascending: false });
    return (data || []).map((row: any) => mapWidgetRow(row, companySlug));
  },

  /** Revoke (deactivate) a widget — token will stop serving content. */
  async revoke(token: string): Promise<boolean> {
    if (!USE_SUPABASE) {
      const w = widgetMem.get(token);
      if (!w) return false;
      w.active = false;
      widgetMem.set(token, w);
      return true;
    }
    const { error } = await admin()
      .from('company_widgets')
      .update({ active: false })
      .eq('token', token);
    return !error;
  },

  /** Increment view counter (fire-and-forget from /widget/[token]/embed). */
  async trackView(token: string): Promise<void> {
    if (!USE_SUPABASE) {
      const w = widgetMem.get(token);
      if (w) {
        w.views++;
        widgetMem.set(token, w);
      }
      return;
    }
    // Postgres atomic increment via RPC fallback — use update + select pattern
    try {
      await admin().rpc('increment_widget_views', { p_token: token });
    } catch {
      // Soft-fall to read-modify-write
      const { data } = await admin()
        .from('company_widgets')
        .select('id, views')
        .eq('token', token)
        .maybeSingle();
      if (data) {
        await admin()
          .from('company_widgets')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', data.id);
      }
    }
  },
};

/* -------------------------- AI Match queries logging (Phase 3 Agent 9 follow-up) -------------------------- */

export const aiMatchRepo = {
  /**
   * Log an AI match query for analytics + future ML training.
   * Fire-and-forget — never throws.
   */
  async log(input: {
    query?: string;
    filterState?: any;
    resultsCount: number;
    sessionId?: string;
    userId?: string;
    ip?: string;
  }): Promise<string | null> {
    if (!USE_SUPABASE) return null;
    try {
      const { data, error } = await admin()
        .from('ai_match_queries')
        .insert({
          query: input.query || null,
          filter_state: input.filterState || {},
          results_count: input.resultsCount,
          session_id: input.sessionId || null,
          user_id: input.userId || null,
          ip: input.ip || null,
        })
        .select('id')
        .single();
      if (error || !data) return null;
      return data.id as string;
    } catch (e) {
      console.warn('aiMatchRepo.log failed:', e);
      return null;
    }
  },

  /** Mark a click on a result (used to compute CTR per position). */
  async markClick(queryId: string, companySlug: string, position: number): Promise<boolean> {
    if (!USE_SUPABASE || !queryId) return false;
    try {
      const { data: c } = await admin()
        .from('companies')
        .select('id')
        .eq('slug', companySlug)
        .maybeSingle();
      if (!c) return false;
      const { error } = await admin()
        .from('ai_match_queries')
        .update({ clicked_company_id: c.id, clicked_position: position })
        .eq('id', queryId);
      return !error;
    } catch {
      return false;
    }
  },
};

/* -------------------------- Moderation flags (Phase 3 Agent 6 follow-up) -------------------------- */

export type ReviewFlagRecord = {
  id: string;
  reviewId: string;
  source: 'auto' | 'user' | 'admin';
  reason: string;
  score?: number;
  details?: any;
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
};

export const moderationRepo = {
  /**
   * Save moderation flags for a review (called from /api/reviews after moderateText).
   * In demo mode (no Supabase), stores nothing — the moderation result is already
   * attached to the Review row in reviewStore.
   */
  async saveAutoFlags(
    reviewId: string,
    flags: { reason: string; score: number; matchedTerms?: string[]; excerpt?: string }[],
  ): Promise<number> {
    if (!USE_SUPABASE || flags.length === 0) return 0;
    const rows = flags.map((f) => ({
      review_id: reviewId,
      source: 'auto' as const,
      reason: f.reason,
      score: Math.max(0, Math.min(1, f.score)),
      details: {
        matched_terms: f.matchedTerms || [],
        excerpt: f.excerpt,
        heuristic: 'src/lib/moderation/heuristics.ts',
      },
    }));
    const { error, count } = await admin().from('review_flags').insert(rows, { count: 'exact' });
    if (error) {
      console.error('moderationRepo.saveAutoFlags error:', error);
      return 0;
    }
    return count || rows.length;
  },

  /** Record a user-reported flag (from "Zgłoś" button on review). */
  async reportByUser(
    reviewId: string,
    reason: string,
    details?: any,
    reporterId?: string,
  ): Promise<ReviewFlagRecord | null> {
    if (!USE_SUPABASE) return null;
    const { data, error } = await admin()
      .from('review_flags')
      .insert({
        review_id: reviewId,
        source: 'user',
        reason,
        details: details || {},
        reporter_id: reporterId || null,
      })
      .select('*')
      .single();
    if (error || !data) return null;
    return mapFlagRow(data);
  },

  /** List unresolved flags for admin queue. */
  async unresolved(limit = 50): Promise<ReviewFlagRecord[]> {
    if (!USE_SUPABASE) return [];
    const { data } = await admin()
      .from('review_flags')
      .select('*')
      .eq('resolved', false)
      .order('score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map(mapFlagRow);
  },

  /** Mark a flag as resolved (admin action). */
  async resolve(flagId: string, adminUserId?: string): Promise<boolean> {
    if (!USE_SUPABASE) return false;
    const { error } = await admin()
      .from('review_flags')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: adminUserId || null,
      })
      .eq('id', flagId);
    return !error;
  },

  /** Get flags for a single review. */
  async forReview(reviewId: string): Promise<ReviewFlagRecord[]> {
    if (!USE_SUPABASE) return [];
    const { data } = await admin()
      .from('review_flags')
      .select('*')
      .eq('review_id', reviewId)
      .order('created_at', { ascending: false });
    return (data || []).map(mapFlagRow);
  },
};

function mapFlagRow(row: any): ReviewFlagRecord {
  return {
    id: row.id,
    reviewId: row.review_id,
    source: row.source,
    reason: row.reason,
    score: row.score != null ? Number(row.score) : undefined,
    details: row.details,
    resolved: !!row.resolved,
    resolvedAt: row.resolved_at || undefined,
    createdAt: row.created_at,
  };
}

/* -------------------------- Subscriptions (Phase 3 Agent 4 follow-up) -------------------------- */

import type { Subscription } from '@/lib/billing/subscriptions-store';
import { subscriptionStore } from '@/lib/billing/subscriptions-store';
import { fromDbPlan, toDbPlan } from '@/lib/billing/plan-mapping';
import type { PlanId } from '@/lib/billing/plans';

function mapSubscriptionRow(row: any, companySlug?: string, companyName?: string): Subscription {
  return {
    id: row.id,
    companySlug: companySlug || row.company_slug || '',
    companyName,
    plan: fromDbPlan(row.plan),
    status:
      row.status === 'past_due'
        ? 'past_due'
        : row.status === 'trialing'
          ? 'trialing'
          : row.status === 'canceled'
            ? 'canceled'
            : 'active',
    amount: row.amount_cents != null ? Math.round((row.amount_cents as number) / 100) : 0,
    period: row.period === 'year' ? 'yearly' : 'monthly',
    currentPeriodEnd: row.current_period_end || row.trial_end || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
    stripeSubscriptionId: row.stripe_subscription_id || undefined,
  };
}

export const subscriptionRepo = {
  /** List all subscriptions (admin view). */
  async list(): Promise<Subscription[]> {
    if (!USE_SUPABASE) return subscriptionStore.list();
    const { data, error } = await admin()
      .from('company_subscriptions')
      .select('*, companies!inner(slug, name)')
      .order('created_at', { ascending: false });
    if (error || !data) return subscriptionStore.list();
    return data.map((row: any) =>
      mapSubscriptionRow(row, row.companies?.slug, row.companies?.name),
    );
  },

  /** Get a single subscription by id. */
  async get(id: string): Promise<Subscription | null> {
    if (!USE_SUPABASE) return subscriptionStore.get(id) || null;
    const { data } = await admin()
      .from('company_subscriptions')
      .select('*, companies(slug, name)')
      .eq('id', id)
      .maybeSingle();
    if (!data) return null;
    return mapSubscriptionRow(data, (data as any).companies?.slug, (data as any).companies?.name);
  },

  /** Find subscription by company slug (latest non-canceled). */
  async forCompany(companySlug: string): Promise<Subscription | null> {
    if (!USE_SUPABASE) {
      return subscriptionStore.list().find((s) => s.companySlug === companySlug) || null;
    }
    const { data: c } = await admin()
      .from('companies')
      .select('id, name')
      .eq('slug', companySlug)
      .maybeSingle();
    if (!c) return null;
    const { data } = await admin()
      .from('company_subscriptions')
      .select('*')
      .eq('company_id', c.id)
      .neq('status', 'canceled')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return mapSubscriptionRow(data, companySlug, (c as any).name);
  },

  /**
   * Upsert subscription — used by Stripe webhook handler.
   * Matches on stripe_subscription_id when provided, otherwise on (company_id, plan).
   */
  async upsert(sub: Subscription): Promise<Subscription> {
    if (!USE_SUPABASE) return subscriptionStore.upsert(sub);
    const { data: c } = await admin()
      .from('companies')
      .select('id')
      .eq('slug', sub.companySlug)
      .maybeSingle();
    if (!c) return subscriptionStore.upsert(sub);

    const row = {
      company_id: c.id,
      plan: toDbPlan(sub.plan),
      status: sub.status,
      stripe_subscription_id: sub.stripeSubscriptionId || null,
      amount_cents: Math.round((sub.amount || 0) * 100),
      currency: 'PLN',
      period: sub.period === 'yearly' ? 'year' : 'month',
      current_period_end: sub.currentPeriodEnd,
    };

    // Prefer match on stripe_subscription_id when present (idempotent webhook)
    if (sub.stripeSubscriptionId) {
      const { data: existing } = await admin()
        .from('company_subscriptions')
        .select('id')
        .eq('stripe_subscription_id', sub.stripeSubscriptionId)
        .maybeSingle();
      if (existing) {
        const { data, error } = await admin()
          .from('company_subscriptions')
          .update(row)
          .eq('id', existing.id)
          .select('*')
          .single();
        if (error || !data) return subscriptionStore.upsert(sub);
        return mapSubscriptionRow(data, sub.companySlug, sub.companyName);
      }
    }

    const { data, error } = await admin()
      .from('company_subscriptions')
      .insert(row)
      .select('*')
      .single();
    if (error || !data) return subscriptionStore.upsert(sub);
    return mapSubscriptionRow(data, sub.companySlug, sub.companyName);
  },

  /** Cancel a subscription by id. */
  async cancel(id: string): Promise<Subscription | null> {
    if (!USE_SUPABASE) return subscriptionStore.cancel(id);
    const { data, error } = await admin()
      .from('company_subscriptions')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) return null;
    return mapSubscriptionRow(data);
  },

  /** Aggregated metrics for /admin/finanse. */
  async stats() {
    if (!USE_SUPABASE) return subscriptionStore.stats();
    const all = await this.list();
    const active = all.filter((s) => s.status === 'active');
    const mrr = active.reduce(
      (a, s) => a + (s.period === 'monthly' ? s.amount : s.amount / 12),
      0,
    );
    return {
      total: all.length,
      active: active.length,
      pastDue: all.filter((s) => s.status === 'past_due').length,
      canceled: all.filter((s) => s.status === 'canceled').length,
      mrr: Math.round(mrr),
      byPlan: {
        premium: active.filter((s) => s.plan === 'premium').length,
        pro: active.filter((s) => s.plan === 'pro').length,
        standard: active.filter((s) => s.plan === 'standard').length,
      },
    };
  },

  /**
   * Log a billing event (Stripe webhook). Best-effort, non-throwing.
   * Writes to `billing_events` table when Supabase is wired; otherwise stays in-memory.
   */
  async logEvent(evt: {
    type: string;
    companySlug?: string;
    plan?: PlanId | string;
    stripeSubscriptionId?: string;
    stripeInvoiceId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    meta?: Record<string, any>;
  }): Promise<void> {
    if (!USE_SUPABASE) {
      // in-memory ring buffer for debug
      (globalThis as any).__billingEvents = (globalThis as any).__billingEvents || [];
      (globalThis as any).__billingEvents.push({ ...evt, at: new Date().toISOString() });
      if ((globalThis as any).__billingEvents.length > 500) {
        (globalThis as any).__billingEvents.shift();
      }
      return;
    }
    try {
      let companyId: string | null = null;
      if (evt.companySlug) {
        const { data: c } = await admin()
          .from('companies')
          .select('id')
          .eq('slug', evt.companySlug)
          .maybeSingle();
        companyId = (c?.id as any) ?? null;
      }
      await admin().from('billing_events').insert({
        type: evt.type,
        company_id: companyId,
        plan: evt.plan ?? null,
        stripe_subscription_id: evt.stripeSubscriptionId ?? null,
        stripe_invoice_id: evt.stripeInvoiceId ?? null,
        amount_cents: typeof evt.amount === 'number' ? evt.amount : null,
        currency: evt.currency ?? 'PLN',
        status: evt.status ?? null,
        meta: evt.meta ?? {},
      });
    } catch (e) {
      console.warn('[subscriptionRepo.logEvent] failed:', e);
    }
  },

  /** Check if a company has at least a given plan (uses DB function when available). */
  async companyHasPlan(companySlug: string, minPlan: PlanId): Promise<boolean> {
    if (!USE_SUPABASE) {
      const sub = subscriptionStore.list().find((s) => s.companySlug === companySlug && s.status === 'active');
      const RANK: Record<PlanId, number> = { free: 0, standard: 1, pro: 2, premium: 3 };
      return sub ? RANK[sub.plan] >= RANK[minPlan] : minPlan === 'free';
    }
    const { data: c } = await admin().from('companies').select('id').eq('slug', companySlug).maybeSingle();
    if (!c) return false;
    const { data, error } = await admin().rpc('company_has_plan', {
      p_company_id: c.id,
      p_min_plan: toDbPlan(minPlan),
    });
    if (error) return false;
    return Boolean(data);
  },
};

export const REPO_BACKEND = USE_SUPABASE ? 'supabase' : 'memory';

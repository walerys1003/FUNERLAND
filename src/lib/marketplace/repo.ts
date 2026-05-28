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

export const REPO_BACKEND = USE_SUPABASE ? 'supabase' : 'memory';

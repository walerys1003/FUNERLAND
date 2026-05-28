/**
 * Availability & calendar logic for marketplace bookings.
 *
 * Each category has its own slot model:
 *  - "ceremony"  → 2-hour slots, 1/day per company (zakłady, kremacja)
 *  - "delivery"  → 1-hour slots, max 6/day (kwiaciarnie, transport)
 *  - "consult"   → 30-min slots, 8/day (kamieniarze)
 *
 * No external deps — pure functions, can run on edge/node/client.
 */

export type SlotKind = 'ceremony' | 'delivery' | 'consult';

export type Slot = {
  id: string;
  start: string; // ISO
  end: string;
  available: boolean;
  reason?: 'booked' | 'closed' | 'lead-time' | 'past';
};

export type DaySlots = {
  date: string; // YYYY-MM-DD
  weekday: number; // 0..6 (0 = Sun)
  slots: Slot[];
  hasAvailable: boolean;
};

const SLOT_CONFIG: Record<
  SlotKind,
  { duration: number; openHour: number; closeHour: number; perDay: number; leadHours: number }
> = {
  ceremony: { duration: 120, openHour: 9, closeHour: 17, perDay: 1, leadHours: 48 },
  delivery: { duration: 60, openHour: 8, closeHour: 18, perDay: 6, leadHours: 24 },
  consult: { duration: 30, openHour: 9, closeHour: 17, perDay: 8, leadHours: 12 },
};

export function getSlotKindForCategory(categorySlug: string): SlotKind {
  if (categorySlug === 'zaklady-pogrzebowe' || categorySlug === 'krematoria') return 'ceremony';
  if (categorySlug === 'kwiaciarnie-pogrzebowe' || categorySlug === 'transport') return 'delivery';
  return 'consult';
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Deterministic "is this slot booked?" — pseudo-random based on companySlug+date+slotIndex.
 * Used as a mock until Supabase persistence is wired in.
 */
function isMockBooked(companySlug: string, dateKey: string, slotIndex: number): boolean {
  const seed = `${companySlug}|${dateKey}|${slotIndex}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  // ~35% slots booked-ish (deterministic per seed)
  return h % 100 < 35;
}

export function generateSlotsForDay(
  date: Date,
  kind: SlotKind,
  opts: { companySlug?: string; bookedSlotStarts?: string[]; now?: Date } = {},
): DaySlots {
  const cfg = SLOT_CONFIG[kind];
  const now = opts.now || new Date();
  const leadCutoff = new Date(now.getTime() + cfg.leadHours * 60 * 60 * 1000);
  const dateKey = toDateKey(date);
  const weekday = date.getDay();
  const slots: Slot[] = [];
  let slotIndex = 0;

  // Sunday closed for ceremony/consult; delivery only morning
  const sundayCeremony = weekday === 0 && (kind === 'ceremony' || kind === 'consult');
  const lateOpen = weekday === 0 ? cfg.openHour + 1 : cfg.openHour;
  const earlyClose = weekday === 0 ? Math.min(cfg.closeHour, 13) : cfg.closeHour;

  for (let minute = lateOpen * 60; minute + cfg.duration <= earlyClose * 60; minute += cfg.duration) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(minute);
    const end = new Date(start.getTime() + cfg.duration * 60 * 1000);

    let available = true;
    let reason: Slot['reason'] | undefined;

    if (sundayCeremony) {
      available = false;
      reason = 'closed';
    } else if (start < now) {
      available = false;
      reason = 'past';
    } else if (start < leadCutoff) {
      available = false;
      reason = 'lead-time';
    } else if (opts.bookedSlotStarts?.includes(start.toISOString())) {
      available = false;
      reason = 'booked';
    } else if (opts.companySlug && isMockBooked(opts.companySlug, dateKey, slotIndex)) {
      available = false;
      reason = 'booked';
    }

    slots.push({
      id: `${dateKey}-${pad(start.getHours())}${pad(start.getMinutes())}`,
      start: start.toISOString(),
      end: end.toISOString(),
      available,
      reason,
    });
    slotIndex++;
  }

  return {
    date: dateKey,
    weekday,
    slots,
    hasAvailable: slots.some((s) => s.available),
  };
}

export function generateSlotsForRange(
  startDate: Date,
  days: number,
  kind: SlotKind,
  opts: { companySlug?: string; bookedSlotStarts?: string[]; now?: Date } = {},
): DaySlots[] {
  const out: DaySlots[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    out.push(generateSlotsForDay(d, kind, opts));
  }
  return out;
}

export function findEarliestSlot(days: DaySlots[]): Slot | null {
  for (const d of days) {
    const s = d.slots.find((x) => x.available);
    if (s) return s;
  }
  return null;
}

export function formatSlotLabel(slot: Slot, locale = 'pl-PL'): string {
  const s = new Date(slot.start);
  const e = new Date(slot.end);
  const day = s.toLocaleDateString(locale, { day: '2-digit', month: 'long', weekday: 'long' });
  const t = `${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`;
  return `${day}, ${t}`;
}

/**
 * Validate a booking-time payload against availability constraints.
 * Used server-side in /api/booking.
 */
export function validateSlot(
  slotStart: string,
  kind: SlotKind,
  opts: { companySlug?: string; bookedSlotStarts?: string[] } = {},
): { ok: boolean; reason?: string } {
  if (!slotStart) return { ok: false, reason: 'Brak wybranego terminu' };
  const d = new Date(slotStart);
  if (isNaN(d.getTime())) return { ok: false, reason: 'Nieprawidłowa data' };
  const day = generateSlotsForDay(d, kind, opts);
  const slot = day.slots.find((s) => s.start === d.toISOString() || s.start === slotStart);
  if (!slot) return { ok: false, reason: 'Termin poza godzinami pracy' };
  if (!slot.available) return { ok: false, reason: `Termin niedostępny (${slot.reason})` };
  return { ok: true };
}

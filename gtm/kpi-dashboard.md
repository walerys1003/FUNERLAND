# KPI Dashboard — PolskiePogrzeby.pl

**Update cadence:** daily 18:00 (auto-collect 09:00)
**Owner:** Founder/CEO
**Tools:** Plausible, Supabase queries, Stripe Dashboard, Resend Analytics

---

## NORTH STAR METRIC

**Liczba zaakceptowanych leadów / tydzień**
(lead został zaakceptowany przez firmę, kontakt podjęty, klient odpowiedział)

Cel Q1: **50/tydz.** → Q2: **150/tydz.** → Q3: **400/tydz.**

---

## CORE KPIs (poziom 1 — codzienne)

### Akwizycja
- **Unique visitors / day**
- **Sessions / day**
- **Avg session duration**
- **Bounce rate** (target <55%)
- **Traffic source split** (organic, paid, direct, referral, social)
- **Top 10 landing pages**
- **Top 10 search queries** (GSC)

### Konwersja
- **Visitor → Lead conversion rate** (target ≥2.5%)
- **Lead count / day**
- **Avg lead score** (target ≥75)
- **Lead → Contact conversion** (firma odebrała) — target ≥85%
- **Contact → Booking conversion** (klient potwierdził usługę) — target ≥35%

### Aktywacja firm
- **Claim requests / day**
- **Claim approved / day**
- **Time to first lead** (avg dni od onboardingu do pierwszego leadu)
- **Active companies** (≥1 lead w ostatnich 7 dni)

### Revenue
- **MRR (Monthly Recurring Revenue)**
- **One-time revenue** (lead unlock 49 zł + obituary premium 49 zł)
- **ARPU** (Avg Revenue Per User per month)
- **Churn rate** (target <5%/miesiąc)
- **Net New MRR**

---

## ADVANCED KPIs (poziom 2 — tygodniowe)

### Product
- **AI assistant — interactions / week**
- **AI assistant — satisfaction score** (thumbs up/down)
- **Search queries / week**
- **Search zero-result rate** (target <3%)
- **Booking funnel completion rate** (step 1→6)
- **Booking funnel drop-off** per step
- **Mobile vs Desktop split** (target mobile ≥65%)

### Performance
- **Lighthouse Perf score** (mobile, weekly average)
- **LCP, CLS, INP** (Real User Monitoring via Plausible/web-vitals)
- **API p95 latency** (`/api/lead`, `/api/search`, `/api/ai/chat`)
- **Error rate** (Sentry)
- **Uptime %** (Uptime Kuma)

### SEO
- **Organic clicks / week** (GSC)
- **Organic impressions / week**
- **Avg CTR**
- **Keywords ranked TOP 10**
- **Backlinks gained** (Ahrefs/Semrush)
- **Domain Rating delta**

### Outreach
- **Cold emails sent / week**
- **Open rate** (target ≥35%)
- **Reply rate** (target ≥8%)
- **Positive reply rate**
- **SMS sent / response rate**
- **LinkedIn connect → conversation rate**

### Unit Economics
- **CAC** (Customer Acquisition Cost) per channel
- **LTV** (Lifetime Value) — 12-month projection
- **LTV/CAC ratio** (target ≥3:1, stretch 8:1)
- **Payback period** (target ≤6 miesięcy)
- **Burn rate vs runway**

---

## OPERATIONAL KPIs (poziom 3 — miesięczne)

- **NPS** (Net Promoter Score) — score + verbatims
- **CSAT** per interaction (post-lead)
- **Support tickets / week** + median resolution time
- **Content velocity**: artykuły opublikowane / miesiąc
- **Feature shipped / sprint**
- **% revenue from top 10 customers** (concentration risk)
- **Geographic distribution** (% wpływów per miasto)

---

## QUERIES (Supabase SQL — gotowe do dashboardu)

### Daily Active Companies
```sql
SELECT COUNT(DISTINCT company_id) AS active_companies
FROM lead_offers
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Lead conversion funnel (24h)
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'new') AS new_leads,
  COUNT(*) FILTER (WHERE status = 'sent_to_companies') AS sent,
  COUNT(*) FILTER (WHERE status = 'revealed') AS revealed,
  COUNT(*) FILTER (WHERE status = 'converted') AS converted
FROM leads
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

### MRR (active subscriptions)
```sql
SELECT
  plan,
  COUNT(*) AS subscribers,
  CASE plan
    WHEN 'basic' THEN COUNT(*) * 199
    WHEN 'pro' THEN COUNT(*) * 399
    WHEN 'premium' THEN COUNT(*) * 799
    WHEN 'enterprise' THEN COUNT(*) * 1499
  END AS mrr_pln
FROM subscriptions
WHERE status = 'active'
GROUP BY plan;
```

### Avg lead score by city
```sql
SELECT
  c.name AS city,
  ROUND(AVG(l.score)) AS avg_score,
  COUNT(*) AS leads
FROM leads l
JOIN cities c ON l.city_id = c.id
WHERE l.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.name
ORDER BY avg_score DESC;
```

### Search zero-results
```sql
SELECT query, COUNT(*) AS searches
FROM search_logs
WHERE results_count = 0
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY query
ORDER BY searches DESC
LIMIT 20;
```

---

## ALERTING RULES

- 🔴 **P0**: Uptime < 99% / 1h → PagerDuty
- 🔴 **P0**: Error rate > 5% / 5 min → Sentry alert + Slack
- 🟠 **P1**: 0 leadów / 24h → Slack #growth
- 🟠 **P1**: Lighthouse Perf drop > 10 pts → Slack #engineering
- 🟡 **P2**: Bounce rate > 65% / dzień → Slack #growth
- 🟡 **P2**: Email reply rate < 5% / 3 dni → Slack #sales

---

## REVIEW CADENCE

| Cadence    | Format            | Attendees           | Output                                  |
|------------|-------------------|---------------------|-----------------------------------------|
| Daily      | KPI snapshot      | CEO, Lead           | Slack post (auto) + flag risks          |
| Weekly     | Growth review     | CEO, Sales, Content | Slide deck + 3 decisions                |
| Bi-weekly  | Product review    | CEO, Dev, Designer  | Backlog re-priorytetyzacja              |
| Monthly    | Strategic review  | Cały zespół + adv.  | OKRs update + roadmap reforecast        |
| Quarterly  | Board meeting     | + inwestorzy        | Update inwestorom + funding signals     |

---

## SUCCESS DEFINITION (Q1 2026)

✅ **Traction**: 25 000 unique visitors / m-c
✅ **Marketplace liquidity**: 100 firm w 7 miastach
✅ **Revenue**: 20 000 zł MRR
✅ **Unit econ**: LTV/CAC ≥ 5:1
✅ **NPS**: ≥ 50
✅ **Brand**: 3 wystąpienia w mediach branżowych

→ Wtedy: Series Seed pitch.

import type { Metadata } from 'next';
import MessagingClient from '@/components/messaging/messaging-client';

export const metadata: Metadata = {
  title: 'Wiadomości · Panel firmy · Polskie Pogrzeby',
  robots: { index: false, follow: false },
};

// In production this slug comes from logged-in user's company.
// For now we hard-code a demo slug; real auth comes in Phase 4.
const DEMO_COMPANY_SLUG = 'zaklad-pogrzebowy-kalla';

export default function CompanyMessagingPage() {
  return (
    <div>
      <h1 className="font-heading text-[34px] mb-6">Wiadomości</h1>
      <MessagingClient role="company" companySlug={DEMO_COMPANY_SLUG} />
    </div>
  );
}

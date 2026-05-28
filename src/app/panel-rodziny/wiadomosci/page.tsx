import type { Metadata } from 'next';
import MessagingClient from '@/components/messaging/messaging-client';

export const metadata: Metadata = {
  title: 'Wiadomości · Panel rodziny · Polskie Pogrzeby',
  robots: { index: false, follow: false },
};

export default async function FamilyMessagingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const sp = await searchParams;
  const email = sp.email || 'klient@example.com';
  return (
    <div className="container-page py-10">
      <h1 className="font-heading text-[34px] mb-6">Wiadomości</h1>
      <MessagingClient role="customer" customerEmail={email} />
    </div>
  );
}

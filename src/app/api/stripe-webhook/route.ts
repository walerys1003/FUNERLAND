import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * POST /api/stripe-webhook
 * Stripe webhook handler — subscriptions, lead reveals, premium obituaries
 *
 * Events handled:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: any;

  try {
    // ===== Weryfikacja podpisu =====
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    // MOCK
    event = JSON.parse(body);
  } catch (err: any) {
    console.error('[stripe-webhook] signature failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log('[stripe-webhook] unhandled event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[stripe-webhook] handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

// ===== HANDLERS =====
async function handleCheckoutCompleted(session: any) {
  const { customer, metadata, mode } = session;

  if (mode === 'subscription') {
    // Subskrypcja firmowa
    // const supabase = supabaseAdmin();
    // await supabase.from('companies')
    //   .update({
    //     stripe_customer_id: customer,
    //     stripe_subscription_id: session.subscription,
    //     plan: metadata.plan,
    //     subscription_status: 'active',
    //   })
    //   .eq('id', metadata.company_id);
  }

  if (mode === 'payment') {
    if (metadata?.type === 'lead_reveal') {
      // Pay-per-reveal — odkrycie kontaktu rodziny
      // await supabase.from('leads')
      //   .update({ revealed_by_companies: array_append(revealed_by_companies, metadata.company_id) })
      //   .eq('id', metadata.lead_id);
    }
    if (metadata?.type === 'obituary_premium') {
      // Premium 49zł — wyróżniony nekrolog 30 dni
      // await supabase.from('obituaries')
      //   .update({ premium: true, premium_until: new Date(Date.now() + 30*24*60*60*1000) })
      //   .eq('id', metadata.obituary_id);
    }
  }

  // Zapisz transakcję
  // await supabase.from('transactions').insert({
  //   user_id: metadata.user_id,
  //   company_id: metadata.company_id,
  //   type: metadata.type || 'subscription',
  //   amount: session.amount_total,
  //   currency: session.currency.toUpperCase(),
  //   provider: 'stripe',
  //   provider_id: session.id,
  //   status: 'succeeded',
  //   metadata,
  // });
}

async function handleSubscriptionChange(_sub: any) {
  // Zmiana planu (upgrade/downgrade), status
}

async function handleSubscriptionDeleted(_sub: any) {
  // Przejście na plan free / disable premium features
}

async function handlePaymentSucceeded(_invoice: any) {
  // Email z potwierdzeniem płatności + FV PDF
}

async function handlePaymentFailed(_invoice: any) {
  // Email "Płatność nieudana — zaktualizuj kartę"
  // Po 3 nieudanych próbach: downgrade
}

---
name: payments
description: >
  Use when the user asks about "Stripe", "payments", "subscription", "billing", "checkout",
  "pricing model", "webhook payment", "invoice", "metered billing", "refund", "payment intent",
  "Stripe Elements", "pricing page", "free trial", "PCI compliance", "revenue", "SaaS billing",
  or needs payment processing and billing system knowledge.
keywords:
  - Stripe
  - payments
  - subscription
  - billing
  - checkout
  - pricing model
  - webhook payment
  - invoice
  - metered billing
  - refund
  - payment intent
  - Stripe Elements
  - pricing page
  - free trial
  - PCI compliance
  - revenue
  - SaaS billing
---

# Payments & Billing Skill

Comprehensive guide for implementing payment processing, subscription billing, and revenue systems in SaaS applications.

---

## Payment Provider Decision Tree

```
Need payments?
├── SaaS with subscriptions?
│   ├── Global customers + need tax handling? → Stripe (most flexible)
│   ├── Want merchant-of-record (they handle tax/VAT)? → Paddle or LemonSqueezy
│   └── Simple subscriptions, US-focused? → Stripe or LemonSqueezy
├── One-time payments only?
│   ├── Digital products? → LemonSqueezy or Stripe
│   ├── Physical goods? → Stripe
│   └── Marketplace (multi-party)? → Stripe Connect
├── Need invoicing? → Stripe Invoicing or Paddle
└── Crypto payments? → Coinbase Commerce or custom
```

| Provider | Strengths | Weaknesses | Fee |
|---|---|---|---|
| **Stripe** | Most flexible, best API, huge ecosystem | You handle tax/VAT | 2.9% + $0.30 |
| **Paddle** | Merchant of record, handles tax | Less flexible, fewer integrations | 5% + $0.50 |
| **LemonSqueezy** | Simple, MoR, good DX | Limited customization | 5% + $0.50 |

---

## Stripe Architecture Overview

### Core Objects

```
Customer
├── PaymentMethod (card, bank, etc.)
├── Subscription
│   ├── SubscriptionItem (one per Price)
│   └── Invoice (auto-generated per billing cycle)
│       └── PaymentIntent (charge attempt)
├── Invoice (one-off)
│   └── PaymentIntent
└── PaymentIntent (one-time payment)
```

### Key Concepts

| Object | Purpose | When to use |
|---|---|---|
| `Customer` | Represents a user, stores payment methods | Always create one per user |
| `PaymentIntent` | Represents a single payment attempt | One-time charges |
| `SetupIntent` | Saves payment method without charging | Save card for later |
| `Subscription` | Recurring billing | SaaS plans |
| `Price` | Defines amount + interval | Attach to products |
| `Product` | What you sell | One per plan/item |
| `Invoice` | Itemized bill | Auto-created for subscriptions |
| `Checkout Session` | Hosted payment page | Fastest checkout integration |

---

## One-Time Payment Flow

### Using Stripe Checkout (recommended for speed)

```typescript
// Server: Create checkout session
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(priceId: string, userId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/pricing`,
    client_reference_id: userId,
    metadata: { userId },
  });

  return session.url;
}
```

### Using Payment Intents (custom UI)

```typescript
// Server: Create payment intent
export async function createPaymentIntent(amount: number, userId: string) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Stripe uses cents
    currency: 'usd',
    metadata: { userId },
    automatic_payment_methods: { enabled: true },
  });

  return paymentIntent.client_secret;
}

// Client: Confirm payment with Stripe Elements
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      // Show error to customer
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>Pay</button>
    </form>
  );
}
```

---

## Subscription Lifecycle

```
                    ┌─────────────┐
                    │   Created    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
              ┌─────┤   Trialing   ├─────┐
              │     └──────┬──────┘     │ (trial ends, payment fails)
              │            │             │
              │     ┌──────▼──────┐     │
              │     │    Active    │◄────┤
              │     └──────┬──────┘     │
              │            │             │
              │     ┌──────▼──────┐     │
              │     │  Past Due    ├─────┘ (retry succeeds)
              │     └──────┬──────┘
              │            │ (all retries fail)
              │     ┌──────▼──────┐
              └────►│  Canceled    │
                    └─────────────┘
```

### Subscription Setup

```typescript
// Create subscription with trial
export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays?: number
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

// Cancel subscription (at period end — recommended)
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Upgrade/downgrade (proration)
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return stripe.subscriptions.update(subscriptionId, {
    items: [{ id: subscription.items.data[0].id, price: newPriceId }],
    proration_behavior: 'create_prorations',
  });
}
```

---

## Pricing Model Decision Table

| Model | Best for | Stripe implementation | Example |
|---|---|---|---|
| **Flat rate** | Simple products | Single `Price` with `recurring` | $29/mo |
| **Tiered** | Feature-gated plans | Multiple `Products` + `Prices` | Free / Pro / Enterprise |
| **Per-seat** | Collaboration tools | `quantity` on subscription item | $10/user/mo |
| **Metered/Usage** | API products, infra | `Price` with `usage_type: metered` | $0.01/API call |
| **Hybrid** | Complex SaaS | Base `Price` + metered `Price` | $49/mo + $0.01/call |
| **One-time + recurring** | Onboarding fee + sub | Checkout with multiple line items | $500 setup + $99/mo |

### Metered Billing Example

```typescript
// Create metered price
const price = await stripe.prices.create({
  product: 'prod_xxx',
  unit_amount: 1, // $0.01 per unit
  currency: 'usd',
  recurring: {
    interval: 'month',
    usage_type: 'metered',
    aggregate_usage: 'sum',
  },
});

// Report usage (call this whenever usage occurs)
export async function reportUsage(subscriptionItemId: string, quantity: number) {
  await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment',
  });
}
```

---

## Webhook Handling

### Essential Pattern

```typescript
import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';

// CRITICAL: Raw body needed for signature verification
export const config = { api: { bodyParser: false } };

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  // 1. Verify signature
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  // 2. Idempotency: Check if already processed
  const existingEvent = await db.stripeEvent.findUnique({
    where: { eventId: event.id },
  });
  if (existingEvent) return res.json({ received: true });

  // 3. Process event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
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
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 4. Record event as processed
    await db.stripeEvent.create({ data: { eventId: event.id, type: event.type } });
  } catch (err) {
    console.error(`Error processing ${event.type}:`, err);
    return res.status(500).send('Webhook handler failed');
  }

  return res.json({ received: true });
}
```

### Must-Handle Webhook Events

| Event | When | Action |
|---|---|---|
| `checkout.session.completed` | Customer completes checkout | Provision access, create DB records |
| `customer.subscription.created` | New subscription | Store subscription ID, update plan |
| `customer.subscription.updated` | Plan change, renewal | Update plan in DB |
| `customer.subscription.deleted` | Subscription canceled | Revoke access |
| `invoice.payment_succeeded` | Successful charge | Update billing records |
| `invoice.payment_failed` | Failed charge | Notify user, may trigger dunning |
| `customer.subscription.trial_will_end` | 3 days before trial ends | Notify user |

---

## Checkout Flow Patterns

### Decision: Stripe Checkout vs Elements vs Custom

| Approach | Speed | Customization | PCI scope |
|---|---|---|---|
| **Stripe Checkout** (hosted) | Fastest | Low (CSS only) | Lowest (SAQ A) |
| **Stripe Elements** (embedded) | Medium | High | Low (SAQ A-EP) |
| **Custom** (Stripe.js) | Slowest | Full | Higher |

**Recommendation**: Start with Checkout, move to Elements when you need custom UI.

### Customer Portal

```typescript
// Create Stripe Customer Portal session
export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.APP_URL}/settings/billing`,
  });

  return session.url;
}
```

Configure the portal in Stripe Dashboard → Settings → Customer Portal to enable:
- Subscription cancellation
- Plan switching
- Payment method updates
- Invoice history

---

## Refund and Dispute Handling

```typescript
// Full refund
await stripe.refunds.create({ payment_intent: 'pi_xxx' });

// Partial refund
await stripe.refunds.create({
  payment_intent: 'pi_xxx',
  amount: 500, // $5.00 in cents
});
```

### Dispute Prevention Checklist
- Clear billing descriptor (Settings → Public details)
- Send receipt emails (Stripe does this automatically)
- Include clear refund policy
- Respond to disputes within 7 days with evidence

---

## Testing with Stripe

### Test Cards

| Card | Behavior |
|---|---|
| `4242 4242 4242 4242` | Succeeds |
| `4000 0000 0000 3220` | Requires 3D Secure |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 9995` | Insufficient funds |

### Stripe CLI Webhook Forwarding

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger specific events for testing
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

---

## PCI Compliance Quick Reference

| Level | Requirement | When |
|---|---|---|
| **SAQ A** | Minimal — use Checkout or Elements | Card data never touches your server |
| **SAQ A-EP** | Moderate — use Elements | Card data passes through your page but not server |
| **SAQ D** | Full audit | You handle raw card data (avoid this) |

**Rule**: Never log, store, or transmit raw card numbers. Use Stripe's tokenization (Elements or Checkout).

---

## Database Schema Pattern

```prisma
model User {
  id               String   @id @default(cuid())
  email            String   @unique
  stripeCustomerId String?  @unique
  subscription     Subscription?
}

model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id])
  stripeSubscriptionId String   @unique
  stripePriceId        String
  status               String   // active, trialing, past_due, canceled
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model StripeEvent {
  id        String   @id @default(cuid())
  eventId   String   @unique // Stripe event ID for idempotency
  type      String
  createdAt DateTime @default(now())
}
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| Not verifying webhook signatures | Anyone can fake webhook events | Always use `constructEvent()` with secret |
| Using raw body parser for webhooks | Signature verification fails | Disable body parser, use raw buffer |
| Not handling idempotency | Duplicate charges or provisions | Store processed event IDs |
| Storing card numbers | PCI violation, massive liability | Use Stripe tokens/Elements only |
| Not handling `past_due` status | Users keep access after failed payment | Check subscription status on every request |
| Hardcoding prices | Can't change pricing without deploy | Use Stripe Dashboard prices, fetch dynamically |
| Missing `cancel_at_period_end` | Immediate cancellation loses paid time | Always cancel at period end |
| Not testing webhooks locally | Bugs found in production | Use `stripe listen --forward-to` |
| Amounts in dollars not cents | 100x overcharge or undercharge | Stripe uses smallest currency unit |
| Ignoring failed payment retries | Users silently churn | Handle `invoice.payment_failed`, send dunning emails |

---

## Pre-Delivery Checklist

- [ ] Stripe keys are in environment variables (never committed)
- [ ] Webhook endpoint verifies signatures
- [ ] Webhook handler is idempotent (checks processed events)
- [ ] All essential webhook events are handled
- [ ] Subscription status is checked on protected routes
- [ ] Customer portal is configured for self-service
- [ ] Stripe test mode used in development
- [ ] Webhook forwarding tested locally with Stripe CLI
- [ ] Price IDs come from env vars or Stripe API, not hardcoded
- [ ] Error states handled (payment failed, card declined)
- [ ] Amounts use cents (smallest currency unit)
- [ ] Cancellation uses `cancel_at_period_end`
- [ ] Database stores Stripe customer ID and subscription ID
- [ ] Raw card data never touches your server (PCI compliance)
- [ ] Billing descriptor is clear and recognizable

---

## References

- [Stripe Docs](https://docs.stripe.com/)
- [Stripe API Reference](https://docs.stripe.com/api)
- [Stripe Testing](https://docs.stripe.com/testing)
- [Stripe CLI](https://docs.stripe.com/stripe-cli)
- [PCI Compliance Guide](https://docs.stripe.com/security/guide)

---
name: email
description: >
  Use when the user asks about "email", "Resend", "SendGrid", "transactional email", "React Email",
  "email template", "notification system", "drip campaign", "email deliverability", "SMTP",
  "webhook email", "in-app notification", "push notification", "email queue",
  or needs email sending, notification system, and email template knowledge.
keywords:
  - email
  - Resend
  - SendGrid
  - transactional email
  - React Email
  - email template
  - notification system
  - drip campaign
  - email deliverability
  - SMTP
  - webhook email
  - in-app notification
  - push notification
  - email queue
---

# Email & Notifications Skill

Comprehensive guide for implementing transactional email, notification systems, email templates, and drip campaigns in web applications.

---

## Email Provider Decision Tree

```
What do you need?
├── Transactional email (best DX)?
│   └── Resend (React Email support, modern API, great DX)
├── High volume transactional + marketing?
│   └── SendGrid (established, feature-rich)
├── Maximum deliverability for transactional?
│   └── Postmark (best deliverability, transactional only)
├── Cheapest at scale?
│   └── AWS SES ($0.10/1K emails)
├── Marketing automation + transactional?
│   └── SendGrid or Mailchimp Transactional
└── Self-hosted?
    └── Postal or Mailtrain + AWS SES
```

| Provider | DX | Deliverability | Price (per 1K) | Best for |
|---|---|---|---|---|
| **Resend** | Excellent | Very good | $0 (3K/mo free) → $0.28 | Modern apps, React Email |
| **Postmark** | Good | Best | $1.25 | Critical transactional email |
| **SendGrid** | Good | Good | $0 (100/day free) → varies | High volume, marketing + transactional |
| **AWS SES** | Basic | Good (needs warmup) | $0.10 | Cost-sensitive, high volume |
| **Mailgun** | Good | Good | $0.80 | API-first, logs/analytics |

---

## Transactional vs Marketing Email

| Aspect | Transactional | Marketing |
|---|---|---|
| **Trigger** | User action | Business decision |
| **Content** | Specific to user | Broadcast to many |
| **Examples** | Welcome, receipt, reset password | Newsletter, promo, announcement |
| **Opt-out** | Not required (functional) | Must include unsubscribe |
| **Deliverability** | Higher priority | Subject to more filtering |
| **Provider** | Resend, Postmark, SES | SendGrid, Mailchimp, ConvertKit |

---

## React Email Template Pattern

### Setup

```bash
npm install @react-email/components resend
```

### Email Template

```tsx
// emails/welcome.tsx
import {
  Html, Head, Body, Container, Section,
  Text, Button, Img, Hr, Preview,
} from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export default function WelcomeEmail({ userName, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our platform, {userName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={`${baseUrl}/logo.png`} width={48} height={48} alt="Logo" />
          <Text style={heading}>Welcome, {userName}!</Text>
          <Text style={paragraph}>
            Thanks for signing up. We're excited to have you on board.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Get Started
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn't create this account, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://myapp.com';
const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' };
const heading = { fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' };
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#525f7f' };
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' };
const button = {
  backgroundColor: '#000', borderRadius: '5px', color: '#fff',
  fontSize: '16px', padding: '12px 24px', textDecoration: 'none',
};
const hr = { borderColor: '#e6ebf1', margin: '32px 0' };
const footer = { fontSize: '12px', color: '#8898aa' };
```

### Preview Emails Locally

```bash
npx react-email dev --dir emails
# Opens at http://localhost:3000 with live preview
```

---

## Email Sending Architecture

### Basic: Direct Send

```typescript
// lib/email.ts
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, userName: string) {
  const { data, error } = await resend.emails.send({
    from: 'App <hello@myapp.com>',
    to,
    subject: `Welcome to MyApp, ${userName}!`,
    react: WelcomeEmail({ userName, loginUrl: `${process.env.APP_URL}/login` }),
  });

  if (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }

  return data;
}
```

### Production: Queue-Based Sending

```typescript
// For high volume or reliability, use a queue
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!);

// 1. Define the queue
const emailQueue = new Queue('emails', { connection });

// 2. Add email to queue (from your API route / service)
export async function queueEmail(
  template: string,
  to: string,
  data: Record<string, unknown>
) {
  await emailQueue.add(template, { to, data }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  });
}

// 3. Process the queue (worker)
const worker = new Worker('emails', async (job) => {
  const { to, data } = job.data;

  switch (job.name) {
    case 'welcome':
      await sendWelcomeEmail(to, data.userName);
      break;
    case 'password-reset':
      await sendPasswordResetEmail(to, data.resetUrl);
      break;
    case 'invoice':
      await sendInvoiceEmail(to, data.invoiceId);
      break;
    default:
      throw new Error(`Unknown email template: ${job.name}`);
  }
}, { connection, concurrency: 5 });
```

---

## Transactional Email Types

| Type | Trigger | Priority | Template data |
|---|---|---|---|
| **Welcome** | User signs up | High | userName, loginUrl |
| **Email verification** | After signup | Critical | verifyUrl, expires |
| **Password reset** | Reset requested | Critical | resetUrl, expires |
| **Invoice / Receipt** | Payment succeeds | High | amount, items, date |
| **Payment failed** | Charge fails | High | updatePaymentUrl, amount |
| **Trial ending** | 3 days before trial end | Medium | daysLeft, upgradeUrl |
| **Subscription canceled** | User cancels | Medium | endDate, reactivateUrl |
| **Team invitation** | Admin invites user | High | inviterName, teamName, acceptUrl |
| **Weekly digest** | Scheduled (cron) | Low | activitySummary |
| **Security alert** | New login, password change | Critical | action, ipAddress, time |

---

## Deliverability Best Practices

### DNS Records (Required)

| Record | Purpose | Priority |
|---|---|---|
| **SPF** | Authorizes sending servers | Required |
| **DKIM** | Cryptographic email signing | Required |
| **DMARC** | Policy for failed SPF/DKIM | Required |
| **Custom MAIL FROM** | Return-path domain | Recommended |

### SPF Example

```
v=spf1 include:_spf.resend.com ~all
```

### DKIM Setup

Most providers (Resend, SendGrid) provide DKIM records to add to your DNS. Follow provider-specific instructions.

### DMARC Example

```
_dmarc.myapp.com TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@myapp.com"
```

### Warmup Strategy (New Domain)

| Week | Daily volume | Notes |
|---|---|---|
| 1 | 50-100 | Send to engaged users only |
| 2 | 200-500 | Expand to active users |
| 3 | 1,000-2,000 | Monitor bounce/complaint rates |
| 4 | 5,000+ | Full volume if metrics are good |

### Deliverability Checklist
- SPF, DKIM, DMARC configured
- Custom sending domain (not `@gmail.com`)
- Clean HTML (avoid spam trigger words)
- Text version included
- Unsubscribe link for marketing emails
- Bounce rate < 2%
- Complaint rate < 0.1%
- List hygiene (remove bounced addresses)

---

## Notification System Architecture

### Multi-Channel Notification

```
User Action / System Event
         │
    ┌────▼────┐
    │ Notif.  │
    │ Service │
    └────┬────┘
         │
    ┌────┼────────────┐
    │    │             │
  Email  In-App    Push
```

```typescript
// lib/notifications.ts
interface Notification {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels: ('email' | 'in_app' | 'push')[];
}

export async function sendNotification(notification: Notification) {
  const { userId, channels } = notification;

  // Check user preferences
  const preferences = await getUserNotificationPreferences(userId);

  const promises: Promise<void>[] = [];

  if (channels.includes('email') && preferences.email) {
    promises.push(sendEmailNotification(notification));
  }

  if (channels.includes('in_app') && preferences.inApp) {
    promises.push(createInAppNotification(notification));
  }

  if (channels.includes('push') && preferences.push) {
    promises.push(sendPushNotification(notification));
  }

  await Promise.allSettled(promises);
}
```

### In-App Notification Schema

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String   // e.g., "team_invite", "payment_failed"
  title     String
  body      String
  data      Json?    // Additional structured data
  read      Boolean  @default(false)
  readAt    DateTime?
  createdAt DateTime @default(now())

  @@index([userId, read])
  @@index([userId, createdAt])
}
```

### In-App Notification API

```typescript
// GET /api/notifications
export async function getNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

// PATCH /api/notifications/:id/read
export async function markAsRead(notificationId: string, userId: string) {
  return db.notification.update({
    where: { id: notificationId, userId },
    data: { read: true, readAt: new Date() },
  });
}

// PATCH /api/notifications/read-all
export async function markAllAsRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}
```

---

## Drip Campaign / Email Sequences

### Sequence Pattern

```typescript
// Define a drip sequence
const onboardingSequence = [
  { delay: '0d', template: 'welcome', subject: 'Welcome to MyApp!' },
  { delay: '1d', template: 'getting-started', subject: 'Getting started with MyApp' },
  { delay: '3d', template: 'feature-highlight', subject: 'Did you know about X?' },
  { delay: '7d', template: 'check-in', subject: 'How's it going?' },
  { delay: '14d', template: 'upgrade-prompt', subject: 'Unlock more with Pro' },
];

// Schedule sequence (using BullMQ delayed jobs)
export async function startDripSequence(userId: string, email: string) {
  for (const step of onboardingSequence) {
    const delayMs = parseDuration(step.delay);

    await emailQueue.add(step.template, {
      to: email,
      data: { userId },
    }, {
      delay: delayMs,
      jobId: `drip-${userId}-${step.template}`, // Prevents duplicates
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }
}

// Cancel sequence (e.g., user converted)
export async function cancelDripSequence(userId: string) {
  for (const step of onboardingSequence) {
    const jobId = `drip-${userId}-${step.template}`;
    const job = await emailQueue.getJob(jobId);
    if (job && (await job.isDelayed())) {
      await job.remove();
    }
  }
}

function parseDuration(duration: string): number {
  const num = parseInt(duration);
  if (duration.endsWith('d')) return num * 86400000;
  if (duration.endsWith('h')) return num * 3600000;
  return num * 60000; // default minutes
}
```

---

## Email Webhook Handling

### Resend Webhooks

```typescript
// Handle email delivery events
export async function handleEmailWebhook(event: {
  type: string;
  data: { email_id: string; to: string; created_at: string };
}) {
  switch (event.type) {
    case 'email.delivered':
      await updateEmailStatus(event.data.email_id, 'delivered');
      break;
    case 'email.bounced':
      await updateEmailStatus(event.data.email_id, 'bounced');
      await markEmailAsBounced(event.data.to);
      break;
    case 'email.complained':
      await updateEmailStatus(event.data.email_id, 'complained');
      await unsubscribeEmail(event.data.to);
      break;
    case 'email.opened':
      await updateEmailStatus(event.data.email_id, 'opened');
      break;
    case 'email.clicked':
      await updateEmailStatus(event.data.email_id, 'clicked');
      break;
  }
}
```

### Bounce Handling Best Practices
- **Hard bounce**: Remove email immediately (invalid address)
- **Soft bounce**: Retry 3 times, then suppress for 72 hours
- **Complaint**: Immediately unsubscribe, never email again
- Track bounce rate — suppress sending if > 5%

---

## Email Testing

### Local Development

```bash
# Preview React Email templates
npx react-email dev --dir emails

# Use Resend test API key (emails go to Resend dashboard, not real inboxes)
RESEND_API_KEY=re_test_xxxx
```

### Test Email Addresses

| Provider | Test address | Behavior |
|---|---|---|
| **Resend** | Use test API key | All emails visible in dashboard |
| **SendGrid** | Any + Sandbox mode | No actual delivery |
| **Mailhog** | Any (self-hosted SMTP trap) | Catches all emails locally |

### Mailhog for Local Development

```yaml
# docker-compose.yml
services:
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
```

```typescript
// Use in development
const transport = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  ignoreTLS: true,
});
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| No SPF/DKIM/DMARC | Emails go to spam | Configure DNS records before sending |
| Sending from free email domain | Instant spam | Use custom domain (`@myapp.com`) |
| No bounce handling | Reputation degrades | Track bounces, remove invalid addresses |
| Synchronous email sending | Slow API responses | Use queue (BullMQ) for async sending |
| No email templates | Inconsistent emails | Use React Email for component-based templates |
| Hardcoded email content | Can't iterate on copy | Separate templates from sending logic |
| No unsubscribe link (marketing) | CAN-SPAM / GDPR violation | Always include for marketing emails |
| Skipping domain warmup | High bounce rate on new domain | Gradually increase volume over weeks |
| No rate limiting on emails | Accidentally spam users | Queue with concurrency limits |
| No preview/test mode | Sending broken emails | Use React Email dev server + test API keys |

---

## Pre-Delivery Checklist

- [ ] Email provider API key in environment variables
- [ ] SPF, DKIM, and DMARC DNS records configured
- [ ] Custom sending domain verified
- [ ] Email templates built and previewed (React Email)
- [ ] Queue-based sending for production (not synchronous)
- [ ] Bounce and complaint handling implemented
- [ ] Unsubscribe mechanism for marketing emails
- [ ] Email logging/tracking for debugging
- [ ] Test mode / sandbox for development
- [ ] Rate limiting on email sends
- [ ] User notification preferences respected
- [ ] Critical emails (password reset, verification) send immediately
- [ ] Email content doesn't include sensitive data (passwords, tokens in plain text)
- [ ] Reply-to address is monitored

---

## References

- [Resend Docs](https://resend.com/docs)
- [React Email](https://react.email)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [Postmark Docs](https://postmarkapp.com/developer)
- [AWS SES Docs](https://docs.aws.amazon.com/ses/)
- [BullMQ Docs](https://docs.bullmq.io/)

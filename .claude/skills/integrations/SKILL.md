---
name: integrations
description: >
  Use when the user asks about "webhook", "third-party API", "OAuth app", "Zapier", "n8n",
  "CRM integration", "HubSpot", "Slack bot", "Discord bot", "API integration", "idempotency",
  "retry strategy", "rate limit client", "queue", "BullMQ", "background job",
  or needs third-party integration, webhook, and background job knowledge.
keywords:
  - webhook
  - third-party API
  - OAuth app
  - Zapier
  - n8n
  - CRM integration
  - HubSpot
  - Slack bot
  - Discord bot
  - API integration
  - idempotency
  - retry strategy
  - rate limit client
  - queue
  - BullMQ
  - background job
---

# Third-Party Integrations Skill

Comprehensive guide for building webhooks, integrating third-party APIs, background jobs, and building integration-friendly applications.

---

## Integration Architecture Decision Tree

```
How to connect with external service?
├── They push data to you?
│   └── Webhook receiver (verify signatures, idempotent handler)
├── You push data to them?
│   ├── Real-time needed? → Direct API call (with retry)
│   ├── Can be async? → Queue + worker (BullMQ)
│   └── Bulk/batch? → Queue with batch processing
├── Two-way sync?
│   └── Webhooks (inbound) + Queue (outbound) + Conflict resolution
├── User connects their account?
│   └── OAuth 2.0 flow
└── Expose your app to automation tools?
    └── Zapier / n8n integration (triggers + actions)
```

---

## Webhook Receiving Patterns

### Signature Verification

```typescript
import crypto from 'crypto';

// Generic HMAC signature verification
function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  const expected = crypto
    .createHmac(algorithm, secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### Provider-Specific Verification

| Provider | Header | Algorithm | Notes |
|---|---|---|---|
| **Stripe** | `stripe-signature` | HMAC-SHA256 (custom format) | Use `stripe.webhooks.constructEvent()` |
| **GitHub** | `x-hub-signature-256` | HMAC-SHA256 | Prefix: `sha256=` |
| **Slack** | `x-slack-signature` | HMAC-SHA256 | Includes timestamp in payload |
| **Resend** | `svix-signature` | HMAC-SHA256 (Svix) | Use Svix library |
| **HubSpot** | `x-hubspot-signature-v3` | HMAC-SHA256 | Includes timestamp |

### Complete Webhook Handler Pattern

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';

// Disable body parser for raw access
export const config = { api: { bodyParser: false } };

export default async function webhookHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await buffer(req);

  // 1. Verify signature
  const signature = req.headers['x-webhook-signature'] as string;
  if (!verifyWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(rawBody.toString());

  // 2. Idempotency check
  const eventId = event.id || req.headers['x-event-id'];
  const existing = await db.webhookEvent.findUnique({ where: { eventId } });
  if (existing) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // 3. Process (or queue for async processing)
  try {
    await webhookQueue.add(event.type, { event, eventId }, {
      jobId: eventId, // Prevents duplicate jobs
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    // 4. Record event
    await db.webhookEvent.create({
      data: { eventId, type: event.type, processedAt: new Date() },
    });

    return res.status(200).json({ status: 'accepted' });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Processing failed' });
  }
}
```

### Idempotency Key Pattern

```prisma
model WebhookEvent {
  id          String   @id @default(cuid())
  eventId     String   @unique  // External event ID
  type        String
  processedAt DateTime
  createdAt   DateTime @default(now())

  @@index([createdAt])  // For cleanup
}
```

---

## Webhook Sending Patterns

### Building Your Own Webhook System

```typescript
// Webhook delivery with retries
interface WebhookDelivery {
  id: string;
  url: string;
  event: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: Date | null;
  status: 'pending' | 'delivered' | 'failed';
}

// Sign webhook payload
function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Send webhook
async function deliverWebhook(delivery: WebhookDelivery, secret: string) {
  const body = JSON.stringify(delivery.payload);
  const signature = signPayload(body, secret);
  const timestamp = Math.floor(Date.now() / 1000);

  try {
    const response = await fetch(delivery.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp.toString(),
        'X-Webhook-ID': delivery.id,
      },
      body,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (response.ok) {
      await markDelivered(delivery.id);
    } else {
      await scheduleRetry(delivery);
    }
  } catch (err) {
    await scheduleRetry(delivery);
  }
}
```

### Retry Schedule

| Attempt | Delay | Total elapsed |
|---|---|---|
| 1 | Immediate | 0 |
| 2 | 5 seconds | 5s |
| 3 | 30 seconds | 35s |
| 4 | 5 minutes | ~5.5min |
| 5 | 30 minutes | ~35min |
| 6 | 2 hours | ~2.5hrs |
| 7 | 8 hours | ~10.5hrs |
| 8 | 24 hours | ~34.5hrs |

After all retries fail: mark as failed, notify admin, allow manual retry.

---

## HTTP Client Patterns

### Robust API Client with Retry

```typescript
interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

async function robustFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 10000, retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: AbortSignal.timeout(timeout),
      });

      // Don't retry client errors (4xx), only server errors (5xx) and rate limits
      if (response.ok) return response;

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '5');
        await sleep(retryAfter * 1000);
        continue;
      }

      if (response.status >= 500 && attempt < retries) {
        await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }

      return response; // Return non-retryable error responses
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(retryDelay * Math.pow(2, attempt));
    }
  }

  throw new Error('Max retries exceeded');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}

// Usage
const hubspotBreaker = new CircuitBreaker(5, 60000);

async function getHubSpotContact(id: string) {
  return hubspotBreaker.execute(() =>
    robustFetch(`https://api.hubapi.com/contacts/v1/contact/vid/${id}`, {
      headers: { Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}` },
    })
  );
}
```

---

## Background Job Architecture

### BullMQ Setup

```typescript
// lib/queue.ts
import { Queue, Worker, QueueScheduler } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });

// Define queues
export const emailQueue = new Queue('email', { connection });
export const syncQueue = new Queue('sync', { connection });
export const webhookQueue = new Queue('webhooks', { connection });

// Email worker
const emailWorker = new Worker('email', async (job) => {
  switch (job.name) {
    case 'send-welcome':
      await sendWelcomeEmail(job.data.to, job.data.userName);
      break;
    case 'send-invoice':
      await sendInvoiceEmail(job.data.to, job.data.invoiceId);
      break;
  }
}, {
  connection,
  concurrency: 5,
  limiter: { max: 10, duration: 1000 }, // Rate limit: 10/sec
});

// Error handling
emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
  // Alert if final attempt
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
    alertOps(`Email job ${job.id} permanently failed: ${err.message}`);
  }
});
```

### Job Types and Patterns

| Pattern | Use case | BullMQ feature |
|---|---|---|
| **Immediate** | Send email now | `queue.add('job', data)` |
| **Delayed** | Send reminder in 24h | `queue.add('job', data, { delay: 86400000 })` |
| **Scheduled** | Daily digest at 9am | `queue.add('job', data, { repeat: { cron: '0 9 * * *' } })` |
| **Prioritized** | Critical emails first | `queue.add('job', data, { priority: 1 })` |
| **Rate-limited** | API with rate limits | `limiter: { max: 10, duration: 1000 }` |
| **Unique** | No duplicate jobs | `queue.add('job', data, { jobId: uniqueKey })` |

### Queue Dashboard (Bull Board)

```typescript
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(syncQueue),
    new BullMQAdapter(webhookQueue),
  ],
  serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', authMiddleware, serverAdapter.getRouter());
```

---

## OAuth App Building

### OAuth 2.0 Authorization Code Flow

```
User clicks "Connect to Slack"
         │
    ┌────▼────┐
    │ Redirect │ → Slack authorization page
    │ to /auth │
    └────┬────┘
         │ User approves
    ┌────▼────┐
    │ Callback │ ← Slack redirects with code
    │ /callback│
    └────┬────┘
         │
    ┌────▼────┐
    │ Exchange │ → code for access_token + refresh_token
    │ token    │
    └────┬────┘
         │
    ┌────▼────┐
    │ Store    │ → Encrypted in database
    │ tokens   │
    └─────────┘
```

### Implementation

```typescript
// 1. Initiate OAuth flow
export async function initiateOAuth(userId: string, provider: string) {
  const state = crypto.randomBytes(32).toString('hex');

  // Store state for CSRF protection
  await db.oauthState.create({
    data: { state, userId, provider, expiresAt: addMinutes(new Date(), 10) },
  });

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    redirect_uri: `${process.env.APP_URL}/api/oauth/callback/slack`,
    scope: 'chat:write,channels:read',
    state,
  });

  return `https://slack.com/oauth/v2/authorize?${params}`;
}

// 2. Handle callback
export async function handleOAuthCallback(code: string, state: string) {
  // Verify state (CSRF protection)
  const storedState = await db.oauthState.findUnique({ where: { state } });
  if (!storedState || storedState.expiresAt < new Date()) {
    throw new Error('Invalid or expired state');
  }
  await db.oauthState.delete({ where: { state } });

  // Exchange code for tokens
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.APP_URL}/api/oauth/callback/slack`,
    }),
  });

  const data = await response.json();

  if (!data.ok) throw new Error(`OAuth failed: ${data.error}`);

  // 3. Store tokens (encrypted)
  await db.integration.upsert({
    where: { userId_provider: { userId: storedState.userId, provider: 'slack' } },
    create: {
      userId: storedState.userId,
      provider: 'slack',
      accessToken: encrypt(data.access_token),
      refreshToken: data.refresh_token ? encrypt(data.refresh_token) : null,
      expiresAt: data.expires_in ? addSeconds(new Date(), data.expires_in) : null,
      metadata: { team: data.team, scope: data.scope },
    },
    update: {
      accessToken: encrypt(data.access_token),
      refreshToken: data.refresh_token ? encrypt(data.refresh_token) : null,
      expiresAt: data.expires_in ? addSeconds(new Date(), data.expires_in) : null,
    },
  });
}

// 4. Use tokens (with auto-refresh)
export async function getAccessToken(userId: string, provider: string): Promise<string> {
  const integration = await db.integration.findUnique({
    where: { userId_provider: { userId, provider } },
  });

  if (!integration) throw new Error('Integration not connected');

  // Check if token expired
  if (integration.expiresAt && integration.expiresAt < new Date()) {
    return refreshAccessToken(integration);
  }

  return decrypt(integration.accessToken);
}
```

### Token Storage Schema

```prisma
model Integration {
  id           String    @id @default(cuid())
  userId       String
  provider     String    // "slack", "hubspot", "github"
  accessToken  String    // Encrypted
  refreshToken String?   // Encrypted
  expiresAt    DateTime?
  metadata     Json?     // Provider-specific data
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id])
  @@unique([userId, provider])
}
```

---

## Rate Limit Handling (as API Consumer)

### Strategies

| Strategy | When | Implementation |
|---|---|---|
| **Respect headers** | Provider sends rate limit headers | Check `X-RateLimit-Remaining` |
| **Backoff on 429** | Hit the limit | Exponential backoff with jitter |
| **Pre-emptive queuing** | Known rate limit | BullMQ rate limiter |
| **Caching** | Read-heavy, data doesn't change fast | Cache responses (Redis, in-memory) |

### Rate Limit Aware Client

```typescript
async function rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await robustFetch(url, options);

  // Check rate limit headers
  const remaining = parseInt(response.headers.get('x-ratelimit-remaining') || '999');
  const resetAt = parseInt(response.headers.get('x-ratelimit-reset') || '0');

  if (remaining < 5) {
    // Approaching limit — slow down
    const waitTime = (resetAt * 1000) - Date.now();
    if (waitTime > 0) {
      console.warn(`Rate limit approaching. Waiting ${waitTime}ms`);
      await sleep(waitTime);
    }
  }

  return response;
}
```

---

## Slack / Discord Bot Patterns

### Slack Bot (Web API)

```typescript
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Send a message
async function sendSlackMessage(channel: string, text: string) {
  await slack.chat.postMessage({
    channel,
    text,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text },
      },
    ],
  });
}

// Handle Slack slash command
export async function handleSlashCommand(req: NextApiRequest, res: NextApiResponse) {
  // Verify Slack signature (see webhook verification)
  const { command, text, user_id, channel_id } = req.body;

  switch (command) {
    case '/status':
      const status = await getProjectStatus(text);
      return res.json({
        response_type: 'in_channel',
        text: `Project status: ${status}`,
      });
    default:
      return res.json({ text: 'Unknown command' });
  }
}
```

### Discord Bot (discord.js)

```typescript
import { Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Register slash command
const command = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Get project status')
  .addStringOption(option =>
    option.setName('project').setDescription('Project name').setRequired(true)
  );

// Handle interaction
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'status') {
    const project = interaction.options.getString('project');
    await interaction.deferReply();
    const status = await getProjectStatus(project!);
    await interaction.editReply(`Status for ${project}: ${status}`);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
```

---

## CRM Integration Patterns

### HubSpot Integration

```typescript
import { Client } from '@hubspot/api-client';

const hubspot = new Client({ accessToken: process.env.HUBSPOT_TOKEN });

// Create or update contact
async function upsertHubSpotContact(email: string, properties: Record<string, string>) {
  try {
    // Try to find existing contact
    const existing = await hubspot.crm.contacts.basicApi.getById(email, undefined, undefined, undefined, false, 'email');

    // Update existing
    await hubspot.crm.contacts.basicApi.update(existing.id, { properties });
    return existing.id;
  } catch {
    // Create new
    const contact = await hubspot.crm.contacts.basicApi.create({
      properties: { email, ...properties },
    });
    return contact.id;
  }
}

// Sync strategy: Webhook + periodic reconciliation
// 1. Listen for HubSpot webhooks for real-time updates
// 2. Run nightly sync to catch missed events
async function reconcileContacts() {
  const lastSync = await getLastSyncTimestamp('hubspot');
  const contacts = await hubspot.crm.contacts.basicApi.getPage(100, undefined, [
    'email', 'firstname', 'lastname', 'company',
  ]);

  for (const contact of contacts.results) {
    await syncContactToLocalDB(contact);
  }

  await updateLastSyncTimestamp('hubspot', new Date());
}
```

### Sync Strategies

| Strategy | Latency | Reliability | Complexity |
|---|---|---|---|
| **Webhook only** | Real-time | Can miss events | Low |
| **Polling only** | Minutes-hours | Reliable but slow | Low |
| **Webhook + reconciliation** | Real-time + reliable | Best | Medium |
| **Change Data Capture** | Real-time | Very reliable | High |

---

## Zapier / n8n Integration

### Making Your App Zapier-Compatible

Your app needs to expose:
1. **Triggers** — webhooks that fire when events happen
2. **Actions** — API endpoints that perform operations
3. **Searches** — API endpoints that look up records

```typescript
// API endpoints for Zapier integration

// Trigger: Subscribe to events (Zapier calls this)
// POST /api/integrations/zapier/subscribe
export async function zapierSubscribe(req: Request) {
  const { hookUrl, event } = await req.json();

  const subscription = await db.webhookSubscription.create({
    data: {
      url: hookUrl,
      event, // e.g., "user.created", "invoice.paid"
      provider: 'zapier',
      active: true,
    },
  });

  return { id: subscription.id };
}

// Trigger: Unsubscribe (Zapier calls this on deactivation)
// DELETE /api/integrations/zapier/subscribe/:id
export async function zapierUnsubscribe(req: Request, { params }: { params: { id: string } }) {
  await db.webhookSubscription.delete({ where: { id: params.id } });
  return { success: true };
}

// Action: Create user (Zapier calls this)
// POST /api/integrations/zapier/actions/create-user
export async function zapierCreateUser(req: Request) {
  const { email, name } = await req.json();
  const user = await createUser({ email, name });
  return user;
}

// When events happen in your app, notify all subscribers
async function notifyWebhookSubscribers(event: string, data: Record<string, unknown>) {
  const subscriptions = await db.webhookSubscription.findMany({
    where: { event, active: true },
  });

  for (const sub of subscriptions) {
    await webhookQueue.add('deliver', {
      url: sub.url,
      payload: { event, data, timestamp: new Date().toISOString() },
      subscriptionId: sub.id,
    });
  }
}
```

### n8n Self-Hosted Integration

n8n can use the same webhook/API pattern. Additionally, you can build custom n8n nodes:

```typescript
// n8n custom node (simplified)
export class MyAppTrigger implements INodeType {
  description = {
    displayName: 'MyApp Trigger',
    name: 'myAppTrigger',
    group: ['trigger'],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          { name: 'User Created', value: 'user.created' },
          { name: 'Invoice Paid', value: 'invoice.paid' },
        ],
      },
    ],
  };
}
```

---

## Idempotency Key Patterns

### Client-Side Idempotency

```typescript
// Generate idempotency key for outgoing requests
function generateIdempotencyKey(operation: string, ...args: string[]): string {
  return crypto
    .createHash('sha256')
    .update(`${operation}:${args.join(':')}`)
    .digest('hex');
}

// Use with Stripe
const idempotencyKey = generateIdempotencyKey('create-charge', userId, orderId);
await stripe.paymentIntents.create(
  { amount: 1000, currency: 'usd' },
  { idempotencyKey }
);
```

### Server-Side Idempotency (for your API)

```typescript
// Middleware for idempotent API endpoints
async function idempotencyMiddleware(req: Request, res: Response, next: Function) {
  const key = req.headers['idempotency-key'];
  if (!key) return next();

  // Check if we've already processed this key
  const existing = await db.idempotencyKey.findUnique({ where: { key } });

  if (existing) {
    // Return cached response
    return res.status(existing.statusCode).json(existing.responseBody);
  }

  // Capture the response
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    // Store the response for future replay
    db.idempotencyKey.create({
      data: {
        key,
        statusCode: res.statusCode,
        responseBody: body as any,
        expiresAt: addDays(new Date(), 1),
      },
    }).catch(console.error);

    return originalJson(body);
  };

  next();
}
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| Not verifying webhook signatures | Security vulnerability, spoofed events | Always verify using provider's method |
| No idempotency on webhook handlers | Duplicate processing, double charges | Store processed event IDs |
| Synchronous external API calls in request | Slow responses, timeouts | Queue external calls with BullMQ |
| No timeout on HTTP requests | Hanging connections, resource exhaustion | Set timeout (10s default) |
| Storing OAuth tokens in plaintext | Security breach exposes all integrations | Encrypt tokens at rest |
| No retry on failed webhook delivery | Lost events for consumers | Exponential backoff, up to 8 retries |
| Ignoring rate limit headers | Getting blocked by provider | Respect `Retry-After` and `X-RateLimit-*` |
| No circuit breaker | Cascade failures when service is down | Implement circuit breaker pattern |
| Missing CSRF on OAuth flow | Authorization code injection | Use `state` parameter |
| No token refresh logic | Integration breaks when token expires | Auto-refresh before expiry |

---

## Pre-Delivery Checklist

- [ ] Webhook signatures verified for all incoming webhooks
- [ ] Webhook handlers are idempotent (check processed event IDs)
- [ ] Background jobs use BullMQ (not synchronous in request)
- [ ] HTTP client has timeout, retry, and error handling
- [ ] OAuth tokens stored encrypted
- [ ] OAuth flow uses `state` parameter for CSRF protection
- [ ] Token refresh logic implemented for OAuth integrations
- [ ] Rate limits respected (backoff on 429, check headers)
- [ ] Circuit breaker for external service calls
- [ ] Dead letter queue for permanently failed jobs
- [ ] Job dashboard accessible for monitoring (Bull Board)
- [ ] Webhook endpoints return 200 quickly (process async)
- [ ] Retry schedule documented for outgoing webhooks
- [ ] Integration disconnect / revoke flow implemented
- [ ] External API failures don't crash the application

---

## References

- [BullMQ Docs](https://docs.bullmq.io/)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Slack API](https://api.slack.com/)
- [Discord.js](https://discord.js.org/)
- [HubSpot API](https://developers.hubspot.com/docs/api)
- [Zapier Platform](https://platform.zapier.com/)
- [n8n Docs](https://docs.n8n.io/)
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)

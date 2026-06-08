---
name: analytics
description: >
  Use when the user asks about "analytics", "PostHog", "Mixpanel", "Google Analytics", "event tracking",
  "conversion funnel", "A/B testing", "feature flag", "LaunchDarkly", "Statsig", "user segmentation",
  "metrics", "KPI", "tracking plan", "product analytics", "experiment",
  or needs analytics, experimentation, and feature flag knowledge.
keywords:
  - analytics
  - PostHog
  - Mixpanel
  - Google Analytics
  - event tracking
  - conversion funnel
  - A/B testing
  - feature flag
  - LaunchDarkly
  - Statsig
  - user segmentation
  - metrics
  - KPI
  - tracking plan
  - product analytics
  - experiment
---

# Analytics & Feature Flags Skill

Comprehensive guide for implementing product analytics, event tracking, A/B testing, and feature flags in web applications.

---

## Analytics Tool Decision Tree

```
What do you need?
├── Full product analytics + session replay + feature flags?
│   └── PostHog (open-source, self-hostable, all-in-one)
├── Advanced product analytics + deep funnels?
│   └── Mixpanel (best funnel/retention analysis)
├── Website traffic analytics only?
│   ├── Need Google Ads integration? → GA4
│   └── Privacy-first, simple? → Plausible or Fathom
├── Feature flags only?
│   ├── Enterprise scale + targeting? → LaunchDarkly
│   ├── Stats + experimentation? → Statsig
│   └── Bundled with analytics? → PostHog
└── A/B testing only?
    ├── Visual editor + no-code? → VWO or Optimizely
    └── Code-based + stats? → Statsig or PostHog
```

| Tool | Type | Self-host | Free tier | Best for |
|---|---|---|---|---|
| **PostHog** | All-in-one | Yes | 1M events/mo | Startups wanting one tool |
| **Mixpanel** | Product analytics | No | 20M events/mo | Deep behavioral analysis |
| **GA4** | Web analytics | No | Unlimited | Traffic + marketing attribution |
| **Plausible** | Web analytics | Yes | None (paid) | Privacy-first simple analytics |
| **LaunchDarkly** | Feature flags | No | Limited | Enterprise feature management |
| **Statsig** | Flags + experiments | No | 1M events/mo | Data-driven experimentation |

---

## Event Tracking Architecture

### Event Naming Convention

Use a consistent `object_action` or `noun_verb` pattern:

```
✅ Good                    ❌ Bad
──────────────────────────────────────────
user_signed_up             signup
page_viewed                pageview
button_clicked             click
subscription_created       new sub
invoice_paid               payment
feature_used               used_feature
onboarding_completed       done onboarding
```

### Event Taxonomy

| Category | Events | Key Properties |
|---|---|---|
| **Identity** | `user_signed_up`, `user_logged_in` | method, referral_source |
| **Activation** | `onboarding_started`, `onboarding_completed` | step, time_to_complete |
| **Engagement** | `feature_used`, `page_viewed` | feature_name, page_path |
| **Conversion** | `subscription_created`, `checkout_started` | plan, price, currency |
| **Retention** | `session_started`, `daily_active` | days_since_signup |
| **Revenue** | `invoice_paid`, `subscription_upgraded` | amount, plan_from, plan_to |

---

## Tracking Plan Template

| Event Name | Trigger | Properties | Owner | Status |
|---|---|---|---|---|
| `user_signed_up` | After successful registration | `method: string, referral: string` | Auth team | Active |
| `onboarding_step_completed` | Each onboarding step done | `step: number, step_name: string` | Growth team | Active |
| `feature_used` | User interacts with feature | `feature: string, context: string` | Product team | Active |
| `subscription_created` | After successful payment | `plan: string, price: number, trial: boolean` | Billing team | Active |
| `page_viewed` | Route change | `path: string, referrer: string` | Engineering | Active |

---

## Implementation Patterns

### PostHog Setup (React / Next.js)

```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window === 'undefined') return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // Manual pageviews for SPA
    capture_pageleave: true,
  });
}

// Identify user after login
export function identifyUser(userId: string, traits: Record<string, unknown>) {
  posthog.identify(userId, traits);
}

// Track event
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}

// Reset on logout
export function resetAnalytics() {
  posthog.reset();
}
```

```tsx
// app/providers.tsx (Next.js App Router)
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, trackEvent } from '@/lib/posthog';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    trackEvent('page_viewed', { path: pathname });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

### Server-Side Tracking (API Routes)

```typescript
// lib/analytics-server.ts
import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST,
});

export function trackServerEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  posthog.capture({
    distinctId: userId,
    event,
    properties,
  });
}

// Flush before serverless function exits
export async function flushAnalytics() {
  await posthog.shutdown();
}
```

### Client vs Server Tracking Decision

| Track on... | When | Examples |
|---|---|---|
| **Client** | UI interactions, page views, clicks | `button_clicked`, `page_viewed` |
| **Server** | Business events, reliable tracking | `subscription_created`, `invoice_paid` |
| **Both** | Conversion with UI context | `checkout_started` (client) → `checkout_completed` (server) |

---

## Conversion Funnel Setup

### Define Your Funnel

```
Landing Page → Sign Up → Onboarding → Feature Used → Subscription
   100%          30%        20%           12%             5%
```

### Implementation

```typescript
// Track each funnel step
trackEvent('landing_page_viewed', { variant: 'a' });
trackEvent('signup_form_started');
trackEvent('user_signed_up', { method: 'email' });
trackEvent('onboarding_step_completed', { step: 1, step_name: 'profile' });
trackEvent('onboarding_completed', { time_to_complete: 120 });
trackEvent('feature_used', { feature: 'dashboard' });
trackEvent('checkout_started', { plan: 'pro' });
trackEvent('subscription_created', { plan: 'pro', price: 29 });
```

---

## A/B Testing Workflow

### Process

```
1. Hypothesis → "Changing CTA color to green will increase signups by 10%"
2. Metric     → signup_rate (signups / landing_page_views)
3. Experiment → Create A/B test with variants
4. Run        → Wait for statistical significance (usually 1-2 weeks)
5. Analyze    → Check results, segment by user type
6. Ship       → Roll out winner to 100%
```

### PostHog Experiment Example

```typescript
// Check experiment variant
import posthog from 'posthog-js';

function SignupButton() {
  const variant = posthog.getFeatureFlag('signup-cta-experiment');
  // variant: 'control' | 'green-cta' | false (not in experiment)

  return (
    <button
      className={variant === 'green-cta' ? 'bg-green-500' : 'bg-blue-500'}
      onClick={() => trackEvent('signup_cta_clicked', { variant })}
    >
      {variant === 'green-cta' ? 'Start Free Trial' : 'Sign Up'}
    </button>
  );
}
```

### Experiment Sizing Quick Reference

| Daily traffic | Minimum detectable effect | Approx. runtime |
|---|---|---|
| 100 visitors/day | 20%+ | 2-4 weeks |
| 1,000 visitors/day | 5-10% | 1-2 weeks |
| 10,000 visitors/day | 2-5% | 3-7 days |

**Rule of thumb**: Need ~400 conversions per variant for 80% statistical power with a 5% minimum detectable effect.

---

## Feature Flag Patterns

### Boolean Flag (Kill Switch / Gradual Rollout)

```typescript
// Check flag
if (posthog.isFeatureEnabled('new-dashboard')) {
  return <NewDashboard />;
}
return <OldDashboard />;
```

### Multivariate Flag

```typescript
const variant = posthog.getFeatureFlag('pricing-page');

switch (variant) {
  case 'monthly-first':
    return <PricingMonthlyFirst />;
  case 'annual-first':
    return <PricingAnnualFirst />;
  default:
    return <PricingDefault />;
}
```

### Server-Side Feature Flag

```typescript
import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY!);

export async function getFeatureFlag(userId: string, flag: string) {
  const isEnabled = await posthog.isFeatureEnabled(flag, userId);
  return isEnabled;
}

// With properties for targeting
const isEnabled = await posthog.isFeatureEnabled('beta-feature', userId, {
  personProperties: { plan: 'enterprise', company_size: 500 },
});
```

### Feature Flag Tool Comparison

| Tool | Flags | Experiments | Analytics | Pricing |
|---|---|---|---|---|
| **PostHog** | Yes | Yes | Yes (built-in) | Free to 1M events |
| **LaunchDarkly** | Best-in-class | Limited | No | $$$ (enterprise) |
| **Statsig** | Yes | Best-in-class | Basic | Free to 1M events |
| **Unleash** | Yes | Basic | No | Open-source |

---

## User Segmentation and Cohorts

### Setting User Properties

```typescript
// Set user properties for segmentation
posthog.identify(userId, {
  plan: 'pro',
  company_size: 50,
  industry: 'saas',
  signup_date: '2024-01-15',
  role: 'admin',
});

// Set group (company-level analytics)
posthog.group('company', companyId, {
  name: 'Acme Inc',
  plan: 'enterprise',
  employee_count: 500,
});
```

### Useful Segments

| Segment | Definition | Use for |
|---|---|---|
| **Power users** | >10 sessions in 7 days | Feature adoption, beta testing |
| **At-risk** | No login in 14 days, active last month | Churn prevention |
| **New users** | Signed up < 7 days ago | Onboarding optimization |
| **Converted** | Has active subscription | Revenue analysis |
| **Enterprise** | Company size > 100 | Sales-led features |

---

## Privacy-Compliant Tracking

### Consent Implementation

```typescript
// Check consent before tracking
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  const consent = getConsentStatus(); // from cookie/localStorage

  if (consent === 'granted') {
    posthog.capture(event, properties);
  } else if (consent === 'anonymous') {
    // Track without PII
    posthog.capture(event, {
      ...properties,
      $process_person_profile: false,
    });
  }
  // If 'denied', don't track at all
}

// Opt out completely
posthog.opt_out_capturing();

// Opt back in
posthog.opt_in_capturing();
```

### Privacy Checklist
- Respect Do Not Track (DNT) header
- Implement consent banner before tracking
- Anonymize IP addresses
- Don't track PII in event properties
- Provide opt-out mechanism
- Document data retention policies
- See **compliance** skill for GDPR/CCPA details

---

## Key SaaS Metrics Reference

| Metric | Formula | Good benchmark |
|---|---|---|
| **MRR** | Sum of all monthly subscription revenue | Growing 10%+ MoM early stage |
| **ARR** | MRR × 12 | - |
| **Churn rate** | Lost customers / Start customers × 100 | <5% monthly, <10% annual |
| **Revenue churn** | Lost MRR / Start MRR × 100 | <2% monthly |
| **Net revenue retention** | (Start MRR + expansion − contraction − churn) / Start MRR | >100% (good), >120% (great) |
| **LTV** | ARPU / Churn rate | >3× CAC |
| **CAC** | Total acquisition cost / New customers | <1/3 LTV |
| **LTV:CAC ratio** | LTV / CAC | >3:1 |
| **Activation rate** | Users completing key action / Total signups | >25% |
| **Time to value** | Time from signup to "aha moment" | As short as possible |
| **DAU/MAU ratio** | Daily active / Monthly active | >20% (good), >50% (great) |

---

## Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| No tracking plan | Inconsistent events, missing data | Create a tracking plan before implementing |
| Tracking everything | Noise, slow queries, high costs | Track actions that map to business questions |
| Inconsistent event names | Can't query across features | Use strict `object_action` naming convention |
| Not identifying users | Can't track across sessions | Call `identify()` after login |
| Client-only tracking | Adblockers miss 15-30% of events | Use server-side for business-critical events |
| No consent management | GDPR/CCPA violations | Implement consent before tracking |
| Feature flags without cleanup | Tech debt, confusing code | Set expiration dates, remove old flags |
| Not segmenting experiment results | Missing insights | Always check results by user segment |
| Vanity metrics only | No actionable insights | Focus on activation, retention, revenue |
| Not flushing server-side | Lost events in serverless | Call `posthog.shutdown()` before exit |

---

## Pre-Delivery Checklist

- [ ] Tracking plan documented (event names, properties, owners)
- [ ] Event naming follows consistent convention
- [ ] User identification set up (identify on login, reset on logout)
- [ ] Page view tracking works for SPA navigation
- [ ] Server-side tracking for business-critical events
- [ ] Analytics flushes properly in serverless environments
- [ ] Consent management implemented before tracking
- [ ] Feature flags have cleanup/expiration plan
- [ ] Key funnels defined and instrumented
- [ ] User properties set for segmentation
- [ ] No PII in event properties
- [ ] Analytics works with ad blockers (server-side fallback or proxy)
- [ ] Dashboard created for key metrics
- [ ] Team has access to analytics tool

---

## References

- [PostHog Docs](https://posthog.com/docs)
- [Mixpanel Docs](https://docs.mixpanel.com/)
- [GA4 Docs](https://developers.google.com/analytics)
- [LaunchDarkly Docs](https://docs.launchdarkly.com/)
- [Statsig Docs](https://docs.statsig.com/)

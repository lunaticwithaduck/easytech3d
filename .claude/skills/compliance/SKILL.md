---
name: compliance
description: >
  Use when the user asks about "GDPR", "CCPA", "cookie consent", "privacy policy",
  "terms of service", "data retention", "data deletion", "right to be forgotten", "DPA",
  "SOC 2", "HIPAA", "accessibility compliance", "ADA", "EAA", "audit log",
  "data processing", "consent management",
  or needs legal compliance, privacy, and data protection knowledge.
keywords:
  - GDPR
  - CCPA
  - cookie consent
  - privacy policy
  - terms of service
  - data retention
  - data deletion
  - right to be forgotten
  - DPA
  - SOC 2
  - HIPAA
  - accessibility compliance
  - ADA
  - EAA
  - audit log
  - data processing
  - consent management
---

# Legal & Compliance Skill

Comprehensive guide for implementing privacy, data protection, and regulatory compliance in web applications. **Not legal advice** — always consult a qualified attorney for your specific situation.

---

## Compliance Requirements Decision Tree

```
Where are your users?
├── EU / UK users?
│   └── GDPR applies
│       ├── Processing personal data? → Need lawful basis
│       ├── Using cookies? → Need cookie consent
│       └── Using sub-processors? → Need DPA
├── California users?
│   └── CCPA/CPRA likely applies (if revenue > $25M or data on 100K+ consumers)
├── US healthcare data?
│   └── HIPAA applies
├── Children under 13?
│   └── COPPA applies
└── All users everywhere?
    ├── Need Privacy Policy → Always
    ├── Need Terms of Service → Always
    └── Need Cookie Banner → If using non-essential cookies
```

```
What compliance framework do you need?
├── SaaS selling to enterprises?
│   └── SOC 2 Type II (most requested)
├── Healthcare / health data?
│   └── HIPAA + BAA
├── Payment processing?
│   └── PCI DSS (see payments skill)
├── Government contracts?
│   └── FedRAMP
└── General web app?
    └── GDPR + CCPA + basic security practices
```

---

## GDPR Requirements Checklist

### Lawful Basis for Processing

| Basis | When to use | Example |
|---|---|---|
| **Consent** | User explicitly agrees | Marketing emails, analytics cookies |
| **Contract** | Needed to fulfill a service | Processing payment, account creation |
| **Legitimate interest** | Reasonable business need | Fraud prevention, basic analytics |
| **Legal obligation** | Required by law | Tax records, regulatory reporting |

### Rights of Data Subjects (Must Implement)

| Right | Description | Implementation |
|---|---|---|
| **Access** | User can request their data | Export endpoint returning user data as JSON/CSV |
| **Rectification** | User can correct their data | Account settings edit page |
| **Erasure** | "Right to be forgotten" | Account deletion with cascade |
| **Portability** | User gets data in machine-readable format | JSON/CSV export of all user data |
| **Restriction** | User limits processing | Flag account, stop non-essential processing |
| **Object** | User objects to processing | Opt-out of specific processing (e.g., analytics) |

### Key Requirements Summary

- [ ] **Lawful basis** documented for each data processing activity
- [ ] **Privacy policy** that's clear and accessible
- [ ] **Cookie consent** with opt-in (not pre-checked)
- [ ] **Data Processing Agreements** with all sub-processors
- [ ] **Data breach notification** within 72 hours to supervisory authority
- [ ] **Data Protection Officer** (if large-scale processing)
- [ ] **Records of processing activities** maintained
- [ ] **Privacy Impact Assessment** for high-risk processing
- [ ] All data subject rights are implementable

---

## CCPA / CPRA Requirements Summary

**Applies if**: Annual revenue > $25M, OR data on 100K+ consumers, OR 50%+ revenue from selling data.

| Requirement | Description |
|---|---|
| **Right to Know** | Disclose what data is collected and why |
| **Right to Delete** | Delete personal information on request |
| **Right to Opt-Out** | "Do Not Sell My Personal Information" link |
| **Right to Non-Discrimination** | Can't penalize users for exercising rights |
| **Right to Correct** | Allow correction of inaccurate data |
| **Notice at Collection** | Inform at or before data collection |

### "Do Not Sell" Implementation

```tsx
// Footer link required by CCPA
<a href="/privacy/do-not-sell">Do Not Sell or Share My Personal Information</a>

// Respect Global Privacy Control (GPC) header
function checkGPC(): boolean {
  if (typeof navigator !== 'undefined') {
    return (navigator as any).globalPrivacyControl === true;
  }
  return false;
}

// If GPC is set, treat as opt-out of sale/sharing
if (checkGPC()) {
  disableThirdPartyTracking();
}
```

---

## Cookie Consent Implementation

### Cookie Categories

| Category | Requires consent | Examples |
|---|---|---|
| **Strictly necessary** | No | Session cookies, CSRF tokens, auth |
| **Functional** | Yes (GDPR) | Language preference, theme |
| **Analytics** | Yes | Google Analytics, PostHog |
| **Marketing** | Yes | Facebook Pixel, ad retargeting |

### Cookie Banner Implementation

```tsx
// components/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: true; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_KEY = 'cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setShowBanner(true);
  }, []);

  function acceptAll() {
    saveConsent({ necessary: true, functional: true, analytics: true, marketing: true });
  }

  function rejectAll() {
    saveConsent({ necessary: true, functional: false, analytics: false, marketing: false });
  }

  function saveConsent(prefs: CookiePreferences) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    setShowBanner(false);
    applyConsent(prefs);
  }

  if (!showBanner) return null;

  return (
    <div role="dialog" aria-label="Cookie consent" className="cookie-banner">
      <p>We use cookies to improve your experience. You can customize your preferences.</p>
      <div>
        <button onClick={rejectAll}>Reject All</button>
        <button onClick={() => { /* open preferences modal */ }}>Customize</button>
        <button onClick={acceptAll}>Accept All</button>
      </div>
    </div>
  );
}

function applyConsent(prefs: CookiePreferences) {
  if (prefs.analytics) {
    // Initialize analytics (PostHog, GA, etc.)
  }
  if (prefs.marketing) {
    // Initialize marketing pixels
  }
}

// Helper to check consent status
export function getConsentStatus(): CookiePreferences {
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) return { necessary: true, functional: false, analytics: false, marketing: false };
  return JSON.parse(stored);
}
```

### GDPR Cookie Rules
- **No pre-checked boxes** — consent must be affirmative action
- **Reject must be as easy as Accept** — equal prominence
- **Granular choices** — users can accept some categories, reject others
- **Revocable** — users can change preferences later
- **No cookie walls** — don't block content for refusing cookies (debated)

---

## Privacy Policy Essentials

### What to Include

```markdown
1. **Who we are** — Company name, contact, DPO (if applicable)
2. **What data we collect** — List all personal data types
3. **Why we collect it** — Lawful basis for each
4. **How we use it** — Specific purposes
5. **Who we share it with** — Sub-processors list
6. **Where we store it** — Data location (EU/US)
7. **How long we keep it** — Retention periods
8. **Your rights** — Access, deletion, portability, etc.
9. **Cookies** — What cookies and why
10. **Updates** — How we notify of changes
11. **Contact** — How to reach us for data requests
```

### Generator Tools
- **Termly** — Generates GDPR/CCPA-compliant policies
- **Iubenda** — Generates policies + cookie consent
- **Privacy Policy generators** — Starting point, always have a lawyer review

---

## Terms of Service Essentials

### Key Sections

| Section | Purpose |
|---|---|
| **Acceptance** | Using the service = agreeing to terms |
| **Account responsibility** | User is responsible for their account |
| **Acceptable use** | What users can't do |
| **Intellectual property** | Who owns what |
| **Payment terms** | Billing, refunds, cancellation |
| **Limitation of liability** | Cap on damages |
| **Termination** | When you can terminate accounts |
| **Dispute resolution** | Arbitration, governing law |
| **Changes to terms** | How you notify users of changes |

---

## Data Subject Rights Implementation

### Account Data Export (Right to Access / Portability)

```typescript
// api/user/export.ts
export async function exportUserData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      subscriptions: true,
      notifications: true,
      activityLogs: true,
    },
  });

  if (!user) throw new Error('User not found');

  // Return structured, machine-readable format
  return {
    exportDate: new Date().toISOString(),
    user: {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    profile: user.profile,
    subscriptions: user.subscriptions.map(s => ({
      plan: s.plan,
      status: s.status,
      startDate: s.createdAt,
    })),
    activity: user.activityLogs,
  };
}
```

### Account Deletion (Right to Erasure)

```typescript
// api/user/delete.ts
export async function deleteUserAccount(userId: string) {
  // 1. Cancel active subscriptions
  await cancelSubscriptions(userId);

  // 2. Delete user data (cascade or manual)
  await db.$transaction([
    db.notification.deleteMany({ where: { userId } }),
    db.activityLog.deleteMany({ where: { userId } }),
    db.session.deleteMany({ where: { userId } }),
    db.subscription.deleteMany({ where: { userId } }),
    db.profile.deleteMany({ where: { userId } }),
    db.user.delete({ where: { id: userId } }),
  ]);

  // 3. Delete from external services
  await deleteFromAnalytics(userId);
  await deleteFromEmailProvider(userId);
  await deleteFromPaymentProvider(userId);

  // 4. Log the deletion (retain minimal audit record)
  await db.auditLog.create({
    data: {
      action: 'ACCOUNT_DELETED',
      entityType: 'USER',
      entityId: userId,
      timestamp: new Date(),
      // Do NOT log PII here
    },
  });
}
```

### Deletion Exceptions
- **Legal obligations**: Tax records (retain 7 years in most jurisdictions)
- **Fraud prevention**: Hashed email for ban enforcement
- **Audit logs**: Keep anonymized records

---

## Data Retention Policy

### Retention Schedule Template

| Data type | Retention period | Basis | Deletion method |
|---|---|---|---|
| User account data | Until account deletion | Contract | Full delete |
| Authentication logs | 90 days | Legitimate interest | Auto-purge |
| Payment records | 7 years | Legal obligation (tax) | Archive, then delete |
| Support tickets | 2 years | Legitimate interest | Anonymize |
| Analytics events | 1 year | Consent | Auto-purge |
| Server logs | 30 days | Legitimate interest | Auto-purge |
| Backups | 30 days | Legitimate interest | Rotation |

### Auto-Purge Implementation

```typescript
// Scheduled job (daily cron)
export async function purgeExpiredData() {
  const now = new Date();

  // Purge old authentication logs (90 days)
  await db.authLog.deleteMany({
    where: { createdAt: { lt: subDays(now, 90) } },
  });

  // Purge old analytics (1 year)
  await db.analyticsEvent.deleteMany({
    where: { createdAt: { lt: subYears(now, 1) } },
  });

  // Anonymize old support tickets (2 years)
  await db.supportTicket.updateMany({
    where: { createdAt: { lt: subYears(now, 2) }, anonymized: false },
    data: { userEmail: 'anonymized', userName: 'anonymized', anonymized: true },
  });
}
```

---

## Audit Logging

### Audit Log Schema

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?  // null for system actions
  action      String   // CREATE, UPDATE, DELETE, LOGIN, EXPORT, etc.
  entityType  String   // USER, SUBSCRIPTION, SETTINGS, etc.
  entityId    String
  changes     Json?    // { field: { old: x, new: y } }
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())

  @@index([userId, timestamp])
  @@index([entityType, entityId])
  @@index([action, timestamp])
}
```

### Audit Log Implementation

```typescript
export async function createAuditLog(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  request?: Request;
}) {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      changes: params.changes ?? undefined,
      ipAddress: params.request?.headers.get('x-forwarded-for') ?? undefined,
      userAgent: params.request?.headers.get('user-agent') ?? undefined,
    },
  });
}

// Usage
await createAuditLog({
  userId: currentUser.id,
  action: 'UPDATE',
  entityType: 'USER',
  entityId: targetUser.id,
  changes: { role: { old: 'member', new: 'admin' } },
  request: req,
});
```

### What to Log

| Action | Entity | Log |
|---|---|---|
| Login / Logout | User | IP, user agent, success/failure |
| Role change | User | Old role → new role |
| Data export | User | Who requested, what was exported |
| Data deletion | User | Who requested, confirmation |
| Settings change | Settings | Old value → new value |
| Billing change | Subscription | Plan change, cancellation |
| Admin action | Any | All admin operations |

---

## SOC 2 Basics

### What is SOC 2?

SOC 2 is a compliance framework for SaaS companies based on 5 Trust Service Criteria:

| Criteria | Description | Required? |
|---|---|---|
| **Security** | Protection against unauthorized access | Always (mandatory) |
| **Availability** | System is available for operation | Common |
| **Processing Integrity** | Processing is complete and accurate | Less common |
| **Confidentiality** | Data is protected | Common |
| **Privacy** | Personal info handled properly | If processing PII |

### Type I vs Type II

| Type | What | Timeline | Cost |
|---|---|---|---|
| **Type I** | Controls are designed properly (point in time) | 1-3 months | $20-50K |
| **Type II** | Controls operate effectively (over time) | 6-12 months observation | $30-100K |

### Key Controls to Implement

- [ ] Access control (RBAC, MFA for team)
- [ ] Encryption at rest and in transit
- [ ] Audit logging
- [ ] Incident response plan
- [ ] Vulnerability management (patching, scanning)
- [ ] Change management (PR reviews, CI/CD)
- [ ] Employee security training
- [ ] Vendor management
- [ ] Backup and recovery
- [ ] Monitoring and alerting

### SOC 2 Tools

| Tool | Purpose |
|---|---|
| **Vanta** | Compliance automation, evidence collection |
| **Drata** | Compliance monitoring, policy management |
| **Secureframe** | SOC 2 readiness, control management |

---

## Accessibility Compliance

### Requirements by Region

| Standard | Region | Level | Applies to |
|---|---|---|---|
| **WCAG 2.2 Level AA** | Global standard | AA | All web apps |
| **ADA** | United States | - | Public accommodations |
| **EAA** | EU (from June 2025) | AA | Digital products/services |
| **Section 508** | US Government | AA | Federal agencies and contractors |

For detailed accessibility implementation patterns, see the **frontend** skill.

### Quick Compliance Checklist
- [ ] All images have alt text
- [ ] Keyboard navigation works throughout
- [ ] Color contrast meets AA ratio (4.5:1 text, 3:1 large text)
- [ ] Form fields have labels
- [ ] Focus indicators are visible
- [ ] Screen reader compatible (semantic HTML, ARIA where needed)
- [ ] No content flashes more than 3 times per second
- [ ] Error messages are descriptive and associated with fields

---

## Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| No cookie consent banner | GDPR fine (up to 4% of revenue) | Implement consent before any non-essential cookies |
| Pre-checked consent boxes | Invalid consent under GDPR | Consent must be affirmative opt-in |
| No data deletion flow | Can't fulfill erasure requests | Build account deletion with cascade |
| Storing data without purpose | Violation of data minimization | Document purpose for every data field |
| No sub-processor list | GDPR Article 28 violation | Maintain and publish list of sub-processors |
| Ignoring breach notification | Must notify within 72 hours (GDPR) | Have incident response plan ready |
| Privacy policy copy-paste | Doesn't reflect actual practices | Customize to your actual data processing |
| No audit logs | Can't demonstrate compliance | Log all significant actions |
| Indefinite data retention | Violates storage limitation | Set retention periods, auto-purge |
| Missing "Do Not Sell" link | CCPA violation | Add to footer if CCPA applies |

---

## Pre-Delivery Checklist

- [ ] Privacy policy published and accessible from every page
- [ ] Terms of service published and accepted at signup
- [ ] Cookie consent banner implemented with opt-in
- [ ] Cookie categories properly classified
- [ ] Data export (Right to Access) endpoint works
- [ ] Account deletion (Right to Erasure) fully cascades
- [ ] Data retention periods defined and auto-purge scheduled
- [ ] Audit logging implemented for sensitive actions
- [ ] Sub-processor list maintained
- [ ] CCPA "Do Not Sell" link in footer (if applicable)
- [ ] Global Privacy Control (GPC) header respected
- [ ] Consent records stored (proof of consent)
- [ ] Data encryption at rest and in transit
- [ ] Incident response plan documented
- [ ] Accessibility basics met (WCAG 2.2 Level AA)
- [ ] **Legal review completed** (not just generated policies)

---

## References

- [GDPR Official Text](https://gdpr-info.eu/)
- [CCPA Official Text](https://oag.ca.gov/privacy/ccpa)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [SOC 2 Overview (AICPA)](https://www.aicpa.org/soc)
- [Vanta](https://www.vanta.com/)
- [Termly (Policy Generator)](https://termly.io/)

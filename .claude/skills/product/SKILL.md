---
name: product
description: >
  Use when the user asks about "user story", "acceptance criteria", "PRD", "product requirements",
  "roadmap", "sprint planning", "estimation", "prioritization", "RICE", "MoSCoW", "MVP",
  "agile", "scrum", "kanban", "backlog", "retrospective", "stakeholder",
  or needs product management and agile methodology knowledge.
keywords:
  - user story
  - acceptance criteria
  - PRD
  - product requirements
  - roadmap
  - sprint planning
  - estimation
  - prioritization
  - RICE
  - MoSCoW
  - MVP
  - agile
  - scrum
  - kanban
  - backlog
  - retrospective
  - stakeholder
---

# Product Management & Agile Skill

Comprehensive guide for product management practices, agile methodologies, and project planning for software teams.

---

## Methodology Decision Tree

```
What's your team like?
├── Small team (2-5), fast-moving, continuous delivery?
│   └── Kanban (flow-based, no sprints)
├── Team of 5-9, regular releases, needs structure?
│   └── Scrum (sprints, ceremonies, roles)
├── Small team, 6-week cycles, appetite-based?
│   └── Shape Up (Basecamp method)
├── Large org, multiple teams?
│   ├── Need coordination? → Scrum with scaled framework (LeSS, SAFe)
│   └── Teams are independent? → Kanban per team
└── Solo developer or pair?
    └── Personal Kanban or simple task list
```

| Methodology | Cadence | Key concepts | Best for |
|---|---|---|---|
| **Scrum** | 1-2 week sprints | Sprint backlog, ceremonies, roles | Teams needing rhythm and predictability |
| **Kanban** | Continuous | WIP limits, pull-based, flow metrics | Maintenance, support, continuous delivery |
| **Shape Up** | 6-week cycles | Shaping, betting, appetite | Product-driven teams, small orgs |
| **XP** | 1-2 week iterations | Pair programming, TDD, CI | Engineering-heavy teams |

---

## User Story Format and Examples

### Format

```
As a [type of user],
I want [goal/desire],
So that [benefit/reason].
```

### Good Examples

```
As a team admin,
I want to invite members by email,
So that I can quickly onboard my team.

As a billing manager,
I want to download PDF invoices for past payments,
So that I can submit them for expense reimbursement.

As a new user,
I want to see a guided tour on first login,
So that I understand how to use the key features.
```

### Story Sizing Guidance

| Size | Complexity | Example |
|---|---|---|
| **XS** | Config change, copy update | Change button text |
| **S** | Single component, clear scope | Add tooltip to icon |
| **M** | Feature with 2-3 components | Build settings form |
| **L** | Multi-component, API + UI | Implement team invitations |
| **XL** | Should be broken down | Full auth system — split into stories |

---

## Acceptance Criteria Patterns

### Given/When/Then (Gherkin)

```gherkin
Feature: Team member invitation

Scenario: Admin invites a new member
  Given I am logged in as a team admin
  When I enter a valid email address and click "Send Invite"
  Then the invitee receives an invitation email
  And a pending invitation appears in the team members list

Scenario: Invitee accepts invitation
  Given I received a team invitation email
  When I click the invitation link
  Then I am added to the team with "member" role
  And I see the team dashboard

Scenario: Admin invites existing member
  Given I am logged in as a team admin
  When I enter an email of an existing team member
  Then I see an error message "This user is already a team member"
  And no duplicate invitation is sent
```

### Checklist Format (simpler)

```markdown
### Acceptance Criteria
- [ ] Email invitation is sent with correct team name and inviter name
- [ ] Invitation link expires after 7 days
- [ ] Existing team members cannot be re-invited
- [ ] Pending invitations are visible to admins
- [ ] Invitee can accept or decline the invitation
- [ ] Rate limit: max 10 invitations per hour per team
```

---

## PRD Template Structure

```markdown
# PRD: [Feature Name]

## Overview
One paragraph describing what we're building and why.

## Problem Statement
- What problem does this solve?
- Who experiences this problem?
- How are they solving it today?

## Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| Increase activation | % users completing onboarding | 40% → 60% |
| Reduce support tickets | Tickets about X per week | 50 → 10 |

## User Stories
1. As a [user], I want [goal] so that [benefit]
2. ...

## Scope
### In Scope
- Feature A
- Feature B

### Out of Scope
- Feature C (future consideration)

## Design
[Link to Figma / wireframes]

## Technical Considerations
- API changes needed
- Database schema changes
- Third-party integrations
- Performance implications

## Milestones
| Milestone | Description | Target Date |
|-----------|-------------|-------------|
| M1 | Core API + basic UI | Week 1 |
| M2 | Full UI + edge cases | Week 2 |
| M3 | Testing + polish | Week 3 |

## Open Questions
- [ ] Question 1
- [ ] Question 2

## Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Third-party API instability | Medium | High | Build retry logic + fallback |
```

---

## Prioritization Frameworks

### RICE Score

```
RICE = (Reach × Impact × Confidence) / Effort
```

| Factor | Scale | Description |
|---|---|---|
| **Reach** | # of users/quarter | How many users will this affect? |
| **Impact** | 0.25, 0.5, 1, 2, 3 | How much will it move the metric? (3 = massive) |
| **Confidence** | 50%-100% | How sure are we? |
| **Effort** | Person-weeks | How much work? |

**Example**:

| Feature | Reach | Impact | Confidence | Effort | RICE |
|---|---|---|---|---|---|
| Onboarding wizard | 500 | 2 | 80% | 3 | 267 |
| Dark mode | 200 | 0.5 | 90% | 2 | 45 |
| Export to CSV | 100 | 1 | 100% | 1 | 100 |

### MoSCoW Method

| Priority | Meaning | Guidance |
|---|---|---|
| **Must have** | Non-negotiable, launch blocker | Without this, the release fails |
| **Should have** | Important but not critical | Painful to leave out, but workarounds exist |
| **Could have** | Desirable, nice-to-have | Only if time allows |
| **Won't have** | Explicitly excluded this time | Acknowledged but deferred |

### ICE Score

```
ICE = Impact × Confidence × Ease
```

Simpler than RICE — each factor scored 1-10. Good for quick prioritization in small teams.

### Kano Model

| Category | User satisfaction | Example |
|---|---|---|
| **Must-be** | Expected, absence = frustration | Login, password reset |
| **Performance** | More = better, linear satisfaction | Speed, storage quota |
| **Attractive** | Delighters, absence is OK | AI features, smart defaults |
| **Indifferent** | Users don't care | Internal refactoring |
| **Reverse** | Causes dissatisfaction | Forced tutorials |

---

## MVP Scoping

### Must-Have vs Nice-to-Have Matrix

```
            High Impact
                │
    MUST HAVE   │   SHOULD HAVE
   (launch)     │   (fast follow)
────────────────┼────────────────
    COULD HAVE  │   WON'T HAVE
   (if time)    │   (later)
                │
            Low Impact
    ←─── Low Effort ──── High Effort ───→
```

### MVP Scoping Questions
1. What is the **one core job** this product does?
2. What is the **minimum** to validate the hypothesis?
3. What can we **fake** or do manually? (Wizard of Oz)
4. What features can be **added after launch**?
5. What is the **simplest version** that delivers value?

### Scope Cutting Techniques

| Technique | Description | Example |
|---|---|---|
| **Reduce cases** | Support only the common case | Only email login (no social) |
| **Manual backend** | Automate later | Admin manually approves accounts |
| **Fewer options** | One way to do things | Single pricing plan |
| **Read before write** | Show data before editing | Dashboard first, settings later |
| **Time-box** | Fixed time, flexible scope | "What can we ship in 2 weeks?" |

---

## Estimation Patterns

### Story Points (Fibonacci)

| Points | Complexity | Example |
|---|---|---|
| **1** | Trivial, well-understood | Fix typo, change color |
| **2** | Simple, small scope | Add form field with validation |
| **3** | Moderate, clear approach | New API endpoint + tests |
| **5** | Significant, some unknowns | Multi-step form with API integration |
| **8** | Complex, many parts | Real-time notification system |
| **13** | Very complex, split it | Full auth system (should be broken down) |

### T-Shirt Sizing

| Size | Rough time | When to use |
|---|---|---|
| **XS** | < 2 hours | Quick fixes, config changes |
| **S** | 2-4 hours | Small features, bug fixes |
| **M** | 1-2 days | Standard features |
| **L** | 3-5 days | Complex features |
| **XL** | 1-2 weeks | Epic-level, break down further |

### No-Estimates Approach
Instead of estimating, focus on:
1. Break all work into **similarly-sized small tasks** (1-2 days max)
2. Track **throughput** (tasks completed per week)
3. Forecast using **Monte Carlo simulation** on historical data

---

## Sprint Ceremony Reference

### For 2-Week Sprints

| Ceremony | Duration | Purpose | Output |
|---|---|---|---|
| **Sprint Planning** | 2 hours | Select and commit to sprint work | Sprint backlog |
| **Daily Standup** | 15 min | Sync, unblock | Updated board |
| **Sprint Review** | 1 hour | Demo completed work | Stakeholder feedback |
| **Sprint Retrospective** | 1 hour | Improve process | Action items |
| **Backlog Refinement** | 1 hour | Clarify upcoming stories | Refined, estimated stories |

### Standup Format

```
1. What I completed yesterday
2. What I'm working on today
3. Any blockers?
```

**Anti-patterns**: Status report to manager, going over 15 min, problem-solving during standup (take it offline).

### Retrospective Formats

| Format | How it works | Best for |
|---|---|---|
| **Start/Stop/Continue** | Three columns | Simple, quick |
| **Glad/Sad/Mad** | Emotional check-in | After difficult sprints |
| **4Ls** | Liked, Learned, Lacked, Longed for | Balanced reflection |
| **Sailboat** | Wind (helpers), Anchor (blockers), Rocks (risks) | Visual teams |

---

## Roadmap Types

### Now / Next / Later (Recommended for Startups)

```
┌─────────────────┬──────────────────┬─────────────────┐
│      NOW         │      NEXT        │     LATER       │
│   (This sprint)  │  (Next 1-2 mo)   │   (3-6 months)  │
├─────────────────┼──────────────────┼─────────────────┤
│ Team invitations │ Role-based access │ SSO / SAML      │
│ Email notifs     │ Notification prefs│ Slack integration│
│ Billing page     │ Usage analytics   │ Custom reports   │
└─────────────────┴──────────────────┴─────────────────┘
```

### Roadmap Type Comparison

| Type | Best for | Risk |
|---|---|---|
| **Now/Next/Later** | Startups, uncertain environments | Less precision |
| **Timeline** | Enterprise, committed dates | Pressure to meet dates |
| **Outcome-based** | Product-led teams | Harder to communicate |
| **Kanban board** | Continuous delivery | Less strategic view |

---

## Stakeholder Communication Templates

### Weekly Status Update

```markdown
## Weekly Update — [Date]

### Highlights
- Shipped team invitations (3 stories, 8 points)
- Started billing integration

### Metrics
- Sprint velocity: 21 points (target: 20)
- Bug count: 3 open (down from 7)

### Blockers
- Waiting on Stripe account approval

### Next Week
- Complete billing flow
- Start notification system

### Risks
- Stripe approval delay could push billing launch by 1 week
```

### Feature Launch Announcement (Internal)

```markdown
## [Feature Name] — Shipped!

**What**: Brief description of the feature
**Why**: Problem it solves, metric it moves
**Who**: Target users
**How to test**: Steps or link to staging
**Rollout plan**: % rollout, timeline to 100%
**Known limitations**: What doesn't work yet
**Feedback**: Where to report issues
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| No acceptance criteria | Scope creep, ambiguous "done" | Write AC before development starts |
| Estimating in time, not complexity | Pressure, inaccurate forecasting | Use story points or t-shirt sizes |
| Skipping retrospectives | Same problems repeat | Make retros mandatory, rotate formats |
| Too many WIP items | Nothing finishes | Set WIP limits (2-3 per developer) |
| Sprint scope changes | Constant disruption | Protect sprint commitment, use "next sprint" |
| PRD without success metrics | No way to evaluate outcome | Define metrics before building |
| Roadmap as promise | Missed expectations | Use "Now/Next/Later" without dates |
| Gold plating | Over-building beyond requirements | Deliver MVP, iterate with feedback |
| No user research | Building wrong things | Talk to 5 users before writing PRD |
| Ignoring technical debt | Slowing velocity over time | Budget 15-20% of sprint for tech debt |

---

## Pre-Delivery Checklist

- [ ] User stories have clear format (As a... I want... So that...)
- [ ] Acceptance criteria defined for each story
- [ ] Stories are sized and prioritized
- [ ] MVP scope is clearly defined (must-have vs nice-to-have)
- [ ] PRD includes success metrics
- [ ] Roadmap is shared with stakeholders
- [ ] Sprint cadence and ceremonies are established
- [ ] Definition of Done is agreed upon by team
- [ ] Backlog is refined and ready for next sprint
- [ ] Retrospective action items are tracked and addressed
- [ ] Stakeholder update cadence is established
- [ ] Technical considerations are documented in PRD

---

## References

- [Scrum Guide](https://scrumguides.org/)
- [Shape Up (Basecamp)](https://basecamp.com/shapeup)
- [Kanban Guide](https://www.agilealliance.org/glossary/kanban/)
- [RICE Scoring](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/)

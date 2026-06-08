# Design Critique Guide

Framework for evaluating existing designs and delivering actionable feedback.

## 10-Point Evaluation Framework

Apply these checks systematically when reviewing any UI. Score each area and prioritize fixes by severity.

### 1. Visual Hierarchy

**Check:** Is it immediately clear what the user should look at first? Is the primary action obvious?

**Signs of problems:**
- Multiple elements competing for attention at the same visual weight
- No clear focal point on the screen
- Secondary actions styled as prominently as the primary CTA
- Headlines and body text at similar sizes

**Fix:** Identify THE one thing the user should do or see. Make it prominent through size, color, and whitespace. De-emphasize everything else. Apply the hierarchy: size > color > weight > position > whitespace > depth.

### 2. Consistency

**Check:** Are similar elements styled the same way across the interface?

**Signs of problems:**
- Buttons with different border-radius on different pages
- Cards with different padding in different sections
- Font sizes that drift between views
- Multiple heading styles for the same level

**Fix:** Audit all instances of each component type. Extract shared styles into tokens or component abstractions. The same button component should render identically everywhere.

### 3. Alignment

**Check:** Are elements properly aligned to a grid? Do any elements feel "off"?

**Signs of problems:**
- Text blocks at different left edges
- Icons not vertically centered with adjacent text
- Inconsistent container margins
- Elements that break the grid without clear purpose

**Fix:** Establish a grid (8pt base) and snap everything to it. Use alignment tools (Flexbox align-items, justify-content) consistently. Intentional grid-breaking should be rare and purposeful.

### 4. Whitespace

**Check:** Is there enough breathing room? Is whitespace used purposefully?

**Signs of problems:**
- Elements crammed together with minimal gaps
- Inconsistent spacing between similar items
- Headers with the same gap above and below (should be closer to their content)
- Dense walls of text or controls

**Fix:** Apply the spacing scale consistently. Use more whitespace between sections than within sections. Increase padding in content areas — the most common spacing mistake is too-little whitespace.

### 5. Typography

**Check:** Is the type scale consistent? Is text readable?

**Signs of problems:**
- More than 4 distinct text sizes on one screen
- Body text below 16px
- Line lengths exceeding 75 characters
- Tight line height on body text
- More than 2 font families

**Fix:** Establish a type scale and stick to it. Set max-width on text containers for proper line length. Ensure body text has 1.5-1.75 line height.

### 6. Color Usage

**Check:** Is color purposeful and cohesive?

**Signs of problems:**
- More than 3 prominent colors competing
- Colors used decoratively without meaning
- Inconsistent use of semantic colors (red sometimes for errors, sometimes for decoration)
- Low contrast text

**Fix:** Apply the 60-30-10 rule. Assign semantic meaning to colors and use them consistently. Verify contrast ratios for all text.

### 7. Accessibility

**Check:** Can all users interact with this design?

**Signs of problems:**
- Text below 4.5:1 contrast ratio
- Interactive elements without focus indicators
- Form inputs without labels
- Color as the sole state indicator
- Tiny touch targets

**Fix:** Run a contrast checker on all text. Add visible focus styles. Associate labels with all inputs. Add icons/text alongside color indicators. Ensure 44x44px minimum touch targets.

### 8. Responsiveness

**Check:** How does it behave across screen sizes?

**Signs of problems:**
- Horizontal scroll on mobile
- Text too small on mobile
- Touch targets too small on mobile
- Layout breaks at specific widths
- Fixed-width elements that overflow

**Fix:** Test at 375px, 768px, 1024px, 1440px. Use responsive utilities (Tailwind prefixes). Set fluid typography with clamp(). Use relative units for containers.

### 9. Information Density

**Check:** Is the right amount of information shown?

**Signs of problems:**
- Overwhelming amount of data on one screen
- Users need to scroll extensively to find key info
- Important actions buried in dense content
- Empty areas that waste valuable screen space

**Fix:** Match density to context. Dashboards can be denser than marketing pages. Use progressive disclosure — show essentials, reveal details on demand. Group related info in collapsible sections.

### 10. User Flow

**Check:** Is the path from intention to completion clear?

**Signs of problems:**
- User has to hunt for the next step
- Important actions hidden in menus or modals
- No clear path from landing to conversion
- Confusing navigation structure

**Fix:** Map the ideal user journey. Ensure each step clearly leads to the next. Place primary actions at natural decision points. Use breadcrumbs and progress indicators for multi-step flows.

## Feedback Delivery

### Rules for Effective Feedback

1. **Be specific.** "The 8px gap between the label and input is too tight; 12px would improve readability" beats "spacing needs work."

2. **Explain why.** Connect every suggestion to a principle or user impact. "The muted text at gray-400 fails AA contrast at 2.7:1" is actionable.

3. **Prioritize.** Classify issues by severity:

| Severity | Description | Examples |
|----------|-------------|---------|
| **Critical** | Blocks usage or fails standards | Accessibility failures, broken layout, unreadable text |
| **Major** | Significantly impacts experience | Weak hierarchy, confusing flow, inconsistent styling |
| **Minor** | Polish and refinement | Shadow tweaks, animation timing, icon alignment |

4. **Offer alternatives.** Do not just critique — provide a concrete improved version or at least a direction.

5. **Acknowledge what works.** Note effective design decisions before suggesting changes. This builds trust and ensures good patterns are preserved.

### Feedback Template

```
## [Area]: [Specific Issue]

**Current:** [What it looks like now]
**Issue:** [What the problem is and why]
**Suggested fix:** [Concrete alternative]
**Severity:** Critical | Major | Minor
```

### When Critiquing Existing Codebases

1. Read the entire component/page before commenting
2. Identify the design system in use (custom, shadcn, MUI, etc.)
3. Prioritize fixes that can use existing patterns over introducing new ones
4. Group related issues together
5. Estimate effort for each fix (quick fix vs. refactor)
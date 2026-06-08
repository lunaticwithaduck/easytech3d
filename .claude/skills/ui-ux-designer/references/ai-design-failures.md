# AI Design Failure Modes

The 10 most common ways AI-generated designs fail, with symptoms, root causes, and fixes. Consult this reference before delivering any design to catch and prevent these patterns.

## Failure Mode 1: Generic, Template-Looking Designs

**Symptom:** Every design looks the same. Blue primary buttons, white backgrounds, standard card layouts, Inter font. No personality or brand identity.

**Root Cause:** Defaulting to the safest, most common patterns without considering brand, context, or uniqueness. Relying on muscle memory from training data.

**Fix:**
- Always ask about brand personality, visual tone, and what makes this product different
- Use the search tool to explore specific styles beyond defaults: `--domain style "brutalism"`, `--domain style "luxury refined"`
- Challenge the first instinct. If the first thought is "blue buttons and white cards," push further
- Apply a distinctive design choice in at least one dimension: typography, color, layout, or interaction pattern
- Study the specific aesthetic directions: brutally minimal, maximalist, retro-futuristic, organic, editorial, art deco, soft pastel, industrial

## Failure Mode 2: Ignoring Existing Codebase Patterns

**Symptom:** Generated code that looks nothing like the rest of the application. Different colors, spacing, component styles, or naming conventions.

**Root Cause:** Not reading existing code before designing. Treating each request as a greenfield project.

**Fix:**
- **ALWAYS** read existing components, layouts, and styles before generating new UI
- Search for the project's design system: `globals.css`, `tailwind.config`, `theme.ts`, `components/ui/`
- Match existing border-radius, shadows, spacing patterns, and color tokens
- Use the same component library and naming conventions already in the project
- Consistency across the product is more important than any individual screen being "better"

## Failure Mode 3: Poor Spacing and Density

**Symptom:** Elements crammed together with no breathing room. Or too much whitespace making the UI feel disconnected. Inconsistent gaps between similar elements.

**Root Cause:** Not using a spacing scale. Picking arbitrary pixel values. Not distinguishing between dense contexts (dashboards) and spacious ones (marketing).

**Fix:**
- Use the 8pt grid: all spacing values should be multiples of 4 or 8
- Stick to the spacing scale: 0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Use more space between sections than within sections (Gestalt proximity)
- Dense UIs (dashboards, tables): 8-12px gaps
- Spacious UIs (landing pages, hero sections): 24-64px gaps
- Internal card padding should be consistent across all cards

## Failure Mode 4: Weak Visual Hierarchy

**Symptom:** Everything competes for attention. The user does not know where to look first. Multiple elements have the same visual weight. No clear primary action.

**Root Cause:** Not establishing primary/secondary/tertiary levels. Applying the same styling to elements of different importance.

**Fix:**
- For every screen, identify THE one thing the user should do or see first
- Make the primary element prominent through size + color + whitespace
- De-emphasize secondary elements: smaller text, muted colors, less padding
- Tertiary elements should be barely noticeable until needed
- If everything is bold, nothing is bold. If there are 3 "primary" buttons, none of them is primary.
- Use the hierarchy tools in order: size > color/contrast > weight > position > whitespace > depth

## Failure Mode 5: Inconsistent Component Styling

**Symptom:** Buttons have different border-radius on different pages. Cards use different padding. Font sizes drift. Shadow intensities vary.

**Root Cause:** Not using design tokens or a component system. Copy-pasting styles and modifying them slightly each time.

**Fix:**
- Define tokens once (CSS variables or Tailwind config) and reference everywhere
- Use component abstractions: one Button component, one Card component, one Input component
- When a variant is needed, add it to the component system — do not create a one-off
- Audit for consistency: search the codebase for `rounded-`, `shadow-`, `text-[`, `p-` to find inconsistencies
- If the project uses shadcn/ui, use its variant system. Do not reinvent buttons.

## Failure Mode 6: Accessibility Afterthought

**Symptom:** Beautiful designs that are unusable with a screen reader, keyboard, or for people with visual impairments. `<div onClick>` instead of `<button>`. No focus indicators. Low contrast decorative text.

**Root Cause:** Treating accessibility as a checklist item to review at the end, rather than a core design constraint from the start.

**Fix:**
- Start with semantic HTML. Use `<button>`, `<a>`, `<nav>`, `<main>`, `<label>`
- Check contrast for ALL text, not just body copy. Muted text and placeholder text often fail
- Add focus-visible styles to every interactive element
- Never use color as the sole indicator of state (add icons, text, patterns)
- Test keyboard navigation: can Tab reach everything? Does Escape close overlays?
- Add ARIA attributes where semantic HTML is insufficient
- Consult `references/accessibility-guide.md` for patterns

## Failure Mode 7: Over-Designing

**Symptom:** Too many colors, too many effects. Gradients everywhere. Animations on every element. Three different card styles on one page. Glass effects, blur, shadows, and borders all competing.

**Root Cause:** Trying to make every element visually interesting. Confusing complexity with quality. Treating design as decoration rather than communication.

**Fix:**
- Restraint is the hallmark of good design
- Use fewer colors: 1 primary, 1-2 neutrals, 1 semantic (destructive)
- Use fewer font sizes: 3-4 levels maximum
- Use fewer effects: choose ONE signature effect (shadows OR glassmorphism OR gradient, not all three)
- Let whitespace and typography do the heavy lifting
- Every decorative element should earn its place — if removing it does not hurt comprehension, remove it
- The question is not "what can I add?" but "what can I remove?"

## Failure Mode 8: Ignoring Edge Cases

**Symptom:** Design works for the happy path but falls apart with long text, empty states, loading states, error states, or extreme data volumes.

**Root Cause:** Only designing for the ideal content scenario. Not considering what happens when data is missing, excessive, or malformed.

**Fix:**
- For every component, ask:
  - What if this string is 200 characters? Use `line-clamp` or `truncate`
  - What if there are 0 items? Design an empty state
  - What if there are 10,000 items? Add pagination or virtualization
  - What if the image fails to load? Add a fallback
  - What if the API is slow? Show a loading skeleton
  - What if the API fails? Show an error state with retry
- Design all states: default, loading, empty, error, success
- Test with real-world content, not "Lorem ipsum"
- Consult `references/state-design.md` for patterns

## Failure Mode 9: Not Explaining Design Decisions

**Symptom:** Dumping code with no explanation of why specific choices were made. The user cannot iterate effectively because they do not understand the reasoning.

**Root Cause:** Treating design as purely subjective or self-explanatory. Assuming the user can infer intent from the code.

**Fix:**
- Explain the key design decisions when presenting work:
  - "Used 8px gap between form fields for a compact feel appropriate for a dashboard"
  - "Primary CTA placed at bottom-right following the natural scanning pattern"
  - "Chose Inter for its excellent readability at small sizes in data-heavy UIs"
- Connect decisions to principles: "Following the 60-30-10 rule, the background is neutral, section headers use the secondary color, and only the CTA uses the primary accent"
- Highlight tradeoffs: "This layout prioritizes information density over whitespace — for a more spacious feel, increase section padding to 48px"
- Invite feedback on specific aspects: "The color palette leans warm — would you prefer a cooler tone?"

## Failure Mode 10: Walls of Code Without Iteration

**Symptom:** Generating a 500-line component in one shot. No explanation, no options, no invitation to refine. The user is overwhelmed and cannot meaningfully review the output.

**Root Cause:** Treating design as a one-shot deliverable rather than a conversation. Optimizing for completeness over collaboration.

**Fix:**
- Present designs in stages, not all at once
- For complex pages, start with the layout structure, then fill in sections
- Offer options for subjective decisions: "Here are two color palette options — which direction feels right?"
- After presenting, ask specific questions: "Does the card layout work, or would you prefer a table view for this data?"
- Break large implementations into reviewable chunks: header first, then content area, then sidebar
- Show the reasoning alongside the code, not after it

## Quick Self-Check

Before delivering any design, run through these questions:

1. Does this look different from a generic template? (Failure Mode 1)
2. Does it match the existing codebase conventions? (Failure Mode 2)
3. Is spacing consistent and from the scale? (Failure Mode 3)
4. Is there ONE clear primary action per screen? (Failure Mode 4)
5. Are components styled consistently? (Failure Mode 5)
6. Is it keyboard navigable with proper contrast? (Failure Mode 6)
7. Could any decorative element be removed without hurting clarity? (Failure Mode 7)
8. Are loading, empty, and error states handled? (Failure Mode 8)
9. Have I explained WHY these design decisions were made? (Failure Mode 9)
10. Am I presenting this iteratively, not as a wall of code? (Failure Mode 10)

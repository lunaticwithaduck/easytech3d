# Figma MCP Workflows

End-to-end workflows for common Figma integration tasks. Each workflow lists the exact tool sequence.

---

## Workflow 1: Figma → React Component

Extract a design from Figma and generate a production React + Tailwind component.

### Tool Sequence

```
1. join_channel("channel-name")
2. get_document_info()                     → verify connection, get file name
3. get_selection()                         → get selected node IDs
4. read_my_design(nodeId)                  → full styling data
5. get_styles()                            → design tokens (colors, typography)
6. export_node_as_image(nodeId, "PNG", 2)  → visual reference
7. [Generate React component from extracted data]
8. [Compare rendered component with exported image]
```

### Mapping Rules

| Figma Property | Tailwind Class | CSS Property |
|---------------|----------------|-------------|
| `fills[0].color` | `bg-[color]` or `text-[color]` | `background-color` / `color` |
| `typography.fontFamily` | `font-[family]` | `font-family` |
| `typography.fontSize` | `text-[size]` | `font-size` |
| `typography.fontWeight` | `font-[weight]` | `font-weight` |
| `typography.lineHeight` | `leading-[value]` | `line-height` |
| `cornerRadius` | `rounded-[value]` | `border-radius` |
| `padding` (uniform) | `p-[value]` | `padding` |
| `padding` (per-side) | `pt-X pr-X pb-X pl-X` | `padding-top`, etc. |
| `itemSpacing` | `gap-[value]` | `gap` |
| `layoutMode: VERTICAL` | `flex flex-col` | `display: flex; flex-direction: column` |
| `layoutMode: HORIZONTAL` | `flex flex-row` | `display: flex; flex-direction: row` |
| `layoutAlign: CENTER` | `items-center justify-center` | `align-items: center` |
| `layoutSizing: FILL` | `flex-1` or `w-full` | `flex: 1` |
| `layoutSizing: HUG` | `w-fit` | `width: fit-content` |
| `effects (DROP_SHADOW)` | `shadow-[value]` | `box-shadow` |
| `strokes` | `border border-[color]` | `border` |

### Example Output

Given a Figma card with:
- Frame: 320x200, cornerRadius 12, vertical auto-layout, padding 16, gap 12
- Fill: white (#FFFFFF)
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- Title text: Inter 18px/700
- Description text: Inter 14px/400 gray

```tsx
function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-md">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
```

---

## Workflow 2: Requirements → Figma Mockup

Create a visual mockup in Figma from text requirements.

### Tool Sequence

```
1. join_channel("channel-name")
2. get_document_info()                           → verify connection
3. [Parse requirements into layout structure]

For each section:
4. create_frame(name, width, height)             → container
5. set_layout_mode(frameId, "VERTICAL")          → auto-layout
6. set_padding(frameId, 24, 24, 24, 24)          → internal spacing
7. set_item_spacing(frameId, 16)                 → gap between children
8. set_fill_color(frameId, 1, 1, 1, 1)           → white background
9. set_corner_radius(frameId, 12)                → rounded corners

For text content:
10. create_text(name, characters, fontSize, fontWeight, parentId=frameId)

For visual elements:
11. create_rectangle(name, width, height, parentId=frameId)
12. set_fill_color(rectId, r, g, b, a)

For nested layouts:
13. create_frame(name, parentId=parentFrame)      → nested container
14. set_layout_mode(nestedId, "HORIZONTAL")       → horizontal row
15. [Add children to nested frame]

Final:
16. set_multiple_annotations(annotations)         → developer notes
17. export_node_as_image(rootFrameId, "PNG", 1)   → preview
```

### Layout Patterns

**Page layout:**
```
Root Frame (VERTICAL, width=1440)
├── Header Frame (HORIZONTAL, height=64)
│   ├── Logo (Text)
│   └── Nav (HORIZONTAL, gap=24)
├── Hero Frame (VERTICAL, padding=80)
│   ├── Heading (Text, 48px/800)
│   ├── Subheading (Text, 20px/400)
│   └── CTA Button Frame (HORIZONTAL)
├── Features Frame (HORIZONTAL, gap=24)
│   ├── Feature Card (VERTICAL)
│   ├── Feature Card (VERTICAL)
│   └── Feature Card (VERTICAL)
└── Footer Frame (VERTICAL, padding=40)
```

**Card grid:**
```
Container Frame (HORIZONTAL, wrap=true, gap=24)
├── Card Frame (VERTICAL, width=320, auto-layout)
├── Card Frame (VERTICAL, width=320, auto-layout)
└── Card Frame (VERTICAL, width=320, auto-layout)
```

---

## Workflow 3: Design System Audit via Figma

Compare Figma design tokens with codebase tokens to find drift.

### Tool Sequence

```
1. join_channel("channel-name")
2. get_styles()                          → Figma color/text/effect styles
3. get_local_components()                → Figma components
4. [Read project token files: globals.css, tailwind.config.ts, tokens.json]
5. [Compare Figma tokens vs code tokens]
6. [Generate drift report]
```

### Drift Report Format

```markdown
# Design System Drift Report

## Colors
| Token | Figma | Code | Status |
|-------|-------|------|--------|
| primary-500 | #3B82F6 | #3B82F6 | Synced |
| gray-100 | #F5F6F7 | #F3F4F6 | DRIFTED |
| accent-400 | #FBBF24 | — | Missing in code |
| — | — | #6366F1 | Orphaned in code |

## Typography
| Token | Figma | Code | Status |
|-------|-------|------|--------|
| h1 | Inter 36px/700 | Inter 36px/700 | Synced |
| body | Inter 16px/400 | Inter 14px/400 | DRIFTED (size) |

## Components
| Figma Component | Code Component | Status |
|----------------|---------------|--------|
| Button | <Button> | Mapped |
| Card | <Card> | Mapped |
| Avatar | — | Missing implementation |

## Summary
- Colors: 3 synced, 1 drifted, 1 missing, 1 orphaned
- Typography: 1 synced, 1 drifted
- Components: 2 mapped, 1 missing
```

---

## Workflow 4: Batch Text Replacement

Replace text content across multiple nodes systematically.

### Tool Sequence

```
1. join_channel("channel-name")
2. scan_text_nodes(chunkSize=50)         → find all text nodes
3. [Filter nodes by name or content pattern]
4. [Prepare replacement map]
5. set_multiple_text_contents(edits=[
     { nodeId: "node1", text: "New heading" },
     { nodeId: "node2", text: "Updated description" },
     { nodeId: "node3", text: "Changed label" }
   ])
```

### Use Cases

- **Localization:** Replace English text with translations
- **Content update:** Swap placeholder text with real content
- **A/B variants:** Create design variants with different copy
- **Brand update:** Replace old brand name with new one

### Best Practices

1. Always `scan_text_nodes` first to see current content
2. Filter by node name patterns (e.g., all nodes named "Heading/*")
3. Use `set_multiple_text_contents` for batch operations (faster than individual calls)
4. Export image after replacement to verify visually

---

## Workflow 5: Annotation-Based Handoff

Add structured developer annotations to design elements for implementation handoff.

### Tool Sequence

```
1. join_channel("channel-name")
2. get_selection() or scan_nodes_by_types(["FRAME", "COMPONENT"])
3. For each element that needs implementation notes:
   set_annotation(nodeId, label, description)

4. set_multiple_annotations([
     {
       nodeId: "header-frame",
       label: "Header Component",
       description: "## Props\n- `logo`: string (image URL)\n- `navItems`: NavItem[]\n- `user`: User | null\n\n## Behavior\n- Sticky on scroll\n- Mobile: hamburger menu\n- Auth: show avatar dropdown"
     },
     {
       nodeId: "hero-section",
       label: "Hero Section",
       description: "## Props\n- `title`: string\n- `subtitle`: string\n- `ctaText`: string\n- `ctaHref`: string\n\n## Animation\n- Title: fade-in-up on mount (300ms)\n- CTA: pulse on hover"
     },
     {
       nodeId: "pricing-card",
       label: "Pricing Card",
       description: "## Props\n- `plan`: Plan\n- `isPopular`: boolean\n- `onSelect`: (planId) => void\n\n## States\n- Default, hover (lift shadow), selected (border accent)\n- Popular: badge + highlighted border"
     }
   ])
```

### Annotation Content Template

```markdown
## Component: [Name]

### Props
- `propName`: type — description

### States
- Default: [description]
- Hover: [description]
- Active: [description]
- Disabled: [description]
- Error: [description]

### Responsive
- Mobile (<768px): [behavior]
- Tablet (768-1024px): [behavior]
- Desktop (>1024px): [behavior]

### Data
- Source: [API endpoint or static]
- Loading: [skeleton pattern]
- Empty: [empty state description]
- Error: [error handling]

### Notes
- [Implementation-specific notes]
```

### Reading Annotations Back

```
get_annotations()
→ Use to generate design-spec.md for the developer agent
→ Each annotation becomes a component section in the spec
```

---

## Workflow Summary

| # | Workflow | Direction | Primary Tools | Output |
|---|---------|-----------|--------------|--------|
| 1 | Figma → React | Read | read_my_design, get_styles, export_node_as_image | React + Tailwind component |
| 2 | Requirements → Figma | Write | create_frame, create_text, set_layout_mode | Figma mockup |
| 3 | Design system audit | Read | get_styles, get_local_components | Drift report |
| 4 | Batch text replacement | Write | scan_text_nodes, set_multiple_text_contents | Updated Figma text |
| 5 | Annotation handoff | Write | set_multiple_annotations | Developer notes in Figma |
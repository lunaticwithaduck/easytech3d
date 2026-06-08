# Example: Figma → React Component

Complete worked example: connect to Figma, extract a card component, read its styles and tokens, generate a React + Tailwind component, and verify visually.

## Scenario

A designer has created a "Feature Card" component in Figma. We need to extract it and generate a production React component.

## Step 1: Connect

```
join_channel("design-team")
→ { success: true, message: "Joined channel: design-team" }

get_document_info()
→ { name: "Marketing Site", pages: [{ id: "0:1", name: "Components" }, { id: "0:2", name: "Pages" }] }
```

## Step 2: Select and Inspect

The designer selects the "Feature Card" component in Figma.

```
get_selection()
→ [{ id: "123:456", name: "Feature Card", type: "COMPONENT", width: 360, height: 280 }]
```

## Step 3: Read Design Details

```
read_my_design("123:456")
→ {
    name: "Feature Card",
    type: "COMPONENT",
    width: 360,
    height: 280,
    cornerRadius: 16,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }],
    effects: [{
      type: "DROP_SHADOW",
      radius: 12,
      offset: { x: 0, y: 4 },
      color: { r: 0, g: 0, b: 0, a: 0.06 }
    }],
    layoutMode: "VERTICAL",
    padding: { top: 24, right: 24, bottom: 24, left: 24 },
    itemSpacing: 16,
    children: [
      {
        name: "Icon Container",
        type: "FRAME",
        width: 48,
        height: 48,
        cornerRadius: 12,
        fills: [{ type: "SOLID", color: { r: 0.933, g: 0.945, b: 1, a: 1 } }],
        layoutMode: "HORIZONTAL",
        children: [{
          name: "Icon",
          type: "VECTOR",
          width: 24,
          height: 24,
          fills: [{ type: "SOLID", color: { r: 0.231, g: 0.510, b: 0.965, a: 1 } }]
        }]
      },
      {
        name: "Title",
        type: "TEXT",
        characters: "Feature Title",
        typography: {
          fontFamily: "Inter",
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: -0.02
        },
        fills: [{ type: "SOLID", color: { r: 0.067, g: 0.094, b: 0.153, a: 1 } }]
      },
      {
        name: "Description",
        type: "TEXT",
        characters: "A brief description of this amazing feature and why users will love it.",
        typography: {
          fontFamily: "Inter",
          fontSize: 15,
          fontWeight: 400,
          lineHeight: 1.6
        },
        fills: [{ type: "SOLID", color: { r: 0.392, g: 0.431, b: 0.502, a: 1 } }]
      },
      {
        name: "Link",
        type: "TEXT",
        characters: "Learn more →",
        typography: {
          fontFamily: "Inter",
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.4
        },
        fills: [{ type: "SOLID", color: { r: 0.231, g: 0.510, b: 0.965, a: 1 } }]
      }
    ]
  }
```

## Step 4: Extract Design Tokens

```
get_styles()
→ {
    paintStyles: [
      { name: "Primary/500", paints: [{ color: { r: 0.231, g: 0.510, b: 0.965 } }] },
      { name: "Primary/50", paints: [{ color: { r: 0.933, g: 0.945, b: 1 } }] },
      { name: "Gray/900", paints: [{ color: { r: 0.067, g: 0.094, b: 0.153 } }] },
      { name: "Gray/500", paints: [{ color: { r: 0.392, g: 0.431, b: 0.502 } }] }
    ],
    textStyles: [
      { name: "Heading/H4", fontFamily: "Inter", fontSize: 20, fontWeight: 600 },
      { name: "Body/Regular", fontFamily: "Inter", fontSize: 15, fontWeight: 400 },
      { name: "Body/Small", fontFamily: "Inter", fontSize: 14, fontWeight: 500 }
    ]
  }
```

## Step 5: Export Visual Reference

```
export_node_as_image("123:456", format="PNG", scale=2)
→ [base64 image data — save as reference]
```

## Step 6: Map Figma → Tailwind

| Figma Property | Value | Tailwind |
|---------------|-------|---------|
| Card width | 360px | `w-[360px]` or `max-w-sm` |
| Corner radius | 16px | `rounded-2xl` |
| Fill white | `r:1 g:1 b:1` | `bg-white` |
| Shadow | 0 4px 12px rgba(0,0,0,0.06) | `shadow-md` |
| Layout | VERTICAL | `flex flex-col` |
| Padding | 24px all | `p-6` |
| Item spacing | 16px | `gap-4` |
| Icon container bg | Primary/50 | `bg-blue-50` |
| Icon container radius | 12px | `rounded-xl` |
| Icon container size | 48x48 | `w-12 h-12` |
| Icon color | Primary/500 | `text-blue-500` |
| Title font | Inter 20/600 | `text-xl font-semibold` |
| Title color | Gray/900 | `text-slate-900` |
| Title tracking | -0.02em | `tracking-tight` |
| Description font | Inter 15/400 | `text-[15px]` |
| Description color | Gray/500 | `text-slate-500` |
| Description line-height | 1.6 | `leading-relaxed` |
| Link font | Inter 14/500 | `text-sm font-medium` |
| Link color | Primary/500 | `text-blue-500` |

## Step 7: Generate React Component

```tsx
import { type ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  href: string
}

export function FeatureCard({ icon, title, description, href }: FeatureCardProps) {
  return (
    <div className="flex max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-md">
      {/* Icon container */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[15px] leading-relaxed text-slate-500">
        {description}
      </p>

      {/* Link */}
      <a
        href={href}
        className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
      >
        Learn more &rarr;
      </a>
    </div>
  )
}
```

## Step 8: Usage

```tsx
import { FeatureCard } from '@/components/feature-card'
import { Zap, Shield, BarChart } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <FeatureCard
        icon={<Zap className="h-6 w-6" />}
        title="Lightning Fast"
        description="Optimized for speed with edge caching and lazy loading built in."
        href="/features/speed"
      />
      <FeatureCard
        icon={<Shield className="h-6 w-6" />}
        title="Secure by Default"
        description="Enterprise-grade security with encryption at rest and in transit."
        href="/features/security"
      />
      <FeatureCard
        icon={<BarChart className="h-6 w-6" />}
        title="Real-time Analytics"
        description="Track engagement and conversions with our built-in dashboard."
        href="/features/analytics"
      />
    </section>
  )
}
```

## Step 9: Verify

Compare the rendered component with the exported Figma image. Check:

- [ ] Overall proportions match
- [ ] Colors match design tokens
- [ ] Typography (size, weight, color) is correct
- [ ] Spacing (padding, gaps) matches
- [ ] Corner radius matches
- [ ] Shadow matches
- [ ] Hover state on link works
- [ ] Responsive behavior at mobile width

## Key Patterns Used

1. **Token mapping** — Figma paint styles (Primary/500) mapped to Tailwind color classes (blue-500)
2. **Typography mapping** — Figma text properties mapped to Tailwind text/font/leading classes
3. **Auto-layout → Flexbox** — Figma VERTICAL layout mode becomes `flex flex-col gap-4`
4. **Component props from Figma variants** — The Figma component's editable text layers become React string props; the icon child becomes a ReactNode prop
5. **Visual verification** — Export from Figma to compare side-by-side with rendered output

# Design Token Extraction & Sync

Patterns for extracting design tokens from Figma and mapping them to code.

## Extracting Tokens from Figma

### Step 1: Get All Styles

```
get_styles()
→ {
    paintStyles: [
      { id: "S:abc", name: "Primary/500", paints: [{ type: "SOLID", color: { r: 0.231, g: 0.510, b: 0.965, a: 1 } }] },
      { id: "S:def", name: "Gray/100", paints: [{ type: "SOLID", color: { r: 0.961, g: 0.965, b: 0.969, a: 1 } }] }
    ],
    textStyles: [
      { id: "S:ghi", name: "Heading/H1", fontFamily: "Inter", fontSize: 36, fontWeight: 700, lineHeight: 1.2 },
      { id: "S:jkl", name: "Body/Regular", fontFamily: "Inter", fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
    ],
    effectStyles: [
      { id: "S:mno", name: "Shadow/SM", effects: [{ type: "DROP_SHADOW", radius: 4, offset: { x: 0, y: 2 }, color: { r: 0, g: 0, b: 0, a: 0.1 } }] }
    ]
  }
```

### Step 2: Get Component Library

```
get_local_components()
→ [
    { id: "C:abc", name: "Button", description: "Primary action button",
      properties: [
        { name: "variant", type: "VARIANT", defaultValue: "primary" },
        { name: "size", type: "VARIANT", defaultValue: "md" },
        { name: "label", type: "TEXT", defaultValue: "Button" }
      ]
    }
  ]
```

### Step 3: Extract from Specific Elements

For tokens not captured by styles (spacing, radius, specific values):

```
read_my_design(nodeId)
→ Extract: cornerRadius, padding, itemSpacing, fills, typography
```

---

## Mapping to Code Formats

### Figma → CSS Custom Properties

```css
/* Generated from Figma styles */
:root {
  /* Colors — from paintStyles */
  --color-primary-500: rgba(59, 130, 246, 1);    /* Primary/500 */
  --color-gray-100: rgba(245, 246, 247, 1);      /* Gray/100 */

  /* Typography — from textStyles */
  --font-heading: 'Inter', sans-serif;
  --font-size-h1: 36px;
  --font-weight-h1: 700;
  --line-height-h1: 1.2;
  --font-size-body: 16px;
  --font-weight-body: 400;
  --line-height-body: 1.5;

  /* Shadows — from effectStyles */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);

  /* Spacing — from component inspection */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Radius — from component inspection */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

### Figma → Tailwind Config

```js
// tailwind.config.js — extend with Figma tokens
export default {
  theme: {
    extend: {
      colors: {
        // From paintStyles (convert 0-1 to hex)
        primary: {
          500: '#3B82F6',  // Primary/500
        },
        gray: {
          100: '#F5F6F7',  // Gray/100
        },
      },
      fontFamily: {
        // From textStyles
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // From textStyles
        h1: ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      boxShadow: {
        // From effectStyles
        sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        // From component cornerRadius values
        card: '12px',
        button: '8px',
      },
    },
  },
}
```

### Figma → Design Token JSON (W3C Format)

```json
{
  "color": {
    "primary": {
      "500": {
        "$value": "#3B82F6",
        "$type": "color",
        "$description": "Primary brand color"
      }
    },
    "gray": {
      "100": {
        "$value": "#F5F6F7",
        "$type": "color"
      }
    }
  },
  "typography": {
    "heading": {
      "h1": {
        "$value": {
          "fontFamily": "Inter",
          "fontSize": "36px",
          "fontWeight": 700,
          "lineHeight": 1.2
        },
        "$type": "typography"
      }
    }
  },
  "shadow": {
    "sm": {
      "$value": {
        "offsetX": "0px",
        "offsetY": "2px",
        "blur": "4px",
        "color": "rgba(0, 0, 0, 0.1)"
      },
      "$type": "shadow"
    }
  },
  "spacing": {
    "xs": { "$value": "4px", "$type": "dimension" },
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" },
    "lg": { "$value": "24px", "$type": "dimension" },
    "xl": { "$value": "32px", "$type": "dimension" }
  },
  "borderRadius": {
    "sm": { "$value": "4px", "$type": "dimension" },
    "md": { "$value": "8px", "$type": "dimension" },
    "lg": { "$value": "12px", "$type": "dimension" }
  }
}
```

---

## Color Conversion

### Figma (0-1) → Hex

```
hex = Math.round(figmaValue * 255).toString(16).padStart(2, '0')
```

| Figma RGBA | Hex | CSS |
|-----------|-----|-----|
| `r=0.231, g=0.510, b=0.965` | `#3B82F6` | `rgb(59, 130, 246)` |
| `r=0.937, g=0.267, b=0.267` | `#EF4444` | `rgb(239, 68, 68)` |
| `r=0.063, g=0.725, b=0.506` | `#10B981` | `rgb(16, 185, 129)` |

### Hex → Figma (0-1)

```
figmaValue = parseInt(hex.slice(i, i+2), 16) / 255
```

---

## Token Naming Conventions

### Figma Style Names → Token Names

| Figma Name | CSS Variable | Tailwind Key |
|-----------|-------------|-------------|
| `Primary/500` | `--color-primary-500` | `colors.primary.500` |
| `Gray/100` | `--color-gray-100` | `colors.gray.100` |
| `Heading/H1` | `--font-size-h1` | `fontSize.h1` |
| `Shadow/SM` | `--shadow-sm` | `boxShadow.sm` |

**Rules:**
1. Replace `/` with `-` for CSS, `.` for Tailwind
2. Lowercase everything
3. Keep the hierarchy: `Category/Variant` → `category-variant`

### Semantic Token Mapping

Map Figma primitive tokens to semantic tokens for the codebase:

| Figma Primitive | Semantic Token | Usage |
|----------------|---------------|-------|
| `Primary/500` | `--color-action-primary` | Buttons, links |
| `Primary/100` | `--color-action-primary-bg` | Button hover backgrounds |
| `Gray/900` | `--color-text-primary` | Headings, body text |
| `Gray/500` | `--color-text-secondary` | Captions, placeholders |
| `Gray/100` | `--color-surface-secondary` | Card backgrounds |
| `Red/500` | `--color-feedback-error` | Error messages |
| `Green/500` | `--color-feedback-success` | Success messages |

---

## Token Sync Workflow

### Initial Extraction

```
1. join_channel("channel-name")
2. get_styles() → extract all paint/text/effect styles
3. get_local_components() → extract component properties
4. Inspect key components with read_my_design() → extract spacing, radius
5. Generate token files (CSS variables, Tailwind config, or JSON)
6. Write to project: globals.css, tailwind.config.ts, or tokens.json
```

### Updating Tokens

```
1. join_channel("channel-name")
2. get_styles() → get current Figma styles
3. Read existing token file from project
4. Diff: identify added, changed, removed tokens
5. Update token file with changes
6. Update Tailwind config if using Tailwind
7. Note breaking changes for review
```

### Detecting Drift

Compare Figma tokens against codebase tokens:

```
1. Extract tokens from Figma (get_styles)
2. Read project token file
3. For each Figma token:
   - Does it exist in the project? → Synced
   - Is the value different? → Drifted
   - Is it missing? → New (add to project)
4. For each project token:
   - Does it exist in Figma? → Synced
   - Is it missing? → Orphaned (may need removal)
```

---

## Spacing Extraction Pattern

Figma doesn't have explicit "spacing styles" like color styles. Extract spacing from consistent component patterns:

```
1. get_local_components() → find layout components (cards, lists, forms)
2. For each component: read_my_design(componentId)
3. Collect all unique: padding, itemSpacing, gap values
4. Sort and deduplicate → these are your spacing scale
5. Map to 4px or 8px grid:
   4  → xs
   8  → sm
   12 → md (if 4px grid) or skip (if 8px grid)
   16 → md (if 8px grid) or lg (if 4px grid)
   24 → lg
   32 → xl
   48 → 2xl
   64 → 3xl
```

---

## Component Mapping

### Figma Components → React Components

```
1. get_local_components() → list all components
2. For each component with variants:
   - Variant properties → React props
   - Default values → prop defaults
   - Text properties → children or label prop
3. Map component structure:

Figma Component:
  Button (variant: primary|secondary, size: sm|md|lg, label: "Click me")

React Component:
  <Button variant="primary" size="md">Click me</Button>

4. Document in design-spec.md for developer handoff
```
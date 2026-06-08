---
name: figma
description: This skill should be used when the user asks about "Figma", "Figma MCP", "design from Figma", "extract from Figma", "Figma to code", "create in Figma", "Figma tokens", "Figma components", "read Figma design", "push to Figma", "Figma plugin", "design handoff", "Figma variables", "Figma auto-layout", "Figma styles", "Figma annotations", "join channel", "talk to Figma", or needs to interact with Figma files through the MCP server.
---

# Figma MCP Integration

Bidirectional Figma integration via the `grab/cursor-talk-to-figma-mcp` MCP server. Read designs, extract tokens, create elements, modify styling, and manage components — all from Claude Code.

## Connection Workflow

Every Figma session starts with connecting to a channel:

```
1. Figma desktop app running with plugin active
2. WebSocket bridge running (bun socket)
3. Plugin joined to a channel (e.g., "design-team")
4. In Claude Code: join_channel("design-team")
5. Verify: get_document_info() → should return file name
```

**If connection fails:** Check that the WebSocket bridge is running (`bun socket` in the cloned repo), the Figma plugin is open and joined to the same channel name, and no firewall blocks localhost:3845.

## Tool Categories

| Task | Tools | Direction |
|------|-------|-----------|
| **Inspect document** | `get_document_info` | Read |
| **Read selection** | `get_selection`, `read_my_design`, `get_node_info` | Read |
| **Find elements** | `scan_nodes_by_types`, `scan_text_nodes` | Read |
| **Read design system** | `get_styles`, `get_local_components` | Read |
| **Export visuals** | `export_node_as_image` | Read |
| **Read annotations** | `get_annotations` | Read |
| **Read prototypes** | `get_reactions` | Read |
| **Create elements** | `create_frame`, `create_text`, `create_rectangle` | Write |
| **Modify styling** | `set_fill_color`, `set_stroke_color`, `set_corner_radius` | Write |
| **Auto-layout** | `set_layout_mode`, `set_padding`, `set_item_spacing`, `set_axis_align`, `set_layout_sizing` | Write |
| **Edit text** | `set_text_content`, `set_multiple_text_contents` | Write |
| **Components** | `create_component_instance`, `get_instance_overrides`, `set_instance_overrides` | Write |
| **Annotate** | `set_annotation`, `set_multiple_annotations` | Write |
| **Organize** | `move_node`, `resize_node`, `clone_node`, `delete_node` | Write |
| **Navigate** | `set_focus`, `set_selections` | Write |

## Read Operations

### Extract Design Context

```
Step 1: get_document_info()
  → Returns file name, page list, current page

Step 2: get_selection()
  → Returns selected node IDs, names, types

Step 3: read_my_design(nodeId)
  → Returns full styling: fills, strokes, effects, typography,
    layout properties, children, constraints

Step 4: export_node_as_image(nodeId, format="PNG", scale=2)
  → Returns base64 image for visual reference
```

### Extract Design System

```
get_styles()
  → Local paint styles (colors), text styles (typography),
    effect styles (shadows), grid styles

get_local_components()
  → Component names, descriptions, properties, variants
```

### Find Specific Elements

```
scan_nodes_by_types(types=["TEXT", "FRAME", "COMPONENT"])
  → All nodes matching the specified types

scan_text_nodes(options={ chunkSize: 50 })
  → All text content with node IDs (use chunking for large files)
```

## Write Operations

### Create a Card Component

```
Step 1: create_frame(name="Card", width=320, height=200)
  → Returns nodeId

Step 2: set_layout_mode(nodeId, mode="VERTICAL")
Step 3: set_padding(nodeId, top=16, right=16, bottom=16, left=16)
Step 4: set_item_spacing(nodeId, spacing=12)
Step 5: set_fill_color(nodeId, r=1, g=1, b=1, a=1)  # White
Step 6: set_corner_radius(nodeId, radius=12)

Step 7: create_text(
  name="Title",
  characters="Card Title",
  fontSize=18,
  fontWeight=600,
  parentId=nodeId
)

Step 8: create_text(
  name="Description",
  characters="Card description text",
  fontSize=14,
  parentId=nodeId
)
```

### Auto-Layout Properties

Apply in this order to avoid conflicts:

```
1. set_layout_mode(nodeId, "VERTICAL" | "HORIZONTAL")
2. set_padding(nodeId, top, right, bottom, left)
3. set_item_spacing(nodeId, spacing)
4. set_axis_align(nodeId, primary="MIN"|"CENTER"|"MAX", counter="MIN"|"CENTER"|"MAX")
5. set_layout_sizing(nodeId, horizontal="FIXED"|"HUG"|"FILL", vertical="FIXED"|"HUG"|"FILL")
```

### Color Format

All colors use **RGBA with 0-1 range**, not 0-255:

| CSS | Figma MCP |
|-----|-----------|
| `#FF0000` | `r=1, g=0, b=0, a=1` |
| `#1a1a2e` | `r=0.102, g=0.102, b=0.180, a=1` |
| `rgba(59,130,246,0.5)` | `r=0.231, g=0.510, b=0.965, a=0.5` |

Formula: `figmaValue = cssValue / 255`

## Design-to-Code Workflow

```
1. join_channel("channel-name")
2. get_selection() → identify target component
3. read_my_design(nodeId) → extract full styling
4. get_styles() → extract design tokens
5. export_node_as_image(nodeId) → visual reference
6. Map Figma properties to Tailwind/CSS:
   - fills → bg-[color], text-[color]
   - typography → font-[family] text-[size] font-[weight]
   - padding → p-[value]
   - item spacing → gap-[value]
   - corner radius → rounded-[value]
   - effects → shadow-[value]
7. Generate React component with mapped styles
8. Compare exported image with rendered component
```

## Code-to-Design Workflow

```
1. join_channel("channel-name")
2. Analyze requirements → determine layout structure
3. Create frames with auto-layout for each section
4. Add text nodes with content
5. Apply styling (colors, typography, spacing)
6. Use create_component_instance for reusable parts
7. set_multiple_annotations for developer handoff notes
8. export_node_as_image → share preview with user
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Calling tools before `join_channel` | Always connect first; verify with `get_document_info` |
| Using 0-255 color values | Use 0-1 range: divide CSS values by 255 |
| Setting auto-layout properties in wrong order | Set `layout_mode` first, then padding, then spacing |
| Not chunking `scan_text_nodes` on large files | Pass `chunkSize: 50` to avoid timeouts |
| Forgetting `parentId` when creating nested elements | Always specify parent to place child inside frame |
| Modifying a component instance directly | Use `set_instance_overrides` instead of direct property changes |

## Setup

First-time setup: run the helper script:
```bash
bash ~/.claude/skills/figma/scripts/setup.sh
```

Or see `~/.claude/skills/figma/references/mcp-tools.md` for manual setup.

## References

- `~/.claude/skills/figma/references/mcp-tools.md` — Complete tool reference (40+ tools with parameters)
- `~/.claude/skills/figma/references/design-tokens.md` — Token extraction and sync patterns
- `~/.claude/skills/figma/references/workflows.md` — End-to-end workflow sequences
- `~/.claude/skills/figma/examples/figma-to-react.md` — Worked example: Figma → React component
- `~/.claude/skills/ui-ux-designer/SKILL.md` — Design principles and visual quality
- `~/.claude/skills/react/SKILL.md` — React component patterns for generated code
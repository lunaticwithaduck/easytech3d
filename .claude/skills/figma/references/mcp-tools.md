# Figma MCP Tools Reference

Complete reference for all tools in the `grab/cursor-talk-to-figma-mcp` server.

## Prerequisites & Connection

### MCP Server Registration

```bash
# Register the MCP server with Claude Code
claude mcp add --transport stdio TalkToFigma bunx cursor-talk-to-figma-mcp@latest

# Verify registration
claude mcp list
```

### Architecture

```
Claude Code ──MCP──→ MCP Server ──WebSocket──→ Figma Plugin ──API──→ Figma Canvas
                     (bunx)        (bun socket)    (in Figma desktop)
```

Three components must be running:
1. **MCP Server** — started automatically by Claude Code via `bunx`
2. **WebSocket Bridge** — `bun socket` from the cloned repo (default: `ws://localhost:3845`)
3. **Figma Plugin** — open in Figma desktop, joined to a channel

### Connection Tool

#### `join_channel`

Establish communication with the Figma plugin. **Must be called first before any other tool.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | string | Yes | Channel name matching the Figma plugin's channel |

```
join_channel(channel="design-team")
→ { success: true, message: "Joined channel: design-team" }
```

---

## Document & Selection Tools

### `get_document_info`

Returns current Figma document metadata.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| — | — | — | No parameters |

Returns: `{ name, pages: [{ id, name }], currentPage: { id, name } }`

### `get_selection`

Returns details about currently selected elements in Figma.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| — | — | — | No parameters |

Returns: Array of `{ id, name, type, width, height }`

### `read_my_design`

Extracts detailed styling and layout data from the active selection. This is the primary design extraction tool.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | No | Specific node ID (defaults to current selection) |

Returns comprehensive object:
```
{
  name, type, width, height,
  fills: [{ type, color: { r, g, b, a }, opacity }],
  strokes: [{ type, color, weight }],
  effects: [{ type, radius, offset, color }],
  typography: { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing },
  cornerRadius, padding, itemSpacing,
  layoutMode, layoutAlign,
  children: [{ ... recursive }]
}
```

### `get_node_info`

Fetch comprehensive details for a specific node by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | The node ID to inspect |

Returns: Same structure as `read_my_design` but for a specific node.

### `get_nodes_info`

Retrieve data for multiple nodes at once.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeIds` | string[] | Yes | Array of node IDs |

Returns: Array of node info objects.

### `set_focus`

Select a node and scroll the viewport to display it.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Node to focus on |

### `set_selections`

Select multiple nodes and adjust viewport.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeIds` | string[] | Yes | Array of node IDs to select |

---

## Scanning Tools

### `scan_nodes_by_types`

Find all nodes matching specified types.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `types` | string[] | Yes | Node types to find |

Valid types: `FRAME`, `TEXT`, `RECTANGLE`, `ELLIPSE`, `COMPONENT`, `INSTANCE`, `GROUP`, `VECTOR`, `LINE`, `STAR`, `POLYGON`, `BOOLEAN_OPERATION`

Returns: Array of `{ id, name, type, parent }`

### `scan_text_nodes`

Analyze all text elements with intelligent chunking for large files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chunkSize` | number | No | Max nodes per chunk (default: all). Use 50 for large files. |
| `chunkIndex` | number | No | Which chunk to return (0-indexed) |

Returns: Array of `{ id, name, characters, fontSize, fontFamily }`

---

## Design System Tools

### `get_styles`

Access all local styles defined in the document.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| — | — | — | No parameters |

Returns:
```
{
  paintStyles: [{ id, name, paints: [{ type, color }] }],
  textStyles: [{ id, name, fontFamily, fontSize, fontWeight, lineHeight }],
  effectStyles: [{ id, name, effects: [{ type, radius, offset, color }] }],
  gridStyles: [{ id, name, grids: [...] }]
}
```

### `get_local_components`

Retrieve all components defined in the document.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| — | — | — | No parameters |

Returns: Array of `{ id, name, description, properties: [{ name, type, defaultValue }] }`

---

## Creating Elements

### `create_frame`

Insert a new frame.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Frame name |
| `width` | number | No | Width in pixels (default: 100) |
| `height` | number | No | Height in pixels (default: 100) |
| `x` | number | No | X position |
| `y` | number | No | Y position |
| `parentId` | string | No | Parent node ID (default: current page) |

Returns: `{ id }` — the new frame's node ID.

### `create_rectangle`

Add a rectangle.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Rectangle name |
| `width` | number | No | Width (default: 100) |
| `height` | number | No | Height (default: 100) |
| `x` | number | No | X position |
| `y` | number | No | Y position |
| `parentId` | string | No | Parent node ID |

Returns: `{ id }`

### `create_text`

Generate a text node.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Text layer name |
| `characters` | string | Yes | The text content |
| `fontSize` | number | No | Font size (default: 16) |
| `fontFamily` | string | No | Font family (default: "Inter") |
| `fontWeight` | number | No | Font weight (default: 400) |
| `x` | number | No | X position |
| `y` | number | No | Y position |
| `parentId` | string | No | Parent node ID |

Returns: `{ id }`

---

## Text Modification

### `set_text_content`

Update a single text node's content.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Text node to update |
| `text` | string | Yes | New text content |

### `set_multiple_text_contents`

Batch update multiple text nodes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `edits` | array | Yes | `[{ nodeId, text }]` pairs |

---

## Styling Tools

### `set_fill_color`

Apply a fill color to a node. **Colors use 0-1 range, not 0-255.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Target node |
| `r` | number | Yes | Red (0-1) |
| `g` | number | Yes | Green (0-1) |
| `b` | number | Yes | Blue (0-1) |
| `a` | number | No | Alpha (0-1, default: 1) |

**Color conversion:** `figmaValue = cssValue / 255`

| CSS Color | r | g | b |
|-----------|---|---|---|
| `#000000` (black) | 0 | 0 | 0 |
| `#FFFFFF` (white) | 1 | 1 | 1 |
| `#3B82F6` (blue-500) | 0.231 | 0.510 | 0.965 |
| `#EF4444` (red-500) | 0.937 | 0.267 | 0.267 |
| `#10B981` (emerald-500) | 0.063 | 0.725 | 0.506 |
| `#1E293B` (slate-800) | 0.118 | 0.161 | 0.231 |

### `set_stroke_color`

Set stroke properties.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Target node |
| `r` | number | Yes | Red (0-1) |
| `g` | number | Yes | Green (0-1) |
| `b` | number | Yes | Blue (0-1) |
| `a` | number | No | Alpha (0-1) |
| `weight` | number | No | Stroke weight in px |

### `set_corner_radius`

Define corner radius with optional per-corner control.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Target node |
| `radius` | number | Yes | Uniform radius |
| `topLeft` | number | No | Override top-left |
| `topRight` | number | No | Override top-right |
| `bottomLeft` | number | No | Override bottom-left |
| `bottomRight` | number | No | Override bottom-right |

---

## Auto-Layout Tools

**Important:** Apply auto-layout properties in this order to avoid conflicts.

### `set_layout_mode`

Enable/configure auto-layout on a frame.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Target frame |
| `mode` | string | Yes | `"NONE"`, `"HORIZONTAL"`, or `"VERTICAL"` |

### `set_padding`

Define internal spacing.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Auto-layout frame |
| `top` | number | No | Top padding |
| `right` | number | No | Right padding |
| `bottom` | number | No | Bottom padding |
| `left` | number | No | Left padding |

### `set_item_spacing`

Adjust distance between child elements.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Auto-layout frame |
| `spacing` | number | Yes | Gap between children in px |

### `set_axis_align`

Control alignment on primary and counter axes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Auto-layout frame |
| `primary` | string | No | `"MIN"` (start), `"CENTER"`, `"MAX"` (end), `"SPACE_BETWEEN"` |
| `counter` | string | No | `"MIN"`, `"CENTER"`, `"MAX"`, `"BASELINE"` |

### `set_layout_sizing`

Set how the frame and children size themselves.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Target frame |
| `horizontal` | string | No | `"FIXED"`, `"HUG"`, `"FILL"` |
| `vertical` | string | No | `"FIXED"`, `"HUG"`, `"FILL"` |

---

## Component Tools

### `create_component_instance`

Instantiate a component by its key or ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `componentId` | string | Yes | Component node ID |
| `x` | number | No | X position |
| `y` | number | No | Y position |
| `parentId` | string | No | Parent node ID |

Returns: `{ id }` — the instance node ID.

### `get_instance_overrides`

Extract current override properties on an instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Instance node ID |

Returns: Array of `{ property, value, nodeId }`

### `set_instance_overrides`

Apply overrides to a component instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Instance node ID |
| `overrides` | array | Yes | `[{ property, value }]` |

---

## Annotation Tools

### `get_annotations`

Extract all annotations from the document or a specific node.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | No | Specific node (default: entire document) |

Returns: Array of `{ nodeId, label, description }`

### `set_annotation`

Create or update an annotation. Supports markdown.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Node to annotate |
| `label` | string | Yes | Annotation label |
| `description` | string | No | Markdown description |

### `set_multiple_annotations`

Batch annotation operations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `annotations` | array | Yes | `[{ nodeId, label, description }]` |

---

## Layout & Organization Tools

### `move_node`

Reposition an element.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Node to move |
| `x` | number | Yes | New X position |
| `y` | number | Yes | New Y position |

### `resize_node`

Modify dimensions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Node to resize |
| `width` | number | Yes | New width |
| `height` | number | Yes | New height |

### `clone_node`

Duplicate a node with optional offset.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Node to clone |
| `offsetX` | number | No | X offset from original |
| `offsetY` | number | No | Y offset from original |

Returns: `{ id }` — the cloned node's ID.

### `delete_node`

Remove a single element.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Node to delete |

### `delete_multiple_nodes`

Remove multiple elements efficiently.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeIds` | string[] | Yes | Array of node IDs to delete |

---

## Prototype Tools

### `get_reactions`

Extract prototype reactions (interactions) with visual animation data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | No | Specific node (default: selection) |

Returns: Array of `{ trigger, action, destination, animation }`

### `set_default_connector`

Configure FigJam connector styling.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `strokeColor` | object | No | `{ r, g, b, a }` |
| `strokeWeight` | number | No | Line weight |
| `connectorType` | string | No | `"STRAIGHT"`, `"ELBOWED"` |

### `create_connections`

Generate connector lines between nodes (FigJam).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `connections` | array | Yes | `[{ from, to, label? }]` |

---

## Export Tools

### `export_node_as_image`

Export a node as an image file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | Yes | Node to export |
| `format` | string | No | `"PNG"` (default), `"JPG"`, `"SVG"`, `"PDF"` |
| `scale` | number | No | Export scale (default: 1, use 2 for retina) |

Returns: Base64-encoded image data.

**Note:** Image export has limited support — returns base64 as text, which may be large for complex nodes. Use `scale=1` for initial checks, `scale=2` for final exports.

---

## MCP Prompts

The server includes guidance prompts accessible via the MCP prompt system:

| Prompt | Purpose |
|--------|---------|
| `design_strategy` | Best practices for modifying designs |
| `read_design_strategy` | Optimal approaches for reading/extracting designs |
| `text_replacement_strategy` | Systematic text update workflows |
| `annotation_conversion_strategy` | Migrating legacy annotations |
| `swap_overrides_instances` | Component instance management |
| `reaction_to_connector_strategy` | Visualizing prototype flows |
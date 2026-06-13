# Agents

Instructions for AI coding agents working on this repository.

## Project overview

kn-editor is an opinionated, easy-to-use rich text editor wrapper built on [Lexical](https://lexical.dev/) and React. It aims to provide a PrimeReact-style API (similar to the old Quill-based PrimeReact Editor) with a simple `value`, `onChange`, `placeholder` prop interface.

## Architecture

```
src/
  KnEditor.tsx        - Main component, entry point. Accepts value/onChange/placeholder props.
                        Registers all nodes, includes all plugins, renders toolbar + editor + status bar.
  index.ts             - Package exports
  config.ts            - Shared configuration (block types, font options, color presets, emoji list)
  nodes/               - Custom Lexical nodes (ImageNode, VideoNode)
  plugins/
    ToolbarPlugin.tsx  - Full toolbar with all formatting, insert, and utility buttons
    ImagePlugin.tsx    - Image insertion via file picker
    VideoPlugin.tsx    - YouTube video embedding
    TablePlugin.tsx    - Table insert dialog (rows x cols)
  styles/
    _variables.scss    - CSS custom properties (colors, shadows, radii, typography)
    editor.scss        - All component styles (toolbar, editor, dropdowns, dialogs, table, code, etc.)
  ui/
    Dialog.tsx         - Modal text input dialog (used for links, videos)
    DropDown.tsx       - Dropdown menu component (used for block type, font, alignment)
    ColorPicker.tsx    - Color swatch grid dropdown (used for text color, highlight)
    EmojiPicker.tsx    - Emoji grid dropdown
playground/            - Separate Vite app for testing the package as a consumer
```

## Lexical dependencies

The editor uses these `@lexical/*` packages (all pinned to the same version):

- `lexical` - Core
- `@lexical/react` - React bindings, HorizontalRuleNode/Plugin, TablePlugin, TabIndentationPlugin
- `@lexical/rich-text` - HeadingNode, QuoteNode
- `@lexical/list` - ListNode, ListItemNode
- `@lexical/link` - LinkNode, AutoLinkNode
- `@lexical/html` - HTML serialization/deserialization
- `@lexical/selection` - $patchStyleText, $wrapNodes
- `@lexical/utils` - $getNearestNodeOfType
- `@lexical/code` - CodeNode, CodeHighlightNode
- `@lexical/table` - TableNode, TableCellNode, TableRowNode

**Important:** All `@lexical/*` packages must be on the same version to avoid duplicate `lexical` core issues that cause TypeScript errors.

## Key conventions

- The editor outputs and accepts **HTML strings** (not Lexical JSON) for the `value` and `onChange` props.
- `value` is an initial value (set on mount), not a controlled value — Lexical manages internal state after initialization.
- All Lexical node types used in the editor must be registered in the `editorNodes` array in `KnEditor.tsx`.
- All Lexical plugins must be placed inside the `<LexicalComposer>` in `KnEditor.tsx`.
- Toolbar state (active format buttons, current block type, colors, alignment) is tracked in `ToolbarPlugin.tsx` via `registerUpdateListener`.
- Theming uses SCSS with CSS custom properties defined in `_variables.scss`.
- Icons come from `lucide-react`.

## Building and testing

```bash
npm install          # install dependencies
npm run build        # build the library to dist/
npm run dev          # run the dev server

# Playground (consumer-like testing)
cd playground
npm install
npm run dev          # runs on http://localhost:5173
```

## When making changes

- New Lexical nodes go in `src/nodes/` and must be added to `editorNodes` in `KnEditor.tsx`.
- New plugins go in `src/plugins/` and must be included inside the `<LexicalComposer>` in `KnEditor.tsx`.
- New toolbar buttons go in `src/plugins/ToolbarPlugin.tsx` — follow the existing pattern for state tracking and command dispatch.
- New UI components (pickers, dialogs) go in `src/ui/`.
- New configuration constants (presets, labels) go in `src/config.ts`.
- Keep the prop API simple and flat — avoid exposing Lexical internals to consumers.
- Run `npm run build` to verify the library compiles before committing.
- Test changes in the `playground/` app to verify consumer-facing behavior.

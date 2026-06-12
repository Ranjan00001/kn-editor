# Agents

Instructions for AI coding agents working on this repository.

## Project overview

kn-editor is an opinionated, easy-to-use rich text editor wrapper built on [Lexical](https://lexical.dev/) and React. It aims to provide a PrimeReact-style API (similar to the old Quill-based PrimeReact Editor) with a simple `value`, `onChange`, `placeholder` prop interface.

## Architecture

```
src/
  KnEditor.tsx        - Main component, entry point. Accepts value/onChange/placeholder props.
  index.ts             - Package exports
  config.ts            - Shared configuration
  nodes/               - Custom Lexical nodes (ImageNode, VideoNode)
  plugins/             - Lexical plugins (ToolbarPlugin, ImagePlugin, VideoPlugin)
  styles/              - SCSS theming (_variables.scss, editor.scss)
  ui/                  - Reusable UI components (Dialog, DropDown)
playground/            - Separate Vite app for testing the package as a consumer
```

## Key conventions

- The editor outputs and accepts **HTML strings** (not Lexical JSON) for the `value` and `onChange` props.
- `value` is an initial value (set on mount), not a controlled value — Lexical manages internal state after initialization.
- All Lexical node types used in the editor must be registered in the `editorNodes` array in `KnEditor.tsx`.
- Theming uses SCSS with CSS custom properties defined in `_variables.scss`.

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
- Keep the prop API simple and flat — avoid exposing Lexical internals to consumers.
- Run `npm run build` to verify the library compiles before committing.
- Test changes in the `playground/` app to verify consumer-facing behavior.

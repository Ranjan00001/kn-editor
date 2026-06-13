# Contributing to kn-editor

Thanks for your interest in contributing! This guide will help you get started.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies:

```bash
npm install
```

3. Build the library:

```bash
npm run build
```

4. For consumer-like testing, use the playground app:

```bash
cd playground
npm install
npm run dev
```

## Project structure

```
src/
  KnEditor.tsx        - Main editor component
  config.ts            - Block types, font options, color presets, emoji list
  nodes/               - Custom Lexical nodes (ImageNode, VideoNode)
  plugins/             - ToolbarPlugin, ImagePlugin, VideoPlugin, TablePlugin
  styles/              - SCSS theming (_variables.scss, editor.scss)
  ui/                  - Dialog, DropDown, ColorPicker, EmojiPicker
playground/            - Separate Vite app for testing as a package consumer
```

## Making changes

### Adding a new feature

1. Create a branch from `main`:

```bash
git checkout -b feat/your-feature-name
```

2. If adding a new Lexical node, place it in `src/nodes/` and register it in the `editorNodes` array in `KnEditor.tsx`.
3. If adding a new plugin, place it in `src/plugins/` and include it inside the `<LexicalComposer>` in `KnEditor.tsx`.
4. If adding a new toolbar button, add it in `src/plugins/ToolbarPlugin.tsx` — follow the existing pattern for state tracking and command dispatch.
5. If adding a new UI component (picker, dialog), place it in `src/ui/`.
6. If adding new configuration (color presets, labels, font options), add it to `src/config.ts`.
7. Keep the consumer-facing API simple. Prefer flat props over nested configuration objects.

### Lexical version alignment

All `@lexical/*` packages must be on the same version. Mismatched versions cause duplicate `lexical` core installs and TypeScript errors. When upgrading, bump all `@lexical/*` deps together.

### Code style

- TypeScript for all source files.
- SCSS for styles, using CSS custom properties for theming.
- Icons from `lucide-react`.
- No test framework is set up yet — test your changes manually in the playground.

### Commit messages

Follow conventional commit format:

```
feat: add table support
fix: resolve image resize on Safari
style: update toolbar spacing
docs: add usage examples for video embedding
```

## Submitting a pull request

1. Make sure the library builds without errors:

```bash
npm run build
```

2. Test your change in the playground app.
3. Push your branch and open a pull request against `main`.
4. Describe what your change does and why in the PR description.

## Reporting issues

Open an issue on GitHub with:

- A clear description of the problem or feature request.
- Steps to reproduce (for bugs).
- Expected vs actual behavior.

## Project goals

kn-editor aims to be a simple, opinionated wrapper over Lexical that provides a PrimeReact-style editor API. When in doubt, favor simplicity and ease of use for the consumer over exposing every Lexical option.

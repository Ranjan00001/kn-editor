# Contributing to kn-editor

Thanks for your interest in contributing! This guide will help you get started.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

4. For consumer-like testing, use the playground app:

```bash
cd playground
npm install
npm run dev
```

## Making changes

### Adding a new feature

1. Create a branch from `main`:

```bash
git checkout -b feat/your-feature-name
```

2. If adding a new Lexical node, place it in `src/nodes/` and register it in the `editorNodes` array in `KnEditor.tsx`.
3. If adding a new plugin, place it in `src/plugins/` and include it inside the `<LexicalComposer>` in `KnEditor.tsx`.
4. Keep the consumer-facing API simple. Prefer flat props over nested configuration objects.

### Code style

- TypeScript for all source files.
- SCSS for styles, using CSS custom properties for theming.
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

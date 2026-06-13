# kn-editor

A powerful, customizable, and premium rich text editor built on top of Lexical and React. Designed to provide a simple, PrimeReact-style API with a comprehensive set of formatting tools out of the box.

## Features

- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Subscript, Superscript, Inline Code.
- **Block Formatting**: Headings (H1, H2, H3), Paragraphs, Blockquotes, Code Blocks.
- **Lists**: Ordered and Unordered lists with indent/outdent support.
- **Text Alignment**: Left, Center, Right, and Justify.
- **Colors**: Text color and background highlight color pickers with preset palettes.
- **Rich Media**:
  - Insert and resize images via native file picker.
  - Insert and embed YouTube videos automatically via URL.
  - Insert horizontal rules.
- **Tables**: Insert tables with configurable rows and columns via a dialog.
- **Emoji Picker**: Quick-insert common emojis from a dropdown grid.
- **Undo / Redo**: Full history support with toolbar buttons.
- **Utilities**: Clear formatting, fullscreen toggle, word and character count.
- **Customizable Theming**: Fully styled with SCSS and CSS Custom Properties for easy overriding.
- **Link Insertion**: Custom dialog-based link insertion and removal.

## Installation

```bash
npm install kn-editor
```

Ensure you have `react` and `react-dom` (>=18) installed as peer dependencies.

## Usage

```tsx
import React from 'react';
import { KnEditor } from 'kn-editor';
import 'kn-editor/dist/style.css';

export function App() {
  const handleChange = (htmlContent, editorState) => {
    console.log('Editor HTML:', htmlContent);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Editor</h1>
      <KnEditor
        value="<p>Hello <b>World</b>!</p>"
        placeholder="Start typing your masterpiece..."
        onChange={handleChange}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Initial HTML content for the editor. Set once on mount. |
| `placeholder` | `string` | Placeholder text shown when the editor is empty. |
| `onChange` | `(html: string, editorState: EditorState) => void` | Called on every change with the current HTML and Lexical EditorState. |

## Toolbar

The editor ships with a two-row toolbar containing:

```
[Undo] [Redo] | [Block Type v] | [Font Family v] [Font Size v] |
[B] [I] [U] [S] [Sub] [Sup] [Code] | [Text Color] [Highlight] |
[Align v] | [Indent] [Outdent] | [Link] [Image] [Video] [HR] [Table] [Emoji] |
[Clear Format] [Fullscreen]
```

**Block types**: Normal, Heading 1-3, Bullet List, Numbered List, Blockquote, Code Block.

## Theming

`kn-editor` uses CSS custom properties attached to the `:root` pseudo-class. Override these variables in your own stylesheet to match your app's branding.

```css
:root {
  --primary: #ff5722;
  --bg-main: #121212;
  --text-main: #ffffff;
  --border-color: #333333;
  --radius-lg: 12px;
}
```

See `src/styles/_variables.scss` for the full list of available custom properties.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## For AI agents

See [AGENTS.md](AGENTS.md) for architecture and conventions when working on this codebase.

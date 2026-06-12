# kn-editor

A powerful, customizable, and premium rich text editor built on top of Lexical and React.

## Features

- **Rich Text Editing**: Bold, Italic, Underline, Strikethrough.
- **Block Formatting**: Headings (H1, H2, H3), Paragraphs, Blockquotes.
- **Lists**: Ordered and Unordered lists.
- **Rich Media**:
  - Insert and resize images via native file picker.
  - Insert and embed YouTube videos automatically via URL.
- **Customizable Theming**: Fully styled with SCSS and CSS Custom Properties for easy overriding.
- **Link Previews**: Custom dialog-based link insertion.

## Installation

```bash
npm install kn-editor
```

Ensure you have `@lexical/react` and `lexical` installed as peer dependencies.

## Usage

```tsx
import React from 'react';
import { KnEditor } from 'kn-editor';
import 'kn-editor/dist/style.css'; // Make sure to import the CSS!

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

## Theming

`kn-editor` uses CSS custom properties attached to the `:root` pseudo-class. You can easily override these variables in your own stylesheet to match your app's branding.

```css
:root {
  --primary: #ff5722; /* Set your brand primary color */
  --bg-main: #121212; /* Dark mode background */
  --text-main: #ffffff; /* Dark mode text */
  --border-color: #333333; /* Dark mode borders */
  --radius-lg: 12px; /* Extra rounded corners */
}
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## For AI agents

See [AGENTS.md](AGENTS.md) for architecture and conventions when working on this codebase.

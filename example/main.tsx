import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { KnEditor } from '../src/index';

function App() {
  const [editorState, setEditorState] = useState<string | null>(null);

  return (
    <div className="app-container">
      <h1 className="title">Kn-Editor Playground</h1>
      <KnEditor
        placeholder="Start writing your beautiful content here..."
        onChange={(html, state) => setEditorState(html)}
      />
      <div style={{ marginTop: '24px', padding: '16px', background: '#e2e8f0', borderRadius: '8px' }}>
        <h3>Editor State:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', overflowX: 'auto' }}>
          {JSON.stringify(editorState, null, 2)}
        </pre>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);

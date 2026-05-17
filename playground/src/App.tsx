import { useState } from 'react';
// Importing the package exactly as a consumer would:
import { KnEditor } from 'kn-editor';
import 'kn-editor/style.css';

function App() {
  const [content, setContent] = useState<any>(null);

  return (
    <div style={{ fontFamily: 'sans-serif', margin: '40px auto', maxWidth: '800px' }}>
      <h1>My Application</h1>
      <p>This is a separate Vite application importing the <code>kn-editor</code> package as a dependency.</p>

      <KnEditor
        placeholder="Start typing..."
        onChange={(html, state) => setContent(html)}
      />

      <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
        <h3>Exported State:</h3>
        <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;

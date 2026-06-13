import { useState } from 'react';
import { KnEditor } from 'kn-editor';
import 'kn-editor/style.css';

function App() {
  const [content, setContent] = useState<any>(null);

  return (
    <div style={{ fontFamily: 'sans-serif', margin: '40px auto', maxWidth: '900px' }}>
      <h1>kn-editor Playground</h1>
      <p>Full-featured rich text editor with all toolbar options.</p>

      <KnEditor
        value="<p>Hello <b>World</b>! Try out all the <i>new features</i> in the toolbar above.</p>"
        placeholder="Start typing..."
        onChange={(html, state) => setContent(html)}
      />

      <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
        <h3>HTML Output:</h3>
        <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;

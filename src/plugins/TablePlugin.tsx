import React, { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { TextInputDialog } from '../ui/Dialog';

export const INSERT_TABLE_DIALOG_COMMAND = 'INSERT_TABLE_DIALOG';

export function TableInsertDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [rows, setRows] = useState('3');
  const [cols, setCols] = useState('3');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const r = parseInt(rows, 10);
    const c = parseInt(cols, 10);
    if (r > 0 && c > 0 && r <= 20 && c <= 10) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: String(r),
        columns: String(c),
      });
      onClose();
    }
  };

  return (
    <div className="kn-dialog-overlay" onClick={onClose}>
      <div className="kn-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="kn-dialog-title">Insert Table</h3>
        <div className="kn-dialog-body">
          <label className="kn-dialog-label">
            Rows (1-20)
            <input
              className="kn-dialog-input"
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
            />
          </label>
          <label className="kn-dialog-label">
            Columns (1-10)
            <input
              className="kn-dialog-input"
              type="number"
              min="1"
              max="10"
              value={cols}
              onChange={(e) => setCols(e.target.value)}
            />
          </label>
        </div>
        <div className="kn-dialog-actions">
          <button className="kn-dialog-btn kn-dialog-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="kn-dialog-btn kn-dialog-btn-confirm" onClick={handleSubmit}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}

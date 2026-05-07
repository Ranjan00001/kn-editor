import React, { useState, useEffect } from 'react';

export interface TextInputDialogProps {
  title: string;
  initialValue?: string;
  placeholder?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

export function TextInputDialog({
  title,
  initialValue = '',
  placeholder = '',
  isOpen,
  onClose,
  onSubmit,
}: TextInputDialogProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
    onClose();
  };

  return (
    <div className="kn-editor-dialog-overlay" onClick={onClose}>
      <div
        className="kn-editor-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="kn-editor-dialog-title">{title}</h3>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            className="kn-editor-dialog-input"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="kn-editor-dialog-actions">
            <button
              type="button"
              className="kn-editor-dialog-btn cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="kn-editor-dialog-btn submit"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

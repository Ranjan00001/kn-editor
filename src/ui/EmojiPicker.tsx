import React, { useEffect, useRef, useState } from 'react';

interface EmojiPickerProps {
  emojis: string[];
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ emojis, onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="kn-emoji-picker-container" ref={containerRef}>
      <button
        className="kn-toolbar-item"
        onClick={() => setIsOpen(!isOpen)}
        title="Insert Emoji"
        aria-label="Insert Emoji"
      >
        <span style={{ fontSize: '16px' }}>😀</span>
      </button>
      {isOpen && (
        <div className="kn-emoji-picker-dropdown">
          <div className="kn-emoji-grid">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                className="kn-emoji-item"
                onClick={() => {
                  onEmojiSelect(emoji);
                  setIsOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

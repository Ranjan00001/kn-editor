import React, { useEffect, useRef, useState } from 'react';

interface ColorPickerProps {
  icon: React.ReactNode;
  colors: string[];
  currentColor: string;
  onColorChange: (color: string) => void;
  title?: string;
}

export function ColorPicker({
  icon,
  colors,
  currentColor,
  onColorChange,
  title,
}: ColorPickerProps) {
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
    <div className="kn-color-picker-container" ref={containerRef}>
      <button
        className="kn-toolbar-item"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        aria-label={title}
      >
        {icon}
        <span
          className="kn-color-indicator"
          style={{ backgroundColor: currentColor === 'transparent' ? 'transparent' : currentColor }}
        />
      </button>
      {isOpen && (
        <div className="kn-color-picker-dropdown">
          <div className="kn-color-grid">
            {colors.map((color) => (
              <button
                key={color}
                className={`kn-color-swatch ${currentColor === color ? 'active' : ''}`}
                style={{
                  backgroundColor: color === 'transparent' ? '#fff' : color,
                  backgroundImage: color === 'transparent'
                    ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)'
                    : 'none',
                  backgroundSize: color === 'transparent' ? '8px 8px' : 'auto',
                  backgroundPosition: color === 'transparent' ? '0 0, 4px 4px' : 'auto',
                }}
                onClick={() => {
                  onColorChange(color);
                  setIsOpen(false);
                }}
                title={color === 'transparent' ? 'None' : color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

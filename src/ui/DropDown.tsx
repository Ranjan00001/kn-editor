import { ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropDownProps {
  buttonLabel: ReactNode;
  buttonIcon?: ReactNode;
  children: ReactNode;
}

export function DropDown({ buttonLabel, buttonIcon, children }: DropDownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="kn-editor-dropdown-container" ref={dropDownRef}>
      <button
        type="button"
        className="kn-editor-dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {buttonIcon && <span className="kn-editor-dropdown-icon">{buttonIcon}</span>}
        <span className="kn-editor-dropdown-label">{buttonLabel}</span>
        <ChevronDown size={14} className="kn-editor-dropdown-chevron" />
      </button>

      {isOpen && (
        <div className="kn-editor-dropdown-menu" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

interface DropDownItemProps {
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
}

export function DropDownItem({ onClick, children, icon, active }: DropDownItemProps) {
  return (
    <button
      type="button"
      className={`kn-editor-dropdown-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {icon && <span className="kn-editor-dropdown-item-icon">{icon}</span>}
      <span className="kn-editor-dropdown-item-label">{children}</span>
    </button>
  );
}

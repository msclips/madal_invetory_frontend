import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        className="input"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%', 
          cursor: 'pointer',
          color: selectedOption ? 'var(--fg-color)' : 'var(--accents-5)'
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} style={{ opacity: 0.5 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          zIndex: 50,
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {options.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--accents-5)', textAlign: 'center' }}>
              No options available
            </div>
          ) : (
            options.map(option => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: 'var(--fg-color)',
                  backgroundColor: String(value) === String(option.value) ? 'var(--accents-2)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (String(value) !== String(option.value)) {
                    e.currentTarget.style.backgroundColor = 'var(--accents-1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (String(value) !== String(option.value)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{option.label}</span>
                {String(value) === String(option.value) && <Check size={16} />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

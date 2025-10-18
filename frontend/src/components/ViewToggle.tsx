import React from 'react';
import { Grid3X3, List } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'card' | 'list';
  onToggle: () => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onToggle }) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '0.5rem',
    padding: '0.25rem'
  };

  const getButtonStyle = (isActive: boolean) => ({
    padding: '0.5rem',
    borderRadius: '0.375rem',
    transition: 'all 0.2s',
    border: isActive ? '1px solid var(--card-border-color)' : '1px solid transparent',
    ...(isActive ? {
      color: 'var(--card-text-color)'
    } : {
      color: 'var(--card-secondary-text-color)'
    })
  });

  const iconStyle = {
    width: '1.25rem',
    height: '1.25rem'
  };

  return (
    <div style={containerStyle}>
      <button
        type="button"
        onClick={onToggle}
        style={getButtonStyle(viewMode === 'card')}
        aria-label="Switch to card view"
      >
        <Grid3X3 style={iconStyle} />
      </button>
      <button
        type="button"
        onClick={onToggle}
        style={getButtonStyle(viewMode === 'list')}
        aria-label="Switch to list view"
      >
        <List style={iconStyle} />
      </button>
    </div>
  );
};
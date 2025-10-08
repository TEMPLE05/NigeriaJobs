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
    backgroundColor: 'var(--card-bg-color)',
    borderRadius: '0.5rem',
    padding: '0.25rem'
  };

  const getButtonStyle = (isActive: boolean) => ({
    padding: '0.5rem',
    borderRadius: '0.375rem',
    transition: 'all 0.2s',
    ...(isActive ? {
      backgroundColor: 'var(--card-bg-color)',
      color: 'var(--card-text-color)',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
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
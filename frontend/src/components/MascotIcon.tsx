import React from 'react';
import { MASCOT_ICON_URL } from '../utils/branding';

// Drop-in replacement for a lucide icon component (same className/strokeWidth
// props so it can sit directly in an icon slot like NAV_LINKS) that renders
// the site mascot instead of a line icon. strokeWidth is accepted and
// ignored — it only makes sense for SVG icons, not this image.
interface MascotIconProps {
  className?: string;
  strokeWidth?: number;
}

export const MascotIcon: React.FC<MascotIconProps> = ({ className }) => (
  <img src={MASCOT_ICON_URL} alt="" className={`${className || ''} object-contain`} />
);

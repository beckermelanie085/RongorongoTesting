import React from 'react';
import { GLYPH_CATALOG } from '../data/glyph-catalog';

interface GlyphIconProps {
  signId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
}

export const GlyphIcon: React.FC<GlyphIconProps> = ({
  signId,
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  // Strip doubtful mark or compound markers for lookup
  const cleanId = signId.replace(/[?[\]+]/g, '').trim();
  const glyph = GLYPH_CATALOG[cleanId];

  const sizeDimensions = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeDimensions} flex items-center justify-center rounded border border-[#dcd7cb] bg-[#fbf9f4] p-1 shadow-xs`}
        title={`Sign ${signId}${glyph ? ` (${glyph.descriptiveLabel})` : ''}`}
      >
        {glyph ? (
          <svg
            viewBox="0 0 90 90"
            className="w-full h-full stroke-[#222222] fill-none"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={glyph.strokeSvg} />
          </svg>
        ) : (
          <span className="font-mono text-xs font-semibold text-[#666660]">
            {signId}
          </span>
        )}
      </div>
      {showLabel && (
        <span className="mt-1 font-mono text-[11px] font-medium text-[#55524b]">
          {signId}
        </span>
      )}
    </div>
  );
};

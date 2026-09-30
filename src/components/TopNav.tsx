import React from 'react';
import { Download, BookOpen } from 'lucide-react';

interface TopNavProps {
  activeTab: 'lab' | 'visual' | 'zp' | 'dictionary' | 'diagnostics';
  onSelectTab: (tab: 'lab' | 'visual' | 'zp' | 'dictionary' | 'diagnostics') => void;
  onOpenExport: () => void;
  onOpenPresets: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenExport,
  onOpenPresets,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#ded9cd] bg-[#fbf9f5]/95 px-6 backdrop-blur-sm">
      {/* Zone 1: Single text element wordmark in display face */}
      <span className="font-serif-heading text-xl font-medium tracking-tight text-[#1c1917] whitespace-nowrap">
        Fabricius Rongorongo Workbench
      </span>

      {/* Zone 2: 4-6 clean text navigation links, single-line */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#57534e]">
        <button
          onClick={() => onSelectTab('lab')}
          className={`cursor-pointer whitespace-nowrap transition-colors pb-0.5 ${
            activeTab === 'lab'
              ? 'text-[#1c1917] border-b-2 border-[#1c1917] font-semibold'
              : 'hover:text-[#1c1917]'
          }`}
        >
          Corpus Laboratory
        </button>

        <button
          onClick={() => onSelectTab('visual')}
          className={`cursor-pointer whitespace-nowrap transition-colors pb-0.5 ${
            activeTab === 'visual'
              ? 'text-[#1c1917] border-b-2 border-[#1c1917] font-semibold'
              : 'hover:text-[#1c1917]'
          }`}
        >
          Visual Studio
        </button>

        <button
          onClick={() => onSelectTab('zp')}
          className={`cursor-pointer whitespace-nowrap transition-colors pb-0.5 ${
            activeTab === 'zp'
              ? 'text-[#1c1917] border-b-2 border-[#1c1917] font-semibold'
              : 'hover:text-[#1c1917]'
          }`}
        >
          ZP Test Series
        </button>

        <button
          onClick={() => onSelectTab('dictionary')}
          className={`cursor-pointer whitespace-nowrap transition-colors pb-0.5 ${
            activeTab === 'dictionary'
              ? 'text-[#1c1917] border-b-2 border-[#1c1917] font-semibold'
              : 'hover:text-[#1c1917]'
          }`}
        >
          Research Dictionary
        </button>

        <button
          onClick={() => onSelectTab('diagnostics')}
          className={`cursor-pointer whitespace-nowrap transition-colors pb-0.5 ${
            activeTab === 'diagnostics'
              ? 'text-[#1c1917] border-b-2 border-[#1c1917] font-semibold'
              : 'hover:text-[#1c1917]'
          }`}
        >
          Syntax & Invariants
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenPresets}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#44403c] border border-[#d6d1c4] bg-[#f5f2ea] rounded-md hover:bg-[#ede8dd] transition-colors whitespace-nowrap cursor-pointer"
          title="Switch corpus presets"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Tablets</span>
        </button>

        <button
          onClick={onOpenExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1c1917] rounded-md hover:bg-[#2d2926] transition-colors whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
};

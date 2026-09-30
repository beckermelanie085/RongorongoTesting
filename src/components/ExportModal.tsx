import React, { useState } from 'react';
import { RongorongoLine } from '../types/rongorongo';
import { rongorongoService } from '../services/rongorongo-analysis';
import { X, Copy, Download, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  corpus: RongorongoLine[];
  corpusText: string;
  targetSign: string;
  sourceSystem: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  corpus,
  corpusText,
  targetSign,
  sourceSystem,
}) => {
  const [exportFormat, setExportFormat] = useState<'markdown' | 'csv' | 'json' | 'text'>('markdown');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const sign = targetSign.trim() || '076';
  const summary = rongorongoService.summarizeSign(corpus, sign);
  const control = rongorongoService.matchedPositionalControl(corpus, sign);
  const occurrences = rongorongoService.getOccurrences(corpus, sign);

  // Generate output content based on format
  let outputContent = '';

  if (exportFormat === 'markdown') {
    outputContent = `# FABRICIUS WORKBENCH · RONGORONGO RESEARCH DOSSIER
**Target Sign:** ${sign}
**Source System:** ${sourceSystem}
**Corpus Extent:** ${corpus.length} lines analyzed
**Date Generated:** ${new Date().toISOString().split('T')[0]}

---

## 1. ZP-C3 Blind Structural Classification
- **Total Occurrences:** ${summary.totalOccurrences}
- **Linked / Compound Rate:** ${summary.linkedRate.toFixed(1)}% (${summary.linkedCount} instances)
- **Independent Rate:** ${summary.independentRate.toFixed(1)}% (${summary.independentCount} instances)
- **Structural Classes Identified:** ${summary.structuralClassCount}

### Position Breakdown
- **Compound Slots:** Initial = ${summary.compoundInitial}, Medial = ${summary.compoundMedial}, Final = ${summary.compoundFinal}
- **Line Slots:** Initial = ${summary.lineInitial}, Medial = ${summary.lineMedial}, Final = ${summary.lineFinal}
- **Tablet Distribution:** ${summary.tablets.join(', ')}

---

## 2. Matched Sign Positional Control
- **Target Linked Rate:** ${control.targetLinkedRate.toFixed(1)}%
- **Matched-Control Mean:** ${control.controlMeanLinkedRate.toFixed(1)}%
- **Target Difference vs Controls:** ${control.differenceFromControls > 0 ? '+' : ''}${control.differenceFromControls.toFixed(1)}%
- **Control Cohort Count:** ${control.controlCount} signs within ±25% frequency tolerance

| Control Sign | Frequency | Linked Count | Linked Rate | Freq Difference |
|---|---|---|---|---|
${control.controls
  .map(
    (c) =>
      `| ${c.signId} | ${c.frequency} | ${c.linkedCount} | ${c.linkedRate.toFixed(1)}% | ±${c.frequencyDifference} |`
  )
  .join('\n')}

---

*Interpretation status: structural evidence only · no decipherment assumed.*
`;
  } else if (exportFormat === 'csv') {
    const headers = [
      'Tablet',
      'Side',
      'LineLabel',
      'FlattenedIndex',
      'Linked',
      'CompoundSlot',
      'LineSlot',
      'SegmentLength',
      'PreviousSign',
      'NextSign',
      'RecurrenceInLine',
      'Certainty',
    ].join(',');

    const rows = occurrences.map((o) =>
      [
        o.tablet,
        o.side,
        o.lineLabel,
        o.flattenedIndex,
        o.compound ? 'YES' : 'NO',
        o.compoundPosition,
        o.linePosition,
        o.segmentLength,
        o.previousSign || 'START',
        o.nextSign || 'END',
        o.recurrenceInLine,
        o.certainty,
      ].join(',')
    );

    outputContent = [headers, ...rows].join('\n');
  } else if (exportFormat === 'json') {
    outputContent = JSON.stringify(
      {
        targetSign: sign,
        summary,
        matchedControl: control,
        occurrences,
        corpusLines: corpus,
      },
      null,
      2
    );
  } else {
    outputContent = corpusText;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = {
      markdown: 'md',
      csv: 'csv',
      json: 'json',
      text: 'txt',
    };
    const blob = new Blob([outputContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rongorongo-analysis-${sign}.${extensions[exportFormat]}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl rounded-lg border border-[#ded9cd] bg-white p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3 mb-4">
          <div>
            <h2 className="font-serif-heading text-2xl font-medium text-[#1c1917]">
              Export Research Dossier
            </h2>
            <span className="text-xs text-[#78716c]">
              Epigraphic dataset & statistical report
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#78716c] hover:bg-[#f5f2ea] hover:text-[#1c1917]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#57534e]">
            Format:
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-[#f5f2ea] rounded-md border border-[#ded9cd]">
            {(['markdown', 'csv', 'json', 'text'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors uppercase ${
                  exportFormat === fmt
                    ? 'bg-white text-[#1c1917] shadow-xs font-semibold'
                    : 'text-[#57534e] hover:text-[#1c1917]'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Text Preview */}
        <div className="flex-1 overflow-auto rounded border border-[#ded9cd] bg-[#faf8f5] p-3.5 mb-4">
          <pre className="font-mono text-xs leading-relaxed text-[#1c1917] whitespace-pre-wrap select-all">
            {outputContent}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0ede6]">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#44403c] border border-[#d6d1c4] bg-[#f5f2ea] rounded-md hover:bg-[#ede8dd] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#15803d]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Output'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1c1917] rounded-md hover:bg-[#2d2926] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
};

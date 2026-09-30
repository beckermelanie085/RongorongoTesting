import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { CorpusLab } from './components/CorpusLab';
import { VisualRecognitionStudio } from './components/VisualRecognitionStudio';
import { ZPTestSeries } from './components/ZPTestSeries';
import { DictionaryView } from './components/DictionaryView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { ExportModal } from './components/ExportModal';
import { CORPUS_PRESETS, CorpusPreset } from './data/corpus-presets';
import { RongorongoLine } from './types/rongorongo';
import { rongorongoService } from './services/rongorongo-analysis';
import { BookOpen, X, Check } from 'lucide-react';

const INITIAL_CORPUS_TEXT = CORPUS_PRESETS[0].text; // Synthetic calibration sample as in user spec

export default function App() {
  const [activeTab, setActiveTab] = useState<'lab' | 'visual' | 'zp' | 'dictionary' | 'diagnostics'>('lab');
  const [corpusText, setCorpusText] = useState<string>(INITIAL_CORPUS_TEXT);
  const [sourceSystem, setSourceSystem] = useState<string>('Custom');
  const [targetSign, setTargetSign] = useState<string>('076');
  const [corpus, setCorpus] = useState<RongorongoLine[]>(() =>
    rongorongoService.parseCorpus(INITIAL_CORPUS_TEXT, 'Custom')
  );

  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);

  const handleSelectPreset = (preset: CorpusPreset) => {
    setCorpusText(preset.text);
    setSourceSystem(preset.sourceSystem);
    const parsed = rongorongoService.parseCorpus(preset.text, preset.sourceSystem);
    setCorpus(parsed);
    setIsPresetModalOpen(false);
  };

  const handleInsertGlyphIntoCorpus = (lineLabel: string, glyphString: string) => {
    const lines = corpusText.split(/\r?\n/);
    let found = false;

    const updatedLines = lines.map((l) => {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('#')) return l;

      const split = trimmed.split('|');
      if (split.length >= 2 && split[0].trim().toLowerCase() === lineLabel.trim().toLowerCase()) {
        found = true;
        return `${split[0].trim()}|${split.slice(1).join('|').trim()} ${glyphString}`;
      }
      return l;
    });

    if (!found) {
      updatedLines.push(`${lineLabel.trim()}|${glyphString}`);
    }

    const newText = updatedLines.join('\n');
    setCorpusText(newText);
    const parsed = rongorongoService.parseCorpus(newText, sourceSystem);
    setCorpus(parsed);
  };

  const handleSelectSignForAnalysis = (signId: string) => {
    setTargetSign(signId);
    setActiveTab('lab');
  };

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#1f1d1a] flex flex-col selection:bg-[#ded9cd]">
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenPresets={() => setIsPresetModalOpen(true)}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'lab' && (
          <CorpusLab
            corpusText={corpusText}
            setCorpusText={setCorpusText}
            targetSign={targetSign}
            setTargetSign={setTargetSign}
            sourceSystem={sourceSystem}
            setSourceSystem={setSourceSystem}
            corpus={corpus}
            setCorpus={setCorpus}
          />
        )}

        {activeTab === 'visual' && (
          <VisualRecognitionStudio
            onInsertGlyphIntoCorpus={handleInsertGlyphIntoCorpus}
            onSelectSignForAnalysis={handleSelectSignForAnalysis}
          />
        )}

        {activeTab === 'zp' && (
          <ZPTestSeries
            corpus={corpus}
            onSelectSignForAnalysis={handleSelectSignForAnalysis}
          />
        )}

        {activeTab === 'dictionary' && (
          <DictionaryView
            onSelectSignForAnalysis={handleSelectSignForAnalysis}
          />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticsView corpusText={corpusText} />
        )}
      </main>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        corpus={corpus}
        corpusText={corpusText}
        targetSign={targetSign}
        sourceSystem={sourceSystem}
      />

      {/* Preset Modal */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-lg border border-[#ded9cd] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1c1917]" />
                <h3 className="font-serif-heading text-xl font-medium text-[#1c1917]">
                  Load Epigraphic Tablet Dataset
                </h3>
              </div>
              <button
                onClick={() => setIsPresetModalOpen(false)}
                className="p-1 rounded text-[#78716c] hover:bg-[#f5f2ea]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {CORPUS_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3.5 rounded-lg border border-[#ded9cd] bg-[#fbf9f5] hover:bg-[#f2eee3] hover:border-[#1c1917] transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-heading text-base font-semibold text-[#1c1917]">
                      {preset.name}
                    </h4>
                    <span className="font-mono text-xs text-[#78716c] bg-[#eeeae2] px-2 py-0.5 rounded">
                      {preset.sourceSystem}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534e] mt-1">
                    {preset.shortDesc}
                  </p>
                  <p className="text-[11px] text-[#78716c] mt-1.5 italic">
                    {preset.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

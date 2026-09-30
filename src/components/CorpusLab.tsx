import React, { useState, useEffect } from 'react';
import {
  GlyphOccurrence,
  GlyphSummary,
  MatchedControlResult,
  NeighborFrequency,
  RongorongoLine,
  StructuralClass,
} from '../types/rongorongo';
import { rongorongoService } from '../services/rongorongo-analysis';
import { CORPUS_PRESETS, CorpusPreset } from '../data/corpus-presets';
import { GlyphIcon } from './GlyphIcon';
import { Search, ArrowRight, Layers, FileText, CheckCircle2 } from 'lucide-react';

interface CorpusLabProps {
  corpusText: string;
  setCorpusText: (text: string) => void;
  targetSign: string;
  setTargetSign: (sign: string) => void;
  sourceSystem: string;
  setSourceSystem: (sys: string) => void;
  corpus: RongorongoLine[];
  setCorpus: (lines: RongorongoLine[]) => void;
}

export const CorpusLab: React.FC<CorpusLabProps> = ({
  corpusText,
  setCorpusText,
  targetSign,
  setTargetSign,
  sourceSystem,
  setSourceSystem,
  corpus,
  setCorpus,
}) => {
  const [occurrences, setOccurrences] = useState<GlyphOccurrence[]>([]);
  const [structuralClasses, setStructuralClasses] = useState<StructuralClass[]>([]);
  const [summary, setSummary] = useState<GlyphSummary | null>(null);
  const [control, setControl] = useState<MatchedControlResult | null>(null);
  const [previousNeighbors, setPreviousNeighbors] = useState<NeighborFrequency[]>([]);
  const [nextNeighbors, setNextNeighbors] = useState<NeighborFrequency[]>([]);
  const [parseMessage, setParseMessage] = useState<string>('');
  const [allSigns, setAllSigns] = useState<string[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('synthetic-test');

  const handleLoadCorpus = (customText?: string, customSystem?: string) => {
    const textToParse = customText ?? corpusText;
    const sysToUse = customSystem ?? sourceSystem;
    const parsed = rongorongoService.parseCorpus(textToParse, sysToUse);
    setCorpus(parsed);
    setParseMessage(`Loaded ${parsed.length} lines.`);

    const signs = rongorongoService.getAllSignIds(parsed);
    setAllSigns(signs);

    // If target sign is not in signs or empty, default to 076 or first available sign
    const signToAnalyze = targetSign.trim() || (signs.includes('076') ? '076' : signs[0] || '076');
    runAnalysis(parsed, signToAnalyze);
  };

  const runAnalysis = (linesToUse: RongorongoLine[] = corpus, signToUse: string = targetSign) => {
    const sign = signToUse.trim();
    if (!sign || linesToUse.length === 0) {
      setOccurrences([]);
      setSummary(null);
      setStructuralClasses([]);
      setControl(null);
      setPreviousNeighbors([]);
      setNextNeighbors([]);
      return;
    }

    const occs = rongorongoService.getOccurrences(linesToUse, sign);
    setOccurrences(occs);

    const sum = rongorongoService.summarizeSign(linesToUse, sign);
    setSummary(sum);

    const classes = rongorongoService.classifyStructuralOccurrences(occs);
    setStructuralClasses(classes);

    const ctrl = rongorongoService.matchedPositionalControl(linesToUse, sign);
    setControl(ctrl);

    const prev = rongorongoService.getPreviousNeighborFrequencies(linesToUse, sign);
    setPreviousNeighbors(prev);

    const next = rongorongoService.getNextNeighborFrequencies(linesToUse, sign);
    setNextNeighbors(next);
  };

  const handleSelectPreset = (preset: CorpusPreset) => {
    setSelectedPresetId(preset.id);
    setCorpusText(preset.text);
    setSourceSystem(preset.sourceSystem);
    handleLoadCorpus(preset.text, preset.sourceSystem);
  };

  const handleSignClick = (signId: string) => {
    setTargetSign(signId);
    runAnalysis(corpus, signId);
  };

  useEffect(() => {
    if (corpus.length === 0) {
      handleLoadCorpus();
    }
  }, []);

  const formatPercent = (val: number): string => `${val.toFixed(1)}%`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Editorial Hero */}
      <header className="mb-8">
        <div className="text-xs font-bold tracking-widest text-[#78716c] uppercase">
          FABRICIUS · RONGORONGO RESEARCH MODE
        </div>
        <h1 className="mt-2 font-serif-heading text-4xl sm:text-5xl font-medium tracking-tight text-[#1c1917] leading-tight text-balance">
          Rongorongo Structural Laboratory
        </h1>
        <p className="mt-3 max-w-3xl text-base sm:text-lg text-[#57534e] leading-relaxed">
          Corpus analysis without assuming a decipherment. Observed structure is kept
          separate from linguistic interpretation.
        </p>
      </header>

      {/* Methodological Warning Banner */}
      <div className="mb-8 border-l-4 border-[#1c1917] bg-[#fbf9f5] p-4 text-sm text-[#292524] shadow-xs">
        <span className="font-bold text-[#1c1917]">Research rule: </span>
        A structural pattern is not automatically a translation, word, name,
        grammatical particle, or phonetic value.
      </div>

      {/* Preset Corpus Switcher */}
      <div className="mb-6 rounded-lg border border-[#e2dcd0] bg-[#fbf9f5] p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#78716c]" />
            <span className="text-xs font-bold tracking-wider text-[#57534e] uppercase">
              Tablet Corpus Presets
            </span>
          </div>
          <span className="text-xs text-[#78716c]">
            Select verified artifact transcriptions or synthetic calibration set
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {CORPUS_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-2.5 rounded-md border text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#1c1917] bg-white shadow-xs font-semibold text-[#1c1917]'
                    : 'border-[#ded9cd] bg-[#f5f2ea] text-[#57534e] hover:bg-white'
                }`}
              >
                <div className="font-serif-heading text-sm text-[#1c1917] truncate">
                  {preset.name}
                </div>
                <div className="text-[11px] text-[#78716c] truncate mt-0.5">
                  {preset.tabletName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Corpus Input Panel */}
      <section className="mb-8 rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0ede6] pb-3 mb-4">
          <h2 className="font-serif-heading text-2xl font-medium text-[#1c1917]">
            1. Corpus
          </h2>
          <span className="text-xs text-[#78716c]">
            Format: TabletSideLine|glyph glyph [compound+compound] glyph
          </span>
        </div>

        <p className="text-sm text-[#57534e] mb-2">
          Enter one tablet line per row.
        </p>

        <pre className="mb-3 overflow-x-auto rounded border border-[#ded9cd] bg-[#f6f4ee] p-3 font-mono text-xs text-[#292524]">
{`Gv5|076 200 [076+600] 300
Gv6|100 076 [200+076]`}</pre>

        <p className="text-xs text-[#78716c] mb-4">
          Square brackets are optional for compounds. The + symbol preserves signs inside
          linked/compound groups. A question mark after a sign marks it doubtful: <code className="bg-[#eeeae2] px-1 py-0.5 rounded">076?</code>.
        </p>

        <div className="mb-4 max-w-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#57534e] mb-1">
            Transcription system
          </label>
          <input
            type="text"
            value={sourceSystem}
            onChange={(e) => setSourceSystem(e.target.value)}
            placeholder="Barthel / Horley / Custom"
            className="w-full rounded border border-[#c4beaf] bg-[#fdfdfc] px-3 py-2 text-sm text-[#1c1917] focus:border-[#1c1917] focus:outline-none"
          />
        </div>

        <textarea
          value={corpusText}
          onChange={(e) => setCorpusText(e.target.value)}
          rows={11}
          spellCheck={false}
          className="w-full rounded border border-[#c4beaf] bg-[#faf8f5] p-3.5 font-mono text-sm leading-relaxed text-[#1c1917] focus:border-[#1c1917] focus:bg-white focus:outline-none"
        />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => handleLoadCorpus()}
            className="inline-flex items-center gap-2 rounded bg-[#1c1917] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d2926] cursor-pointer transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Load Corpus</span>
          </button>

          <span className="font-mono text-sm font-semibold text-[#1c1917]">
            {parseMessage}
          </span>
        </div>
      </section>

      {/* 2. Target Sign Selector Panel */}
      <section className="mb-8 rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
        <h2 className="font-serif-heading text-2xl font-medium text-[#1c1917] mb-3">
          2. Select Sign
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={targetSign}
              onChange={(e) => setTargetSign(e.target.value)}
              placeholder="076"
              className="w-36 rounded border border-[#c4beaf] bg-[#faf8f5] px-3.5 py-2 font-mono text-lg font-bold text-[#1c1917] focus:border-[#1c1917] focus:bg-white focus:outline-none"
            />
            {targetSign && (
              <GlyphIcon signId={targetSign} size="md" />
            )}
          </div>

          <button
            type="button"
            onClick={() => runAnalysis(corpus, targetSign)}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#1c1917] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d2926] cursor-pointer transition-colors shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Run Blind Structural Test</span>
          </button>
        </div>

        {/* Quick-Pick Catalog of Detected Signs */}
        {allSigns.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#f0ede6]">
            <span className="text-xs font-semibold text-[#78716c] uppercase tracking-wider block mb-2">
              Signs Detected in Loaded Corpus ({allSigns.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allSigns.map((sign) => {
                const isSelected = targetSign.trim() === sign;
                return (
                  <button
                    key={sign}
                    onClick={() => handleSignClick(sign)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1917] text-white font-bold'
                        : 'bg-[#f4f1ea] text-[#44403c] hover:bg-[#eae5da]'
                    }`}
                  >
                    <span>{sign}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. Summary Panel (ZP-C3 Blind Structural Classification) */}
      {summary && (
        <section className="mb-8 rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ede6] pb-3 mb-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#78716c] uppercase block">
                ZP-C3 Protocol
              </span>
              <h2 className="font-serif-heading text-2xl font-medium text-[#1c1917]">
                Blind Structural Classification for Sign {summary.signId}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <GlyphIcon signId={summary.signId} size="lg" />
            </div>
          </div>

          {/* 4 Big Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border border-[#e7e3d8] bg-[#fbf9f5] p-5 rounded-md">
              <span className="font-mono text-3xl font-bold text-[#1c1917] block tabular-nums">
                {summary.totalOccurrences}
              </span>
              <span className="mt-1 text-xs font-semibold tracking-wider text-[#78716c] uppercase block">
                Occurrences
              </span>
            </div>

            <div className="border border-[#e7e3d8] bg-[#fbf9f5] p-5 rounded-md">
              <span className="font-mono text-3xl font-bold text-[#1c1917] block tabular-nums">
                {formatPercent(summary.linkedRate)}
              </span>
              <span className="mt-1 text-xs font-semibold tracking-wider text-[#78716c] uppercase block">
                Linked / Compound ({summary.linkedCount})
              </span>
            </div>

            <div className="border border-[#e7e3d8] bg-[#fbf9f5] p-5 rounded-md">
              <span className="font-mono text-3xl font-bold text-[#1c1917] block tabular-nums">
                {formatPercent(summary.independentRate)}
              </span>
              <span className="mt-1 text-xs font-semibold tracking-wider text-[#78716c] uppercase block">
                Independent ({summary.independentCount})
              </span>
            </div>

            <div className="border border-[#e7e3d8] bg-[#fbf9f5] p-5 rounded-md">
              <span className="font-mono text-3xl font-bold text-[#1c1917] block tabular-nums">
                {summary.structuralClassCount}
              </span>
              <span className="mt-1 text-xs font-semibold tracking-wider text-[#78716c] uppercase block">
                Structural Classes
              </span>
            </div>
          </div>

          {/* Visual Distribution Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-[#78716c] mb-1 font-mono">
              <span>Linked Affinity ({formatPercent(summary.linkedRate)})</span>
              <span>Independent Affinity ({formatPercent(summary.independentRate)})</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#eae5da] flex">
              <div
                style={{ width: `${summary.linkedRate}%` }}
                className="bg-[#292524] transition-all duration-300"
                title={`Linked: ${summary.linkedRate.toFixed(1)}%`}
              />
              <div
                style={{ width: `${summary.independentRate}%` }}
                className="bg-[#a8a29e] transition-all duration-300"
                title={`Independent: ${summary.independentRate.toFixed(1)}%`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#f0ede6] pt-6">
            <div>
              <h3 className="font-serif-heading text-lg font-medium text-[#1c1917] mb-3">
                Compound Position Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#f8f6f0] p-3 rounded border border-[#eae5da]">
                  <span className="text-xs text-[#78716c] block">Initial Slot</span>
                  <span className="font-mono text-xl font-bold text-[#1c1917] tabular-nums">
                    {summary.compoundInitial}
                  </span>
                </div>
                <div className="bg-[#f8f6f0] p-3 rounded border border-[#eae5da]">
                  <span className="text-xs text-[#78716c] block">Medial Slot</span>
                  <span className="font-mono text-xl font-bold text-[#1c1917] tabular-nums">
                    {summary.compoundMedial}
                  </span>
                </div>
                <div className="bg-[#f8f6f0] p-3 rounded border border-[#eae5da]">
                  <span className="text-xs text-[#78716c] block">Final Slot</span>
                  <span className="font-mono text-xl font-bold text-[#1c1917] tabular-nums">
                    {summary.compoundFinal}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif-heading text-lg font-medium text-[#1c1917] mb-3">
                Line Position Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#f8f6f0] p-3 rounded border border-[#eae5da]">
                  <span className="text-xs text-[#78716c] block">Line Initial</span>
                  <span className="font-mono text-xl font-bold text-[#1c1917] tabular-nums">
                    {summary.lineInitial}
                  </span>
                </div>
                <div className="bg-[#f8f6f0] p-3 rounded border border-[#eae5da]">
                  <span className="text-xs text-[#78716c] block">Line Medial</span>
                  <span className="font-mono text-xl font-bold text-[#1c1917] tabular-nums">
                    {summary.lineMedial}
                  </span>
                </div>
                <div className="bg-[#f8f6f0] p-3 rounded border border-[#eae5da]">
                  <span className="text-xs text-[#78716c] block">Line Final</span>
                  <span className="font-mono text-xl font-bold text-[#1c1917] tabular-nums">
                    {summary.lineFinal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#f0ede6] pt-4">
            <h3 className="font-serif-heading text-base font-medium text-[#1c1917] mb-2">
              Tablet Distribution
            </h3>
            <p className="text-sm font-mono text-[#44403c]">
              {summary.tablets.join(', ') || 'None detected in current corpus.'}
            </p>
          </div>
        </section>
      )}

      {/* 4. Matched Sign Positional Control Panel */}
      {control && (
        <section className="mb-8 rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
          <div className="border-b border-[#f0ede6] pb-3 mb-4">
            <h2 className="font-serif-heading text-2xl font-medium text-[#1c1917]">
              Matched Sign Positional Control
            </h2>
            <p className="text-sm text-[#57534e] mt-1">
              Target signs are compared with signs having similar corpus frequencies.
              This asks whether the target's linked behavior is unusual without assigning meaning.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="border border-[#e7e3d8] bg-[#fbf9f5] p-4 rounded-md">
              <span className="font-mono text-2xl font-bold text-[#1c1917] block tabular-nums">
                {control.targetFrequency}
              </span>
              <span className="text-xs font-semibold tracking-wider text-[#78716c] uppercase block mt-1">
                Target Frequency
              </span>
            </div>

            <div className="border border-[#e7e3d8] bg-[#fbf9f5] p-4 rounded-md">
              <span className="font-mono text-2xl font-bold text-[#1c1917] block tabular-nums">
                {formatPercent(control.targetLinkedRate)}
              </span>
              <span className="text-xs font-semibold tracking-wider text-[#78716c] uppercase block mt-1">
                Target Linked Rate
              </span>
            </div>

            <div className="border border-[#e7e3d8] bg-[#fbf9f5] p-4 rounded-md">
              <span className="font-mono text-2xl font-bold text-[#1c1917] block tabular-nums">
                {formatPercent(control.controlMeanLinkedRate)}
              </span>
              <span className="text-xs font-semibold tracking-wider text-[#78716c] uppercase block mt-1">
                Matched-Control Mean
              </span>
            </div>

            <div className="border border-[#e7e3d8] bg-[#fbf9f5] p-4 rounded-md">
              <span className={`font-mono text-2xl font-bold block tabular-nums ${
                control.differenceFromControls > 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
              }`}>
                {control.differenceFromControls > 0 ? '+' : ''}
                {formatPercent(control.differenceFromControls)}
              </span>
              <span className="text-xs font-semibold tracking-wider text-[#78716c] uppercase block mt-1">
                Target Minus Controls
              </span>
            </div>
          </div>

          {control.controls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#44403c] text-xs font-bold uppercase tracking-wider text-[#44403c]">
                    <th className="py-2.5 px-3">Control Sign</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Linked</th>
                    <th className="py-2.5 px-3">Linked Rate</th>
                    <th className="py-2.5 px-3">Frequency Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece7dc] font-mono">
                  {control.controls.map((item) => (
                    <tr
                      key={item.signId}
                      onClick={() => handleSignClick(item.signId)}
                      className="hover:bg-[#fbf9f4] cursor-pointer transition-colors"
                      title={`Click to analyze control sign ${item.signId}`}
                    >
                      <td className="py-2.5 px-3 font-bold text-[#1c1917] flex items-center gap-2">
                        <GlyphIcon signId={item.signId} size="sm" />
                        <span>{item.signId}</span>
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">{item.frequency}</td>
                      <td className="py-2.5 px-3 tabular-nums">{item.linkedCount}</td>
                      <td className="py-2.5 px-3 tabular-nums font-semibold">{formatPercent(item.linkedRate)}</td>
                      <td className="py-2.5 px-3 tabular-nums text-[#78716c]">±{item.frequencyDifference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#78716c] italic py-4">
              No frequency-matched control signs were available in this corpus within the ±25% frequency tolerance.
            </p>
          )}
        </section>
      )}

      {/* 5. Neighbors Panel (Previous Signs & Following Signs) */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
          <h2 className="font-serif-heading text-xl font-medium text-[#1c1917] mb-3">
            Previous Signs (Preceding {targetSign})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#44403c] text-xs font-bold uppercase tracking-wider text-[#44403c]">
                  <th className="py-2 px-3">Sign</th>
                  <th className="py-2 px-3">Count</th>
                  <th className="py-2 px-3">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece7dc] font-mono">
                {previousNeighbors.map((item) => {
                  const maxCount = previousNeighbors[0]?.count || 1;
                  const pct = (item.count / maxCount) * 100;
                  return (
                    <tr
                      key={item.signId}
                      onClick={() => handleSignClick(item.signId)}
                      className="hover:bg-[#fbf9f4] cursor-pointer"
                    >
                      <td className="py-2 px-3 font-semibold text-[#1c1917] flex items-center gap-1.5">
                        <GlyphIcon signId={item.signId} size="sm" />
                        <span>{item.signId}</span>
                      </td>
                      <td className="py-2 px-3 tabular-nums">{item.count}</td>
                      <td className="py-2 px-3 w-32">
                        <div className="h-2 w-full bg-[#eeeae2] rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-[#1c1917]"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {previousNeighbors.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-xs text-[#78716c] italic">
                      No preceding neighbors recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
          <h2 className="font-serif-heading text-xl font-medium text-[#1c1917] mb-3">
            Following Signs (Succeeding {targetSign})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#44403c] text-xs font-bold uppercase tracking-wider text-[#44403c]">
                  <th className="py-2 px-3">Sign</th>
                  <th className="py-2 px-3">Count</th>
                  <th className="py-2 px-3">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece7dc] font-mono">
                {nextNeighbors.map((item) => {
                  const maxCount = nextNeighbors[0]?.count || 1;
                  const pct = (item.count / maxCount) * 100;
                  return (
                    <tr
                      key={item.signId}
                      onClick={() => handleSignClick(item.signId)}
                      className="hover:bg-[#fbf9f4] cursor-pointer"
                    >
                      <td className="py-2 px-3 font-semibold text-[#1c1917] flex items-center gap-1.5">
                        <GlyphIcon signId={item.signId} size="sm" />
                        <span>{item.signId}</span>
                      </td>
                      <td className="py-2 px-3 tabular-nums">{item.count}</td>
                      <td className="py-2 px-3 w-32">
                        <div className="h-2 w-full bg-[#eeeae2] rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-[#1c1917]"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {nextNeighbors.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-xs text-[#78716c] italic">
                      No succeeding neighbors recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Every Occurrence Table Panel */}
      <section className="mb-8 rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3 mb-4">
          <h2 className="font-serif-heading text-2xl font-medium text-[#1c1917]">
            Every {targetSign} Occurrence ({occurrences.length})
          </h2>
          <span className="text-xs text-[#78716c]">
            Complete positional epigraphy inventory
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-[#44403c] font-bold uppercase tracking-wider text-[#44403c]">
                <th className="py-2.5 px-3">Tablet</th>
                <th className="py-2.5 px-3">Line</th>
                <th className="py-2.5 px-3">Linked?</th>
                <th className="py-2.5 px-3">Compound Slot</th>
                <th className="py-2.5 px-3">Line Slot</th>
                <th className="py-2.5 px-3">Segment Len</th>
                <th className="py-2.5 px-3">Previous</th>
                <th className="py-2.5 px-3">Next</th>
                <th className="py-2.5 px-3">Recurrence</th>
                <th className="py-2.5 px-3">Certainty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7dc] font-mono">
              {occurrences.map((occ, idx) => (
                <tr key={`${occ.lineLabel}-${occ.flattenedIndex}-${idx}`} className="hover:bg-[#fbf9f4]">
                  <td className="py-2.5 px-3 font-semibold text-[#1c1917]">{occ.tablet}</td>
                  <td className="py-2.5 px-3">{occ.lineLabel}</td>
                  <td className="py-2.5 px-3">
                    <span className={occ.compound ? 'font-bold text-[#1c1917]' : 'text-[#78716c]'}>
                      {occ.compound ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{occ.compoundPosition}</td>
                  <td className="py-2.5 px-3">{occ.linePosition}</td>
                  <td className="py-2.5 px-3 tabular-nums">{occ.segmentLength}</td>
                  <td className="py-2.5 px-3 text-[#57534e]">{occ.previousSign || 'START'}</td>
                  <td className="py-2.5 px-3 text-[#57534e]">{occ.nextSign || 'END'}</td>
                  <td className="py-2.5 px-3 tabular-nums font-semibold">{occ.recurrenceInLine}</td>
                  <td className="py-2.5 px-3 capitalize text-[#78716c]">{occ.certainty}</td>
                </tr>
              ))}
              {occurrences.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-sm text-[#78716c] italic">
                    No occurrences of sign {targetSign} detected in current corpus.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Stable Structural Classes Panel */}
      <section className="mb-8 rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
        <div className="border-b border-[#f0ede6] pb-3 mb-4">
          <h2 className="font-serif-heading text-2xl font-medium text-[#1c1917]">
            Stable Structural Classes ({structuralClasses.length})
          </h2>
          <p className="text-sm text-[#57534e] mt-1">
            These classes are generated without using names, genealogy, proposed readings, or translation.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-[#44403c] font-bold uppercase tracking-wider text-[#44403c]">
                <th className="py-2.5 px-3">Count</th>
                <th className="py-2.5 px-3">Linked</th>
                <th className="py-2.5 px-3">Compound Slot</th>
                <th className="py-2.5 px-3">Line Slot</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3">Previous</th>
                <th className="py-2.5 px-3">Next</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7dc] font-mono">
              {structuralClasses.map((sc) => (
                <tr key={sc.classId} className="hover:bg-[#fbf9f4]">
                  <td className="py-2.5 px-3 font-bold text-[#1c1917] tabular-nums">
                    {sc.occurrences}
                  </td>
                  <td className="py-2.5 px-3">
                    {sc.linked ? 'YES' : 'NO'}
                  </td>
                  <td className="py-2.5 px-3">{sc.compoundPosition}</td>
                  <td className="py-2.5 px-3">{sc.linePosition}</td>
                  <td className="py-2.5 px-3 tabular-nums">{sc.segmentLength}</td>
                  <td className="py-2.5 px-3">{sc.previousSign || 'START'}</td>
                  <td className="py-2.5 px-3">{sc.nextSign || 'END'}</td>
                </tr>
              ))}
              {structuralClasses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-[#78716c] italic">
                    No structural classes available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Epigraphic Research Footer */}
      <footer className="border-t border-[#ded9cd] py-6 text-xs text-[#78716c] text-center font-serif-heading italic">
        <strong className="font-semibold text-[#44403c]">Interpretation status: </strong>
        structural evidence only · no decipherment assumed
      </footer>
    </div>
  );
};

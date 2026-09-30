import React, { useState } from 'react';
import { GLYPH_CATALOG, GlyphMetadata } from '../data/glyph-catalog';
import { GlyphIcon } from './GlyphIcon';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Plus,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface VisualRecognitionStudioProps {
  onInsertGlyphIntoCorpus: (lineLabel: string, glyphString: string) => void;
  onSelectSignForAnalysis: (signId: string) => void;
}

interface InscribedGlyphBox {
  id: string;
  lineLabel: string;
  signId: string;
  isCompound: boolean;
  compoundString?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  candidates: Array<{ signId: string; confidence: number; label: string }>;
}

export const VisualRecognitionStudio: React.FC<VisualRecognitionStudioProps> = ({
  onInsertGlyphIntoCorpus,
  onSelectSignForAnalysis,
}) => {
  const [selectedTablet, setSelectedTablet] = useState<'santiago-g' | 'mamari-c' | 'tahua-a'>('santiago-g');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedGlyphBox, setSelectedGlyphBox] = useState<InscribedGlyphBox | null>({
    id: 'box-g-1',
    lineLabel: 'Gr1',
    signId: '076',
    isCompound: true,
    compoundString: '[076+600]',
    x: 180,
    y: 90,
    width: 65,
    height: 75,
    candidates: [
      { signId: '076', confidence: 0.834, label: 'Frigate bird / beak marker' },
      { signId: '075', confidence: 0.108, label: 'Beak variant' },
      { signId: '?', confidence: 0.058, label: 'Uncertain damaged sign' },
    ],
  });

  const [confirmedSign, setConfirmedSign] = useState<string>('076');
  const [certainty, setCertainty] = useState<'certain' | 'doubtful'>('certain');
  const [partnerSign, setPartnerSign] = useState<string>('600');
  const [compoundOrder, setCompoundOrder] = useState<'prefix' | 'postfix' | 'none'>('prefix');
  const [targetLine, setTargetLine] = useState<string>('Gr1');
  const [insertedFeedback, setInsertedFeedback] = useState<string | null>(null);

  // Inscribed glyph positions on the simulated tablet facsimile
  const tabletGlyphs: Record<string, InscribedGlyphBox[]> = {
    'santiago-g': [
      {
        id: 'box-g-1',
        lineLabel: 'Gr1',
        signId: '006',
        isCompound: false,
        x: 40,
        y: 85,
        width: 55,
        height: 75,
        candidates: [
          { signId: '006', confidence: 0.91, label: 'Crescent bar delimiter' },
          { signId: '001', confidence: 0.06, label: 'Staff' },
        ],
      },
      {
        id: 'box-g-2',
        lineLabel: 'Gr1',
        signId: '200',
        isCompound: false,
        x: 105,
        y: 85,
        width: 60,
        height: 75,
        candidates: [
          { signId: '200', confidence: 0.88, label: 'Standing anthropomorph' },
          { signId: '300', confidence: 0.07, label: 'Seated figure' },
        ],
      },
      {
        id: 'box-g-3',
        lineLabel: 'Gr1',
        signId: '076',
        isCompound: true,
        compoundString: '[076+600]',
        x: 180,
        y: 85,
        width: 75,
        height: 75,
        candidates: [
          { signId: '076', confidence: 0.834, label: 'Frigate bird / beak marker' },
          { signId: '075', confidence: 0.108, label: 'Beak variant' },
          { signId: '?', confidence: 0.058, label: 'Uncertain sign' },
        ],
      },
      {
        id: 'box-g-4',
        lineLabel: 'Gr1',
        signId: '300',
        isCompound: false,
        x: 270,
        y: 85,
        width: 60,
        height: 75,
        candidates: [
          { signId: '300', confidence: 0.94, label: 'Seated anthropomorph' },
          { signId: '200', confidence: 0.04, label: 'Standing anthropomorph' },
        ],
      },
      {
        id: 'box-g-5',
        lineLabel: 'Gr2',
        signId: '076',
        isCompound: false,
        x: 45,
        y: 185,
        width: 60,
        height: 75,
        candidates: [
          { signId: '076', confidence: 0.89, label: 'Independent frigate bird sign' },
          { signId: '400', confidence: 0.07, label: 'Bird-headed' },
        ],
      },
      {
        id: 'box-g-6',
        lineLabel: 'Gr2',
        signId: '600',
        isCompound: true,
        compoundString: '[200+076]',
        x: 120,
        y: 185,
        width: 75,
        height: 75,
        candidates: [
          { signId: '200', confidence: 0.81, label: 'Anthropomorph base' },
          { signId: '076', confidence: 0.79, label: 'Postfixed 076 element' },
        ],
      },
    ],
    'mamari-c': [
      {
        id: 'box-c-1',
        lineLabel: 'Cr6',
        signId: '040',
        isCompound: false,
        x: 50,
        y: 85,
        width: 60,
        height: 75,
        candidates: [
          { signId: '040', confidence: 0.95, label: 'Lunar night-station glyph' },
          { signId: '041', confidence: 0.04, label: 'Crescent phase' },
        ],
      },
      {
        id: 'box-c-2',
        lineLabel: 'Cr6',
        signId: '040',
        isCompound: true,
        compoundString: '[040+007]',
        x: 130,
        y: 85,
        width: 75,
        height: 75,
        candidates: [
          { signId: '040', confidence: 0.86, label: 'Station glyph with arc ligature' },
          { signId: '007', confidence: 0.84, label: 'Crescent ligature' },
        ],
      },
      {
        id: 'box-c-3',
        lineLabel: 'Cr6',
        signId: '076',
        isCompound: false,
        x: 220,
        y: 85,
        width: 60,
        height: 75,
        candidates: [
          { signId: '076', confidence: 0.92, label: 'Avian separator sign' },
          { signId: '075', confidence: 0.05, label: 'Variant' },
        ],
      },
    ],
    'tahua-a': [
      {
        id: 'box-a-1',
        lineLabel: 'Ar1',
        signId: '001',
        isCompound: false,
        x: 40,
        y: 85,
        width: 50,
        height: 75,
        candidates: [
          { signId: '001', confidence: 0.96, label: 'Vertical staff delimiter' },
        ],
      },
      {
        id: 'box-a-2',
        lineLabel: 'Ar1',
        signId: '200',
        isCompound: false,
        x: 105,
        y: 85,
        width: 60,
        height: 75,
        candidates: [
          { signId: '200', confidence: 0.89, label: 'Standing anthropomorph' },
        ],
      },
      {
        id: 'box-a-3',
        lineLabel: 'Ar1',
        signId: '076',
        isCompound: true,
        compoundString: '[076+600]',
        x: 180,
        y: 85,
        width: 75,
        height: 75,
        candidates: [
          { signId: '076', confidence: 0.85, label: 'Frigate bird element' },
          { signId: '600', confidence: 0.82, label: 'Reptilian partner' },
        ],
      },
    ],
  };

  const currentGlyphs = tabletGlyphs[selectedTablet] || [];

  const handleSelectBox = (box: InscribedGlyphBox) => {
    setSelectedGlyphBox(box);
    setConfirmedSign(box.signId);
    setTargetLine(box.lineLabel);
  };

  const handleConfirmAndInsert = () => {
    let finalToken = confirmedSign;
    if (certainty === 'doubtful') {
      finalToken += '?';
    }

    if (compoundOrder === 'prefix' && partnerSign) {
      finalToken = `[${finalToken}+${partnerSign}]`;
    } else if (compoundOrder === 'postfix' && partnerSign) {
      finalToken = `[${partnerSign}+${finalToken}]`;
    }

    onInsertGlyphIntoCorpus(targetLine, finalToken);
    setInsertedFeedback(`Inserted "${finalToken}" into line ${targetLine}!`);
    setTimeout(() => setInsertedFeedback(null), 3500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <header className="mb-6">
        <div className="text-xs font-bold tracking-widest text-[#78716c] uppercase">
          FABRICIUS · PHASE 2 PIPELINE
        </div>
        <h1 className="mt-2 font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-[#1c1917] leading-tight text-balance">
          Visual Recognition & Inscription Studio
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#57534e] max-w-3xl leading-relaxed">
          Epigraphic image verification: select tablet inscriptions, inspect visual features,
          confirm ML recognition candidates, construct compound ligatures, and commit directly to the corpus.
        </p>
      </header>

      {/* Main Grid: Tablet Canvas (left) and Recognition Inspector (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tablet Image Viewer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ede6] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#57534e]">
                Tablet Facsimile:
              </span>
              <select
                value={selectedTablet}
                onChange={(e) => setSelectedTablet(e.target.value as any)}
                className="rounded border border-[#c4beaf] bg-[#faf8f5] px-2.5 py-1 text-xs font-medium text-[#1c1917] focus:outline-none"
              >
                <option value="santiago-g">Small Santiago Tablet (G) - Recto</option>
                <option value="mamari-c">Tablet C (Mamari) - Lunar Sequence</option>
                <option value="tahua-a">Tahua (A) - Oar Inscription</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                className="p-1 rounded border border-[#d6d1c4] bg-[#f5f2ea] hover:bg-[#ede8dd] text-[#44403c]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs text-[#78716c] w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
                className="p-1 rounded border border-[#d6d1c4] bg-[#f5f2ea] hover:bg-[#ede8dd] text-[#44403c]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded border border-[#d6d1c4] bg-[#f5f2ea] hover:bg-[#ede8dd] text-[#44403c]"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Inscription Canvas */}
          <div className="relative h-96 w-full overflow-auto rounded border border-[#e5dfd3] bg-[#eadecc]/40 p-4 select-none">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                width: '680px',
                height: '340px',
              }}
              className="relative rounded border border-[#c8bead] bg-[#ebdcc4] shadow-inner transition-transform duration-150"
            >
              {/* Simulated Woodgrain and Fluted Channels */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,#9a815a,#9a815a_2px,transparent_2px,transparent_40px)]" />
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(90deg,#6b5331,#6b5331_1px,transparent_1px,transparent_16px)]" />

              {/* Tablet Header / Line indicators */}
              <div className="absolute top-2 left-4 text-[10px] font-mono font-bold tracking-widest text-[#7a6448] uppercase">
                {selectedTablet === 'santiago-g' && 'TABLET G · SANTIAGO RECTO · FLUTED CHANNELS'}
                {selectedTablet === 'mamari-c' && 'TABLET C · MAMARI LUNAR EPIGRAPHY'}
                {selectedTablet === 'tahua-a' && 'TABLET A · TAHUA OAR ASH WOOD'}
              </div>

              {/* Line 1 Guide */}
              <div className="absolute top-16 left-4 text-[11px] font-mono font-bold text-[#8a7559]">
                {selectedTablet === 'santiago-g' ? 'Gr1' : selectedTablet === 'mamari-c' ? 'Cr6' : 'Ar1'}
              </div>
              <div className="absolute top-20 left-12 right-6 border-b border-dashed border-[#bcaea0]/60" />

              {/* Line 2 Guide */}
              <div className="absolute top-40 left-4 text-[11px] font-mono font-bold text-[#8a7559]">
                {selectedTablet === 'santiago-g' ? 'Gr2' : selectedTablet === 'mamari-c' ? 'Cr7' : 'Av1'}
              </div>
              <div className="absolute top-44 left-12 right-6 border-b border-dashed border-[#bcaea0]/60" />

              {/* Clickable Inscribed Glyph Boxes */}
              {currentGlyphs.map((box) => {
                const isSelected = selectedGlyphBox?.id === box.id;
                const glyph = GLYPH_CATALOG[box.signId];

                return (
                  <div
                    key={box.id}
                    onClick={() => handleSelectBox(box)}
                    style={{
                      left: `${box.x}px`,
                      top: `${box.y}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`,
                    }}
                    className={`absolute flex flex-col items-center justify-center rounded cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-[#1c1917] bg-[#fdfbf7]/90 shadow-md ring-2 ring-[#1c1917]/20 z-10'
                        : 'border border-[#8f795d]/60 bg-[#f4ebe0]/60 hover:bg-[#fffdf9]/80'
                    }`}
                    title={`Click to inspect glyph ${box.signId} (${box.lineLabel})`}
                  >
                    {glyph ? (
                      <svg
                        viewBox="0 0 90 90"
                        className="w-10 h-10 stroke-[#42311f] fill-none"
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={glyph.strokeSvg} />
                      </svg>
                    ) : (
                      <span className="font-mono text-xs font-bold text-[#5c442c]">
                        {box.signId}
                      </span>
                    )}

                    <span className="text-[9px] font-mono font-semibold text-[#6e583f] mt-0.5">
                      {box.isCompound ? box.compoundString : box.signId}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#78716c]">
            <span>Click any glyph bounding box above to inspect strokes & ML confidence</span>
            <span className="font-mono">Active Target: {targetLine}</span>
          </div>
        </div>

        {/* Visual Recognition & Verification Pipeline (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3 mb-4">
            <h2 className="font-serif-heading text-xl font-medium text-[#1c1917]">
              Visual Recognition Engine
            </h2>
            <span className="text-xs font-mono font-bold text-[#78716c] uppercase">
              Classifier
            </span>
          </div>

          {selectedGlyphBox ? (
            <div className="space-y-5">
              {/* Glyph Crop Preview */}
              <div className="flex items-center gap-4 bg-[#fbf9f5] p-3.5 rounded-lg border border-[#e5dfd3]">
                <div className="flex flex-col items-center">
                  <GlyphIcon signId={selectedGlyphBox.signId} size="lg" />
                  <span className="mt-1 font-mono text-xs font-bold text-[#1c1917]">
                    Incision Crop
                  </span>
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-[#1c1917] mb-0.5">
                    Line {selectedGlyphBox.lineLabel} · Token slot
                  </div>
                  <div className="text-[#57534e]">
                    Bounding box coordinates: ({selectedGlyphBox.x}, {selectedGlyphBox.y})
                  </div>
                  <div className="text-[#78716c] mt-1 font-mono">
                    Structure: {selectedGlyphBox.isCompound ? 'Compound Ligature' : 'Independent sign'}
                  </div>
                </div>
              </div>

              {/* Machine Learning Candidates Ranking */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#57534e]">
                    ML Candidate Signs
                  </span>
                  <span className="text-[11px] text-[#78716c]">Ranked by visual similarity</span>
                </div>

                <div className="space-y-2">
                  {selectedGlyphBox.candidates.map((cand, idx) => {
                    const isSelected = confirmedSign === cand.signId;
                    const pct = Math.round(cand.confidence * 100);

                    return (
                      <div
                        key={cand.signId}
                        onClick={() => setConfirmedSign(cand.signId)}
                        className={`flex items-center justify-between p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-[#1c1917] bg-[#f5f2ea] shadow-xs'
                            : 'border-[#ded9cd] bg-white hover:bg-[#faf8f5]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#78716c] w-3">
                            {idx + 1}.
                          </span>
                          <GlyphIcon signId={cand.signId} size="sm" />
                          <div>
                            <span className="font-mono font-bold text-sm text-[#1c1917]">
                              {cand.signId}
                            </span>
                            <span className="text-[#78716c] ml-2">{cand.label}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#1c1917]">
                            {pct}%
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#15803d]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Human Epigrapher Confirmation & Ligature Builder */}
              <div className="border-t border-[#f0ede6] pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#57534e] block mb-2">
                  Human Epigrapher Verification
                </span>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] text-[#78716c] mb-1">
                      Confirmed Sign ID
                    </label>
                    <input
                      type="text"
                      value={confirmedSign}
                      onChange={(e) => setConfirmedSign(e.target.value)}
                      className="w-full rounded border border-[#c4beaf] bg-[#faf8f5] px-2.5 py-1.5 font-mono text-sm font-bold text-[#1c1917] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#78716c] mb-1">
                      Certainty Status
                    </label>
                    <select
                      value={certainty}
                      onChange={(e) => setCertainty(e.target.value as any)}
                      className="w-full rounded border border-[#c4beaf] bg-[#faf8f5] px-2 py-1.5 text-xs text-[#1c1917] focus:outline-none"
                    >
                      <option value="certain">Certain</option>
                      <option value="doubtful">Doubtful (?)</option>
                    </select>
                  </div>
                </div>

                {/* Compound Ligature Builder */}
                <div className="bg-[#fbf9f5] p-3 rounded border border-[#e5dfd3] mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#57534e] block mb-2">
                    Compound Ligature Relationship
                  </span>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-[10px] text-[#78716c]">Position</label>
                      <select
                        value={compoundOrder}
                        onChange={(e) => setCompoundOrder(e.target.value as any)}
                        className="w-full rounded border border-[#c4beaf] bg-white px-2 py-1 text-xs text-[#1c1917]"
                      >
                        <option value="none">Independent (no link)</option>
                        <option value="prefix">Prefix [{confirmedSign}+Partner]</option>
                        <option value="postfix">Postfix [Partner+{confirmedSign}]</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#78716c]">Partner Sign</label>
                      <input
                        type="text"
                        value={partnerSign}
                        disabled={compoundOrder === 'none'}
                        onChange={(e) => setPartnerSign(e.target.value)}
                        placeholder="600"
                        className="w-full rounded border border-[#c4beaf] bg-white px-2 py-1 font-mono text-xs text-[#1c1917] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-[#57534e]">
                    Resulting token:{' '}
                    <span className="font-mono font-bold text-[#1c1917]">
                      {compoundOrder === 'none'
                        ? `${confirmedSign}${certainty === 'doubtful' ? '?' : ''}`
                        : compoundOrder === 'prefix'
                        ? `[${confirmedSign}${certainty === 'doubtful' ? '?' : ''}+${partnerSign}]`
                        : `[${partnerSign}+${confirmedSign}${certainty === 'doubtful' ? '?' : ''}]`}
                    </span>
                  </div>
                </div>

                {/* Commit Action */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleConfirmAndInsert}
                    className="w-full inline-flex items-center justify-center gap-2 rounded bg-[#1c1917] py-2.5 px-4 text-xs font-semibold text-white hover:bg-[#2d2926] cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Append Verified Glyph to Corpus ({targetLine})</span>
                  </button>

                  <button
                    onClick={() => onSelectSignForAnalysis(confirmedSign)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded border border-[#d6d1c4] bg-[#f5f2ea] py-1.5 px-3 text-xs font-medium text-[#44403c] hover:bg-[#ede8dd] cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Structural Statistics for Sign {confirmedSign}</span>
                  </button>
                </div>

                {insertedFeedback && (
                  <div className="mt-3 p-2 bg-[#dcfce7] border border-[#86efac] text-[#166534] text-xs font-medium rounded text-center">
                    {insertedFeedback}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-[#78716c] italic">
              Select any glyph on the tablet canvas to run visual epigraphic classification.
            </div>
          )}
        </div>
      </div>

      {/* Catalog Grid for Reference */}
      <section className="mt-8 rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
        <h3 className="font-serif-heading text-xl font-medium text-[#1c1917] mb-2">
          Canonical Barthel Sign Catalog
        </h3>
        <p className="text-xs text-[#78716c] mb-4">
          Click on any canonical sign to test recognition candidates or load into the laboratory.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Object.values(GLYPH_CATALOG).map((glyph) => (
            <button
              key={glyph.id}
              onClick={() => {
                setConfirmedSign(glyph.id);
                onSelectSignForAnalysis(glyph.id);
              }}
              className="flex flex-col items-center justify-center p-3 rounded border border-[#ded9cd] bg-[#fbf9f5] hover:bg-[#f2eee3] hover:border-[#1c1917] transition-all cursor-pointer text-left"
            >
              <GlyphIcon signId={glyph.id} size="md" />
              <span className="font-mono text-xs font-bold text-[#1c1917] mt-1.5">
                {glyph.id}
              </span>
              <span className="text-[10px] text-[#78716c] truncate w-full text-center mt-0.5">
                {glyph.category}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

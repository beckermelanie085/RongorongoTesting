import React, { useState, useMemo } from 'react';
import {
  VOCABULARY_ENTRIES,
  HISTORICAL_PERSONS,
  ROYAL_GENEALOGIES,
  CROSS_SOURCE_ANCHORS,
  TABOO_RECORDS,
  PHONETIC_HYPOTHESES,
  TITLE_FORMULAS,
  TITLE_CANDIDATES,
  REJECTED_CLAIMS,
  BIBLIOGRAPHY_SOURCES,
  GV6_UNITS,
} from '../data/dictionary-data';
import { DictionaryConfidence } from '../types/dictionary';
import { GlyphIcon } from './GlyphIcon';
import {
  Book,
  Users,
  Search,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  FileText,
  Bookmark,
  Layers,
  Sparkles,
  GitBranch,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface DictionaryViewProps {
  onSelectSignForAnalysis: (signId: string) => void;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  onSelectSignForAnalysis,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'lexicon' | 'persons' | 'gv6' | 'formulas' | 'hypotheses' | 'rejected' | 'sources'
  >('lexicon');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confidenceFilter, setConfidenceFilter] = useState<DictionaryConfidence | 'all'>('all');

  const filteredLexicon = useMemo(() => {
    return VOCABULARY_ENTRIES.filter((item) => {
      const matchesConf = confidenceFilter === 'all' || item.confidence === confidenceFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.recordedForm.toLowerCase().includes(q) ||
        item.meaningOrReferent.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchesConf && matchesSearch;
    });
  }, [searchQuery, confidenceFilter]);

  const filteredHypotheses = useMemo(() => {
    return PHONETIC_HYPOTHESES.filter((item) => {
      const matchesConf = confidenceFilter === 'all' || item.confidence === confidenceFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.glyphOrSequence.toLowerCase().includes(q) ||
        item.proposedSound.toLowerCase().includes(q) ||
        item.proposedWord.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchesConf && matchesSearch;
    });
  }, [searchQuery, confidenceFilter]);

  const getConfidenceBadge = (conf: DictionaryConfidence) => {
    switch (conf) {
      case 'A':
        return (
          <span className="font-mono text-xs font-bold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded">
            GRADE A · Established
          </span>
        );
      case 'B':
        return (
          <span className="font-mono text-xs font-bold text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded">
            GRADE B · Strong Evidence
          </span>
        );
      case 'C':
        return (
          <span className="font-mono text-xs font-bold text-[#0891b2] bg-[#ecfeff] border border-[#a5f3fc] px-2 py-0.5 rounded">
            GRADE C · Plausible
          </span>
        );
      case 'D':
        return (
          <span className="font-mono text-xs font-bold text-[#b45309] bg-[#fffbeb] border border-[#fde68a] px-2 py-0.5 rounded">
            GRADE D · Speculative
          </span>
        );
      case 'E':
        return (
          <span className="font-mono text-xs font-bold text-[#78716c] bg-[#f5f5f4] border border-[#e7e5e4] px-2 py-0.5 rounded">
            GRADE E · Weak/Unverified
          </span>
        );
      case 'F':
        return (
          <span className="font-mono text-xs font-bold text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] px-2 py-0.5 rounded">
            GRADE F · Rejected
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <header className="mb-6">
        <div className="text-xs font-bold tracking-widest text-[#78716c] uppercase">
          FABRICIUS WORKBENCH · RESEARCH DICTIONARY
        </div>
        <h1 className="mt-2 font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-[#1c1917] leading-tight text-balance">
          Rongorongo Historical–Phonetic Research Dictionary
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#57534e] max-w-3xl leading-relaxed">
          Version 1 — A source-critical dictionary linking early Rapa Nui vocabulary, personal names, genealogies,
          death-taboo evidence, and rongorongo glyph sequences without treating speculative readings as established.
        </p>
      </header>

      {/* Core Epigraphic Principles Banner */}
      <div className="mb-8 rounded-lg border border-[#ded9cd] bg-[#fbf9f5] p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#ece7dc] pb-2">
          <Book className="w-4 h-4 text-[#1c1917]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#1c1917]">
            Core Epigraphic Rules & Methodological Safeguards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-bold text-[#1c1917] block mb-0.5">Core Rule:</span>
            <span className="text-[#57534e]">
              Raw evidence and proposed readings are stored separately. No candidate phonetic value may overwrite the original glyph record.
            </span>
          </div>

          <div>
            <span className="font-bold text-[#1c1917] block mb-0.5">Death-Taboo Rule:</span>
            <span className="text-[#57534e]">
              A taboo replacement is admitted as evidence only when independently documented. Hypothetical substitutions are strictly penalized.
            </span>
          </div>

          <div>
            <span className="font-bold text-[#1c1917] block mb-0.5">Validation Rule:</span>
            <span className="text-[#57534e]">
              Candidate values developed from one dataset must be tested on a withheld tablet (e.g. Santiago Staff I) before confidence can rise.
            </span>
          </div>
        </div>

        {/* Confidence Scale Reference Strip */}
        <div className="pt-2 border-t border-[#ece7dc] flex flex-wrap items-center gap-2 text-[11px] text-[#78716c]">
          <span className="font-bold text-[#1c1917]">Confidence Scale:</span>
          <span>A = Independently established</span>
          <span>·</span>
          <span>B = Strong evidence</span>
          <span>·</span>
          <span>C = Plausible</span>
          <span>·</span>
          <span>D = Speculative</span>
          <span>·</span>
          <span>E = Weak/unverified</span>
          <span>·</span>
          <span>F = Contradicted/rejected</span>
        </div>
      </div>

      {/* Primary Section Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#ded9cd] pb-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSubTab('lexicon')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              activeSubTab === 'lexicon'
                ? 'bg-[#1c1917] text-white font-semibold shadow-xs'
                : 'text-[#57534e] hover:bg-[#f5f2ea]'
            }`}
          >
            Churchill Lexicon ({VOCABULARY_ENTRIES.length})
          </button>

          <button
            onClick={() => setActiveSubTab('persons')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              activeSubTab === 'persons'
                ? 'bg-[#1c1917] text-white font-semibold shadow-xs'
                : 'text-[#57534e] hover:bg-[#f5f2ea]'
            }`}
          >
            Historical Persons & Genealogies
          </button>

          <button
            onClick={() => setActiveSubTab('gv6')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              activeSubTab === 'gv6'
                ? 'bg-[#1c1917] text-white font-semibold shadow-xs'
                : 'text-[#57534e] hover:bg-[#f5f2ea]'
            }`}
          >
            Gv5–Gv6 Genealogy Sequence
          </button>

          <button
            onClick={() => setActiveSubTab('formulas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              activeSubTab === 'formulas'
                ? 'bg-[#1c1917] text-white font-semibold shadow-xs'
                : 'text-[#57534e] hover:bg-[#f5f2ea]'
            }`}
          >
            Title Candidates & Formulas
          </button>

          <button
            onClick={() => setActiveSubTab('hypotheses')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              activeSubTab === 'hypotheses'
                ? 'bg-[#1c1917] text-white font-semibold shadow-xs'
                : 'text-[#57534e] hover:bg-[#f5f2ea]'
            }`}
          >
            Phonetic Hypotheses
          </button>

          <button
            onClick={() => setActiveSubTab('rejected')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              activeSubTab === 'rejected'
                ? 'bg-[#1c1917] text-white font-semibold shadow-xs'
                : 'text-[#57534e] hover:bg-[#f5f2ea]'
            }`}
          >
            Rejected Claims ({REJECTED_CLAIMS.length})
          </button>

          <button
            onClick={() => setActiveSubTab('sources')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              activeSubTab === 'sources'
                ? 'bg-[#1c1917] text-white font-semibold shadow-xs'
                : 'text-[#57534e] hover:bg-[#f5f2ea]'
            }`}
          >
            Sources ({BIBLIOGRAPHY_SOURCES.length})
          </button>
        </div>

        {/* Global Dictionary Search & Grade Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-[#78716c] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dictionary..."
              className="w-full rounded border border-[#c4beaf] bg-[#faf8f5] pl-7 pr-2 py-1 text-xs text-[#1c1917] focus:outline-none"
            />
          </div>

          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value as any)}
            className="rounded border border-[#c4beaf] bg-[#faf8f5] px-2 py-1 text-xs text-[#1c1917] focus:outline-none"
          >
            <option value="all">All Grades</option>
            <option value="A">Grade A only</option>
            <option value="B">Grade B only</option>
            <option value="C">Grade C only</option>
            <option value="D">Grade D only</option>
            <option value="E">Grade E only</option>
          </select>
        </div>
      </div>

      {/* Sub-Tab 1: Churchill 1912 Lexicon */}
      {activeSubTab === 'lexicon' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#78716c]">
            <span>
              Source: William Churchill, <em>Easter Island: The Rapanui Speech and the Peopling of Southeast Polynesia</em> (1912).
            </span>
            <span>Displaying {filteredLexicon.length} verified entries</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLexicon.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#78716c] bg-[#eeeae2] px-2 py-0.5 rounded">
                        {entry.id}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-[#78716c]">
                        {entry.type}
                      </span>
                    </div>
                    {getConfidenceBadge(entry.confidence)}
                  </div>

                  <h3 className="font-serif-heading text-2xl font-bold text-[#1c1917]">
                    {entry.recordedForm}
                    <span className="ml-2 font-mono text-sm font-normal text-[#78716c]">
                      /{entry.normalizedForm}/
                    </span>
                  </h3>

                  <p className="mt-2 text-sm text-[#292524] font-medium leading-relaxed">
                    {entry.meaningOrReferent}
                  </p>

                  <div className="mt-3 p-2.5 rounded bg-[#fbf9f5] border border-[#eae5da] text-xs text-[#57534e] space-y-1">
                    <div>
                      <strong className="text-[#1c1917]">Possible Segmentation:</strong>{' '}
                      <span className="font-mono">{entry.possibleSegmentation}</span>
                    </div>
                    {entry.modernForm && (
                      <div>
                        <strong className="text-[#1c1917]">Modern Form:</strong>{' '}
                        <span>{entry.modernForm}</span>
                      </div>
                    )}
                    <div>
                      <strong className="text-[#1c1917]">Notes:</strong> {entry.notes}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0ede6] flex items-center justify-between text-[11px] text-[#78716c]">
                  <span>{entry.sourcePage}</span>
                  <a
                    href={entry.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#1c1917] hover:underline"
                  >
                    <span>View scan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sub-Tab 2: Historical Persons & Genealogies */}
      {activeSubTab === 'persons' && (
        <section className="space-y-6">
          <div className="rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs">
            <h2 className="font-serif-heading text-xl font-medium text-[#1c1917] mb-2">
              Historical Informants & Tablet Guardians (Routledge 1919)
            </h2>
            <p className="text-xs text-[#78716c] mb-4">
              Historical figures directly tied to 19th-century tablet recitations, inspections, and custody at Anakena.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HISTORICAL_PERSONS.map((p) => (
                <div key={p.id} className="p-4 rounded-lg border border-[#ded9cd] bg-[#fbf9f5]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#78716c]">{p.id}</span>
                    {getConfidenceBadge(p.confidence)}
                  </div>
                  <h3 className="font-serif-heading text-xl font-bold text-[#1c1917]">
                    {p.recordedName}
                  </h3>
                  <span className="text-xs text-[#78716c] block mb-2">{p.roleOrStatus}</span>

                  <div className="text-xs space-y-1.5 text-[#44403c] border-t border-[#ece7dc] pt-2">
                    <div>
                      <strong>Period:</strong> {p.approxPeriod}
                    </div>
                    {p.clanOrLine && (
                      <div>
                        <strong>Clan:</strong> {p.clanOrLine}
                      </div>
                    )}
                    <div>
                      <strong>Rongorongo Link:</strong> {p.rongorongoAssociation}
                    </div>
                    <div className="text-[11px] text-[#78716c] italic pt-1">
                      {p.researchNotes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Source Concordance Table */}
          <div className="rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs">
            <h2 className="font-serif-heading text-xl font-medium text-[#1c1917] mb-2">
              Cross-Source Royal Name Anchors (XREF-001 to XREF-017)
            </h2>
            <p className="text-xs text-[#78716c] mb-4">
              Direct comparison of Roussel (1886), Jaussen (1893), Thomson (1891), and Métraux (1940) lists without forced row normalization.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#44403c] font-bold uppercase tracking-wider text-[#44403c]">
                    <th className="py-2 px-3">Anchor ID</th>
                    <th className="py-2 px-3">Normalized Label</th>
                    <th className="py-2 px-3">Roussel (Pos)</th>
                    <th className="py-2 px-3">Jaussen (Pos)</th>
                    <th className="py-2 px-3">Métraux (Pos)</th>
                    <th className="py-2 px-3">Thomson (Pos)</th>
                    <th className="py-2 px-3">Cross-Source Evidence & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece7dc] font-mono">
                  {CROSS_SOURCE_ANCHORS.map((anchor) => (
                    <tr key={anchor.id} className="hover:bg-[#fbf9f5]">
                      <td className="py-2 px-3 font-bold text-[#1c1917]">{anchor.id}</td>
                      <td className="py-2 px-3 font-semibold text-[#1c1917] font-sans">
                        {anchor.normalizedLabel}
                      </td>
                      <td className="py-2 px-3">{anchor.rousselForm} ({anchor.rousselPos})</td>
                      <td className="py-2 px-3">{anchor.jaussenForm} ({anchor.jaussenPos})</td>
                      <td className="py-2 px-3">{anchor.metrauxForm} ({anchor.metrauxPos})</td>
                      <td className="py-2 px-3">Pos {anchor.thomsonPos}</td>
                      <td className="py-2 px-3 font-sans text-xs text-[#57534e]">{anchor.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Sub-Tab 3: Gv5–Gv6 Genealogy Sequence */}
      {activeSubTab === 'gv6' && (
        <section className="space-y-6">
          <div className="rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3 mb-4">
              <div>
                <h2 className="font-serif-heading text-xl font-medium text-[#1c1917]">
                  Small Santiago Tablet G: Gv5–Gv6 Seven-Unit Model
                </h2>
                <span className="text-xs text-[#78716c]">
                  Davletshin (2012) re-segmentation: names begin with TB076–TB200
                </span>
              </div>
              <button
                onClick={() => onSelectSignForAnalysis('076')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1c1917] rounded-md hover:bg-[#2d2926]"
              >
                <span>Analyze Sign 076 in Lab</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Gv6 Inscription Diagram */}
            <div className="mb-6 p-4 rounded-lg bg-[#fbf9f5] border border-[#e5dfd3]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1c1917] block mb-2">
                Reconstructed Recursive Chain (Carryover Signs):
              </span>
              <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                <span className="bg-white px-2.5 py-1 rounded border border-[#ded9cd] font-bold text-[#1c1917]">
                  U1: [430+432] ↔ 769
                </span>
                <span>→</span>
                <span className="bg-white px-2.5 py-1 rounded border border-[#ded9cd] font-bold text-[#1c1917]">
                  U2: 769 ↔ 432+002
                </span>
                <span>→</span>
                <span className="bg-white px-2.5 py-1 rounded border border-[#ded9cd] font-bold text-[#1c1917]">
                  U3: 000!-280 ↔ 280
                </span>
                <span>→</span>
                <span className="bg-white px-2.5 py-1 rounded border border-[#ded9cd] font-bold text-[#1c1917]">
                  U4: 280-730 ↔ 730
                </span>
                <span>→</span>
                <span className="bg-white px-2.5 py-1 rounded border border-[#ded9cd] font-bold text-[#1c1917]">
                  U5: 730-517a ↔ 517a
                </span>
                <span>→</span>
                <span className="bg-white px-2.5 py-1 rounded border border-[#ded9cd] font-bold text-[#1c1917]">
                  U6: 517a-222 ↔ 222
                </span>
                <span>→</span>
                <span className="bg-[#f5f2ea] px-2.5 py-1 rounded border border-[#1c1917] font-bold text-[#1c1917]">
                  U7: 062+073 ↔ TITLE-X
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#44403c] font-bold uppercase tracking-wider text-[#44403c]">
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Onset Formula</th>
                    <th className="py-2.5 px-3">Son Name Signs</th>
                    <th className="py-2.5 px-3">Father Name Signs</th>
                    <th className="py-2.5 px-3">Shared Link (Son → Father)</th>
                    <th className="py-2.5 px-3">Proposed Phonetic Equation</th>
                    <th className="py-2.5 px-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece7dc] font-mono">
                  {GV6_UNITS.map((u) => (
                    <tr key={u.id} className="hover:bg-[#fbf9f5]">
                      <td className="py-2.5 px-3 font-bold text-[#1c1917]">{u.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1c1917]">{u.reconstructedStart} ({u.titleCandidate})</td>
                      <td className="py-2.5 px-3">{u.sonNameSigns}</td>
                      <td className="py-2.5 px-3">{u.fatherNameSigns}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#15803d]">{u.sharedLinkToNext}</td>
                      <td className="py-2.5 px-3 font-sans text-xs text-[#44403c]">{u.phoneticEquation}</td>
                      <td className="py-2.5 px-3">{getConfidenceBadge(u.confidenceStructure)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Sub-Tab 4: Title Candidates & Grammar */}
      {activeSubTab === 'formulas' && (
        <section className="space-y-6">
          {/* Grammar Formulas */}
          <div className="rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs">
            <h2 className="font-serif-heading text-xl font-medium text-[#1c1917] mb-2">
              Rapa Nui Onomastic & Grammatical Formulas (FRM-001 to FRM-006)
            </h2>
            <p className="text-xs text-[#78716c] mb-4">
              Independently recorded syntactic structures in traditional Rapa Nui manuscripts and narratives.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TITLE_FORMULAS.map((f) => (
                <div key={f.id} className="p-4 rounded-lg border border-[#ded9cd] bg-[#fbf9f5]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#1c1917]">{f.id}</span>
                    {getConfidenceBadge(f.confidence)}
                  </div>
                  <h3 className="font-serif-heading text-lg font-bold text-[#1c1917]">
                    {f.formula}
                  </h3>
                  <span className="text-xs text-[#78716c] block mb-2">{f.literalFunction}</span>

                  <div className="p-2.5 rounded bg-white border border-[#eae5da] text-xs font-mono mb-2">
                    <span className="text-[#1c1917] font-semibold">{f.exampleRapaNui}</span>
                  </div>

                  <p className="text-xs text-[#57534e] mb-2 leading-relaxed">
                    {f.interpretation}
                  </p>

                  <div className="text-[11px] text-[#78716c] pt-2 border-t border-[#ece7dc]">
                    <strong>Glyph Analogy:</strong> {f.glyphAnalogyToTest}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gv6 Title Candidates Table */}
          <div className="rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs">
            <h2 className="font-serif-heading text-xl font-medium text-[#1c1917] mb-2">
              Title Candidates for Gv6 TITLE-X vs 062+073 (TC-01 to TC-09)
            </h2>
            <p className="text-xs text-[#78716c] mb-4">
              Testing candidate titles against the strict 2-CV syllabogram constraint vs permissive logosyllabic model.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#44403c] font-bold uppercase tracking-wider text-[#44403c]">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Meaning / Role</th>
                    <th className="py-2.5 px-3">Syllable Parse</th>
                    <th className="py-2.5 px-3">2-CV Fit</th>
                    <th className="py-2.5 px-3">Status / Decision</th>
                    <th className="py-2.5 px-3">Why Not Match Yet?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece7dc]">
                  {TITLE_CANDIDATES.map((tc) => (
                    <tr key={tc.id} className="hover:bg-[#fbf9f5]">
                      <td className="py-2.5 px-3 font-bold text-[#1c1917] font-mono">
                        {tc.historicalForm}
                      </td>
                      <td className="py-2.5 px-3">{tc.meaningOrRole}</td>
                      <td className="py-2.5 px-3 font-mono">{tc.syllableParse}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            tc.simple2SignFit === 'GOOD' || tc.simple2SignFit === 'PASS'
                              ? 'bg-[#dcfce7] text-[#166534]'
                              : 'bg-[#fee2e2] text-[#991b1b]'
                          }`}
                        >
                          {tc.simple2SignFit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] font-semibold text-[#1c1917]">
                        {tc.status}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[#57534e]">{tc.whyNotMatchYet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Sub-Tab 5: Phonetic Hypotheses Ledger */}
      {activeSubTab === 'hypotheses' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#78716c]">
            <span>Active phonetic and structural proposals undergoing test validation.</span>
            <span>Displaying {filteredHypotheses.length} hypotheses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHypotheses.map((hyp) => (
              <div
                key={hyp.id}
                className="rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#78716c] bg-[#eeeae2] px-2 py-0.5 rounded">
                        {hyp.id}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          hyp.status === 'Promising'
                            ? 'bg-[#dbeafe] text-[#1e40af]'
                            : hyp.status === 'Quarantined'
                            ? 'bg-[#fee2e2] text-[#991b1b]'
                            : 'bg-[#fef9c3] text-[#854d0e]'
                        }`}
                      >
                        {hyp.status}
                      </span>
                    </div>
                    {getConfidenceBadge(hyp.confidence)}
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <GlyphIcon signId={hyp.glyphOrSequence} size="md" />
                    <div>
                      <h3 className="font-mono text-xl font-bold text-[#1c1917]">
                        {hyp.glyphOrSequence}
                      </h3>
                      <span className="font-mono text-sm text-[#2563eb] font-semibold">
                        Proposed: {hyp.proposedSound} ({hyp.proposedWord})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#44403c] leading-relaxed mb-3">
                    <strong>Basis:</strong> {hyp.basis}
                  </p>

                  <div className="p-3 rounded bg-[#fbf9f5] border border-[#eae5da] text-xs space-y-1.5 text-[#57534e]">
                    <div>
                      <strong className="text-[#1c1917]">Training Source:</strong>{' '}
                      <span className="font-mono">{hyp.trainingSource}</span>
                    </div>
                    <div>
                      <strong className="text-[#1c1917]">Contradictions:</strong>{' '}
                      <span>{hyp.contradictions}</span>
                    </div>
                    <div>
                      <strong className="text-[#1c1917]">Research Notes:</strong> {hyp.notes}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0ede6] flex items-center justify-between">
                  <span className="text-xs text-[#78716c]">Score: {hyp.score}</span>
                  <button
                    onClick={() => onSelectSignForAnalysis(hyp.glyphOrSequence.replace(/[^0-9]/g, ''))}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1c1917] hover:underline"
                  >
                    <span>Analyze sign in Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sub-Tab 6: Rejected & Quarantined Claims */}
      {activeSubTab === 'rejected' && (
        <section className="space-y-4">
          <div className="rounded-lg border-l-4 border-l-[#b91c1c] border border-[#fecaca] bg-[#fffbfb] p-4 text-xs text-[#7f1d1d]">
            <strong>Methodological Quarantine: </strong>
            Claims listed below were evaluated and downgraded/rejected to prevent circular reasoning and unproven readings from polluting structural analysis.
          </div>

          <div className="space-y-3">
            {REJECTED_CLAIMS.map((rej) => (
              <div
                key={rej.id}
                className="rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#b91c1c] bg-[#fee2e2] px-2 py-0.5 rounded">
                    {rej.id} · REJECTED
                  </span>
                  <span className="text-xs text-[#78716c]">Reviewed: {rej.dateReviewed}</span>
                </div>

                <h3 className="font-serif-heading text-lg font-bold text-[#1c1917] mb-1">
                  "{rej.claim}"
                </h3>

                <p className="text-xs text-[#b91c1c] font-medium mb-3">
                  Reason Rejected: {rej.reasonRejectedOrDowngraded}
                </p>

                <div className="p-3 rounded bg-[#faf8f5] border border-[#eae5da] text-xs space-y-1 text-[#57534e]">
                  <div>
                    <strong className="text-[#1c1917]">Origin / Source:</strong> {rej.sourceOrOrigin}
                  </div>
                  <div>
                    <strong className="text-[#1c1917]">Can Reopen If:</strong> {rej.canReopenIf}
                  </div>
                  <div>
                    <strong className="text-[#1c1917]">Safeguard Purpose:</strong> {rej.notes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sub-Tab 7: Bibliography & Sourced Corpora */}
      {activeSubTab === 'sources' && (
        <section className="space-y-4">
          <div className="text-xs text-[#78716c]">
            Foundational primary source editions, traditional manuscripts, and historical concordance files.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BIBLIOGRAPHY_SOURCES.map((src) => (
              <div
                key={src.id}
                className="rounded-lg border border-[#ded9cd] bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#78716c] bg-[#eeeae2] px-2 py-0.5 rounded">
                      {src.id}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        src.priority === 'Critical'
                          ? 'bg-[#fee2e2] text-[#991b1b]'
                          : 'bg-[#fef9c3] text-[#854d0e]'
                      }`}
                    >
                      {src.priority} Priority
                    </span>
                  </div>

                  <h3 className="font-serif-heading text-lg font-bold text-[#1c1917]">
                    {src.author} ({src.year})
                  </h3>
                  <span className="text-xs italic text-[#57534e] block mb-2">{src.title}</span>

                  <p className="text-xs text-[#44403c] mb-2 leading-relaxed">
                    <strong>Why It Matters:</strong> {src.whyItMatters}
                  </p>

                  <div className="p-2.5 rounded bg-[#fbf9f5] border border-[#eae5da] text-[11px] text-[#57534e]">
                    <div>
                      <strong>Verification Status:</strong> {src.verificationStatus}
                    </div>
                    <div>
                      <strong>Notes:</strong> {src.notes}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0ede6] flex items-center justify-between text-xs">
                  <span className="text-[#78716c]">{src.sourceType}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#1c1917] hover:underline"
                  >
                    <span>View primary document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

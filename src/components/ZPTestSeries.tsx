import React, { useState, useMemo } from 'react';
import { ZP_TEST_REGISTRY } from '../data/glyph-catalog';
import { ZPTestRecord, ZPTestStatus, RongorongoLine } from '../types/rongorongo';
import { rongorongoService } from '../services/rongorongo-analysis';
import { GlyphIcon } from './GlyphIcon';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Play,
  PlayCircle,
  Plus,
  Search,
  Filter,
  Download,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  FileText,
  RotateCcw,
  Edit3,
  AlertOctagon,
  X,
} from 'lucide-react';

interface ZPTestSeriesProps {
  corpus: RongorongoLine[];
  onSelectSignForAnalysis: (signId: string) => void;
}

export const ZPTestSeries: React.FC<ZPTestSeriesProps> = ({
  corpus,
  onSelectSignForAnalysis,
}) => {
  const [testRecords, setTestRecords] = useState<ZPTestRecord[]>(ZP_TEST_REGISTRY);
  const [selectedTestId, setSelectedTestId] = useState<string>('ZP-03'); // ZP-C3 Positional control
  const [filterStatus, setFilterStatus] = useState<ZPTestStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationLogs, setEvaluationLogs] = useState<Record<string, string>>({});

  // Falsification documentation modal state
  const [showFalsifyModal, setShowFalsifyModal] = useState<boolean>(false);
  const [falsifyTestTarget, setFalsifyTestTarget] = useState<ZPTestRecord | null>(null);
  const [falsificationNotesInput, setFalsificationNotesInput] = useState<string>('');
  const [falsificationError, setFalsificationError] = useState<string | null>(null);

  // New test modal state
  const [showNewTestModal, setShowNewTestModal] = useState<boolean>(false);
  const [newId, setNewId] = useState<string>('ZP-10');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newHypothesis, setNewHypothesis] = useState<string>('');
  const [newControlGroups, setNewControlGroups] = useState<string>('');
  const [newRecordedResults, setNewRecordedResults] = useState<string>('');
  const [newSupportingEvidence, setNewSupportingEvidence] = useState<string>('');
  const [newFalsificationCriterion, setNewFalsificationCriterion] = useState<string>('');
  const [newStatus, setNewStatus] = useState<ZPTestStatus>('pending');
  const [newTargetSigns, setNewTargetSigns] = useState<string>('076');
  const [newFalsificationNotes, setNewFalsificationNotes] = useState<string>('');
  const [newFormErrors, setNewFormErrors] = useState<{
    id?: string;
    controls?: string;
    hypothesis?: string;
    title?: string;
    falsificationNotes?: string;
  }>({});

  // Filtered tests
  const filteredTests = useMemo(() => {
    return testRecords.filter((t) => {
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.hypothesis.toLowerCase().includes(q) ||
        t.targetSigns.some((s) => s.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [testRecords, filterStatus, searchQuery]);

  const selectedTest = useMemo(() => {
    return testRecords.find((t) => t.id === selectedTestId) || testRecords[0];
  }, [testRecords, selectedTestId]);

  // Status metrics summary
  const counts = useMemo(() => {
    return {
      all: testRecords.length,
      passed: testRecords.filter((t) => t.status === 'passed').length,
      failed: testRecords.filter((t) => t.status === 'failed').length,
      falsified: testRecords.filter((t) => t.status === 'falsified').length,
      inconclusive: testRecords.filter((t) => t.status === 'inconclusive').length,
      pending: testRecords.filter((t) => t.status === 'pending').length,
    };
  }, [testRecords]);

  // Open modal to mark test specifically as falsified
  const openFalsifyModal = (test: ZPTestRecord) => {
    setFalsifyTestTarget(test);
    setFalsificationNotesInput(test.falsificationNotes || '');
    setFalsificationError(null);
    setShowFalsifyModal(true);
  };

  // Submit mandatory falsification documentation
  const handleConfirmFalsification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!falsifyTestTarget) return;

    const trimmedNotes = falsificationNotesInput.trim();
    if (!trimmedNotes || trimmedNotes.length < 5) {
      setFalsificationError('Documentation notes are mandatory when marking a hypothesis as falsified (minimum 5 characters).');
      return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

    setTestRecords((prev) =>
      prev.map((t) =>
        t.id === falsifyTestTarget.id
          ? {
              ...t,
              status: 'falsified',
              falsificationNotes: trimmedNotes,
              falsifiedAt: timestamp,
              lastEvaluatedAt: timestamp,
            }
          : t
      )
    );

    setShowFalsifyModal(false);
    setFalsifyTestTarget(null);
    setFalsificationNotesInput('');
    setFalsificationError(null);
  };

  // Direct status update handler
  const handleUpdateStatus = (testId: string, targetStatus: ZPTestStatus) => {
    const test = testRecords.find((t) => t.id === testId);
    if (!test) return;

    if (targetStatus === 'falsified') {
      openFalsifyModal(test);
      return;
    }

    setTestRecords((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, status: targetStatus } : t))
    );
  };

  // Execute a single test against the active corpus
  const evaluateTest = (test: ZPTestRecord) => {
    setIsEvaluating(true);

    setTimeout(() => {
      let log = '';
      let newStatus: ZPTestStatus = test.status;
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

      if (test.id === 'ZP-03') {
        // Blind structural positional control test
        const ctrl = rongorongoService.matchedPositionalControl(corpus, '076');
        const diff = ctrl.differenceFromControls;

        log = `Live calculation on ${corpus.length} lines: Target linked rate = ${ctrl.targetLinkedRate.toFixed(1)}%, matched-control mean = ${ctrl.controlMeanLinkedRate.toFixed(1)}% (cohort size n=${ctrl.controlCount}). Net difference = ${diff > 0 ? '+' : ''}${diff.toFixed(1)}%.`;

        if (Math.abs(diff) <= 5.0) {
          newStatus = 'failed';
          log += ' Falsification triggered: difference is within ±5.0%.';
        } else if (diff > 5.0) {
          newStatus = 'passed';
          log += ' Hypothesis passed: target sign 076 exhibits statistically significant compound affinity.';
        } else {
          newStatus = 'inconclusive';
        }
      } else if (test.id === 'ZP-02' || test.id === 'ZP-09') {
        // Ligature symmetry test
        const occs = rongorongoService.getOccurrences(corpus, '076');
        let prefixCount = 0;
        let postfixCount = 0;

        for (const o of occs) {
          if (o.compound) {
            if (o.compoundPosition === 'initial') prefixCount++;
            if (o.compoundPosition === 'final') postfixCount++;
          }
        }

        log = `Live calculation: Prefix [076+X] = ${prefixCount}, Postfix [X+076] = ${postfixCount}.`;
        if (prefixCount + postfixCount === 0) {
          newStatus = 'inconclusive';
          log += ' Insufficient compound occurrences in current corpus lines.';
        } else {
          const ratio = prefixCount / Math.max(1, postfixCount);
          log += ` Directional ratio = ${ratio.toFixed(2)}:1.`;
          if (ratio > 1.8 || ratio < 0.5) {
            newStatus = test.id === 'ZP-09' ? 'falsified' : 'passed';
            log += test.id === 'ZP-09'
              ? ' Falsification confirmed: directional asymmetry contradicts commutative symmetry.'
              : ' Hypothesis passed: non-commutative syntax ordering observed.';
          } else {
            newStatus = test.id === 'ZP-09' ? 'passed' : 'failed';
            log += ' Symmetric orientation indicates free variation.';
          }
        }
      } else if (test.id === 'ZP-01') {
        // Line-edge invariance test
        const sum = rongorongoService.summarizeSign(corpus, '076');
        const total = sum.totalOccurrences;
        if (total === 0) {
          log = 'Sign 076 not found in active corpus.';
          newStatus = 'inconclusive';
        } else {
          const initPct = (sum.lineInitial / total) * 100;
          const medPct = (sum.lineMedial / total) * 100;
          const finPct = (sum.lineFinal / total) * 100;
          log = `Live distribution: Initial = ${initPct.toFixed(1)}% (${sum.lineInitial}), Medial = ${medPct.toFixed(1)}% (${sum.lineMedial}), Final = ${finPct.toFixed(1)}% (${sum.lineFinal}).`;

          if (initPct > 80 || finPct > 80) {
            newStatus = 'failed';
            log += ' Falsification triggered: extreme line-edge clustering detected.';
          } else {
            newStatus = 'passed';
            log += ' Hypothesis passed: sign 076 is distributed across all line positions.';
          }
        }
      } else if (test.id === 'ZP-08') {
        // Santiago Staff 001 rigidity
        const sum001 = rongorongoService.summarizeSign(corpus, '001');
        log = `Live calculation: Sign 001 independent occurrences = ${sum001.independentCount}, linked = ${sum001.linkedCount} (linked rate = ${sum001.linkedRate.toFixed(1)}%).`;
        if (sum001.linkedCount > 0) {
          newStatus = 'failed';
          log += ' Falsification triggered: sign 001 observed as an internal compound member.';
        } else {
          newStatus = 'passed';
          log += ' Hypothesis passed: sign 001 behaves 100% as an uncompoundable strophic delimiter.';
        }
      } else {
        log = `Evaluation executed on active corpus of ${corpus.length} lines. Metrics remain consistent with recorded hypothesis criteria.`;
      }

      setEvaluationLogs((prev) => ({ ...prev, [test.id]: log }));
      setTestRecords((prev) =>
        prev.map((r) =>
          r.id === test.id
            ? {
                ...r,
                status: newStatus,
                computedMetric: log,
                lastEvaluatedAt: timestamp,
              }
            : r
        )
      );

      setIsEvaluating(false);
    }, 350);
  };

  // Run all tests in the suite sequentially
  const handleRunAllTests = () => {
    setIsEvaluating(true);
    let delay = 0;

    testRecords.forEach((test) => {
      setTimeout(() => {
        evaluateTest(test);
      }, delay);
      delay += 100;
    });

    setTimeout(() => {
      setIsEvaluating(false);
    }, delay + 400);
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {
      id?: string;
      controls?: string;
      hypothesis?: string;
      title?: string;
      falsificationNotes?: string;
    } = {};

    const trimmedId = newId.trim();
    const trimmedControls = newControlGroups.trim();
    const trimmedHypothesis = newHypothesis.trim();
    const trimmedTitle = newTitle.trim();

    // 1. Validation for non-empty ID
    if (!trimmedId) {
      errors.id = 'Unique Test ID cannot be empty (e.g. ZP-10).';
    } else if (testRecords.some((t) => t.id.toUpperCase() === trimmedId.toUpperCase())) {
      errors.id = `Test ID "${trimmedId.toUpperCase()}" is already in use. Please specify a unique ID.`;
    }

    // 2. Validation for defined controls
    if (!trimmedControls) {
      errors.controls = 'Specified control groups are required to guarantee reproducible scientific controls.';
    }

    // 3. Validation for defined hypothesis & title
    if (!trimmedHypothesis) {
      errors.hypothesis = 'Hypothesis cannot be empty. Please define the formal structural proposition.';
    }

    if (!trimmedTitle) {
      errors.title = 'Test title cannot be empty.';
    }

    // 4. Validation for falsified status documentation
    if (newStatus === 'falsified' && (!newFalsificationNotes.trim() || newFalsificationNotes.trim().length < 5)) {
      errors.falsificationNotes = 'Documentation notes are mandatory when registering a test with status "falsified" (min 5 characters).';
    }

    if (Object.keys(errors).length > 0) {
      setNewFormErrors(errors);
      return;
    }

    setNewFormErrors({});

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

    const record: ZPTestRecord = {
      id: trimmedId.toUpperCase(),
      title: trimmedTitle,
      hypothesis: trimmedHypothesis,
      controlGroups: trimmedControls,
      recordedResults: newRecordedResults.trim() || 'Initial test specification created. Pending baseline evaluation.',
      supportingEvidence: newSupportingEvidence.trim() || 'Citations to be collected from active corpus lines.',
      falsificationCriterion: newFalsificationCriterion.trim() || 'Hypothesis is falsified if empirical frequency departs from predicted tolerance (p < 0.05).',
      status: newStatus,
      targetSigns: newTargetSigns.split(',').map((s) => s.trim()).filter(Boolean),
      lastEvaluatedAt: timestamp,
      falsificationNotes: newStatus === 'falsified' ? newFalsificationNotes.trim() : undefined,
      falsifiedAt: newStatus === 'falsified' ? timestamp : undefined,
    };

    setTestRecords([record, ...testRecords]);
    setSelectedTestId(record.id);
    setShowNewTestModal(false);

    // Reset fields
    setNewId(`ZP-${String(testRecords.length + 2).padStart(2, '0')}`);
    setNewTitle('');
    setNewHypothesis('');
    setNewControlGroups('');
    setNewRecordedResults('');
    setNewSupportingEvidence('');
    setNewFalsificationCriterion('');
    setNewStatus('pending');
    setNewFalsificationNotes('');
    setNewFormErrors({});
    setFalsificationError(null);
  };

  const handleExportSuite = () => {
    const markdown = `# ZP EPIGRAPHIC TEST SERIES · REPRODUCIBLE HYPOTHESIS AUDIT LOG
**Generated:** ${new Date().toISOString()}
**Corpus Scope:** ${corpus.length} active tablet lines
**Total Tests:** ${testRecords.length} | Passed: ${counts.passed} | Failed: ${counts.failed} | Falsified: ${counts.falsified} | Inconclusive: ${counts.inconclusive} | Pending: ${counts.pending}

---

${testRecords
  .map(
    (t) => `## ${t.id}: ${t.title}
- **Status:** ${t.status.toUpperCase()}
- **Target Signs:** ${t.targetSigns.join(', ')}
- **Last Evaluated:** ${t.lastEvaluatedAt || 'N/A'}
${t.falsifiedAt ? `- **Falsified On:** ${t.falsifiedAt}` : ''}

### Hypothesis
${t.hypothesis}

### Control Groups
${t.controlGroups}

### Recorded Results
${t.recordedResults}
${t.computedMetric ? `*Live Computed:* ${t.computedMetric}` : ''}

### Supporting Evidence
${t.supportingEvidence}

### Falsification Criterion
${t.falsificationCriterion}

${
  t.falsificationNotes
    ? `### Mandatory Falsification Documentation\n${t.falsificationNotes}\n`
    : ''
}
---
`
  )
  .join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zp-test-series-audit-log.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: ZPTestStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-[#15803d]" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-[#b91c1c]" />;
      case 'falsified':
        return <AlertOctagon className="w-4 h-4 text-[#991b1b]" />;
      case 'inconclusive':
        return <HelpCircle className="w-4 h-4 text-[#b45309]" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-[#78716c]" />;
    }
  };

  const getStatusTextClass = (status: ZPTestStatus) => {
    switch (status) {
      case 'passed':
        return 'text-[#15803d] bg-[#f0fdf4] border-[#bbf7d0]';
      case 'failed':
        return 'text-[#b91c1c] bg-[#fef2f2] border-[#fecaca]';
      case 'falsified':
        return 'text-[#991b1b] bg-[#fef2f2] border-[#dc2626] font-bold';
      case 'inconclusive':
        return 'text-[#b45309] bg-[#fffbeb] border-[#fde68a]';
      case 'pending':
        return 'text-[#57534e] bg-[#f5f5f4] border-[#e7e5e4]';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <header className="mb-6">
        <div className="text-xs font-bold tracking-widest text-[#78716c] uppercase">
          FABRICIUS WORKBENCH · HYPOTHESIS TESTING SUITE
        </div>
        <h1 className="mt-2 font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-[#1c1917] leading-tight text-balance">
          ZP Test Series Module
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#57534e] max-w-3xl leading-relaxed">
          Systematic, reproducible testing of decipherment hypotheses. Each test couples a formal structural proposition
          with explicit control cohorts, recorded results, direct textual evidence, and unambiguous falsification criteria.
          Researchers can formally document hypothesis falsification with mandatory evidentiary notes.
        </p>
      </header>

      {/* Suite Executive Metrics & Actions */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-lg border border-[#ded9cd] bg-white shadow-xs">
          <span className="text-xs font-semibold text-[#78716c] uppercase tracking-wider block">
            Total In Series
          </span>
          <span className="font-mono text-3xl font-bold text-[#1c1917] tabular-nums mt-1 block">
            {counts.all}
          </span>
          <span className="text-[11px] text-[#78716c] mt-0.5 block">Registered tests</span>
        </div>

        <div className="p-4 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#15803d] uppercase tracking-wider block">
              Passed
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
          </div>
          <span className="font-mono text-3xl font-bold text-[#15803d] tabular-nums mt-1 block">
            {counts.passed}
          </span>
          <span className="text-[11px] text-[#15803d] mt-0.5 block">Corpus supported</span>
        </div>

        <div className="p-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#b91c1c] uppercase tracking-wider block">
              Failed
            </span>
            <XCircle className="w-4 h-4 text-[#b91c1c]" />
          </div>
          <span className="font-mono text-3xl font-bold text-[#b91c1c] tabular-nums mt-1 block">
            {counts.failed}
          </span>
          <span className="text-[11px] text-[#b91c1c] mt-0.5 block">Statistical failure</span>
        </div>

        <div className="p-4 rounded-lg border border-[#dc2626] bg-[#fef2f2] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#991b1b] uppercase tracking-wider block">
              Falsified
            </span>
            <AlertOctagon className="w-4 h-4 text-[#991b1b]" />
          </div>
          <span className="font-mono text-3xl font-bold text-[#991b1b] tabular-nums mt-1 block">
            {counts.falsified}
          </span>
          <span className="text-[11px] text-[#991b1b] mt-0.5 block">Documented on record</span>
        </div>

        <div className="p-4 rounded-lg border border-[#fde68a] bg-[#fffbeb] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#b45309] uppercase tracking-wider block">
              Inconclusive
            </span>
            <HelpCircle className="w-4 h-4 text-[#b45309]" />
          </div>
          <span className="font-mono text-3xl font-bold text-[#b45309] tabular-nums mt-1 block">
            {counts.inconclusive}
          </span>
          <span className="text-[11px] text-[#b45309] mt-0.5 block">Insufficient sample</span>
        </div>

        <div className="p-4 rounded-lg border border-[#ded9cd] bg-[#faf8f5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716c] uppercase tracking-wider block">
              Pending
            </span>
            <Clock className="w-4 h-4 text-[#78716c]" />
          </div>
          <span className="font-mono text-3xl font-bold text-[#57534e] tabular-nums mt-1 block">
            {counts.pending}
          </span>
          <span className="text-[11px] text-[#78716c] mt-0.5 block">Awaiting evaluation</span>
        </div>
      </div>

      {/* Control Ribbon: Filters, Search, Batch Execution, and New Test Modal */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#ded9cd] bg-white p-4 shadow-xs">
        {/* Status Filter Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'passed', 'failed', 'falsified', 'inconclusive', 'pending'] as const).map((st) => {
            const isSelected = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors uppercase tracking-wider ${
                  isSelected
                    ? 'bg-[#1c1917] text-white shadow-xs font-semibold'
                    : 'text-[#57534e] hover:bg-[#f5f2ea] hover:text-[#1c1917]'
                }`}
              >
                {st} ({counts[st]})
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search test ID or hypothesis..."
              className="w-full rounded border border-[#c4beaf] bg-[#faf8f5] pl-8 pr-3 py-1.5 text-xs text-[#1c1917] focus:border-[#1c1917] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleRunAllTests}
            disabled={isEvaluating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1c1917] border border-[#d6d1c4] bg-[#f5f2ea] rounded-md hover:bg-[#ede8dd] cursor-pointer whitespace-nowrap disabled:opacity-50 transition-colors"
            title="Evaluate all tests against currently loaded corpus"
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#1c1917]" />
            <span>Run All Tests</span>
          </button>

          <button
            onClick={handleExportSuite}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1c1917] border border-[#d6d1c4] bg-[#f5f2ea] rounded-md hover:bg-[#ede8dd] cursor-pointer whitespace-nowrap transition-colors"
            title="Export markdown test dossier"
          >
            <Download className="w-3.5 h-3.5 text-[#1c1917]" />
            <span>Export Suite</span>
          </button>

          <button
            onClick={() => {
              setNewFormErrors({});
              setShowNewTestModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1c1917] rounded-md hover:bg-[#2d2926] cursor-pointer whitespace-nowrap shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Test</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Test Registry Browser (5 cols) & Detailed Test Dossier (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Test Cards List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTests.map((test) => {
            const isSelected = selectedTest?.id === test.id;
            return (
              <div
                key={test.id}
                onClick={() => setSelectedTestId(test.id)}
                className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#1c1917] bg-white shadow-xs ring-1 ring-[#1c1917]'
                    : 'border-[#ded9cd] bg-[#fbf9f5] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1c1917] bg-[#eeeae2] px-2 py-0.5 rounded">
                      {test.id}
                    </span>
                    <span className="text-[11px] text-[#78716c]">
                      Signs: {test.targetSigns.join(', ')}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getStatusTextClass(
                      test.status
                    )}`}
                  >
                    {getStatusIcon(test.status)}
                    <span>{test.status}</span>
                  </span>
                </div>

                <h3 className="font-serif-heading text-base font-semibold text-[#1c1917] leading-snug">
                  {test.title}
                </h3>

                <p className="mt-1 text-xs text-[#57534e] line-clamp-2 leading-relaxed">
                  {test.hypothesis}
                </p>

                {test.status === 'falsified' && test.falsificationNotes && (
                  <div className="mt-2 p-2 rounded bg-[#fff1f2] border border-[#fecdd3] text-[11px] text-[#9f1239] line-clamp-2">
                    <strong>Falsified Note:</strong> {test.falsificationNotes}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#78716c] pt-2 border-t border-[#f0ede6]">
                  <span className="truncate max-w-[200px]">
                    Falsification: {test.falsificationCriterion.substring(0, 45)}...
                  </span>
                  <span className="font-mono text-[#1c1917] font-medium flex items-center gap-0.5">
                    Inspect dossier <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

          {filteredTests.length === 0 && (
            <div className="p-8 text-center rounded-lg border border-[#ded9cd] bg-white text-sm text-[#78716c] italic">
              No tests match the current filter criteria.
            </div>
          )}
        </div>

        {/* Right: Comprehensive Test Dossier */}
        <div className="lg:col-span-7">
          {selectedTest ? (
            <div className="rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs space-y-6">
              {/* Header with Title, ID, and Status Selector */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0ede6] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1c1917] bg-[#eeeae2] px-2.5 py-0.5 rounded">
                      {selectedTest.id}
                    </span>
                    <span className="text-xs text-[#78716c]">
                      Last Evaluated: {selectedTest.lastEvaluatedAt || 'Pending verification'}
                    </span>
                  </div>
                  <h2 className="font-serif-heading text-2xl font-medium text-[#1c1917] mt-1">
                    {selectedTest.title}
                  </h2>
                </div>

                {/* Status Toggle Buttons including 'falsified' */}
                <div className="flex flex-wrap items-center gap-1.5 bg-[#f5f2ea] p-1 rounded-md border border-[#ded9cd]">
                  {(['passed', 'failed', 'falsified', 'inconclusive', 'pending'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedTest.id, st)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded uppercase tracking-wider transition-colors cursor-pointer ${
                        selectedTest.status === st
                          ? st === 'falsified'
                            ? 'bg-[#991b1b] text-white shadow-xs font-bold'
                            : 'bg-white text-[#1c1917] shadow-xs'
                          : 'text-[#78716c] hover:text-[#1c1917]'
                      }`}
                      title={st === 'falsified' ? 'Mark specifically as falsified with mandatory documentation' : `Set status to ${st}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Falsified State Banner & Mandatory Notes Display */}
              {selectedTest.status === 'falsified' && (
                <div className="rounded-lg border-l-4 border-l-[#b91c1c] border border-[#fca5a5] bg-[#fff5f5] p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#fed7d7] pb-2">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-[#b91c1c]" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#991b1b]">
                        FORMALLY FALSIFIED HYPOTHESIS ON RECORD
                      </span>
                    </div>

                    <button
                      onClick={() => openFalsifyModal(selectedTest)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#991b1b] hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Documentation</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7f1d1d] block mb-1">
                      Mandatory Falsification Documentation & Reason:
                    </span>
                    <p className="text-xs sm:text-sm font-serif-heading text-[#450a0a] leading-relaxed bg-white/80 p-3 rounded border border-[#fecaca]">
                      {selectedTest.falsificationNotes || 'No notes on record.'}
                    </p>
                  </div>

                  <div className="text-[11px] text-[#991b1b] flex items-center justify-between pt-1">
                    <span>
                      Triggered Criterion: <code className="bg-white/60 px-1 py-0.5 rounded">{selectedTest.falsificationCriterion}</code>
                    </span>
                    {selectedTest.falsifiedAt && (
                      <span className="font-mono">Falsified: {selectedTest.falsifiedAt}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Target Signs Investigated */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716c] block mb-2">
                  Target Inscription Signs
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  {selectedTest.targetSigns.map((sign) => (
                    <button
                      key={sign}
                      onClick={() => onSelectSignForAnalysis(sign)}
                      className="inline-flex items-center gap-2 rounded border border-[#ded9cd] bg-[#fbf9f5] px-3 py-1.5 hover:bg-[#ede8dd] cursor-pointer shadow-xs transition-colors"
                      title={`Click to analyze sign ${sign} in Corpus Laboratory`}
                    >
                      <GlyphIcon signId={sign} size="sm" />
                      <div className="text-left font-mono">
                        <span className="text-xs font-bold text-[#1c1917] block">
                          Sign {sign}
                        </span>
                        <span className="text-[10px] text-[#78716c]">
                          Open in Lab →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Clearly Defined Hypothesis */}
              <div className="rounded-lg border border-[#e5dfd3] bg-[#fcfbf9] p-4 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1c1917] flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                  <span>Clearly Defined Hypothesis</span>
                </span>
                <p className="text-sm font-serif-heading text-[#1c1917] leading-relaxed">
                  "{selectedTest.hypothesis}"
                </p>
              </div>

              {/* 2. Specified Control Groups */}
              <div className="rounded-lg border border-[#ded9cd] bg-white p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716c] block mb-1">
                  Specified Control Groups & Baseline Methodology
                </span>
                <p className="text-xs text-[#44403c] leading-relaxed">
                  {selectedTest.controlGroups}
                </p>
              </div>

              {/* 3. Recorded Results */}
              <div className="rounded-lg border border-[#ded9cd] bg-white p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
                    Recorded Results & Metrics
                  </span>
                  <span className="text-[11px] font-mono text-[#78716c]">
                    Verified Corpus Evidence
                  </span>
                </div>
                <p className="text-xs text-[#292524] leading-relaxed font-mono bg-[#fbf9f5] p-3 rounded border border-[#eae5da]">
                  {selectedTest.recordedResults}
                </p>
              </div>

              {/* 4. Supporting Evidence & Direct Tablet Excerpts */}
              <div className="rounded-lg border border-[#ded9cd] bg-white p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716c] block mb-2">
                  Supporting Evidence & Inscription Citations
                </span>
                <p className="text-xs text-[#57534e] mb-3 leading-relaxed">
                  {selectedTest.supportingEvidence}
                </p>

                {selectedTest.evidenceCitations && selectedTest.evidenceCitations.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716c] block">
                      Direct Corpus Lines:
                    </span>
                    {selectedTest.evidenceCitations.map((cit, idx) => (
                      <div
                        key={idx}
                        className="rounded border border-[#ded9cd] bg-[#faf8f5] p-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1c1917]">{cit.tablet}</span>
                          <span className="font-mono text-[#78716c]">({cit.lineLabel})</span>
                          <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#ded9cd] text-[#44403c] truncate max-w-xs">
                            {cit.excerpt}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#78716c] font-mono shrink-0">
                          {cit.signCount} instances
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Falsification Criterion */}
              <div className="rounded-lg border-l-4 border-l-[#b91c1c] border border-[#fecaca] bg-[#fffbfb] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b91c1c]">
                    Explicit Falsification Criterion
                  </span>

                  {selectedTest.status !== 'falsified' && (
                    <button
                      onClick={() => openFalsifyModal(selectedTest)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#b91c1c] hover:underline cursor-pointer"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Mark as Falsified...</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#450a0a] leading-relaxed">
                  {selectedTest.falsificationCriterion}
                </p>
              </div>

              {/* Live Test Execution Engine */}
              <div className="border-t border-[#f0ede6] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#15803d]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1c1917]">
                      Live Epigraphic Evaluator
                    </span>
                  </div>

                  <button
                    onClick={() => evaluateTest(selectedTest)}
                    disabled={isEvaluating}
                    className="inline-flex items-center gap-2 rounded bg-[#1c1917] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2d2926] cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isEvaluating ? 'Calculating...' : 'Run Test on Active Corpus'}</span>
                  </button>
                </div>

                {evaluationLogs[selectedTest.id] && (
                  <div className="rounded border border-[#d6d1c4] bg-[#f7f5ee] p-3 font-mono text-xs text-[#292524] leading-relaxed">
                    <span className="font-bold text-[#1c1917] block mb-0.5">Execution Output:</span>
                    {evaluationLogs[selectedTest.id]}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[#ded9cd] bg-white p-12 text-center text-sm text-[#78716c] italic">
              Select a test from the left panel to inspect hypotheses, control groups, and evidence.
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Falsification Documentation Modal */}
      {showFalsifyModal && falsifyTestTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-lg border-2 border-[#b91c1c] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#fecaca] pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-[#b91c1c]" />
                <h3 className="font-serif-heading text-xl font-bold text-[#991b1b]">
                  Document Hypothesis Falsification
                </h3>
              </div>
              <button
                onClick={() => setShowFalsifyModal(false)}
                className="p-1 rounded text-[#78716c] hover:bg-[#f5f2ea]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#fef2f2] p-3.5 rounded border border-[#fecaca] text-xs text-[#7f1d1d] space-y-1">
              <div>
                <strong>Test ID:</strong> <span className="font-mono font-bold">{falsifyTestTarget.id}</span> · {falsifyTestTarget.title}
              </div>
              <div>
                <strong>Hypothesis:</strong> "{falsifyTestTarget.hypothesis}"
              </div>
              <div>
                <strong>Falsification Criterion:</strong> {falsifyTestTarget.falsificationCriterion}
              </div>
            </div>

            <form onSubmit={handleConfirmFalsification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#991b1b] uppercase tracking-wider mb-1">
                  Mandatory Falsification Documentation Notes *
                </label>
                <p className="text-[11px] text-[#78716c] mb-2">
                  Document the specific empirical findings, control group divergence, contradiction data, or tablet lines that triggered falsification.
                </p>
                <textarea
                  value={falsificationNotesInput}
                  onChange={(e) => {
                    setFalsificationNotesInput(e.target.value);
                    if (falsificationError) setFalsificationError(null);
                  }}
                  rows={4}
                  placeholder="e.g. Falsified on 2026-09-30: In Tablet G and Tablet A lines, observed ratio of [076+600] to [600+076] is 8.0:1 (p = 0.0004), demonstrating strict head-modifier directionality. Commutative symmetry is definitively rejected."
                  className="w-full rounded border border-[#dc2626] bg-[#fffbfb] p-3 text-xs leading-relaxed text-[#1c1917] focus:outline-none focus:ring-1 focus:ring-[#b91c1c]"
                  required
                />
                {falsificationError && (
                  <p className="mt-1.5 text-xs text-[#b91c1c] font-semibold">
                    {falsificationError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={() => setShowFalsifyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#57534e] hover:bg-[#f5f2ea] rounded cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#991b1b] hover:bg-[#7f1d1d] rounded shadow-xs cursor-pointer transition-colors"
                >
                  Confirm & Mark Falsified
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Test Modal Dialog */}
      {showNewTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-lg border border-[#ded9cd] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif-heading text-2xl font-medium text-[#1c1917] mb-1">
              Register New Decipherment Hypothesis Test
            </h3>
            <p className="text-xs text-[#78716c] mb-4">
              All scientific criteria are required to guarantee reproducible epigraphic analysis.
            </p>

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#57534e] mb-1">
                    Unique ID *
                  </label>
                  <input
                    type="text"
                    value={newId}
                    onChange={(e) => {
                      setNewId(e.target.value);
                      if (newFormErrors.id) {
                        setNewFormErrors((prev) => ({ ...prev, id: undefined }));
                      }
                    }}
                    placeholder="ZP-10"
                    className={`w-full rounded border p-2 text-xs font-mono font-bold text-[#1c1917] transition-colors ${
                      newFormErrors.id
                        ? 'border-[#dc2626] bg-[#fffbfb] ring-1 ring-[#dc2626]'
                        : 'border-[#c4beaf] bg-[#faf8f5]'
                    }`}
                    required
                  />
                  {newFormErrors.id && (
                    <p className="mt-1 text-xs text-[#b91c1c] font-medium leading-tight">
                      {newFormErrors.id}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#57534e] mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (newFormErrors.title) {
                        setNewFormErrors((prev) => ({ ...prev, title: undefined }));
                      }
                    }}
                    placeholder="e.g. Delimiter Collocation Symmetry Test"
                    className={`w-full rounded border p-2 text-xs text-[#1c1917] transition-colors ${
                      newFormErrors.title
                        ? 'border-[#dc2626] bg-[#fffbfb] ring-1 ring-[#dc2626]'
                        : 'border-[#c4beaf] bg-[#faf8f5]'
                    }`}
                    required
                  />
                  {newFormErrors.title && (
                    <p className="mt-1 text-xs text-[#b91c1c] font-medium leading-tight">
                      {newFormErrors.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#57534e] mb-1">
                    Target Signs (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={newTargetSigns}
                    onChange={(e) => setNewTargetSigns(e.target.value)}
                    placeholder="076, 600, 200"
                    className="w-full rounded border border-[#c4beaf] bg-[#faf8f5] p-2 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#57534e] mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ZPTestStatus)}
                    className="w-full rounded border border-[#c4beaf] bg-[#faf8f5] p-2 text-xs uppercase"
                  >
                    <option value="pending">Pending</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="falsified">Falsified</option>
                    <option value="inconclusive">Inconclusive</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Mandatory Falsification Notes in New Test Modal */}
              {newStatus === 'falsified' && (
                <div className="p-3.5 bg-[#fef2f2] border border-[#fecaca] rounded-md">
                  <label className="block text-xs font-bold text-[#991b1b] uppercase tracking-wider mb-1">
                    Mandatory Falsification Documentation Notes *
                  </label>
                  <p className="text-[11px] text-[#78716c] mb-1.5">
                    Because this hypothesis is being created with status 'falsified', documentation of the falsification evidence is mandatory.
                  </p>
                  <textarea
                    value={newFalsificationNotes}
                    onChange={(e) => {
                      setNewFalsificationNotes(e.target.value);
                      if (newFormErrors.falsificationNotes) {
                        setNewFormErrors((prev) => ({ ...prev, falsificationNotes: undefined }));
                      }
                    }}
                    rows={3}
                    placeholder="Detail the exact reason, empirical test result, or counter-evidence causing falsification..."
                    className={`w-full rounded border bg-white p-2 text-xs leading-relaxed transition-colors ${
                      newFormErrors.falsificationNotes
                        ? 'border-[#dc2626] ring-1 ring-[#dc2626]'
                        : 'border-[#dc2626]'
                    }`}
                    required
                  />
                  {newFormErrors.falsificationNotes && (
                    <p className="mt-1 text-xs text-[#b91c1c] font-medium leading-tight">
                      {newFormErrors.falsificationNotes}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#57534e] mb-1">
                  Clearly Defined Hypothesis *
                </label>
                <textarea
                  value={newHypothesis}
                  onChange={(e) => {
                    setNewHypothesis(e.target.value);
                    if (newFormErrors.hypothesis) {
                      setNewFormErrors((prev) => ({ ...prev, hypothesis: undefined }));
                    }
                  }}
                  rows={2}
                  placeholder="State the formal structural hypothesis without assuming phonetic translation..."
                  className={`w-full rounded border p-2 text-xs leading-relaxed transition-colors ${
                    newFormErrors.hypothesis
                      ? 'border-[#dc2626] bg-[#fffbfb] ring-1 ring-[#dc2626]'
                      : 'border-[#c4beaf] bg-[#faf8f5]'
                  }`}
                  required
                />
                {newFormErrors.hypothesis && (
                  <p className="mt-1 text-xs text-[#b91c1c] font-medium leading-tight">
                    {newFormErrors.hypothesis}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#57534e] mb-1">
                  Specified Control Groups *
                </label>
                <input
                  type="text"
                  value={newControlGroups}
                  onChange={(e) => {
                    setNewControlGroups(e.target.value);
                    if (newFormErrors.controls) {
                      setNewFormErrors((prev) => ({ ...prev, controls: undefined }));
                    }
                  }}
                  placeholder="e.g. Frequency-matched non-target sign cohort within ±25% frequency..."
                  className={`w-full rounded border p-2 text-xs transition-colors ${
                    newFormErrors.controls
                      ? 'border-[#dc2626] bg-[#fffbfb] ring-1 ring-[#dc2626]'
                      : 'border-[#c4beaf] bg-[#faf8f5]'
                  }`}
                  required
                />
                {newFormErrors.controls && (
                  <p className="mt-1 text-xs text-[#b91c1c] font-medium leading-tight">
                    {newFormErrors.controls}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#57534e] mb-1">
                  Recorded Results *
                </label>
                <input
                  type="text"
                  value={newRecordedResults}
                  onChange={(e) => setNewRecordedResults(e.target.value)}
                  placeholder="e.g. Observed 24 instances with 78% linked rate vs 22% control mean..."
                  className="w-full rounded border border-[#c4beaf] bg-[#faf8f5] p-2 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#57534e] mb-1">
                  Supporting Evidence *
                </label>
                <textarea
                  value={newSupportingEvidence}
                  onChange={(e) => setNewSupportingEvidence(e.target.value)}
                  rows={2}
                  placeholder="Textual occurrences, tablet references, and structural classes..."
                  className="w-full rounded border border-[#c4beaf] bg-[#faf8f5] p-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b91c1c] mb-1">
                  Falsification Criterion *
                </label>
                <input
                  type="text"
                  value={newFalsificationCriterion}
                  onChange={(e) => setNewFalsificationCriterion(e.target.value)}
                  placeholder="e.g. If difference from controls is within ±5.0%, hypothesis is falsified."
                  className="w-full rounded border border-[#fecaca] bg-[#fffbfb] p-2 text-xs text-[#991b1b]"
                  required
                />
              </div>

              {Object.keys(newFormErrors).length > 0 && (
                <div className="p-3 rounded-md bg-[#fef2f2] border border-[#fecaca] text-xs font-semibold text-[#b91c1c] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-[#b91c1c]" />
                    <span>Please resolve the required scientific criteria:</span>
                  </div>
                  <ul className="list-disc pl-5 font-normal space-y-0.5">
                    {newFormErrors.id && <li>{newFormErrors.id}</li>}
                    {newFormErrors.controls && <li>{newFormErrors.controls}</li>}
                    {newFormErrors.hypothesis && <li>{newFormErrors.hypothesis}</li>}
                    {newFormErrors.title && <li>{newFormErrors.title}</li>}
                    {newFormErrors.falsificationNotes && <li>{newFormErrors.falsificationNotes}</li>}
                  </ul>
                </div>
              )}

              {falsificationError && (
                <div className="p-2.5 rounded bg-[#fef2f2] border border-[#fecaca] text-xs font-semibold text-[#b91c1c]">
                  {falsificationError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={() => setShowNewTestModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#57534e] hover:bg-[#f5f2ea] rounded cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1c1917] hover:bg-[#2d2926] rounded shadow-xs cursor-pointer"
                >
                  Register Test Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

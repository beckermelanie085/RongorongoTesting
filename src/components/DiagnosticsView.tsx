import React, { useMemo } from 'react';
import { DiagnosticIssue, EngineZone } from '../types/rongorongo';
import { rongorongoService } from '../services/rongorongo-analysis';
import { AlertCircle, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

interface DiagnosticsViewProps {
  corpusText: string;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ corpusText }) => {
  const issues: DiagnosticIssue[] = useMemo(() => {
    return rongorongoService.diagnoseCorpus(corpusText);
  }, [corpusText]);

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <header className="mb-6">
        <div className="text-xs font-bold tracking-widest text-[#78716c] uppercase">
          EPIGRAPHIC SYNTAX & INVARIANT AUDITOR
        </div>
        <h1 className="mt-2 font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-[#1c1917] leading-tight text-balance">
          Corpus Integrity & Syntax Validation
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#57534e] max-w-3xl leading-relaxed">
          Automated structural verification of transcription brackets, sign delimiters,
          and epigraphic tokens. Guarantees balanced ligature brackets and valid line labeling.
        </p>
      </header>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-lg border border-[#ded9cd] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Syntax Errors
            </span>
            <AlertCircle className={`w-4 h-4 ${errorCount > 0 ? 'text-[#b91c1c]' : 'text-[#78716c]'}`} />
          </div>
          <span className={`font-mono text-3xl font-bold mt-2 block ${errorCount > 0 ? 'text-[#b91c1c]' : 'text-[#1c1917]'}`}>
            {errorCount}
          </span>
          <span className="text-[11px] text-[#78716c]">Unbalanced brackets or missing pipes</span>
        </div>

        <div className="p-4 rounded-lg border border-[#ded9cd] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Epigraphic Warnings
            </span>
            <AlertTriangle className={`w-4 h-4 ${warningCount > 0 ? 'text-[#b45309]' : 'text-[#78716c]'}`} />
          </div>
          <span className="font-mono text-3xl font-bold mt-2 block text-[#1c1917]">
            {warningCount}
          </span>
          <span className="text-[11px] text-[#78716c]">Non-canonical line headers or stray symbols</span>
        </div>

        <div className="p-4 rounded-lg border border-[#ded9cd] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Audit Invariants
            </span>
            <ShieldCheck className="w-4 h-4 text-[#15803d]" />
          </div>
          <span className="font-mono text-3xl font-bold mt-2 block text-[#15803d]">
            {errorCount === 0 ? 'PASS' : 'FLAGGED'}
          </span>
          <span className="text-[11px] text-[#78716c]">Ready for blind structural calculation</span>
        </div>
      </div>

      {/* Issues Table */}
      <div className="rounded-lg border border-[#ded9cd] bg-white p-6 shadow-xs">
        <h2 className="font-serif-heading text-xl font-medium text-[#1c1917] mb-4">
          Diagnostic Event Log ({issues.length})
        </h2>

        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-4 rounded-md border text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                issue.severity === 'error'
                  ? 'border-[#fca5a5] bg-[#fef2f2]'
                  : issue.severity === 'warning'
                  ? 'border-[#fed7aa] bg-[#fffbeb]'
                  : 'border-[#bbf7d0] bg-[#f0fdf4]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {issue.severity === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-[#b91c1c]" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-[#b45309]" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-[#15803d]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1c1917]">{issue.title}</span>
                    {issue.lineLabel && (
                      <span className="font-mono text-xs bg-white/80 px-1.5 py-0.5 rounded border border-[#ded9cd] text-[#44403c]">
                        Line {issue.lineLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#57534e] mt-1 leading-relaxed">
                    {issue.description}
                  </p>
                  {issue.rawFragment && (
                    <code className="block mt-1.5 font-mono text-[11px] bg-white/70 p-1.5 rounded border border-[#e5e0d3] text-[#1c1917] truncate max-w-xl">
                      {issue.rawFragment}
                    </code>
                  )}
                </div>
              </div>

              {/* Engine Zone Indicator strictly formatted */}
              <div className="self-end sm:self-center shrink-0">
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-[#ded9cd] text-[#78716c]" title="Diagnostic engineZone mapping">
                  zone: {issue.engineZone}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import {
  CompoundPosition,
  ControlSignResult,
  DiagnosticIssue,
  EngineZone,
  GlyphCertainty,
  GlyphOccurrence,
  GlyphSummary,
  LinePosition,
  MatchedControlResult,
  NeighborFrequency,
  RongorongoGlyph,
  RongorongoLine,
  RongorongoSide,
  RongorongoToken,
  StructuralClass,
} from '../types/rongorongo';

export class RongorongoAnalysisService {
  /**
   * Input format:
   * Gv5|076 200 [076+600] 300
   * Gv6|100 076 500 [076+200]
   *
   * Compound signs: [076+600]
   * Doubtful sign: 076?
   * Unknown: ?
   * Comments: # comment
   */
  parseCorpus(text: string, sourceSystem: string = 'Custom'): RongorongoLine[] {
    const result: RongorongoLine[] = [];
    const rows = text.split(/\r?\n/);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex].trim();

      if (!row) continue;
      if (row.charAt(0) === '#') continue;

      const split = row.split('|');
      if (split.length < 2) continue;

      const lineLabel = split[0].trim();
      const content = split.slice(1).join('|').trim();

      const location = this.parseLineLabel(lineLabel);
      if (!location) {
        // Line label skipped if invalid
        continue;
      }

      const rawTokens = content.split(/\s+/).filter(Boolean);
      const tokens: RongorongoToken[] = [];

      for (let tokenIndex = 0; tokenIndex < rawTokens.length; tokenIndex++) {
        tokens.push(
          this.parseToken(rawTokens[tokenIndex], lineLabel, tokenIndex, sourceSystem)
        );
      }

      result.push({
        tablet: location.tablet,
        side: location.side,
        line: location.line,
        label: lineLabel,
        tokens,
      });
    }

    return result;
  }

  parseLineLabel(label: string): { tablet: string; side: RongorongoSide; line: number } | null {
    /**
     * Examples: Gv5, Gr2, Hv10, Xv1, Ca6
     */
    const match = /^([A-Za-z]+)([rv])(\d+)$/i.exec(label);
    if (!match) return null;

    const side = match[2].toLowerCase();
    let parsedSide: RongorongoSide = 'unknown';
    if (side === 'r') parsedSide = 'r';
    if (side === 'v') parsedSide = 'v';

    return {
      tablet: match[1],
      side: parsedSide,
      line: parseInt(match[3], 10),
    };
  }

  parseToken(
    rawToken: string,
    lineLabel: string,
    tokenIndex: number,
    sourceSystem: string
  ): RongorongoToken {
    let cleaned = rawToken.trim();
    const bracketed = cleaned.startsWith('[') && cleaned.endsWith(']');
    if (bracketed) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }

    const parts = cleaned.split('+');
    const isCompound = parts.length > 1;
    const compoundId = `${lineLabel}-token-${tokenIndex}`;

    const members: RongorongoGlyph[] = [];
    for (let memberIndex = 0; memberIndex < parts.length; memberIndex++) {
      const parsed = this.parseGlyph(parts[memberIndex]);
      const position: CompoundPosition = this.getCompoundPosition(memberIndex, parts.length);

      members.push({
        id: parsed.id,
        raw: parts[memberIndex],
        sourceSystem,
        certainty: parsed.certainty,
        compoundId: isCompound ? compoundId : undefined,
        compoundPosition: isCompound ? position : 'independent',
      });
    }

    return {
      raw: rawToken,
      isCompound,
      members,
    };
  }

  parseGlyph(raw: string): { id: string; certainty: GlyphCertainty } {
    const value = raw.trim();

    if (!value || value === '?') {
      return {
        id: '?',
        certainty: 'unknown',
      };
    }

    if (value.endsWith('?')) {
      return {
        id: value.substring(0, value.length - 1),
        certainty: 'doubtful',
      };
    }

    return {
      id: value,
      certainty: 'certain',
    };
  }

  getCompoundPosition(index: number, length: number): CompoundPosition {
    if (length <= 1) return 'single';
    if (index === 0) return 'initial';
    if (index === length - 1) return 'final';
    return 'medial';
  }

  getOccurrences(corpus: RongorongoLine[], targetSign: string): GlyphOccurrence[] {
    const results: GlyphOccurrence[] = [];

    for (let lineIndex = 0; lineIndex < corpus.length; lineIndex++) {
      const line = corpus[lineIndex];
      const flattened = this.flattenLine(line);
      const recurrence = this.countSignInFlattenedLine(flattened, targetSign);

      for (let i = 0; i < flattened.length; i++) {
        const item = flattened[i];
        if (item.glyph.id !== targetSign) continue;

        const previous = i > 0 ? flattened[i - 1].glyph.id : null;
        const next = i < flattened.length - 1 ? flattened[i + 1].glyph.id : null;
        const linePosition = this.getLinePosition(i, flattened.length);

        results.push({
          signId: targetSign,
          tablet: line.tablet,
          side: line.side,
          line: line.line,
          lineLabel: line.label,
          tokenIndex: item.tokenIndex,
          flattenedIndex: i,
          compound: item.token.isCompound,
          compoundSize: item.token.members.length,
          compoundPosition: item.glyph.compoundPosition,
          linePosition,
          segmentLength: flattened.length,
          previousSign: previous,
          nextSign: next,
          recurrenceInLine: recurrence,
          sourceSystem: item.glyph.sourceSystem,
          certainty: item.glyph.certainty,
        });
      }
    }

    return results;
  }

  flattenLine(line: RongorongoLine): Array<{
    glyph: RongorongoGlyph;
    token: RongorongoToken;
    tokenIndex: number;
  }> {
    const flattened: Array<{
      glyph: RongorongoGlyph;
      token: RongorongoToken;
      tokenIndex: number;
    }> = [];

    for (let tokenIndex = 0; tokenIndex < line.tokens.length; tokenIndex++) {
      const token = line.tokens[tokenIndex];
      for (let memberIndex = 0; memberIndex < token.members.length; memberIndex++) {
        flattened.push({
          glyph: token.members[memberIndex],
          token,
          tokenIndex,
        });
      }
    }

    return flattened;
  }

  countSignInFlattenedLine(
    flattened: Array<{ glyph: RongorongoGlyph; token: RongorongoToken; tokenIndex: number }>,
    signId: string
  ): number {
    let count = 0;
    for (let i = 0; i < flattened.length; i++) {
      if (flattened[i].glyph.id === signId) {
        count++;
      }
    }
    return count;
  }

  getLinePosition(index: number, length: number): LinePosition {
    if (length <= 1) return 'single';
    if (index === 0) return 'initial';
    if (index === length - 1) return 'final';
    return 'medial';
  }

  getAllSignIds(corpus: RongorongoLine[]): string[] {
    const seen: Record<string, boolean> = {};

    for (let lineIndex = 0; lineIndex < corpus.length; lineIndex++) {
      const line = corpus[lineIndex];
      for (let tokenIndex = 0; tokenIndex < line.tokens.length; tokenIndex++) {
        const token = line.tokens[tokenIndex];
        for (let memberIndex = 0; memberIndex < token.members.length; memberIndex++) {
          const id = token.members[memberIndex].id;
          if (id && id !== '?') {
            seen[id] = true;
          }
        }
      }
    }

    return Object.keys(seen).sort();
  }

  summarizeSign(corpus: RongorongoLine[], signId: string): GlyphSummary {
    const occurrences = this.getOccurrences(corpus, signId);

    let independent = 0;
    let linked = 0;
    let compoundInitial = 0;
    let compoundMedial = 0;
    let compoundFinal = 0;
    let lineInitial = 0;
    let lineMedial = 0;
    let lineFinal = 0;

    const tablets: Record<string, boolean> = {};
    const previous: Record<string, boolean> = {};
    const next: Record<string, boolean> = {};

    for (let i = 0; i < occurrences.length; i++) {
      const occurrence = occurrences[i];
      tablets[occurrence.tablet] = true;

      if (occurrence.compound) {
        linked++;
      } else {
        independent++;
      }

      if (occurrence.compoundPosition === 'initial') compoundInitial++;
      if (occurrence.compoundPosition === 'medial') compoundMedial++;
      if (occurrence.compoundPosition === 'final') compoundFinal++;

      if (occurrence.linePosition === 'initial') lineInitial++;
      if (occurrence.linePosition === 'medial') lineMedial++;
      if (occurrence.linePosition === 'final') lineFinal++;

      if (occurrence.previousSign) previous[occurrence.previousSign] = true;
      if (occurrence.nextSign) next[occurrence.nextSign] = true;
    }

    const total = occurrences.length;
    const linkedRate = total > 0 ? linked / total : 0;
    const independentRate = total > 0 ? independent / total : 0;
    const structuralClasses = this.classifyStructuralOccurrences(occurrences);

    return {
      signId,
      totalOccurrences: total,
      independentCount: independent,
      linkedCount: linked,
      independentRate: independentRate * 100,
      linkedRate: linkedRate * 100,
      compoundInitial,
      compoundMedial,
      compoundFinal,
      lineInitial,
      lineMedial,
      lineFinal,
      tablets: Object.keys(tablets).sort(),
      uniquePreviousSigns: Object.keys(previous).sort(),
      uniqueNextSigns: Object.keys(next).sort(),
      structuralClassCount: structuralClasses.length,
    };
  }

  classifyStructuralOccurrences(occurrences: GlyphOccurrence[]): StructuralClass[] {
    const classes: Record<string, StructuralClass> = {};

    for (let i = 0; i < occurrences.length; i++) {
      const occurrence = occurrences[i];

      const classId = [
        occurrence.compound ? 'linked' : 'independent',
        occurrence.compoundPosition,
        occurrence.linePosition,
        'len-' + occurrence.segmentLength,
        'prev-' + (occurrence.previousSign || 'START'),
        'next-' + (occurrence.nextSign || 'END'),
      ].join('|');

      if (!classes[classId]) {
        classes[classId] = {
          classId,
          linked: occurrence.compound,
          compoundPosition: occurrence.compoundPosition,
          linePosition: occurrence.linePosition,
          segmentLength: occurrence.segmentLength,
          previousSign: occurrence.previousSign,
          nextSign: occurrence.nextSign,
          occurrences: 0,
        };
      }

      classes[classId].occurrences++;
    }

    return Object.keys(classes)
      .map((key) => classes[key])
      .sort((a, b) => b.occurrences - a.occurrences);
  }

  matchedPositionalControl(corpus: RongorongoLine[], targetSign: string): MatchedControlResult {
    const targetSummary = this.summarizeSign(corpus, targetSign);
    const targetFrequency = targetSummary.totalOccurrences;
    const allSigns = this.getAllSignIds(corpus);

    /**
     * ±25% target frequency, with minimum window of 2 occurrences.
     */
    const tolerance = Math.max(2, Math.round(targetFrequency * 0.25));
    const controls: ControlSignResult[] = [];

    for (let i = 0; i < allSigns.length; i++) {
      const candidate = allSigns[i];
      if (candidate === targetSign) continue;

      const summary = this.summarizeSign(corpus, candidate);
      const difference = Math.abs(summary.totalOccurrences - targetFrequency);

      if (difference <= tolerance && summary.totalOccurrences >= 2) {
        controls.push({
          signId: candidate,
          frequency: summary.totalOccurrences,
          linkedCount: summary.linkedCount,
          linkedRate: summary.linkedRate,
          frequencyDifference: difference,
        });
      }
    }

    controls.sort((a, b) => {
      if (a.frequencyDifference !== b.frequencyDifference) {
        return a.frequencyDifference - b.frequencyDifference;
      }
      return b.frequency - a.frequency;
    });

    let controlMean = 0;
    if (controls.length > 0) {
      let totalRate = 0;
      for (let i = 0; i < controls.length; i++) {
        totalRate += controls[i].linkedRate;
      }
      controlMean = totalRate / controls.length;
    }

    return {
      targetSign,
      targetFrequency,
      targetLinkedRate: targetSummary.linkedRate,
      controlCount: controls.length,
      controlMeanLinkedRate: controlMean,
      differenceFromControls: targetSummary.linkedRate - controlMean,
      controls,
    };
  }

  getPreviousNeighborFrequencies(corpus: RongorongoLine[], signId: string): NeighborFrequency[] {
    const occurrences = this.getOccurrences(corpus, signId);
    const counts: Record<string, number> = {};

    for (let i = 0; i < occurrences.length; i++) {
      const previous = occurrences[i].previousSign;
      if (!previous) continue;
      counts[previous] = (counts[previous] || 0) + 1;
    }

    return this.frequencyObjectToArray(counts);
  }

  getNextNeighborFrequencies(corpus: RongorongoLine[], signId: string): NeighborFrequency[] {
    const occurrences = this.getOccurrences(corpus, signId);
    const counts: Record<string, number> = {};

    for (let i = 0; i < occurrences.length; i++) {
      const next = occurrences[i].nextSign;
      if (!next) continue;
      counts[next] = (counts[next] || 0) + 1;
    }

    return this.frequencyObjectToArray(counts);
  }

  private frequencyObjectToArray(counts: Record<string, number>): NeighborFrequency[] {
    return Object.keys(counts)
      .map((key) => ({
        signId: key,
        count: counts[key],
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Diagnostic verification engine for the corpus text.
   * Ensures formatting consistency, bracket matching, and validity.
   * Uses required engineZone taxonomy.
   */
  diagnoseCorpus(corpusText: string): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];
    const lines = corpusText.split(/\r?\n/);

    for (let index = 0; index < lines.length; index++) {
      const raw = lines[index].trim();
      const lineNum = index + 1;

      if (!raw || raw.startsWith('#')) continue;

      // Check pipe format
      if (!raw.includes('|')) {
        issues.push({
          id: `diag-pipe-${lineNum}`,
          title: 'Missing Tablet/Side/Line delimiter',
          description: `Line ${lineNum} does not contain '|' separating tablet label from glyph sequence.`,
          severity: 'error',
          rawFragment: raw,
          engineZone: 'general' as EngineZone,
        });
        continue;
      }

      const [label, content] = raw.split('|');
      const parsedLabel = this.parseLineLabel(label.trim());

      if (!parsedLabel) {
        issues.push({
          id: `diag-label-${lineNum}`,
          title: 'Invalid Line Header Format',
          description: `Header "${label.trim()}" does not match standard notation (e.g. Gv5, Xr2, Ca6).`,
          severity: 'warning',
          lineLabel: label.trim(),
          rawFragment: raw,
          engineZone: 'general' as EngineZone,
        });
      }

      // Check brackets balance
      const openBrackets = (content.match(/\[/g) || []).length;
      const closeBrackets = (content.match(/\]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        issues.push({
          id: `diag-brackets-${lineNum}`,
          title: 'Unbalanced Compound Brackets',
          description: `Line ${label.trim()} has ${openBrackets} '[' and ${closeBrackets} ']'. Ligature boundaries must be balanced.`,
          severity: 'error',
          lineLabel: label.trim(),
          rawFragment: content.trim(),
          engineZone: 'general' as EngineZone,
        });
      }

      // Check for stray plus signs outside or inside
      if (content.includes('++') || content.includes('[+') || content.includes('+]')) {
        issues.push({
          id: `diag-plus-${lineNum}`,
          title: 'Malformed Compound Ligature Marker',
          description: `Stray '+' found in "${content.trim()}". Ligature format must be [sign+sign].`,
          severity: 'warning',
          lineLabel: label.trim(),
          rawFragment: content.trim(),
          engineZone: 'general' as EngineZone,
        });
      }
    }

    if (issues.length === 0) {
      issues.push({
        id: 'diag-clean-pass',
        title: 'Corpus Invariants Verified',
        description: 'All lines adhere to epigraphic syntax rules with balanced compound structures.',
        severity: 'info',
        engineZone: 'general' as EngineZone,
      });
    }

    return issues;
  }
}

export const rongorongoService = new RongorongoAnalysisService();

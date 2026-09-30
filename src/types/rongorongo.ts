export type RongorongoSide = 'r' | 'v' | 'unknown';

export type GlyphCertainty =
  | 'certain'
  | 'probable'
  | 'doubtful'
  | 'damaged'
  | 'unknown';

export type CompoundPosition =
  | 'independent'
  | 'initial'
  | 'medial'
  | 'final'
  | 'single';

export type LinePosition =
  | 'initial'
  | 'medial'
  | 'final'
  | 'single';

export interface RongorongoGlyph {
  id: string;
  /** Original sign string as entered by the researcher */
  raw: string;
  /** Barthel, Horley, Custom, etc. */
  sourceSystem: string;
  certainty: GlyphCertainty;
  /** If part of a compound, this identifies the parent */
  compoundId?: string;
  /** Position INSIDE a compound */
  compoundPosition: CompoundPosition;
}

export interface RongorongoToken {
  raw: string;
  /** True when multiple signs are structurally linked */
  isCompound: boolean;
  /** Signs contained in the visual/token group */
  members: RongorongoGlyph[];
}

export interface RongorongoLine {
  tablet: string;
  side: RongorongoSide;
  line: number;
  /** Example: Gv5 */
  label: string;
  tokens: RongorongoToken[];
}

export interface GlyphOccurrence {
  signId: string;
  tablet: string;
  side: RongorongoSide;
  line: number;
  lineLabel: string;
  tokenIndex: number;
  flattenedIndex: number;
  compound: boolean;
  compoundSize: number;
  compoundPosition: CompoundPosition;
  linePosition: LinePosition;
  segmentLength: number;
  previousSign: string | null;
  nextSign: string | null;
  recurrenceInLine: number;
  sourceSystem: string;
  certainty: GlyphCertainty;
}

export interface StructuralClass {
  classId: string;
  linked: boolean;
  compoundPosition: CompoundPosition;
  linePosition: LinePosition;
  segmentLength: number;
  previousSign: string | null;
  nextSign: string | null;
  occurrences: number;
}

export interface GlyphSummary {
  signId: string;
  totalOccurrences: number;
  independentCount: number;
  linkedCount: number;
  independentRate: number;
  linkedRate: number;
  compoundInitial: number;
  compoundMedial: number;
  compoundFinal: number;
  lineInitial: number;
  lineMedial: number;
  lineFinal: number;
  tablets: string[];
  uniquePreviousSigns: string[];
  uniqueNextSigns: string[];
  structuralClassCount: number;
}

export interface ControlSignResult {
  signId: string;
  frequency: number;
  linkedCount: number;
  linkedRate: number;
  frequencyDifference: number;
}

export interface MatchedControlResult {
  targetSign: string;
  targetFrequency: number;
  targetLinkedRate: number;
  controlCount: number;
  controlMeanLinkedRate: number;
  differenceFromControls: number;
  controls: ControlSignResult[];
}

export interface NeighborFrequency {
  signId: string;
  count: number;
}

/**
 * Diagnostic issue engine zone taxonomy as strictly required.
 */
export type EngineZone =
  | 'battery'
  | 'alternator'
  | 'serpentine-belt'
  | 'radiator'
  | 'coolant-reservoir'
  | 'engine-block'
  | 'cylinder-head'
  | 'intake-manifold'
  | 'exhaust-manifold'
  | 'spark-plugs'
  | 'fuel-injector'
  | 'oil-pan'
  | 'transmission'
  | 'brake-system'
  | 'exhaust-pipe'
  | 'air-filter'
  | 'power-steering'
  | 'ac-compressor'
  | 'general';

export interface DiagnosticIssue {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  lineLabel?: string;
  rawFragment?: string;
  engineZone: EngineZone;
}

/**
 * Phase 2: Visual Recognition & Tablet Inspector
 */
export interface VisualCandidate {
  signId: string;
  confidence: number;
  label: string;
  category: string;
}

export interface TabletImageMeta {
  id: string;
  name: string;
  code: string;
  side: RongorongoSide;
  description: string;
  currentLocation: string;
  sampleLines: string[];
}

/**
 * ZP Epigraphic Test Series Types
 * For reproducible analysis of decipherment hypotheses.
 */
export type ZPTestStatus = 'pending' | 'passed' | 'failed' | 'falsified' | 'inconclusive';

export interface ZPEvidenceCitation {
  tablet: string;
  lineLabel: string;
  excerpt: string;
  signCount: number;
}

export interface ZPTestRecord {
  /** Unique identifier for the test (e.g., ZP-01, ZP-C3) */
  id: string;
  /** Human-readable title of the test */
  title: string;
  /** Clearly defined hypothesis */
  hypothesis: string;
  /** Specified control groups */
  controlGroups: string;
  /** Recorded results (text summary and metrics) */
  recordedResults: string;
  /** Supporting evidence (corpus occurrences, structural observations) */
  supportingEvidence: string;
  /** Concrete falsification criterion */
  falsificationCriterion: string;
  /** Current evaluation status (supports explicit 'falsified' marking) */
  status: ZPTestStatus;
  /** Target signs investigated by this test */
  targetSigns: string[];
  /** Optional structured citations from the corpus */
  evidenceCitations?: ZPEvidenceCitation[];
  /** Optional computed numerical metric from live analysis */
  computedMetric?: string;
  /** Timestamp of the last execution */
  lastEvaluatedAt?: string;
  /** Mandatory documentation notes when status is 'falsified' */
  falsificationNotes?: string;
  /** Timestamp of when the hypothesis was marked as falsified */
  falsifiedAt?: string;
}



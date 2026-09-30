export type DictionaryConfidence = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type EvidenceLevel = 'O' | 'R' | 'S' | 'L' | 'P' | 'X';

export interface VocabularyEntry {
  id: string; // e.g. CH-0001
  recordedForm: string;
  normalizedForm: string;
  type: string;
  meaningOrReferent: string;
  possibleSegmentation: string;
  earliestSourceDate: string;
  source: string;
  sourceUrl: string;
  sourcePage: string;
  recorderOrInformant: string;
  modernForm?: string;
  notes: string;
  confidence: DictionaryConfidence;
}

export interface HistoricalPerson {
  id: string; // PER-0001
  recordedName: string;
  normalizedName: string;
  roleOrStatus: string;
  clanOrLine?: string;
  parent?: string;
  childOrDescendant?: string;
  approxPeriod: string;
  rongorongoAssociation: string;
  source: string;
  sourceUrl: string;
  locationInSource: string;
  confidence: DictionaryConfidence;
  researchNotes: string;
}

export interface RoyalGenealogyEntry {
  id: string; // GEN-R-01
  sourceTradition: string;
  generationNo: number;
  nameAsRecorded: string;
  normalizedName: string;
  predecessor?: string;
  successor?: string;
  relationshipWording: string;
  approxDate: string;
  sourceUrl: string;
  confidence: DictionaryConfidence;
  notes: string;
}

export interface CrossSourceAnchor {
  id: string; // XREF-001
  rousselForm: string;
  rousselPos: number;
  jaussenForm: string;
  jaussenPos: string;
  metrauxForm: string;
  metrauxPos: number;
  thomsonPos: number;
  normalizedLabel: string;
  evidence: string;
  notes: string;
}

export interface TabooRecord {
  id: string; // TAB-0001
  originalForm: string;
  personOrCause: string;
  replacementForm: string;
  replacementType: string;
  period: string;
  directEvidence: string;
  comparativeEvidence: string;
  source: string;
  sourceUrl: string;
  confidence: DictionaryConfidence;
  status: string;
  notes: string;
}

export interface PhoneticHypothesisEntry {
  id: string; // PHO-0001
  glyphOrSequence: string;
  proposedSound: string;
  proposedWord: string;
  basis: string;
  trainingSource: string;
  independentTest: string;
  contradictions: string;
  score: number;
  confidence: DictionaryConfidence;
  status: 'Open' | 'Promising' | 'Quarantined' | 'Suspended';
  notes: string;
}

export interface TitleFormula {
  id: string; // FRM-001
  formula: string;
  literalFunction: string;
  exampleRapaNui: string;
  interpretation: string;
  source: string;
  sourceUrl: string;
  sourceLocation: string;
  independentOfRongorongo: boolean;
  glyphAnalogyToTest: string;
  confidence: DictionaryConfidence;
  notes: string;
}

export interface TitleCandidate {
  id: string; // TC-01
  historicalForm: string;
  normalized: string;
  meaningOrRole: string;
  directEvidence: string;
  syllableParse: string;
  simple2SignFit: 'POOR' | 'AMBIGUOUS' | 'GOOD' | 'VERY POOR' | 'PASS' | 'FAIL';
  hereditaryTitleFit: 'VERY STRONG' | 'MODERATE' | 'WEAK' | 'STRONG';
  couldEqualTitleX: string;
  couldEqual062_073: string;
  whyNotMatchYet: string;
  evidenceGrade: DictionaryConfidence;
  primarySource: string;
  status: string;
}

export interface RejectedClaim {
  id: string; // REJ-0001
  claim: string;
  reasonRejectedOrDowngraded: string;
  sourceOrOrigin: string;
  dateReviewed: string;
  canReopenIf: string;
  notes: string;
}

export interface BibliographySource {
  id: string; // SRC-0001
  author: string;
  year: string;
  title: string;
  sourceType: string;
  whyItMatters: string;
  url: string;
  priority: 'Critical' | 'High' | 'Medium';
  verificationStatus: string;
  notes: string;
}

export interface Gv6UnitRecord {
  id: string; // GV6-U1
  rawOrder: number;
  reconstructedStart: string;
  titleCandidate: string;
  sonNameSigns: string;
  fatherNameSigns: string;
  sharedLinkToNext: string;
  davletshinFunction: string;
  phoneticEquation: string;
  historicalNameAssigned: string;
  confidenceTranscription: DictionaryConfidence;
  confidenceStructure: DictionaryConfidence;
  notes: string;
}

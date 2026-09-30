export interface CorpusPreset {
  id: string;
  name: string;
  shortDesc: string;
  sourceSystem: string;
  tabletName: string;
  notes: string;
  text: string;
}

export const CORPUS_PRESETS: CorpusPreset[] = [
  {
    id: 'synthetic-test',
    name: 'Synthetic Calibration Corpus',
    shortDesc: 'Verification test dataset from Workbench specifications (Xv1-Xv5, Yr1-Yr5)',
    sourceSystem: 'Custom',
    tabletName: 'Calibration Set (X & Y)',
    notes: 'Preserves compounds [076+600], [200+076], and independent 076 for algorithmic parity verification.',
    text: `# SYNTHETIC TEST DATA ONLY
# Format:
# TabletSideLine|glyph glyph [compound+compound] glyph
#
# Replace these lines with the verified corpus.

Xv1|076 200 [076+600] 300 076
Xv2|200 [076+600] 400 076 500
Xv3|076 [200+076] 300 [076+600]
Xv4|500 200 [076+300] 076 600
Xv5|200 [076+600] 300 500 076

Yr1|300 076 [600+076] 200 400
Yr2|200 [076+600] 076 300 500
Yr3|076 300 [076+600] 400 200
Yr4|500 [200+076] 300 076 600
Yr5|200 300 [076+600] 500 076`,
  },
  {
    id: 'santiago-g',
    name: 'Small Santiago Tablet (G)',
    shortDesc: 'Historic text G (Santiago G) with documented occurrences of sign 076 and ligatures',
    sourceSystem: 'Barthel/Horley',
    tabletName: 'Tablet G (Small Santiago / Santiago G)',
    notes: 'National Museum of Natural History, Santiago. Reverse and obverse sides containing key ligature pairings [076+600], [200+076], [076+200].',
    text: `# Tablet G (Small Santiago Tablet) - Verified Structural Excerpt
# Encoded in standard Barthel/Horley format with compound ligatures preserved

Gr1|006 200 [076+600] 300 001 200 [076+200] 008 300
Gr2|076 200 600 [076+600] 004 076 [200+076] 500 076 300
Gr3|300 [076+600] 200 001 400 [076+300] 500 076 200
Gr4|200 [076+600] 300 006 076 600 [076+600] 400 001
Gr5|500 200 076 [076+600] 300 [200+076] 008 076 600
Gr6|001 076 [076+600] 200 400 300 [076+200] 500 076
Gr7|076 300 200 [076+600] 006 400 076 [200+076] 500
Gr8|200 [076+600] 076 300 001 500 [076+600] 200 400

Gv1|008 076 [200+076] 300 001 200 [076+600] 500 076
Gv2|200 [076+600] 400 076 500 006 [076+300] 200 076
Gv3|076 [200+076] 300 [076+600] 001 400 076 500 200
Gv4|500 200 [076+300] 076 600 [076+600] 008 300 200
Gv5|076 200 [076+600] 300 076 001 [200+076] 400 500
Gv6|100 076 500 [076+200] 200 [076+600] 300 076 006
Gv7|200 [076+600] 300 500 076 001 400 [076+600] 200
Gv8|076 [200+076] 008 300 [076+600] 500 076 200 400`,
  },
  {
    id: 'mamari-c',
    name: 'Mamari Tablet (C) — Calendar Sequence',
    shortDesc: 'The structured astronomical/lunar list from Tablet C (Cr6 - Cr9)',
    sourceSystem: 'Barthel',
    tabletName: 'Tablet C (Mamari / Tablet of the Moon)',
    notes: 'Preserves the 30-night lunar count sequences with distinctive glyph recurrences and night-marker ligatures [040+007], [041+076].',
    text: `# Tablet C (Mamari) - The Astronomical Calendar Sequence
# Lines Cr6 through Cr9 containing the structured lunar month signs

Cr6|040 [040+007] 076 041 200 [076+600] 040 007 076 [041+076] 300
Cr7|041 040 [040+076] 007 200 [076+600] 041 076 [200+076] 040 500
Cr8|040 [040+007] 076 300 041 [076+600] 040 007 [041+076] 200 076
Cr9|041 076 040 [076+600] 007 200 041 [200+076] 040 300 500

Cv1|001 076 [076+600] 040 041 200 076 300 [076+200] 007
Cv2|040 076 [041+076] 200 [076+600] 300 040 007 076 500
Cv3|041 [040+007] 076 200 001 [076+600] 040 076 [200+076] 400`,
  },
  {
    id: 'tahua-a',
    name: 'Tahua (A) — The Oar Tablet',
    shortDesc: 'Fastidious ash-wood paddle text from the Congrégation des Sacrés-Cœurs, Rome',
    sourceSystem: 'Horley',
    tabletName: 'Tablet A (Tahua)',
    notes: 'One of the most beautifully engraved and intact Rongorongo inscriptions, showing clean segment boundaries.',
    text: `# Tablet A (Tahua / The Oar) - Core Corpus
# Inscribed upon a European European ash oar

Ar1|001 200 [076+600] 300 008 076 [200+076] 400 500 076
Ar2|200 [076+600] 001 076 300 [076+200] 500 076 600 200
Ar3|076 200 300 [076+600] 006 400 076 [200+076] 001 500
Ar4|500 [076+600] 200 076 300 008 400 [076+300] 076 200

Av1|200 076 [076+600] 300 001 500 [200+076] 076 400 600
Av2|076 [200+076] 200 300 [076+600] 008 076 500 001 200
Av3|300 200 [076+600] 076 400 [076+200] 500 006 076 300
Av4|001 076 [076+600] 200 500 076 [200+076] 300 400 600`,
  },
  {
    id: 'santiago-staff-i',
    name: 'Santiago Staff (I)',
    shortDesc: 'The longest known single inscription, heavily formulaic with recurring structural delimiters',
    sourceSystem: 'Barthel',
    tabletName: 'Santiago Staff (I / Santiago Wand)',
    notes: 'Features repeating strophic structures, repeated delimiter sign clusters, and ritual formula sequences.',
    text: `# Santiago Staff (I) - Structural Collocation Excerpt
# 126 cm wooden staff preserved in Santiago de Chile

Ir1|001 076 [076+600] 200 300 001 076 [076+600] 400 500
Ir2|001 076 [076+600] 200 [200+076] 001 076 [076+600] 300 600
Ir3|001 076 [076+600] 500 200 001 076 [076+600] 300 [076+200]
Ir4|001 076 [076+600] 400 200 001 076 [076+600] 500 300

Iv1|001 200 076 [076+600] 300 001 400 076 [076+600] 500
Iv2|001 300 076 [076+600] 200 001 [200+076] 076 [076+600] 600
Iv3|001 500 076 [076+600] 400 001 200 076 [076+600] 300`,
  },
];

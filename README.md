# SAWT — Sound-Aligned Writing Technique

**SAWT (صوت, *ṣawt*, sound/voice)** is an author-designed shorthand system based on consonant sounds, anchored vowel marks, and a compact set of confirmed modifiers.

Live site: https://rayeen13.github.io/SAWT-Shorthand/

## The current website

- Responsive **English → SAWT sentence converter**, not a manual word assembly demo.
- Confirmed source words take priority over pronunciation guesses.
- Online English dictionary expansion using the [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) (optional; site works without it).
- Romanized non-English sound handling where SAWT symbols have been confirmed — **BHARAT** uses atomic `B'`.
- Local corrections: click a converted word and edit its confirmed glyph units and vowel placements.
- Optional initial supporting dot `•` and optional W-for-V rendering.
- Sentence SVG export, four beginner-friendly stories, and a compact reference page with only **13 source vowel labels**.
- Restored the original graph-window identity, with interactive, **illustrative sine-wave studies** for AA, EE, AO, AU and AOI.
- A new Ṣād (ص)-inspired SVG mark serves as the site logo and favicon.

## Repo layout

```text
index.html                  semantic page sections
styles.css                  shared responsive visual design
assets/sawt-icon.svg        SVG branding and favicon
js/sawt-data.js             canonical glyphs, 13 vowel marks, source examples
js/sawt-converter.js        text tokenization and sound-to-SA WT conversion
js/sawt-render.js           SVG glyph rendering and SVG export
js/sawt-waves.js            original-style interactive vowel wave graph
js/sawt-pronunciation.js    optional CMUdict text parser
js/app.js                   UI/event handling and local corrections
tests/converter.test.mjs    Node.js tests
```

## Getting started

The site is static. Serve the directory via any static HTTP server (ES modules require HTTP rather than opening `index.html` using `file://`):

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

To run tests (Node 22 or newer recommended):

```bash
npm test
```

## Script rules

The handwritten draft and confirmed corrections are authoritative. Extended online pronunciation matches are a helpful approximation, not definitive SAWT:

- Original handwritten vowel labels: AA, A, AE, E, I, EE, AI, AO, AU, OO, U, O, YU. **I is a short rising slash; EE uses a double-length rising slash.**
- Confirmed addition: **AOI /ɔɪ/** for VOICE, BOY, CHOICE. One joined three-segment **/\\/** stroke anchored to the consonant. VOICE = **V[AOI]S**.
- **Short A is implicit inside generated words.** Only standalone A is emitted automatically; authoritative handwritten examples such as AZAN retain their explicitly authored A mark.
- Initial vowels may float in front of the word with **no dot**. A supporting centered bullet is optional.
- T', D', B' are each indivisible glyph units, representing unvoiced TH, voiced TH, and BH.
- SH and CH use a single c-like drooping handwritten lower stroke.
- ZH = ~; -NG = !; -ING = +; -TION = #; AND = ∧; OR = ∨.
- V and W are both available; users can optionally render V sounds with W.
- Additional endings like -MENT and -LY have not been approved and are not included.

## Accuracy

SAWT is an evolving personal shorthand, and the converter does **not** claim exact phonetic spelling for every English word. Word labels distinguish **Source**, **Pronunciation**, **Estimated**, and **Saved correction**. The English dictionary enhances word recognition, while confirmed SAWT examples still win.

## English pronunciation data

The optional dictionary is the Carnegie Mellon Pronouncing Dictionary (CMUdict), originally © Carnegie Mellon University, redistributed under its BSD-style license. [Full license and attribution](https://github.com/cmusphinx/cmudict/blob/master/LICENSE). The dictionary is fetched as plain text; user input is processed locally and **is not sent to the dictionary server**. Without an internet connection, a curated on-device lexicon and an explicitly labeled fallback remain available.

## Notes on publishing

Website updates are intentionally committed to Git and deployed by GitHub Pages, preserving source provenance. For changes to phonetic glyphs, follow the author's source manuscript, not generated assumptions.

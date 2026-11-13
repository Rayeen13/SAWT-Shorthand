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

## Studio input syntax

The Studio recognizes three explicit editing controls that are not ordinary English-to-SAWT spellings:

- `"Keep me as it is"` — preserve the exact text inside the double quotation marks without converting it. The wrapping quotes are delimiters, not part of the rendered result.
- `` `I am also kept as it is` `` — preserve the exact text and render it **bold/highlighted** in the Studio and exported SVG.
- `*` — an explicit **vowel carrier**. It renders as a centered bullet `•` even when the optional automatic supporting-dot toggle is off. The manual word editor also accepts `*` as an atomic glyph unit, so a sound can be anchored to a separate dot inside a word.
- `*[AO]`, `*[AOI]`, `*[I]` — place the specified approved vowel mark on the bullet. For `I` and `EE`, the mark remains below the carrier; all other source tones use their existing side.
- `*oat` — take OAT's **initial** O tone and attach it to the explicit bullet before T. This is not the same as TOE.

Quoted/backtick text preserves spelling, spaces and punctuation and bypasses both the English dictionary and fallback conversion. Unclosed quotes are ordinary punctuation. The teaching notation and SVG exports respect these modes. User text stays local.

Default input example: **The quick brown fox jumps over the lazy dog.**

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

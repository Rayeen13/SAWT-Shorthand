# SAWT — Sound-Aligned Writing Technique

SAWT is Riyan's original shorthand system, digitized as a modern static website using HTML5, modern CSS, vanilla JavaScript, GSAP and ScrollTrigger.

## Canonical placement rule (v0.5)

A vowel sound is **not written as superscript letters**. The documentation may use square brackets to show where a tone belongs, but the finished shorthand contains only the consonant skeleton plus the actual tone stroke.

Examples:

- `TR[AY]` → write `TR`; draw the AY tone above `R`.
- `C[AE]T` → write `CT`; draw the AE tone above `C`.
- `D[AO]G` → write `DG`; draw the AO tone above `D`.
- `TRYING = TR[AI]ING = TR[AI]+` → AI is written above `R`, then `+` represents `-ING`.

`AI`, `AY`, and `EE` are distinct. TRYING uses `AI`; TRAY uses `AY`. In the digital rendering, EE uses the rising slash and AY uses the grave/down-sloping stroke visible in the handwritten TRAY example.

## Tech

- HTML5
- Modern responsive CSS
- Vanilla JavaScript
- GSAP + ScrollTrigger from jsDelivr
- No build step

## Run locally

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## GitHub Pages

`.github/workflows/pages.yml` deploys the static site on every push to `main` once the repository's Pages source is set to **GitHub Actions**.


## Correction in v0.5

`TRYING` is **not** `TR[AY]ING`. Its canonical teaching breakdown is `TR[AI]ING`, compressed to `TR[AI]+`. In the finished shorthand the `AI` tone mark is drawn directly above `R`, and `+` carries the `-ING` ending.

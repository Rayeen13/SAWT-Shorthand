'use strict';

/*
 * SAWT Sentence Converter v0.6
 * Converts complete sentences word-by-word.
 * Canonical notebook forms are kept exact; other words use a transparent
 * client-side sound heuristic and are labeled Estimated until approved.
 */

const sawtCanonicalLexicon = Object.freeze({
  tray: {
    skeleton: 'TR',
    marks: [{ tone: 'AY', anchor: 1 }],
    modifier: '',
    status: 'canonical',
    note: 'Observed notebook form: AY above R.'
  },
  cat: {
    skeleton: 'CT',
    marks: [{ tone: 'AE', anchor: 0 }],
    modifier: '',
    status: 'canonical',
    note: 'Observed notebook form: AE above C.'
  },
  dog: {
    skeleton: 'DG',
    marks: [{ tone: 'AO', anchor: 0 }],
    modifier: '',
    status: 'canonical',
    note: 'Observed notebook form: AO above D.'
  },
  try: {
    skeleton: 'TR',
    marks: [{ tone: 'AI', anchor: 1 }],
    modifier: '',
    status: 'canonical',
    note: 'Observed notebook form: AI above R.'
  },
  trying: {
    skeleton: 'TR',
    marks: [{ tone: 'AI', anchor: 1 }],
    modifier: '-ING',
    status: 'canonical',
    note: 'Observed notebook form: AI above R + ING modifier.'
  },
  the: {
    skeleton: 'D',
    marks: [],
    modifier: '',
    status: 'canonical',
    note: 'Observed notebook note: voiced TH sound contracts to D.'
  }
});

const voicedThWords = new Set([
  'the','this','that','these','those','there','their','them','then','than',
  'though','thus','they','thee','thy','thine','weather','whether','rather'
]);

const vowelChars = new Set(['a','e','i','o','u']);

function sawtIsVowelAt(word, index) {
  const ch = word[index];
  if (vowelChars.has(ch)) return true;
  if (ch === 'y') return index > 0;
  return false;
}

function sawtToneById(id) {
  return soundData.find(function (item) { return item.id === id; }) || null;
}

function sawtModifierSymbol(id) {
  if (id === '-ING') return '+';
  if (id === '-TION') return '#';
  return id || '';
}

function sawtClonePlan(plan, original) {
  return {
    original: original,
    skeleton: plan.skeleton,
    marks: plan.marks.map(function (mark) { return { tone: mark.tone, anchor: mark.anchor }; }),
    modifier: plan.modifier || '',
    status: plan.status || 'canonical',
    note: plan.note || ''
  };
}

function sawtNormalizeBase(word) {
  let value = word.toLowerCase().replace(/[^a-z']/g, '').replace(/'/g, '');
  let modifier = '';

  if (value.length > 4 && value.endsWith('ing')) {
    modifier = '-ING';
    value = value.slice(0, -3);
    if (value.length > 2 && value[value.length - 1] === value[value.length - 2] && !sawtIsVowelAt(value, value.length - 1)) {
      value = value.slice(0, -1);
    }
  } else if (value.length > 5 && value.endsWith('tion')) {
    modifier = '-TION';
    value = value.slice(0, -4);
  }

  return { base: value || word.toLowerCase(), modifier: modifier };
}

function sawtBuildSkeleton(base) {
  const letters = [];
  const sourceToSkeleton = {};
  let i = 0;

  function push(char, sourceIndexes) {
    const upper = char.toUpperCase();
    let index = letters.length - 1;
    if (letters[index] !== upper) {
      letters.push(upper);
      index = letters.length - 1;
    }
    sourceIndexes.forEach(function (sourceIndex) { sourceToSkeleton[sourceIndex] = index; });
  }

  while (i < base.length) {
    const pair = base.slice(i, i + 2);

    if (i === 0 && pair === 'kn') {
      push('n', [i, i + 1]);
      i += 2;
      continue;
    }
    if (i === 0 && pair === 'wr') {
      push('r', [i, i + 1]);
      i += 2;
      continue;
    }
    if (pair === 'ph') {
      push('f', [i, i + 1]);
      i += 2;
      continue;
    }
    if (pair === 'ck') {
      push('k', [i, i + 1]);
      i += 2;
      continue;
    }
    if (pair === 'th') {
      push(voicedThWords.has(base) ? 'd' : 't', [i, i + 1]);
      i += 2;
      continue;
    }

    if (!sawtIsVowelAt(base, i)) push(base[i], [i]);
    i += 1;
  }

  if (!letters.length) {
    const fallback = (base[0] || 'A').toUpperCase();
    letters.push(fallback);
    sourceToSkeleton[0] = 0;
  }

  return { skeleton: letters.join(''), map: sourceToSkeleton };
}

function sawtFindAnchor(base, map, start, end, skeletonLength) {
  let i;
  for (i = start - 1; i >= 0; i -= 1) {
    if (Number.isInteger(map[i])) return map[i];
  }
  for (i = end; i < base.length; i += 1) {
    if (Number.isInteger(map[i])) return map[i];
  }
  return Math.max(0, skeletonLength - 1);
}

function sawtLongToneFromSilentE(base, groupStart, groupText) {
  if (!base.endsWith('e') || groupStart >= base.length - 2 || groupText.length !== 1) return null;
  if (groupText === 'a') return 'AY';
  if (groupText === 'i') return 'AI';
  if (groupText === 'o') return 'AO';
  if (groupText === 'u') return 'OO';
  if (groupText === 'e') return 'EE';
  return null;
}

function sawtToneForGroup(base, start, group) {
  const silentELong = sawtLongToneFromSilentE(base, start, group);
  if (silentELong) return silentELong;

  if (group === 'ay' || group === 'ai' || group === 'ey') return 'AY';
  if (group === 'ee' || group === 'ea' || group === 'ie') return 'EE';
  if (group === 'oo' || group === 'ue') return 'OO';
  if (group === 'oi' || group === 'oy') return 'OY';
  if (group === 'ou' || group === 'ow') return 'AU';
  if (group === 'au' || group === 'aw') return 'AW';
  if (group === 'oa' || group === 'oe') return 'AO';

  if (group === 'y') {
    if (start === base.length - 1 && base.length <= 4) return 'AI';
    return 'EE';
  }

  if (group === 'a') return 'AE';
  if (group === 'e') return 'E';
  if (group === 'i') return 'I';
  if (group === 'o') return 'O';
  if (group === 'u') return 'UH';

  return 'SCHWA';
}

function sawtFindVowelMarks(base, skeletonInfo) {
  const marks = [];
  let index = 0;

  while (index < base.length) {
    if (!sawtIsVowelAt(base, index)) {
      index += 1;
      continue;
    }

    const start = index;
    while (index < base.length && sawtIsVowelAt(base, index)) index += 1;
    const group = base.slice(start, index);

    if (group === 'e' && index === base.length && base.length > 2) continue;

    let toneId = sawtToneForGroup(base, start, group);

    if (index < base.length && base[index] === 'r' && ['e','i','u'].includes(group)) {
      toneId = 'ER';
    }

    const anchor = sawtFindAnchor(base, skeletonInfo.map, start, index, skeletonInfo.skeleton.length);
    const key = toneId + ':' + anchor;

    if (!marks.some(function (mark) { return mark.key === key; })) {
      marks.push({ tone: toneId, anchor: anchor, key: key });
    }
  }

  return marks.map(function (mark) { return { tone: mark.tone, anchor: mark.anchor }; });
}

function sawtAnalyzeWord(original) {
  const clean = original.toLowerCase().replace(/[^a-z']/g, '');

  if (sawtCanonicalLexicon[clean]) return sawtClonePlan(sawtCanonicalLexicon[clean], original);

  const normalized = sawtNormalizeBase(clean);
  const skeletonInfo = sawtBuildSkeleton(normalized.base);
  const marks = sawtFindVowelMarks(normalized.base, skeletonInfo);

  const usesProposed = marks.some(function (mark) {
    const tone = sawtToneById(mark.tone);
    return tone && tone.type === 'proposed';
  });

  return {
    original: original,
    skeleton: skeletonInfo.skeleton,
    marks: marks,
    modifier: normalized.modifier,
    status: 'estimated',
    note: usesProposed
      ? 'Estimated from spelling; includes one or more proposed sound marks.'
      : 'Estimated from spelling using the current SAWT sound rules.'
  };
}

function sawtTokenizeSentence(text) {
  return text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|\d+(?:[.,]\d+)?|[^\s]/g) || [];
}

function sawtConvertSentence(text) {
  return sawtTokenizeSentence(text).map(function (token) {
    if (/^[A-Za-z]/.test(token)) return sawtAnalyzeWord(token);
    return { original: token, punctuation: true, status: 'literal' };
  });
}

function sawtEscape(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char];
  });
}

function sawtTeachingNotation(plan) {
  if (plan.punctuation) return plan.original;

  const chars = plan.skeleton.split('');
  const grouped = {};
  plan.marks.forEach(function (mark) {
    if (!grouped[mark.anchor]) grouped[mark.anchor] = [];
    grouped[mark.anchor].push(mark.tone);
  });

  let out = '';
  chars.forEach(function (char, index) {
    out += char;
    (grouped[index] || []).forEach(function (tone) { out += '[' + tone + ']'; });
  });
  out += sawtModifierSymbol(plan.modifier);
  return out || plan.original;
}

let sawtSentenceGlyphId = 0;

function sawtShapeMarkup(item) {
  return (markShapes[item.mark] || '')
    .replaceAll('MARK', 'sentence-live-mark')
    .replaceAll('FILL', 'sentence-live-fill');
}

function sawtGlyphWidth(plan) {
  if (plan.punctuation) return 30;
  return Math.max(92, plan.skeleton.length * 58 + (plan.modifier ? 42 : 24));
}

function sawtWordGlyph(plan) {
  if (plan.punctuation) return '<span class="sentence-punctuation">' + sawtEscape(plan.original) + '</span>';

  const chars = plan.skeleton.split('');
  const width = sawtGlyphWidth(plan);
  const height = 118;
  const gap = chars.length > 1 ? Math.min(58, (width - 54) / (chars.length - 1)) : 0;
  const startX = chars.length > 1 ? 28 : width / 2;
  const baselineY = 87;
  const glyphId = 'sentenceGradient' + (++sawtSentenceGlyphId);

  let letters = '';
  chars.forEach(function (char, index) {
    const x = chars.length > 1 ? startX + index * gap : startX;
    letters += '<text class="sentence-live-letter" x="' + x + '" y="' + baselineY + '" text-anchor="middle">' + sawtEscape(char) + '</text>';
  });

  const stacks = {};
  let marks = '';
  plan.marks.forEach(function (mark) {
    const tone = sawtToneById(mark.tone);
    if (!tone) return;
    const anchor = Math.max(0, Math.min(Number(mark.anchor) || 0, chars.length - 1));
    const x = chars.length > 1 ? startX + anchor * gap : startX;
    const stack = stacks[anchor] || 0;
    stacks[anchor] = stack + 1;
    const yShift = -7 - stack * 17;
    marks += '<g transform="translate(' + (x - 82) + ' ' + yShift + ')">' + sawtShapeMarkup(tone) + '</g>';
  });

  let modifier = '';
  if (plan.modifier) {
    modifier = '<text class="sentence-live-modifier" x="' + (width - 17) + '" y="' + baselineY + '" text-anchor="middle">' + sawtEscape(sawtModifierSymbol(plan.modifier)) + '</text>';
  }

  return '<svg class="sentence-word-svg" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + sawtEscape(plan.original + ' as ' + sawtTeachingNotation(plan)) + '">' +
    '<defs><linearGradient id="' + glyphId + '" x1="0" x2="1"><stop offset="0" stop-color="#75e6ff"/><stop offset=".55" stop-color="#a991ff"/><stop offset="1" stop-color="#f4c86a"/></linearGradient></defs>' +
    letters + marks + modifier + '</svg>';
}

function sawtStatusBadge(plan) {
  if (plan.status === 'canonical') return '<span class="converter-status canonical">Notebook</span>';
  return '<span class="converter-status estimated">Estimated</span>';
}

function sawtRenderSentence(plans) {
  const stage = document.getElementById('sentence-glyph-line');
  const analysis = document.getElementById('sentence-analysis');
  const notation = document.getElementById('sentence-notation');
  const empty = document.getElementById('converter-empty');

  const words = plans.filter(function (plan) { return !plan.punctuation; });
  empty.hidden = words.length > 0;

  stage.innerHTML = plans.map(function (plan) {
    if (plan.punctuation) return sawtWordGlyph(plan);
    return '<div class="sentence-word" title="' + sawtEscape(plan.note) + '">' +
      sawtWordGlyph(plan) +
      '<span class="sentence-source-word">' + sawtEscape(plan.original) + '</span>' +
      '</div>';
  }).join('');

  notation.textContent = plans.map(sawtTeachingNotation).join(' ').replace(/\s+([,.!?;:])/g, '$1');

  analysis.innerHTML = words.map(function (plan) {
    const markSummary = plan.marks.length
      ? plan.marks.map(function (mark) {
          const tone = sawtToneById(mark.tone);
          const host = plan.skeleton[mark.anchor] || plan.skeleton[0] || '—';
          return '<span><b>' + sawtEscape(mark.tone) + '</b> above ' + sawtEscape(host) + (tone ? ' · ' + sawtEscape(tone.ipa) : '') + '</span>';
        }).join('')
      : '<span>No separate vowel mark</span>';

    return '<article class="converter-word-card">' +
      '<div class="converter-word-head"><strong>' + sawtEscape(plan.original) + '</strong>' + sawtStatusBadge(plan) + '</div>' +
      '<code>' + sawtEscape(sawtTeachingNotation(plan)) + '</code>' +
      '<div class="converter-word-marks">' + markSummary + '</div>' +
      '<p>' + sawtEscape(plan.note) + '</p>' +
      '</article>';
  }).join('');

  const canonicalCount = words.filter(function (plan) { return plan.status === 'canonical'; }).length;
  const estimatedCount = words.length - canonicalCount;
  document.getElementById('converter-word-count').textContent = String(words.length);
  document.getElementById('converter-canonical-count').textContent = String(canonicalCount);
  document.getElementById('converter-estimated-count').textContent = String(estimatedCount);
}

function sawtBuildExportSvg(plans) {
  const width = 1200;
  const margin = 50;
  const lineHeight = 150;
  let x = margin;
  let y = margin;
  let rows = 1;
  let body = '';

  plans.forEach(function (plan) {
    if (plan.punctuation) {
      const punctuationWidth = 34;
      if (x + punctuationWidth > width - margin) {
        x = margin;
        y += lineHeight;
        rows += 1;
      }
      body += '<text x="' + x + '" y="' + (y + 86) + '" class="punc">' + sawtEscape(plan.original) + '</text>';
      x += punctuationWidth;
      return;
    }

    const wordWidth = sawtGlyphWidth(plan) + 20;
    if (x + wordWidth > width - margin) {
      x = margin;
      y += lineHeight;
      rows += 1;
    }

    const temp = document.createElement('div');
    temp.innerHTML = sawtWordGlyph(plan);
    const svg = temp.querySelector('svg');
    if (svg) {
      const inner = svg.innerHTML;
      body += '<svg x="' + x + '" y="' + y + '" width="' + (wordWidth - 20) + '" height="118" viewBox="' + svg.getAttribute('viewBox') + '">' + inner + '</svg>';
      body += '<text x="' + x + '" y="' + (y + 132) + '" class="source">' + sawtEscape(plan.original) + '</text>';
    }
    x += wordWidth;
  });

  const height = margin * 2 + rows * lineHeight;
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '">' +
    '<rect width="100%" height="100%" fill="#0c1118"/>' +
    '<style>.sentence-live-letter{fill:#fff;font:46px Inter,Arial,sans-serif;font-weight:300}.sentence-live-mark{fill:none;stroke:#75e6ff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.sentence-live-fill{fill:#f4c86a}.sentence-live-modifier{fill:#f4c86a;font:42px Inter,Arial,sans-serif}.source{fill:#7f8a99;font:12px Inter,Arial,sans-serif}.punc{fill:#fff;font:46px Inter,Arial,sans-serif}</style>' +
    body + '</svg>';
}

function setupSentenceConverter() {
  const input = document.getElementById('sentence-input');
  const convertButton = document.getElementById('convert-sentence');
  const clearButton = document.getElementById('clear-sentence');
  const copyButton = document.getElementById('copy-sentence-notation');
  const exportButton = document.getElementById('export-sentence-svg');
  const analysisToggle = document.getElementById('toggle-analysis');
  const analysisPanel = document.getElementById('sentence-analysis-wrap');
  let currentPlans = [];

  function convert() {
    const value = input.value.trim();
    currentPlans = sawtConvertSentence(value);
    sawtRenderSentence(currentPlans);

    if (window.gsap && !reduceMotion) {
      gsap.fromTo('#sentence-glyph-line .sentence-word', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .32, stagger: .035, ease: 'power2.out' });
    }
  }

  convertButton.addEventListener('click', convert);

  input.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      convert();
    }
  });

  clearButton.addEventListener('click', function () {
    input.value = '';
    currentPlans = [];
    sawtRenderSentence([]);
    input.focus();
  });

  document.querySelectorAll('[data-sentence-example]').forEach(function (button) {
    button.addEventListener('click', function () {
      input.value = button.dataset.sentenceExample;
      convert();
    });
  });

  analysisToggle.addEventListener('click', function () {
    const open = analysisToggle.getAttribute('aria-expanded') === 'true';
    analysisToggle.setAttribute('aria-expanded', String(!open));
    analysisPanel.hidden = open;
    analysisToggle.textContent = open ? 'Show word analysis' : 'Hide word analysis';
  });

  copyButton.addEventListener('click', async function () {
    const value = document.getElementById('sentence-notation').textContent;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      showToast('Sentence notation copied');
    } catch (error) {
      showToast(value);
    }
  });

  exportButton.addEventListener('click', function () {
    if (!currentPlans.length) return;
    const source = sawtBuildExportSvg(currentPlans);
    const blob = new Blob([source], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'sawt-sentence.svg';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
    showToast('Sentence SVG exported');
  });

  input.value = 'The cat and dog are trying SAWT.';
  convert();
}

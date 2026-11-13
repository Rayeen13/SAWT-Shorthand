import test from "node:test";
import assert from "node:assert/strict";
import { LETTERS, VOWELS, GLYPHS, NOTEBOOK, STORIES } from "../js/sawt-data.js";
import { convertText, convertWord, qualityStats, compressionStats, teachingForm } from "../js/sawt-converter.js";
import { TONE_PATH, wordSvg, compactWordSvg, readingSentenceHTML, exportSentenceSvg, exportReadingSvg, sentenceHTML } from "../js/sawt-render.js";

test("original 13 vowel labels remain, with only approved AOI added",()=>{
  assert.deepEqual(VOWELS.filter(x=>x.id!=="AOI").map(x=>x.id),["AA","A","AE","E","I","EE","AI","AO","AU","OO","U","O","YU"]);
  assert.equal(VOWELS.length,14);
  for(const entry of VOWELS) assert.ok(TONE_PATH[entry.id]);
});
test("I is exactly half the length of EE slash",()=>{
  assert.match(TONE_PATH.I,/M-5 122L5 115/);
  assert.match(TONE_PATH.EE,/M-10 128L10 114/);
});
test("source Azan uses a free initial A and AA above Z",()=>{
  const plan=convertWord("Azan");
  assert.deepEqual(plan.units,["Z","N"]);
  assert.deepEqual(plan.marks,[{tone:"A",anchor:-1},{tone:"AA",anchor:0}]);
  assert.equal(plan.status,"confirmed");
  const noDot=wordSvg(plan);
  assert.equal(noDot.includes("sawt-leading-dot"),false);
  const withDot=wordSvg(plan,{leadingDot:true});
  assert.equal(withDot.includes("sawt-leading-dot"),true);
});
test("OAT is not TOE: mark begins before T",()=>{
  const plan=convertWord("OAT");
  assert.deepEqual(plan.units,["T"]);
  assert.deepEqual(plan.marks,[{tone:"O",anchor:-1}]);
  assert.equal(teachingForm(plan),"[O]T");
});
test("BHARAT has atomic B' and long AA attached to it",()=>{
  const plan=convertWord("Bharat");
  assert.deepEqual(plan.units,["B'","R","T"]);
  assert.deepEqual(plan.marks,[{tone:"AA",anchor:0}]);
  assert.equal(teachingForm(plan),"B'[AA]RT");
  assert.match(wordSvg(plan),/B&#39;/);
});
test("voiced and unvoiced TH stay joined consonants",()=>{
  assert.equal(convertWord("this").units[0],"D'");
  assert.equal(convertWord("thick").units[0],"T'");
  assert.ok(convertWord("this").units.every(x=>x!=="'"));
});
test("SH and CH use dedicated hooked glyph units",()=>{
  assert.deepEqual(convertWord("shock").units,["SH","K"]);
  assert.deepEqual(convertWord("chalk").units,["CH","K"]);
  assert.match(wordSvg(convertWord("shock")),/sawt-hook/);
  assert.match(wordSvg(convertWord("chalk")),/sawt-hook/);
});
test("ZH is represented by a tilde consonant glyph",()=>{
  assert.ok(convertWord("vision").units.includes("~"));
  assert.ok(convertWord("measure").units.includes("~"));
});
test("confirmed NG, ING, TION and connective symbols",()=>{
  assert.equal(GLYPHS.find(x=>x.id==="NG").written,"!");
  assert.equal(convertWord("trying").suffix,"+");
  assert.equal(convertWord("and").units[0],"∧");
  assert.equal(convertWord("or").units[0],"∨");
  assert.equal(convertWord("direction").suffix,"#");
});
test("V remains available, with optional W replacement",()=>{
  assert.ok(LETTERS.includes("V"));
  assert.ok(LETTERS.includes("W"));
  assert.ok(convertWord("van").units.includes("V"));
  assert.ok(convertWord("van",{mergeV:true}).units.includes("W"));
});
test("unknown words are estimated, never implicitly canonical",()=>{
  const result=convertWord("unlistedwordzz");
  assert.equal(result.status,"estimated");
});
test("editor corrections can override fallback and are labeled custom",()=>{
  const corrections={laser:{units:["L","Z","R"],marks:[{tone:"E",anchor:0}],suffix:""}};
  const plan=convertWord("laser",{},corrections);
  assert.equal(plan.status,"custom");
  assert.deepEqual(plan.units,["L","Z","R"]);
});
test("punctuation and whitespace survive sentence conversion",()=>{
  const plans=convertText("Bharat is here. Azan!\nOAT?");
  assert.equal(plans.map(x=>x.original).join(""),"Bharat is here. Azan!\nOAT?");
  const stats=qualityStats(plans);
  assert.equal(stats.total,5);
  assert.ok(stats.confirmed>=3);
  assert.match(sentenceHTML(plans),/word-chip/);
});
test("story examples convert to valid scalable SVG",()=>{
  assert.ok(STORIES.length>=3);
  for(const story of STORIES) {
    const plans=convertText(story.text);
    assert.ok(plans.filter(x=>x.kind==="word").length>=10);
    const svg=exportSentenceSvg(plans);
    assert.match(svg,/^<\?xml/);
    assert.match(svg,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.ok(svg.includes("sawt-letter"));
  }
});
test("HTML input is safely escaped in converter rendering",()=>{
  const plans=convertText("<script>alert('x')</script>");
  const html=sentenceHTML(plans);
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;"));
});

test("AOI is a single connected /\\/ mark anchored to V in VOICE",()=>{
  const plan=convertWord("voice");
  assert.deepEqual(plan.units,["V","S"]);
  assert.deepEqual(plan.marks,[{tone:"AOI",anchor:0}]);
  assert.equal(plan.status,"confirmed");
  assert.equal(teachingForm(plan),"V[AOI]S");
  assert.match(TONE_PATH.AOI,/M-20 35L-8 13L4 35L16 13/);
  const svg=wordSvg(plan);
  assert.match(svg,/M-20 35L-8 13L4 35L16 13/);
});
test("OI/OY diphthongs from the pronunciation dictionary use one AOI mark",()=>{
  const words=["boy","joy","coin","noise","choice"];
  for(const word of words){
    const plan=convertWord(word);
    assert.equal(plan.marks.filter(x=>x.tone==="AOI").length,1,word);
    assert.equal(plan.marks.filter(x=>["AO","I"].includes(x.tone)).length,0,word);
  }
});
test("standalone A is shown, but automatically inferred short A is implicit",()=>{
  const article=convertWord("a");
  assert.deepEqual(article.marks,[{tone:"A",anchor:-1}]);
  for(const word of ["the","sun","was","about","some","upon"]){
    const plan=convertWord(word);
    assert.ok(plan.marks.every(mark=>mark.tone!=="A"),word+" has an unwanted A mark");
  }
  const source=convertWord("azan");
  assert.ok(source.marks.some(mark=>mark.tone==="A"&&mark.anchor===-1),"original AZAN must remain unchanged");
});

test("double-quoted content is preserved without SAWT phonetic conversion",()=>{
  const text='Before "Keep me as it is" after.';
  const plans=convertText(text);
  const protectedSpan=plans.find(x=>x.kind==="literal");
  assert.ok(protectedSpan);
  assert.equal(protectedSpan.text,"Keep me as it is");
  assert.equal(teachingForm(protectedSpan),protectedSpan.text);
  const html=sentenceHTML(plans);
  assert.match(html,/sawt-passthrough-literal/);
  assert.match(html,/Keep me as it is/);
  assert.equal(protectedSpan.original,'"Keep me as it is"');
  const output=exportSentenceSvg(plans);
  assert.match(output,/Keep me as it is/);
  assert.match(output,/xml:space="preserve"/);
});
test("backtick-wrapped content is preserved and visibly bold/highlighted",()=>{
  const backtick=String.fromCharCode(96);
  const phrase="I am also kept as it is";
  const plans=convertText(backtick+phrase+backtick);
  assert.equal(plans.length,1);
  assert.equal(plans[0].kind,"bold");
  assert.equal(plans[0].text,phrase);
  assert.match(sentenceHTML(plans),/<strong class="sawt-passthrough sawt-passthrough-bold"/);
  const svg=exportSentenceSvg(plans);
  assert.match(svg,/font-weight="800"/);
  assert.match(svg,/fill="#fff2c0"/);
});
test("asterisk is an explicit vowel-carrier bullet, independent of automatic dots",()=>{
  const plans=convertText("*");
  assert.equal(plans[0].kind,"carrier");
  assert.equal(plans[0].original,"*");
  assert.deepEqual(plans[0].tones,[]);
  assert.match(sentenceHTML(plans,{leadingDot:false}),/sawt-carrier-svg/);
  assert.match(sentenceHTML(plans,{leadingDot:false}),/sawt-leading-dot/);
  assert.match(exportSentenceSvg(plans,{leadingDot:false}),/sawt-leading-dot/);
});
test("asterisk can anchor an explicit approved vowel mark",()=>{
  const plans=convertText("*[AOI] *[I] *[EE]");
  const carriers=plans.filter(x=>x.kind==="carrier");
  assert.deepEqual(carriers.map(x=>x.tones),[["AOI"],["I"],["EE"]]);
  assert.equal(teachingForm(carriers[0]),"*[AOI]");
  assert.match(sentenceHTML(plans),/M-20 35L-8 13L4 35L16 13/);
  assert.match(exportSentenceSvg(plans),/M-5 122L5 115/);
});
test("carrier before OAT moves its initial O tone onto the bullet",()=>{
  const plans=convertText("*oat");
  assert.equal(plans[0].kind,"carrier");
  assert.deepEqual(plans[0].tones,["O"]);
  assert.equal(plans[1].kind,"word");
  assert.deepEqual(plans[1].marks,[]);
  assert.equal(plans.map(teachingForm).join(""),"*[O]T");
  assert.match(sentenceHTML(plans),/sawt-carrier-svg/);
});
test("an explicit carrier does not steal a following word's initial vowel",()=>{
  const plans=convertText("*[AO]oat");
  assert.equal(plans[0].kind,"carrier");
  assert.deepEqual(plans[0].tones,["AO"]);
  assert.deepEqual(plans[1].marks,[{tone:"O",anchor:-1}]);
});
test("protected text and carrier syntax are safe against HTML injection",()=>{
  const text='"Hello <script>alert(1)</script>"';
  const html=sentenceHTML(convertText(text));
  assert.ok(!html.includes("<script>"));
  assert.match(html,/&lt;script&gt;/);
  const svg=exportSentenceSvg(convertText(text));
  assert.match(svg,/&lt;script&gt;/);
});
test("unmatched quotation marks remain ordinary punctuation",()=>{
  const plans=convertText('"unfinished writing');
  assert.equal(plans[0].kind,"punct");
  assert.equal(plans[0].original,'"');
});

test("custom SAWT words can place a tone directly on a literal * carrier",()=>{
  const plan={
    kind:"word",original:"custom",units:["K","*","T"],
    marks:[{tone:"AO",anchor:1}],suffix:"",status:"custom"
  };
  assert.equal(teachingForm(plan),"K*[AO]T");
  const svg=wordSvg(plan);
  assert.match(svg,/sawt-leading-dot/);
  assert.match(svg,/cx="98" cy="81" r="6.2"/);
  assert.match(svg,/sawt-tone-ao/);
});
test("SAWT source inventory includes explicit vowel carrier",()=>{
  const carrier=GLYPHS.find(g=>g.id==="CARRIER");
  assert.ok(carrier);
  assert.equal(carrier.written,"*");
});
test("Studio's default input is the quick brown fox pangram",async()=>{
  const {readFileSync}=await import("node:fs");
  const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.ok(html.includes("The quick brown fox jumps over the lazy dog."));
  assert.ok(html.includes("STUDIO / INPUT SYNTAX"));
});

test("Reading view draws one compact inline glyph per word without inspection labels",()=>{
  const plans=convertText("VOICE and BHARAT. OAT!");
  const html=readingSentenceHTML(plans,{leadingDot:false});
  assert.match(html,/sawt-reading-word/);
  assert.match(html,/sawt-compact-word-svg/);
  assert.ok(!html.includes("word-chip-foot"));
  assert.ok(!html.includes("word-quality"));
  assert.match(html,/sawt-reading-punct/);
  assert.equal((html.match(/<button /g)||[]).length,4);
});
test("Reading view preserves whitespace, protected text, and carrier bullets",()=>{
  const tick=String.fromCharCode(96);
  const plans=convertText('The  "Exact words"\n*'+tick+'Highlighted'+tick);
  const html=readingSentenceHTML(plans,{leadingDot:false});
  assert.match(html,/The/i);
  assert.match(html,/sawt-passthrough-literal/);
  assert.match(html,/sawt-passthrough-bold/);
  assert.match(html,/sawt-carrier-svg/);
  assert.ok(html.includes("\n"),"Reading view must retain explicit line breaks");
});
test("Compact glyphs discard wide inspect-card padding but preserve vowel anchors",()=>{
  const plan=convertWord("voice");
  const large=wordSvg(plan);
  const small=compactWordSvg(plan);
  const matchLarge=/viewBox="0 0 ([0-9]+) 150"/.exec(large);
  const matchSmall=/viewBox="[0-9]+ 0 ([0-9]+) 150"/.exec(small);
  assert.ok(matchLarge&&matchSmall);
  assert.ok(+matchSmall[1]<+matchLarge[1], "Compact viewBox must be narrower");
  assert.match(small,/sawt-tone-aoi/);
  assert.match(small,/M-20 35L-8 13L4 35L16 13/);
});
test("Written-symbol comparison counts atomic consonants and vowel marks fairly",()=>{
  assert.deepEqual(compressionStats(convertText("VOICE")), {
    english:5,sawt:3,difference:2,percent:40
  });
  assert.deepEqual(compressionStats(convertText("BHARAT")), {
    english:6,sawt:4,difference:2,percent:33
  });
  const quoted=compressionStats(convertText('"Keep this unchanged"'));
  assert.equal(quoted.english,quoted.sawt);
  assert.deepEqual(compressionStats(convertText("")), {
    english:0,sawt:0,difference:0,percent:0
  });
});
test("Site opens in Reading view with Inspect available and editor-matched font size",async()=>{
  const {readFileSync}=await import("node:fs");
  const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
  const css=readFileSync(new URL("../styles-studio.css",import.meta.url),"utf8");
  assert.match(html,/id="reading-mode"/);
  assert.match(html,/id="inspect-mode"/);
  assert.match(html,/data-mode="reading"/);
  assert.match(html,/id="reading-source-text"/);
  assert.match(html,/id="compression-summary"/);
  assert.match(css,/--sawt-editor-font-size:19px/);
  assert.match(css,/--sawt-inline-glyph-height:50px/);
  assert.match(css,/sawt-compact-word-svg/);
});

test("Reading SVG export is a compact continuous paragraph rather than inspection cards",()=>{
  const tick=String.fromCharCode(96);
  const plans=convertText('VOICE and "Keep this" '+tick+'bold'+tick+' *[AOI] BHARAT.');
  const svg=exportReadingSvg(plans);
  assert.match(svg,/^<\?xml/);
  assert.match(svg,/M-20 35L-8 13L4 35L16 13/);
  assert.match(svg,/Keep this/);
  assert.match(svg,/font-weight="800"/);
  assert.match(svg,/sawt-leading-dot/);
  assert.ok(!svg.includes('font-size="14"'),"Reading export should not include inspector labels");
  assert.match(svg,/scale\(0\.3333333333333333\)/);
});

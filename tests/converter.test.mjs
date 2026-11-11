import test from "node:test";
import assert from "node:assert/strict";
import { LETTERS, VOWELS, GLYPHS, NOTEBOOK, STORIES } from "../js/sawt-data.js";
import { convertText, convertWord, qualityStats, teachingForm } from "../js/sawt-converter.js";
import { TONE_PATH, wordSvg, exportSentenceSvg, sentenceHTML } from "../js/sawt-render.js";

test("only the 13 confirmed source vowel labels appear",()=>{
  assert.deepEqual(VOWELS.map(x=>x.id),["AA","A","AE","E","I","EE","AI","AO","AU","OO","U","O","YU"]);
  assert.equal(VOWELS.length,13);
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

import { NOTEBOOK, LEXICON, ARPA_TO_TONE, CONSONANT_TO_UNIT, VOWEL_BY_ID } from "./sawt-data.js";

const VOWEL_PHONE = new Set(Object.keys(ARPA_TO_TONE));
const VOICED_TH = new Set(["the","this","these","those","that","them","they","their","there","then","than","though","thus","with","weather","other","another","mother","father","brother","together"]);
const TWO_CHAR = {
  bh:"B'", th:"T'", sh:"SH", ch:"CH", ph:"F", ng:"!", ck:"K", gh:"G",
  wh:"W", kh:"K", zh:"~"
};
const FALLBACK_VOWELS = {
  aa:["AA"], ee:["EE"], ea:["EE"], ie:["EE"],
  oo:["U"], ou:["AU"], ow:["AU"], au:["AO"], aw:["AO"],
  ai:["E"], ay:["E"], ey:["E"], oa:["O"], oe:["O"],
  oi:["AOI"], oy:["AOI"], ue:["OO"], iu:["YU"], iyu:["YU"],
  a:["AE"], e:["E"], i:["I"], o:["AO"], u:["A"], y:["AI"]
};
const LETTERS = /[a-z]/;
const IS_VOWEL=/[aeiouy]/;
const ARPA_VOWEL=/^[A-Z]+[012]?$/;

export const DEFAULT_OPTIONS = Object.freeze({
  leadingDot:false,
  mergeV:false,
  useModifiers:true
});

const copy = value => JSON.parse(JSON.stringify(value));
function cleanPhone(p) { return p.replace(/[0-2]$/,""); }
function isVowelPhone(p) { return VOWEL_PHONE.has(cleanPhone(p)); }
function unitForPhone(phone, options) {
  const output=CONSONANT_TO_UNIT[phone] || "";
  return options.mergeV && output === "V" ? "W" : output;
}
function toneForPhone(phone) {
  return ARPA_TO_TONE[cleanPhone(phone)] || null;
}
function normalize(value){return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z]/g,"").toLowerCase();}

function assembleFromPhones(original, phones, options) {
  const units=[], marks=[];
  let suffix="";
  const sequence=[...phones];
  const lower=normalize(original);
  if (options.useModifiers && /tion$/.test(lower) && sequence.slice(-3).map(cleanPhone).join("-")==="SH-AH-N") {
    sequence.splice(-3);
    suffix="#";
  }
  if (options.useModifiers && /ing$/.test(lower) && sequence.slice(-2).map(cleanPhone).join("-")==="IH-NG") {
    sequence.splice(-2);
    suffix="+";
  }
  let lastConsonant=-1;
  for (let i=0;i<sequence.length;i++){
    const phone=cleanPhone(sequence[i]);
    if (phone==="Y" && cleanPhone(sequence[i+1]||"")==="UW") {
      marks.push({tone:"YU",anchor:lastConsonant});
      i++;
      continue;
    }
    if (isVowelPhone(sequence[i])){
      const tones=toneForPhone(sequence[i]);
      for (const tone of (Array.isArray(tones) ? tones : [tones])) {
        // A is implicit within generated words; the standalone article A remains marked.
        // Source-confirmed examples such as AZAN are handled by NOTEBOOK first.
        if (tone === "A" && lower !== "a") continue;
        if (VOWEL_BY_ID[tone]) marks.push({tone,anchor:lastConsonant});
      }
      continue;
    }
    const unit=unitForPhone(phone,options);
    if (!unit) continue;
    // A phoneme is never split into a base letter and a detached apostrophe.
    units.push(unit);
    lastConsonant=units.length-1;
  }
  return {kind:"word",original,units,marks,suffix,status:"dictionary",note:"Pronunciation-based conversion from the built-in English word list."};
}
function applyOptions(plan,options) {
  if (!options.mergeV) return plan;
  return {...plan,units:plan.units.map(x=>x==="V"?"W":x)};
}

function parseFallback(original,options) {
  const word=normalize(original);
  const units=[],marks=[];
  let lastConsonant=-1;
  let i=0;
  function addUnit(value) {
    units.push(value==="V"&&options.mergeV?"W":value);
    lastConsonant=units.length-1;
  }
  while (i<word.length){
    const rest=word.slice(i);
    if (rest.startsWith("tion") && options.useModifiers && i>0 && i+4===word.length) {
      return {kind:"word",original,units,marks,suffix:"#",status:"estimated",note:"Spelling-based fallback. Check this word against your intended pronunciation."};
    }
    if (rest.startsWith("ing") && options.useModifiers && i>0 && i+3===word.length) {
      return {kind:"word",original,units,marks,suffix:"+",status:"estimated",note:"Spelling-based fallback. Check this word against your intended pronunciation."};
    }
    const pair=word.slice(i,i+2), ch=word[i];
    if (TWO_CHAR[pair]) {
      if (pair==="th" && VOICED_TH.has(word)) addUnit("D'");
      else addUnit(TWO_CHAR[pair]);
      i+=2;continue;
    }
    if (ch==="x") {addUnit("K");addUnit("S");i++;continue;}
    if (ch==="q") {addUnit("K");i++;continue;}
    if (ch==="c") {addUnit(/[eiy]/.test(word[i+1]||"")?"S":"K");i++;continue;}
    if (ch==="j") {addUnit("J");i++;continue;}
    if (ch==="v") {addUnit(options.mergeV?"W":"V");i++;continue;}
    if (ch==="w" && i===0 && word.startsWith("wr")) {i++;continue;}
    if (ch==="k" && i===0 && word.startsWith("kn")) {i++;continue;}
    if (IS_VOWEL.test(ch)) {
      let group=ch;
      if(word.slice(i,i+3)==="iyu") group="iyu";
      else if(FALLBACK_VOWELS[pair]) group=pair;
      if(ch==="e" && i===word.length-1 && word.length>2 && !IS_VOWEL.test(word[i-1])) {i++;continue;}
      let ids=FALLBACK_VOWELS[group]||["A"];
      if (group.length===1 && i+2===word.length && word[i+1]==="e") {
        ids=group==="i"?["AI"]:group==="o"?["O"]:group==="a"?["E"]:ids;
      }
      for(const tone of ids) {
        if (tone === "A" && word !== "a") continue;
        marks.push({tone,anchor:lastConsonant});
      }
      i+=group.length;continue;
    }
    if (LETTERS.test(ch)) {
      if (units[lastConsonant] !== ch.toUpperCase()) addUnit(ch.toUpperCase());
      i++;
      continue;
    }
    i++;
  }
  return {kind:"word",original,units,marks,suffix:"",status:"estimated",note:"Spelling-based fallback. Check this word against your intended pronunciation."};
}

function sanitizeCustom(plan, word) {
  if (!plan || !Array.isArray(plan.units) || !Array.isArray(plan.marks)) return null;
  const units=plan.units.map(x=>String(x)).filter(Boolean).slice(0,35);
  const marks=plan.marks.filter(x=>VOWEL_BY_ID[x.tone] && Number.isInteger(x.anchor) && x.anchor>=-1 && x.anchor<units.length).slice(0,25);
  if (!units.length && !marks.length) return null;
  return {kind:"word",original:word,units,marks,suffix:["","+","!","#"].includes(plan.suffix)?plan.suffix:"",status:"custom",note:"Your saved SAWT correction."};
}

export function convertWord(word,options=DEFAULT_OPTIONS,custom={}) {
  const key=normalize(word);
  const preferred=custom[key] && sanitizeCustom(custom[key],word);
  if (preferred) return applyOptions(preferred,options);
  if (key==="and") return {kind:"word",original:word,units:["∧"],marks:[],suffix:"",status:"confirmed",note:"Confirmed standalone SAWT word glyph."};
  if (key==="or") return {kind:"word",original:word,units:["∨"],marks:[],suffix:"",status:"confirmed",note:"Confirmed standalone SAWT word glyph."};
  if (NOTEBOOK[key]) {
    const plan=copy(NOTEBOOK[key]);
    return applyOptions({kind:"word",original:word,...plan,note:"Confirmed from your handwritten SAWT examples."},options);
  }
  if (LEXICON[key]) return assembleFromPhones(word,LEXICON[key],options);
  return parseFallback(word,options);
}

export function tokenize(text) {
  return String(text).match(/[A-Za-zÀ-ž]+(?:['’][A-Za-zÀ-ž]+)*|\d+(?:[.,]\d+)?|\s+|[^\s]/gu) || [];
}
export function convertText(text,options=DEFAULT_OPTIONS,custom={}) {
  return tokenize(text).map(part=>{
    if (/^[A-Za-zÀ-ž]/u.test(part)) return convertWord(part,options,custom);
    if (/^\s+$/.test(part)) return {kind:"space",original:part};
    return {kind:"punct",original:part};
  });
}
export function teachingForm(plan) {
  if(plan.kind!=="word") return plan.original;
  const marks=plan.marks||[];
  let result="";
  if(marks.some(x=>x.anchor===-1)) result+=marks.filter(x=>x.anchor===-1).map(x=>"["+x.tone+"]").join("");
  plan.units.forEach((unit,index)=>{
    result+=unit;
    result+=marks.filter(x=>x.anchor===index).map(x=>"["+x.tone+"]").join("");
  });
  return result+(plan.suffix||"");
}
export function qualityStats(plans) {
  const words=plans.filter(x=>x.kind==="word");
  return {
    total:words.length,
    confirmed:words.filter(x=>x.status==="confirmed").length,
    dictionary:words.filter(x=>x.status==="dictionary").length,
    estimated:words.filter(x=>x.status==="estimated").length,
    custom:words.filter(x=>x.status==="custom").length
  };
}

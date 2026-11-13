import { VOWELS, VOWEL_BY_ID, GLYPHS } from "./sawt-data.js";
import { teachingForm } from "./sawt-converter.js";

export function escapeHTML(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
const HOOK_C="M75 14 C64 12 49 14 37 22 C24 31 18 43 19 58 C20 71 28 80 41 84 C53 88 63 85 70 87 C80 91 83 103 81 116 C81 124 78 132 73 137";

// These are the user's 13 source marks, not a generalized IPA mark list.
// The short I diagonal has exactly half the line length of long EE.
const TONE_PATH={
  AA:'<path d="M0 6V36"/>',
  A:'<path d="M0 18V33"/>',
  AE:'<path d="M-14 35L0 13L14 35"/>',
  E:'<path d="M-12 12L12 34"/>',
  I:'<path d="M-5 122L5 115"/>',
  EE:'<path d="M-10 128L10 114"/>',
  AI:'<path d="M-14 35Q0 5 14 35"/>',
  AO:'<path d="M-14 12L0 35L14 12"/>',
  // AO + short I as ONE pen stroke: exact connected /\\/ zigzag.
  AOI:'<path d="M-20 35L-8 13L4 35L16 13"/>',
  AU:'<path d="M-14 12Q0 40 14 12"/>',
  OO:'<path d="M-17 24H17"/>',
  U:'<path d="M-9 24H9"/>',
  O:'<path d="M-11 34L11 14"/>',
  YU:'<circle cx="-9" cy="24" r="3.6"/><circle cx="9" cy="24" r="3.6"/>'
};
export { TONE_PATH };

function baseUnitMarkup(unit,x){
  const safe=escapeHTML(unit);
  if(unit==="SH"||unit==="CH"){
    const letter=unit==="SH"?"S":"C";
    return '<g class="sawt-hooked" aria-label="'+unit+'">' +
      '<text x="'+x+'" y="99" class="sawt-letter" text-anchor="middle">'+letter+'</text>'+
      '<path d="'+HOOK_C+'" transform="translate('+(x-21)+' 89) scale(.29)" class="sawt-hook" />'+
    '</g>';
  }
  // Apostrophes are part of the letter's own glyph: B', D', T'.
  const cls=unit==="~"?"sawt-special-letter":"sawt-letter";
  return '<text x="'+x+'" y="99" class="'+cls+'" text-anchor="middle">'+safe+'</text>';
}
function drawTone(mark,x,level){
  if(!VOWEL_BY_ID[mark.tone]||!TONE_PATH[mark.tone])return "";
  const stack=(level||0)*16;
  const dy=VOWEL_BY_ID[mark.tone].side==="above"?-stack:stack;
  return '<g transform="translate('+x+' '+dy+')" class="sawt-tone sawt-tone-'+mark.tone.toLowerCase()+'">'+TONE_PATH[mark.tone]+'</g>';
}
export function wordSvg(plan,{leadingDot=false}={}){
  if(plan.kind!=="word")return "";
  const hasInitial=plan.marks.some(mark=>mark.anchor===-1);
  const lead=hasInitial?58:0;
  const startX=40+lead;
  const letters=plan.units||[];
  const width=Math.max(100,startX+Math.max(0,letters.length-1)*58+50+(plan.suffix?44:0));
  const base=letters.map((unit,i)=>baseUnitMarkup(unit,startX+i*58)).join("");
  const grouped={};
  const marks=plan.marks.map(mark=>{
    const anchor=mark.anchor;
    const x=anchor===-1?startX-58:startX+Math.max(0,anchor)*58;
    const k=String(anchor);
    const level=grouped[k]||0;
    grouped[k]=level+1;
    return drawTone(mark,x,level);
  }).join("");
  const dot=leadingDot && hasInitial?'<circle class="sawt-leading-dot" cx="'+(startX-58)+'" cy="81" r="5.8"/>':'';
  const suffix=plan.suffix?'<text class="sawt-suffix" x="'+(startX+Math.max(0,letters.length-1)*58+41)+'" y="99" text-anchor="middle">'+escapeHTML(plan.suffix)+'</text>':'';
  return '<svg class="sawt-word-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+width+' 150" width="'+width+'" height="150" role="img" aria-label="'+escapeHTML(plan.original+" becomes "+teachingForm(plan))+'">'+base+dot+marks+suffix+'</svg>';
}

export function wordCard(plan,options){
  const status=plan.status||"estimated";
  const classes=status==="confirmed"?"confirmed":status==="dictionary"?"dictionary":status==="custom"?"custom":"estimated";
  const quality=classes==="confirmed"?"Source":classes==="dictionary"?"Pronunciation":classes==="custom"?"Saved correction":"Estimated";
  return '<div class="word-chip" data-quality="'+classes+'" title="'+escapeHTML(plan.note)+'">'+
    '<div class="word-drawing">'+wordSvg(plan,options)+'</div>'+
    '<div class="word-chip-foot"><span>'+escapeHTML(plan.original)+'</span><span class="word-quality '+classes+'">'+quality+'</span></div>'+
  '</div>';
}
export function sentenceHTML(plans,options){
  return plans.map(plan=>{
    if(plan.kind==="space"){
      if(/[\r\n]/.test(plan.original)) return '<div class="linebreak"></div>';
      return '<span class="sentence-gap" aria-hidden="true"></span>';
    }
    if(plan.kind==="punct")return '<span class="sentence-punct">'+escapeHTML(plan.original)+'</span>';
    return wordCard(plan,options);
  }).join("");
}
export function inventoryGlyph(unit){
  const p={kind:"word",original:unit,units:[unit],marks:[],suffix:""};
  if(unit==="!")p.units=["!"];
  return wordSvg(p);
}
export function toneSample(toneId,opts={}){
  return wordSvg({kind:"word",original:toneId,units:["R"],marks:[{tone:toneId,anchor:0}],suffix:""},opts);
}

const SVG_STYLE='<style>'+
'.sawt-letter{font-family:Inter,Arial,sans-serif;font-size:58px;font-weight:320;fill:#f6f5ff}'+
'.sawt-special-letter{font-family:Georgia,serif;font-size:57px;font-weight:600;fill:#d9b4ff}'+
'.sawt-hook{stroke:#f6f5ff;stroke-width:12;fill:none;stroke-linecap:round;stroke-linejoin:round}'+
'.sawt-tone{fill:none;stroke:#bd91ff;stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round}'+
'.sawt-tone-yu circle{fill:#bd91ff;stroke:none}'+
'.sawt-leading-dot{fill:#f6f5ff}'+
'.sawt-suffix{font-family:Inter,Arial,sans-serif;font-size:56px;fill:#d9b4ff}'+
'</style>';

export function exportSentenceSvg(plans,opts={}){
  let x=35,y=38;
  const maxWidth=1200,spaceWidth=20,rowHeight=178;
  let group="";
  for(const plan of plans){
    if(plan.kind==="space"){
      if(/[\r\n]/.test(plan.original)){x=35;y+=rowHeight;}
      else x+=spaceWidth;
      continue;
    }
    if(plan.kind==="punct"){
      if(x+30>maxWidth-35){x=35;y+=rowHeight;}
      group+='<text x="'+x+'" y="'+(y+99)+'" font-family="Inter,Arial,sans-serif" font-size="55" fill="#f8f5ff">'+escapeHTML(plan.original)+'</text>';
      x+=30;
      continue;
    }
    const svg=wordSvg(plan,opts);
    const w=Number((svg.match(/viewBox="0 0 ([0-9]+) 150"/)||[])[1]||100);
    if(x+w>maxWidth-35){x=35;y+=rowHeight;}
    const inner=svg.replace(/^.*?<svg[^>]*>/,"").replace(/<\/svg>$/,"");
    group+='<g transform="translate('+x+' '+y+')">'+inner+'</g>';
    group+='<text x="'+x+'" y="'+(y+139)+'" font-size="14" font-family="Arial,sans-serif" fill="#9e93b4">'+escapeHTML(plan.original)+'</text>';
    x+=w;
  }
  const height=y+200;
  return '<?xml version="1.0" encoding="UTF-8"?>'+
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+maxWidth+' '+height+'">'+
    '<rect width="100%" height="100%" fill="#0b0a16"/>'+SVG_STYLE+group+'</svg>';
}

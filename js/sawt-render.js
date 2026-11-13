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
  // An asterisk is the author's vowel carrier glyph, not an inked star.
  if(unit==="*")return '<circle class="sawt-leading-dot" cx="'+x+'" cy="81" r="6.2"/>';
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

// Reading mode is actual continuous script at editor-scale typography.
// Tight viewBoxes eliminate the whitespace from inspect cards. Consonant
// positions remain anchored to their own marks, including true initial vowels.
export function compactWordSvg(plan,{leadingDot=false}={}){
  if(plan.kind!=="word")return "";
  const units=plan.units||[];
  const hasInitial=(plan.marks||[]).some(m=>m.anchor===-1);
  let cursor=hasInitial?97:45;
  const positions=units.map(unit=>{
    const current=cursor;
    // Atomic apostrophe consonants need a little more horizontal room.
    cursor+=["B'","D'","T'"].includes(unit)?55:
      ["SH","CH"].includes(unit)?46:42;
    return current;
  });
  const leadX=hasInitial?(positions[0]??97)-51:null;
  const firstX=positions[0]??(leadX??45);
  const lastX=positions.at(-1)??firstX;
  const suffixX=plan.suffix?lastX+39:null;
  const left=Math.max(0,Math.floor((hasInitial?leadX:firstX)-26));
  const right=Math.max(
    lastX+(["B'","D'","T'"].includes(units.at(-1))?37:28),
    hasInitial?leadX+26:0,
    suffixX===null?0:suffixX+25
  );
  const width=Math.max(43,Math.ceil(right-left));
  const letters=units.map((unit,i)=>baseUnitMarkup(unit,positions[i])).join("");
  const groups={};
  const marks=(plan.marks||[]).map(mark=>{
    const idx=mark.anchor;
    const x=idx===-1?leadX:(positions[idx]??firstX);
    const key=String(idx);
    const level=groups[key]||0;
    groups[key]=level+1;
    return drawTone(mark,x,level);
  }).join("");
  const dot=leadingDot&&hasInitial?'<circle class="sawt-leading-dot" cx="'+leadX+'" cy="81" r="5.8"/>':'';
  const suffix=suffixX===null?"":'<text class="sawt-suffix" x="'+suffixX+'" y="99" text-anchor="middle">'+escapeHTML(plan.suffix)+'</text>';
  return '<svg class="sawt-word-svg sawt-compact-word-svg" xmlns="http://www.w3.org/2000/svg" '+
    'viewBox="'+left+' 0 '+width+' 150" width="'+width+'" height="150" role="img" aria-label="'+
    escapeHTML(plan.original+" becomes "+teachingForm(plan))+'">'+letters+dot+marks+suffix+'</svg>';
}

// An explicit * is always a visible, centered bullet, even when the
// optional automatic initial-dot display is disabled.
export function carrierSvg(plan){
  const tones=plan.tones||[];
  const marks=tones.map((tone,index)=>drawTone({tone},48,index)).join("");
  return '<svg class="sawt-word-svg sawt-carrier-svg" xmlns="http://www.w3.org/2000/svg" '+
    'viewBox="0 0 96 150" width="96" height="150" role="img" aria-label="'+
    escapeHTML("Vowel carrier dot"+(tones.length?" with "+tones.join(", ")+" tone":""))+'">'+
    '<circle class="sawt-leading-dot" cx="48" cy="81" r="6.2"/>'+marks+'</svg>';
}
function passthroughHTML(plan){
  const safe=escapeHTML(plan.text);
  if(plan.kind==="bold")return '<strong class="sawt-passthrough sawt-passthrough-bold" title="Preserved, highlighted text">'+safe+'</strong>';
  return '<span class="sawt-passthrough sawt-passthrough-literal" title="Preserved without conversion">'+safe+'</span>';
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
    if(plan.kind==="literal"||plan.kind==="bold")return passthroughHTML(plan);
    if(plan.kind==="carrier")return '<span class="sawt-carrier-chip">'+carrierSvg(plan)+'</span>';
    return wordCard(plan,options);
  }).join("");
}
// Inline, naturally wrapping text with a fixed font size matching the source
// editor. No chips, footnotes or per-word boxes interrupt the sentence.
export function readingSentenceHTML(plans,options={}){
  return plans.map(plan=>{
    if(plan.kind==="space")return escapeHTML(plan.original);
    if(plan.kind==="punct")return '<span class="sawt-reading-punct">'+escapeHTML(plan.original)+'</span>';
    if(plan.kind==="literal"||plan.kind==="bold")return passthroughHTML(plan);
    if(plan.kind==="carrier")return '<span class="sawt-reading-carrier">'+carrierSvg(plan)+'</span>';
    const quality=plan.status||"estimated";
    return '<button type="button" class="word-chip sawt-reading-word" data-quality="'+
      escapeHTML(quality)+'" title="'+escapeHTML(plan.original+": "+(plan.note||""))+'">'+
      compactWordSvg(plan,options)+'</button>';
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
    if(plan.kind==="literal"||plan.kind==="bold"){
      const text=plan.text;
      const isBold=plan.kind==="bold";
      // Keep spelling, case, punctuation and spacing intact in exported SVG.
      // Long fragments wrap visually, but copy/teaching notation is unchanged.
      const rows=text.split(/\r?\n/).flatMap(line=>{
        const segments=[];
        for(let i=0;i<line.length;i+=60)segments.push(line.slice(i,i+60));
        return segments.length?segments:[""];
      });
      const lines=rows.length?rows:[""];
      const blockWidth=Math.min(1100,Math.max(75,...lines.map(line=>line.length*17+26)));
      if(x+blockWidth>maxWidth-25){x=35;y+=rowHeight;}
      const h=lines.length*42+23;
      if(isBold)group+='<rect x="'+x+'" y="'+(y+56)+'" width="'+blockWidth+
        '" height="'+Math.max(55,h)+'" rx="12" fill="#273b48" stroke="#78dfe3" stroke-width="1.4"/>';
      lines.forEach((line,index)=>{
        group+='<text x="'+(x+12)+'" y="'+(y+97+index*41)+
          '" font-family="Inter,Arial,sans-serif" font-size="29" xml:space="preserve" '+
          'font-weight="'+(isBold?"800":"450")+'" fill="'+(isBold?"#fff2c0":"#f8f5ff")+'">'+
          escapeHTML(line)+'</text>';
      });
      x+=blockWidth+9;
      if(lines.length>2){y+=(lines.length-2)*42;}
      continue;
    }
    if(plan.kind==="carrier"){
      if(x+95>maxWidth-35){x=35;y+=rowHeight;}
      const fragment=carrierSvg(plan);
      const inner=fragment.replace(/^.*?<svg[^>]*>/,"").replace(/<\/svg>$/,"");
      group+='<g transform="translate('+x+' '+y+')">'+inner+'</g>';
      x+=96;continue;
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


// Export Reading view as an actual continuous paragraph (not the teaching
// cards). Words are drawn with compact consonant spacing at a shared 19px
// visual scale; line breaks and verbatim/marked text are retained.
export function exportReadingSvg(plans,opts={}){
  const pageWidth=1100,margin=30,lineHeight=65,scale=50/150;
  let x=margin,y=23;
  let shapes="";
  function nextLine(){x=margin;y+=lineHeight;}
  function ensureRoom(w){
    if(x+w>pageWidth-margin && x>margin)nextLine();
  }
  function writeText(value,bold=false){
    // Split only for visual wrapping, not for conversion or spelling changes.
    const pieces=String(value).split(/(\r\n|\r|\n|[ \t]+)/);
    for(const piece of pieces){
      if(!piece)continue;
      if(/[\r\n]/.test(piece)){nextLine();continue;}
      if(/^[ \t]+$/.test(piece)){x+=piece.length*6.5;continue;}
      const chars=Array.from(piece);
      for(let start=0;start<chars.length;){
        const room=Math.max(1,Math.floor((pageWidth-margin-x)/10.3));
        const chunk=chars.slice(start,start+room).join("");
        const w=chunk.length*10.3;
        if(x+w>pageWidth-margin && x>margin){nextLine();continue;}
        if(bold)shapes+='<rect x="'+(x-3)+'" y="'+(y+12)+'" width="'+(w+6)+
          '" height="35" rx="5" fill="#28485a"/>';
        shapes+='<text x="'+x+'" y="'+(y+36)+'" font-family="Inter,Arial,sans-serif" '+
          'font-size="19" font-weight="'+(bold?"800":"400")+'" xml:space="preserve" '+
          'fill="'+(bold?"#fff2c0":"#f8f5ff")+'">'+escapeHTML(chunk)+'</text>';
        x+=w;start+=chunk.length;
        if(start<chars.length)nextLine();
      }
    }
  }
  for(const part of plans){
    if(part.kind==="space"){writeText(part.original);continue;}
    if(part.kind==="punct"){writeText(part.original);continue;}
    if(part.kind==="literal"||part.kind==="bold"){writeText(part.text,part.kind==="bold");continue;}
    if(part.kind==="carrier"){
      const inner=carrierSvg(part).replace(/^.*?<svg[^>]*>/,"").replace(/<\/svg>$/,"");
      ensureRoom(96*scale);
      shapes+='<g transform="translate('+x+' '+y+') scale('+scale+')">'+inner+'</g>';
      x+=96*scale;continue;
    }
    const svg=compactWordSvg(part,opts);
    const match=/viewBox="([0-9]+) 0 ([0-9]+) 150"/.exec(svg);
    if(!match)continue;
    const left=Number(match[1]),width=Number(match[2]);
    const drawWidth=width*scale;
    ensureRoom(drawWidth);
    const inner=svg.replace(/^.*?<svg[^>]*>/,"").replace(/<\/svg>$/,"");
    shapes+='<g transform="translate('+(x-left*scale)+' '+y+') scale('+scale+')">'+inner+'</g>';
    x+=drawWidth;
  }
  const height=y+85;
  return '<?xml version="1.0" encoding="UTF-8"?>'+
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+pageWidth+' '+height+'">'+
    '<rect width="100%" height="100%" fill="#0b1015"/>'+SVG_STYLE+shapes+'</svg>';
}

import { LETTERS, GLYPHS, VOWELS, VOWEL_BY_ID, STORIES, NOTEBOOK } from "./sawt-data.js";
import { enableExtendedPronunciations } from "./sawt-pronunciation.js";
import { initVowelWaves } from "./sawt-waves.js";
import { convertText, convertWord, teachingForm, qualityStats, compressionStats, DEFAULT_OPTIONS } from "./sawt-converter.js";
import { escapeHTML, sentenceHTML, readingSentenceHTML, inventoryGlyph, toneSample, exportSentenceSvg, exportReadingSvg } from "./sawt-render.js";

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const KEY="sawt-converter-v1";
const VALID_UNITS=new Set([...LETTERS,"B'","D'","T'","SH","CH","~","!","∧","∨","*"]);
let currentPlans=[];
let activeWord="";
let custom={};
let options={...DEFAULT_OPTIONS};
let displayMode="reading";
let toastTimeout;

function notice(message) {
  const el=$("#toast");
  el.textContent=message;
  el.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>el.classList.remove("show"),2100);
}
function restore(){
  try {
    const state=JSON.parse(localStorage.getItem(KEY)||"{}");
    if(state.options && typeof state.options==="object") {
      options={...options,
        leadingDot:!!state.options.leadingDot,
        mergeV:!!state.options.mergeV
      };
    }
    if(state.custom && typeof state.custom==="object" && !Array.isArray(state.custom))custom=state.custom;
    displayMode=state.displayMode==="inspect"?"inspect":"reading";
  }catch{}
}
function persist(){
  try{localStorage.setItem(KEY,JSON.stringify({version:2,options,custom,displayMode}));}
  catch{notice("Browser storage is unavailable; corrections will last only this session.");}
}
function safeInput(){
  return $("#text-input").value.slice(0,3000);
}
function updateCount(){
  $("#input-length").textContent=safeInput().length;
}
function updateConverter(){
  updateCount();
  currentPlans=convertText(safeInput(),options,custom);
  const output=$("#sentence-output");
  const reading=displayMode==="reading";
  output.dataset.mode=displayMode;
  output.innerHTML=reading?readingSentenceHTML(currentPlans,options):sentenceHTML(currentPlans,options);
  $("#reading-source-row").hidden=!reading;
  $("#reading-output-label").hidden=!reading;
  $("#reading-source-text").textContent=safeInput();
  $("#reading-mode").classList.toggle("active",reading);
  $("#inspect-mode").classList.toggle("active",!reading);
  $("#reading-mode").setAttribute("aria-pressed",String(reading));
  $("#inspect-mode").setAttribute("aria-pressed",String(!reading));
  const symbolStats=compressionStats(currentPlans);
  $("#source-symbols").textContent=symbolStats.english;
  $("#sawt-symbols").textContent=symbolStats.sawt;
  $("#compression-summary").textContent=symbolStats.english===0?"—":symbolStats.difference>=0?
    symbolStats.percent+"% fewer written symbols":Math.abs(symbolStats.percent)+"% more written symbols";
  const wordItems=currentPlans.filter(x=>x.kind==="word");
  $$(".word-chip",output).forEach((chip,i)=>{
    chip.setAttribute("role","button");
    chip.setAttribute("tabindex","0");
    chip.setAttribute("aria-label","Inspect "+wordItems[i].original+" SAWT form");
  });
  $("#teaching-output").textContent=currentPlans.map(teachingForm).join("");
  const stats=qualityStats(currentPlans);
  $("#stat-total").textContent=stats.total;
  $("#stat-confirmed").textContent=stats.confirmed;
  $("#stat-dictionary").textContent=stats.dictionary;
  $("#stat-estimated").textContent=stats.estimated;
  $("#stat-custom").textContent=stats.custom;
}
function download(filename,content,mime){
  const objectURL=URL.createObjectURL(new Blob([content],{type:mime}));
  const anchor=document.createElement("a");
  anchor.href=objectURL;anchor.download=filename;document.body.appendChild(anchor);
  anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(objectURL),1500);
}
function renderInventory(){
  $("#letter-grid").innerHTML=LETTERS.map(ch=>'<span class="letter-tile">'+escapeHTML(ch)+'</span>').join("");
  $("#special-grid").innerHTML=GLYPHS.map(g=>{
    const unit=g.id==="BH"?"B'":g.id==="DH"?"D'":g.id==="TH"?"T'":
      g.id==="SH"?"SH":g.id==="CH"?"CH":g.written;
    return '<article class="special-tile"><div class="special-glyph">'+inventoryGlyph(unit)+'</div>'+
      '<div class="special-meta"><strong>'+escapeHTML(g.title)+'</strong>'+
      '<small>'+escapeHTML(g.written)+' · '+escapeHTML(g.example)+'</small></div></article>';
  }).join("");
  $("#vowel-grid").innerHTML=VOWELS.map(v=>{
    return '<article class="vowel-tile"><b>'+escapeHTML(v.id)+'</b>'+
      toneSample(v.id)+'<small>'+escapeHTML(v.cue)+'</small></article>';
  }).join("");
}
function renderStories(){
  const icons=["♧","◈","☼","✦"];
  $("#story-grid").innerHTML=STORIES.map((s,i)=>
    '<article class="story-card">'+
      '<div class="story-card-head"><span class="story-icon">'+icons[i%icons.length]+'</span><span class="story-tag">'+escapeHTML(s.tag)+'</span></div>'+
      '<h3>'+escapeHTML(s.title)+'</h3><p>'+escapeHTML(s.text)+'</p>'+ '<div class="story-sawt"><span>SAWT PRACTICE NOTATION · UNVERIFIED WORDS MAY BE ESTIMATED</span><code>'+escapeHTML(convertText(s.text,options,custom).map(teachingForm).join(""))+'</code></div>'+
      '<div class="story-footer"><small>'+convertText(s.text,options,custom).filter(x=>x.kind==="word").length+' words to practice</small>'+
      '<button class="story-load" data-story="'+escapeHTML(s.id)+'" type="button">Read in SAWT ↗</button></div>'+
    '</article>'
  ).join("");
}

function openWord(word){
  if(!word)return;
  activeWord=word.original.toLowerCase().replace(/[^a-z]/g,"");
  if(!activeWord)return;
  $("#edit-title").textContent="Edit "+word.original;
  $("#edit-context").textContent=word.note+" This correction applies locally whenever you convert this word.";
  $("#edit-units").value=word.units.join(",");
  $("#edit-marks").value=word.marks.map(mark=>mark.tone+"@"+(mark.anchor===-1?"start":String(mark.anchor+1))).join(", ");
  $("#edit-suffix").value=word.suffix||"";
  $("#edit-error").hidden=true;
  $("#edit-dialog").showModal();
}
function getEditedPlan(){
  const units=$("#edit-units").value.split(",").map(s=>s.trim().toUpperCase()).filter(Boolean);
  if(units.length>35 || (!units.length && !$("#edit-marks").value.trim()))throw new Error("Add at least one valid glyph or vowel mark.");
  for(const unit of units)if(!VALID_UNITS.has(unit))throw new Error("Unrecognized glyph '"+unit+"'. Use only the confirmed inventory.");
  const marksText=$("#edit-marks").value.trim();
  const marks=[];
  if(marksText){
    for(const token of marksText.split(",").map(x=>x.trim()).filter(Boolean)){
      const match=/^([A-Z]{1,2})@(start|[1-9][0-9]*)$/i.exec(token);
      if(!match)throw new Error("Use vowel entries like AA@1 or A@start.");
      const tone=match[1].toUpperCase();
      if(!VOWEL_BY_ID[tone])throw new Error("Unknown vowel mark '"+tone+"'.");
      const anchor=match[2].toLowerCase()==="start"?-1:Number(match[2])-1;
      if(anchor>=units.length)throw new Error("Tone position "+match[2]+" is outside the glyph sequence.");
      marks.push({tone,anchor});
    }
  }
  if(marks.length>25)throw new Error("Too many marks for one word.");
  return {units,marks,suffix:$("#edit-suffix").value};
}
function saveWord(){
  try{
    custom[activeWord]=getEditedPlan();
    persist();
    $("#edit-dialog").close();
    updateConverter();
    renderStories();
    notice("Saved your SAWT correction locally.");
  }catch(error){
    $("#edit-error").textContent=error.message;
    $("#edit-error").hidden=false;
  }
}

function setupConverter(){
  const input=$("#text-input");
  $("#show-dot").checked=options.leadingDot;
  $("#merge-v").checked=options.mergeV;
  let debounce;
  input.addEventListener("input",()=>{
    updateCount();clearTimeout(debounce);
    debounce=setTimeout(updateConverter,180);
  });
  input.addEventListener("keydown",event=>{
    if(event.key==="Enter" && (event.ctrlKey||event.metaKey)){event.preventDefault();updateConverter();notice("Sentence converted.");}
  });
  $("#convert-button").addEventListener("click",()=>{updateConverter();notice("Sentence converted.");});
  $("#clear-button").addEventListener("click",()=>{input.value="";updateConverter();input.focus();});
  $("#reading-mode").addEventListener("click",()=>{displayMode="reading";persist();updateConverter();});
  $("#inspect-mode").addEventListener("click",()=>{displayMode="inspect";persist();updateConverter();});
  $("#show-dot").addEventListener("change",event=>{
    options.leadingDot=event.target.checked;persist();updateConverter();
  });
  $("#merge-v").addEventListener("change",event=>{
    options.mergeV=event.target.checked;persist();updateConverter();renderStories();
  });
  $("#copy-notation").addEventListener("click",async()=>{
    const text=$("#teaching-output").textContent;
    if(!text){notice("Nothing to copy.");return;}
    try{await navigator.clipboard.writeText(text);notice("Teaching notation copied.");}
    catch{notice("Clipboard not available in this browser.");}
  });
  $("#export-svg").addEventListener("click",()=>{
    if(!currentPlans.some(x=>["word","literal","bold","carrier"].includes(x.kind))){notice("Type something to export first.");return;}
    download(displayMode==="reading"?"sawt-reading.svg":"sawt-sentence.svg",
      displayMode==="reading"?exportReadingSvg(currentPlans,options):exportSentenceSvg(currentPlans,options),
      "image/svg+xml");
    notice("SAWT sentence SVG exported.");
  });
  $("#sentence-output").addEventListener("click",event=>{
    const chip=event.target.closest(".word-chip");
    if(!chip)return;
    const items=currentPlans.filter(x=>x.kind==="word");
    const index=$$(".word-chip",$("#sentence-output")).indexOf(chip);
    openWord(items[index]);
  });
  $("#sentence-output").addEventListener("keydown",event=>{
    if(event.key!=="Enter" && event.key!==" ")return;
    const chip=event.target.closest(".word-chip");
    if(!chip)return;
    if(chip.tagName==="BUTTON")return; // native button already handles Enter/Space
    event.preventDefault();chip.click();
  });
  updateConverter();
}
function setupEditor(){
  $("#save-word").addEventListener("click",saveWord);
  $("#close-edit").addEventListener("click",()=>$("#edit-dialog").close());
  $("#reset-word").addEventListener("click",()=>{
    if(Object.hasOwn(custom,activeWord)){
      delete custom[activeWord];
      persist();$("#edit-dialog").close();updateConverter();renderStories();
      notice("Restored default conversion for this word.");
    } else {
      $("#edit-dialog").close();notice("No saved correction for this word.");
    }
  });
  $("#edit-form").addEventListener("submit",event=>{event.preventDefault();saveWord();});
}
function setupStories(){
  $("#story-grid").addEventListener("click",event=>{
    const button=event.target.closest("[data-story]");
    if(!button)return;
    const story=STORIES.find(s=>s.id===button.dataset.story);
    if(!story)return;
    $("#text-input").value=story.text;
    updateConverter();
    document.getElementById("converter").scrollIntoView({behavior:"smooth",block:"start"});
    notice("Story loaded. Click any word to inspect it.");
  });
}
function setupMobileNav(){
  $("#mobile-menu-button").addEventListener("click",()=>{
    const open=$("#mobile-nav").hidden;
    $("#mobile-nav").hidden=!open;
    $("#mobile-menu-button").setAttribute("aria-expanded",String(open));
  });
  $$("#mobile-nav a").forEach(link=>link.addEventListener("click",()=>{
    $("#mobile-nav").hidden=true;$("#mobile-menu-button").setAttribute("aria-expanded","false");
  }));
}
function setupGallery(){
  const dialog=$("#image-dialog");
  $$("[data-image]").forEach(button=>button.addEventListener("click",()=>{
    $("#dialog-image").src=button.dataset.image;dialog.showModal();
  }));
  $("#close-image").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
}
function init(){
  restore();
  renderInventory();
  renderStories();
  setupConverter();
  setupEditor();
  setupStories();
  setupMobileNav();
  setupGallery();
  initVowelWaves();
  const status=$(".output-status");
  status.textContent="CORE READY";
  enableExtendedPronunciations().then(count=>{
    status.textContent=count?"DICTIONARY READY":"CORE READY";
    updateConverter();renderStories();
  }).catch(()=>{status.textContent="OFFLINE READY";});
}
init();

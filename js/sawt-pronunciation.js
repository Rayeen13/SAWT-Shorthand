// Optional pronunciation data upgrade. Only public dictionary text is fetched;
// the user's sentences and local corrections NEVER leave the browser.
// CMU Pronouncing Dictionary © Carnegie Mellon University, BSD-style license.
// Source: https://github.com/cmusphinx/cmudict
import { LEXICON, ARPA_TO_TONE, CONSONANT_TO_UNIT } from "./sawt-data.js";

const URLS=[
  "https://cdn.jsdelivr.net/gh/cmusphinx/cmudict@master/cmudict.dict",
  "https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict"
];
const ALLOWED=new Set([...Object.keys(ARPA_TO_TONE),...Object.keys(CONSONANT_TO_UNIT)]);
let pending=null;
function parseDictionary(text) {
  let added=0;
  for(const line of text.split(/\r?\n/)){
    if(!line || line.startsWith(";") || line.startsWith("#"))continue;
    const fields=line.trim().split(/\s+/);
    if(fields.length<2)continue;
    const key=fields.shift().toLowerCase().replace(/\(\d+\)$/,"");
    if(!/^[a-z']+$/.test(key) || LEXICON[key])continue;
    if(!fields.every(phone=>ALLOWED.has(phone.replace(/[012]$/,""))))continue;
    LEXICON[key]=fields;
    added++;
  }
  return added;
}

export function enableExtendedPronunciations() {
  if(pending)return pending;
  pending=(async()=>{
    let previousError=null;
    for(const url of URLS){
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),15000);
      try{
        const response=await fetch(url,{signal:controller.signal,cache:"force-cache",mode:"cors"});
        if(!response.ok)throw new Error("HTTP "+response.status);
        const text=await response.text();
        clearTimeout(timer);
        return parseDictionary(text);
      }catch(error){
        previousError=error;
        clearTimeout(timer);
      }
    }
    throw previousError||new Error("Dictionary unavailable");
  })();
  return pending;
}

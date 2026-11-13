// Decorative vowel wave studies for the original SAWT graph window.
// These are deliberately illustrative synthesized sine curves, not recorded speech.
const SHAPES={
  AA:{label:"AA",word:"FATHER",periods:3.7,harmonic:0.23,phase:0.25},
  EE:{label:"EE",word:"SEED",periods:7.6,harmonic:0.32,phase:0},
  AO:{label:"AO",word:"DOG",periods:4.3,harmonic:0.43,phase:0.4},
  AU:{label:"AU",word:"MOUSE",periods:5.2,harmonic:0.18,phase:0.7},
  AOI:{label:"AOI",word:"VOICE",periods:6.2,harmonic:0.37,phase:0.1}
};
export const WAVE_TYPES=Object.keys(SHAPES);
function path({periods,harmonic,phase},centerY,amplitude) {
  const left=45,right=675,length=right-left;
  const points=[];
  for(let x=left;x<=right;x+=3){
    const t=(x-left)/length;
    const envelope=Math.pow(Math.sin(Math.PI*t),.38);
    const theta=(Math.PI*2)*(periods*t+phase);
    const y=centerY-amplitude*envelope*(Math.sin(theta)+(harmonic*Math.sin(theta*2+0.9)));
    points.push((points.length?"L":"M")+x.toFixed(1)+" "+y.toFixed(2));
  }
  return points.join("");
}
export function initVowelWaves(root=document) {
  const main=root.querySelector("#wave-main");
  if(!main)return;
  const comparisonA=root.querySelector("#wave-context-a");
  const comparisonB=root.querySelector("#wave-context-b");
  const label=root.querySelector("#wave-active-tone");
  const example=root.querySelector("#wave-active-word");
  const buttons=[...root.querySelectorAll("[data-vowel-wave]")];
  if(comparisonA) comparisonA.setAttribute("d",path(SHAPES.AA,206,49));
  if(comparisonB) comparisonB.setAttribute("d",path(SHAPES.EE,206,39));
  function setTone(id){
    const next=SHAPES[id]||SHAPES.AOI;
    main.setAttribute("d",path(next,206,65));
    if(label) label.textContent=next.label;
    if(example) example.textContent=next.word;
    buttons.forEach(button=>{
      const selected=button.dataset.vowelWave===id;
      button.classList.toggle("selected",selected);
      button.setAttribute("aria-selected",String(selected));
      button.tabIndex=selected?0:-1;
    });
  }
  buttons.forEach((button,index)=>{
    button.addEventListener("click",()=>setTone(button.dataset.vowelWave));
    button.addEventListener("keydown",event=>{
      if(!["ArrowRight","ArrowLeft","Home","End"].includes(event.key))return;
      event.preventDefault();
      const next=event.key==="Home"?0:event.key==="End"?buttons.length-1:
        (index+(event.key==="ArrowRight"?1:-1)+buttons.length)%buttons.length;
      buttons[next].focus();setTone(buttons[next].dataset.vowelWave);
    });
  });
  setTone("AOI");
}

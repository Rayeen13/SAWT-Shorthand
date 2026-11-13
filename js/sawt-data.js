// SAWT 1.1 — source-aligned definitions. Keep the inventory compact.
// Marks are directly transcribed from the user's handwritten reference.
// Apostrophes are part of consonant glyphs: B', D', T' (never standalone tokens).

export const LETTERS = "ABDEFGHIJKLMNOPRSTUVWXYZ".split("");
export const VOWELS = [
  {id:"AA", name:"AA", cue:"father / Bharat", shape:"vertical", side:"above", sound:"ɑː"},
  {id:"A",  name:"A", cue:"Azan / a", shape:"shortvertical", side:"above", sound:"ə, a"},
  {id:"AE", name:"AE", cue:"cat", shape:"caret", side:"above", sound:"æ"},
  {id:"E",  name:"E", cue:"elephant", shape:"grave", side:"above", sound:"e, ɛ"},
  {id:"I",  name:"I", cue:"sit", shape:"shortacute", side:"below", sound:"ɪ"},
  {id:"EE", name:"EE", cue:"seed", shape:"acute", side:"below", sound:"iː"},
  {id:"AI", name:"AI", cue:"mine", shape:"arch", side:"above", sound:"aɪ"},
  {id:"AO", name:"AO", cue:"dog", shape:"vee", side:"above", sound:"ɔ, ɒ"},
  {id:"AU", name:"AU", cue:"mouse", shape:"cup", side:"above", sound:"aʊ"},
  {id:"OO", name:"OO", cue:"food", shape:"macron", side:"above", sound:"uː"},
  {id:"U",  name:"U", cue:"foot, book", shape:"shortdash", side:"above", sound:"ʊ"},
  {id:"O",  name:"O", cue:"oat, boat", shape:"slashup", side:"above", sound:"oʊ"},
  {id:"AOI", name:"AOI", cue:"voice, boy, choice", shape:"zigzag", side:"above", sound:"ɔɪ"},
  {id:"YU", name:"YU", cue:"new, huge", shape:"twodots", side:"above", sound:"juː"}
];
export const VOWEL_BY_ID=Object.fromEntries(VOWELS.map(x=>[x.id,x]));

export const GLYPHS=[
  {id:"BH", written:"B'", title:"BH", example:"Bharat", type:"aspirated"},
  {id:"DH", written:"D'", title:"voiced TH", example:"this, these", type:"joined"},
  {id:"TH", written:"T'", title:"unvoiced TH", example:"thick", type:"joined"},
  {id:"SH", written:"Sᶜ", title:"SH", example:"shock", type:"hooked"},
  {id:"CH", written:"Cᶜ", title:"CH", example:"chalk", type:"hooked"},
  {id:"ZH", written:"~", title:"ZH", example:"vision, measure", type:"special"},
  {id:"CARRIER", written:"*", title:"Vowel carrier", example:"*[AO] → bullet + AO tone", type:"carrier"},
  {id:"NG", written:"!", title:"NG", example:"sing", type:"suffix"},
  {id:"ING", written:"+", title:"-ING", example:"trying", type:"suffix"},
  {id:"TION", written:"#", title:"-TION", example:"direction", type:"suffix"},
  {id:"AND", written:"∧", title:"AND", example:"and", type:"word"},
  {id:"OR", written:"∨", title:"OR", example:"or", type:"word"}
];
// -MENT and -LY have NOT been approved. Do not invent their glyphs.
export const RULES={
  initialDotOptional:true,
  apostropheIsPartOfLetter:true,
  optionalWForV:true,
  useOnlyConfirmedMarks:true
};

// Words explicitly demonstrated / approved in the source and conversation.
// Units are atomic glyphs; the tone anchor is a unit index, or -1 for a
// word-initial vowel floating to the left of the first consonant.
export const NOTEBOOK={
  voice:{units:["V","S"],marks:[{tone:"AOI",anchor:0}],status:"confirmed"},
  azan:{units:["Z","N"],marks:[{tone:"A",anchor:-1},{tone:"AA",anchor:0}],status:"confirmed"},
  oat:{units:["T"],marks:[{tone:"O",anchor:-1}],status:"confirmed"},
  bharat:{units:["B'","R","T"],marks:[{tone:"AA",anchor:0}],status:"confirmed"},
  cat:{units:["K","T"],marks:[{tone:"AE",anchor:0}],status:"confirmed"},
  dog:{units:["D","G"],marks:[{tone:"AO",anchor:0}],status:"confirmed"},
  foot:{units:["F","T"],marks:[{tone:"U",anchor:0}],status:"confirmed"},
  food:{units:["F","D"],marks:[{tone:"OO",anchor:0}],status:"confirmed"},
  book:{units:["B","K"],marks:[{tone:"U",anchor:0}],status:"confirmed"},
  sit:{units:["S","T"],marks:[{tone:"I",anchor:0}],status:"confirmed"},
  seed:{units:["S","D"],marks:[{tone:"EE",anchor:0}],status:"confirmed"},
  mine:{units:["M","N"],marks:[{tone:"AI",anchor:0}],status:"confirmed"},
  mouse:{units:["M","Z"],marks:[{tone:"AU",anchor:0}],status:"confirmed"},
  new:{units:["N"],marks:[{tone:"YU",anchor:0}],status:"confirmed"},
  huge:{units:["H","J"],marks:[{tone:"YU",anchor:0}],status:"confirmed"},
  thick:{units:["T'","K"],marks:[{tone:"I",anchor:0}],status:"confirmed"},
  shock:{units:["SH","K"],marks:[{tone:"AO",anchor:0}],status:"confirmed"},
  chalk:{units:["CH","K"],marks:[{tone:"AO",anchor:0}],status:"confirmed"},
  tray:{units:["T","R"],marks:[{tone:"E",anchor:1}],status:"confirmed"},
  try:{units:["T","R"],marks:[{tone:"AI",anchor:1}],status:"confirmed"},
  trying:{units:["T","R"],marks:[{tone:"AI",anchor:1}],suffix:"+",status:"confirmed"}
};

export const STORIES=[
  {id:"forest",title:"The quiet forest",tag:"Everyday English",text:"The cat sat by the door. The dog ran to the yard. A little bird sang in the tree."},
  {id:"bharat",title:"Voices of Bharat",tag:"Names and non-English sounds",text:"Bharat has many voices. A child writes a new story. Every word has a sound."},
  {id:"morning",title:"A peaceful morning",tag:"Opening vowels",text:"Azan was heard at dawn. The world became calm. A small boat moved over the river."},
  {id:"learning",title:"Learning SAWT",tag:"Practice paragraph",text:"She saw a bright light. Then she tried to write a short story. The new words were easy to learn."}
];

// Small built-in pronunciation lexicon. Unknown words are *not* claimed as
// correct: converter uses labelled grapheme fallback.
// ARPABET stress digits from an English pronunciation lexicon, with
// hand-confirmed SAWT spellings winning above any dictionary result.
const WORDS=`
voice|V OY1 S
boy|B OY1
joy|JH OY1
coin|K OY1 N
noise|N OY1 Z
choice|CH OY1 S
the|DH AH0
cat|K AE1 T
sat|S AE1 T
by|B AY1
door|D AO1 R
dog|D AO1 G
ran|R AE1 N
to|T UW1
yard|Y AA1 R D
has|HH AE1 Z
many|M EH1 N IY0
voices|V OY1 S AH0 Z
a|AH0
child|CH AY1 L D
writes|R AY1 T S
new|N UW1
story|S T AO1 R IY0
was|W AA1 Z
heard|HH ER1 D
at|AE1 T
dawn|D AO1 N
world|W ER1 L D
became|B IH0 K EY1 M
calm|K AA1 M
small|S M AO1 L
boat|B OW1 T
moved|M UW1 V D
over|OW1 V ER0
river|R IH1 V ER0
air|EH1 R
cool|K UW1 L
she|SH IY1
saw|S AO1
bright|B R AY1 T
light|L AY1 T
then|DH EH1 N
tried|T R AY1 D
write|R AY1 T
and|AH0 N D
or|AO1 R
is|IH1 Z
this|DH IH1 S
these|DH IY1 Z
thick|TH IH1 K
shock|SH AA1 K
chalk|CH AA1 K
trying|T R AY1 IH0 NG
tray|T R EY1
try|T R AY1
direction|D ER0 EH1 K SH AH0 N
office|AO1 F IH0 S
oat|OW1 T
mouse|M AW1 S
huge|HH Y UW1 JH
food|F UW1 D
foot|F UH1 T
seed|S IY1 D
book|B UH1 K
love|L AH1 V
very|V EH1 R IY0
van|V AE1 N
wan|W AA1 N
vision|V IH1 ZH AH0 N
measure|M EH1 ZH ER0
it|IH1 T
one|W AH1 N
sun|S AH1 N
on|AA1 N
long|L AO1 NG
day|D EY1
her|HH ER1
friend|F R EH1 N D
beautiful|B Y UW1 T AH0 F AH0 L
people|P IY1 P AH0 L
with|W IH1 DH
gentle|JH EH1 N T AH0 L
hands|HH AE1 N D Z
sound|S AW1 N D
aligned|AH0 L AY1 N D
technique|T EH0 K N IY1 K
use|Y UW1 S
in|IH0 N
english|IH1 NG G L IH0 SH
be|B IY1
we|W IY1
they|DH EY1
are|AA1 R
your|Y AO1 R
our|AW1 ER0
learn|L ER1 N
fast|F AE1 S T
short|SH AO1 R T
language|L AE1 NG G W AH0 JH
words|W ER1 D Z
when|W EH1 N
every|EH1 V ER0 IY0
vowel|V AW1 AH0 L
needs|N IY1 D Z
mark|M AA1 R K
first|F ER1 S T
nation|N EY1 SH AH0 N
morning|M AO1 R N IH0 NG
singing|S IH1 NG IH0 NG
king|K IH1 NG
sing|S IH1 NG
walking|W AO1 K IH0 NG
playing|P L EY1 IH0 NG
thinking|TH IH1 NG K IH0 NG
reading|R IY1 D IH0 NG
water|W AO1 T ER0
rain|R EY1 N
come|K AH1 M
came|K EY1 M
went|W EH1 N T
home|HH OW1 M
school|S K UW1 L
once|W AH1 N S
upon|AH0 P AA1 N
time|T AY1 M
little|L IH1 T AH0 L
boy|B OY1
girl|G ER1 L
tree|T R IY1
bird|B ER1 D
forest|F AO1 R AH0 S T
sky|S K AY1
wind|W AY1 N D
fire|F AY1 ER0
traveler|T R AE1 V AH0 L ER0
found|F AW1 N D
path|P AE1 TH
knew|N UW1
name|N EY1 M
happy|HH AE1 P IY0
looked|L UH1 K T
around|ER0 AW1 N D
said|S EH1 D
i|AY1
you|Y UW1
he|HH IY1
will|W IH1 L
can|K AE1 N
do|D UW1
not|N AA1 T
what|W AH1 T
where|W EH1 R
who|HH UW1
why|W AY1
how|HH AW1
near|N IH1 R
far|F AA1 R
good|G UH1 D
quiet|K W AY1 AH0 T
today|T AH0 D EY1
tomorrow|T AH0 M AA1 R OW2
speak|S P IY1 K
same|S EY1 M
life|L AY1 F
made|M EY1 D
work|W ER1 K
together|T AH0 G EH1 DH ER0
alphabet|AE1 L F AH0 B EH2 T
letters|L EH1 T ER0 Z
voice|V OY1 S
sounds|S AW1 N D Z
matter|M AE1 T ER0
from|F R AH1 M
source|S AO1 R S
notes|N OW1 T S
sentence|S EH1 N T AH0 N S
converter|K AH0 N V ER1 T ER0
history|HH IH1 S T ER0 IY0
tells|T EH1 L Z
stories|S T AO1 R IY0 Z
now|N AW1
after|AE1 F T ER0
before|B IH0 F AO1 R
old|OW1 L D
easy|IY1 Z IY0
were|W ER1
sang|S AE1 NG
rich|R IH1 CH
goodbye|G UH2 D B AY1
writing|R AY1 T IH0 NG
reading|R IY1 D IH0 NG
we|W IY1
them|DH EH1 M
tell|T EH1 L
think|TH IH1 NG K
what|W AH1 T
some|S AH1 M
different|D IH1 F ER0 AH0 N T
help|HH EH1 L P
practice|P R AE1 K T IH0 S
voice|V OY1 S
`;

export const LEXICON=Object.fromEntries(WORDS.trim().split("\n").map(line=>{
  const [word,phones]=line.trim().split("|");
  return [word,phones.split(" ")];
}));

// Tone mapping is intentionally constrained to the 13 confirmed labels.
export const ARPA_TO_TONE={
  AA:"AA",AE:"AE",AH:"A",AO:"AO",AW:"AU",AY:"AI",
  EH:"E",ER:"A",EY:"E",IH:"I",IY:"EE",
  OW:"O",OY:"AOI",UH:"U",UW:"OO"
};
export const CONSONANT_TO_UNIT={
  B:"B",CH:"CH",D:"D",DH:"D'",F:"F",G:"G",HH:"H",JH:"J",
  K:"K",L:"L",M:"M",N:"N",NG:"!",P:"P",R:"R",S:"S",
  SH:"SH",T:"T",TH:"T'",V:"V",W:"W",Y:"Y",Z:"Z",ZH:"~"
};

export interface AnalysisResult {
  disease: string;
  cause: string;
  precautions: string;
}

interface ConditionDefinition {
  name: string;
  // Highly distinctive – must-have markers (worth 4 pts each)
  pathognomonicKeywords: string[];
  // High-weight: strongly distinctive (3 pts each)
  primaryKeywords: string[];
  // Medium-weight: common but shared (1 pt each)
  secondaryKeywords: string[];
  // Negative signals: reduce this condition's score
  negativeKeywords?: string[];
  // Symptom clusters: bonus if MULTIPLE symptoms from a group co-occur
  clusters?: string[][];
  cause: string;
  precautions: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNONYM MAP  –  colloquial / layperson → medical equivalents
// Covers child-level, rural, regional, and very informal descriptions
// ─────────────────────────────────────────────────────────────────────────────
const SYNONYM_MAP: Record<string, string> = {
  // ── BREATHING ────────────────────────────────────────────────────────────
  "can't breathe": "difficulty breathing",
  "cannot breathe": "difficulty breathing",
  "hard to breathe": "difficulty breathing",
  "struggling to breathe": "difficulty breathing",
  "trouble breathing": "difficulty breathing",
  "breathing problem": "difficulty breathing",
  "breathing difficulty": "difficulty breathing",
  "breathing issues": "difficulty breathing",
  "not able to breathe": "difficulty breathing",
  "breathing is hard": "difficulty breathing",
  "air is not going in": "difficulty breathing",
  "not getting air": "difficulty breathing",
  "lungs feel blocked": "difficulty breathing",
  "feel suffocated": "difficulty breathing",
  suffocating: "difficulty breathing",
  "short of breath": "shortness of breath",
  "out of breath": "shortness of breath",
  breathless: "shortness of breath",
  "no breath": "shortness of breath",
  "breath difficulty": "difficulty breathing",
  "getting breathless": "shortness of breath",
  "feel breathless": "shortness of breath",
  weezing: "wheezing",
  whezing: "wheezing",
  "squeaky breathing": "wheezing",
  "whistling breath": "wheezing",
  "noisy breathing": "wheezing",
  "breathing with sound": "wheezing",
  "sound when breathing": "wheezing",
  "chest makes noise": "wheezing",
  "chest tight": "chest tightness",
  "tight chest": "chest tightness",
  "chest feels tight": "chest tightness",
  "heaviness in chest": "chest tightness",
  "chest heaviness": "chest tightness",
  "pressure in chest": "chest tightness",
  "weight on chest": "chest tightness",
  "something heavy on chest": "chest tightness",
  "chest feels heavy": "chest tightness",
  "chest is heavy": "chest tightness",

  // ── SKIN ─────────────────────────────────────────────────────────────────
  bumps: "skin bumps",
  "watery bumps": "fluid filled blisters",
  "watery balls": "fluid filled blisters",
  "water filled balls": "fluid filled blisters",
  "water bags on skin": "fluid filled blisters",
  "small water bags": "fluid filled blisters",
  "ball like bumps": "fluid filled blisters",
  "balls on skin": "fluid filled blisters",
  blisters: "fluid filled blisters",
  "water filled bumps": "fluid filled blisters",
  "water bumps": "fluid filled blisters",
  "fluid bumps": "fluid filled blisters",
  boils: "fluid filled blisters",
  "small boils": "fluid filled blisters",
  "pus filled bumps": "fluid filled blisters",
  "bubble like skin": "fluid filled blisters",
  "bubbles on skin": "fluid filled blisters",
  "pimple like": "skin bumps",
  "spots on skin": "skin rash",
  "redness on skin": "skin redness",
  "skin spots": "skin rash",
  "red dots": "skin rash",
  "red patches": "skin rash",
  "skin blotches": "skin rash",
  "marks on skin": "skin rash",
  "red marks": "skin rash",
  "itchy skin": "itching",
  "itchy all over": "itching widespread rash",
  "itching all over": "itching widespread rash",
  "itch everywhere": "itching widespread rash",
  "all over body": "widespread rash",
  "whole body": "widespread rash",
  "everywhere on body": "widespread rash",
  "body covered": "widespread rash",
  "whole skin": "widespread rash",
  "skin peeling": "skin peeling",
  "skin flaking": "flaky skin",
  "dry flaky skin": "dry skin flaky",
  "ring on skin": "ring shaped rash",
  "circular patch": "ring shaped rash",
  "round rash": "ring shaped rash",
  "round marks on skin": "ring shaped rash",
  "circle marks": "ring shaped rash",
  "scaly skin": "scaly patches",
  "skin scales": "silver scales",
  "patches on skin": "skin patches",
  "dry patches": "dry skin patches",
  "rough skin": "scaly patches",
  "skin turning yellow": "jaundice",
  "eyes turning yellow": "jaundice",
  "nails turning yellow": "nail discoloration",

  // ── FEVER / TEMPERATURE ──────────────────────────────────────────────────
  "high temp": "high fever",
  "burning up": "high fever",
  temperature: "fever",
  "hot body": "fever",
  "feel hot": "fever",
  "body is hot": "fever",
  "body hot": "fever",
  "my body is heating up": "fever",
  "heating up": "fever",
  "feeling feverish": "fever",
  feverish: "fever",
  "low grade fever": "mild fever",
  "slight fever": "mild fever",
  "mild temperature": "mild fever",
  "body temperature high": "high fever",
  "on and off fever": "cyclical fever",
  "fever comes and goes": "cyclical fever",
  "fever every day": "cyclical fever",
  "fever at night": "sweating at night",

  // ── HEAD ────────────────────────────────────────────────────────────────
  "head hurts": "headache",
  "my head hurts": "headache",
  "head is pounding": "throbbing headache",
  "head pain": "headache",
  "skull pain": "headache",
  "throbbing head": "throbbing headache",
  "head is throbbing": "throbbing headache",
  "head beating": "throbbing headache",
  "one sided headache": "one side headache",
  "half head pain": "one side headache",
  "migraine like": "throbbing headache",
  "pain on one side of head": "one side headache",
  "pain one side head": "one side headache",
  "headache on one side": "one side headache",
  "pressure in head": "head pressure",
  "head feels heavy": "head pressure",
  "tight band around head": "band around head",
  "head band pain": "band around head",

  // ── STOMACH / GI ──────────────────────────────────────────────────────
  "tummy ache": "stomach ache",
  "tummy pain": "abdominal pain",
  "belly pain": "abdominal pain",
  "belly ache": "abdominal pain",
  "belly hurts": "abdominal pain",
  "my belly hurts": "abdominal pain",
  "stomach hurts": "stomach ache",
  "my stomach hurts": "stomach ache",
  "upset stomach": "nausea",
  "feel sick": "nausea",
  "feeling sick": "nausea",
  "feel like vomiting": "nausea vomiting",
  "want to vomit": "nausea vomiting",
  "throwing up": "vomiting",
  "threw up": "vomiting",
  puke: "vomiting",
  puking: "vomiting",
  vomit: "vomiting",
  "keep vomiting": "persistent vomiting",
  "vomiting again and again": "persistent vomiting",
  "loose motion": "diarrhea",
  "loose stool": "diarrhea",
  "running stomach": "diarrhea",
  "watery stool": "watery diarrhea",
  "watery poop": "watery diarrhea",
  "stomach gurgling": "abdominal cramps",
  "stomach rumbling": "nausea",
  "right side pain": "right side abdominal pain",
  "lower right pain": "lower right abdominal pain",
  "pain right side belly": "right side abdominal pain",
  "pain near belly button": "abdominal pain",
  "belly button pain": "appendicitis abdominal pain",
  "pain starts near belly button": "pain starts around navel",
  "pain below belly button": "lower abdominal pain",
  "lower belly pain": "lower abdominal pain",
  "pain between meals": "pain between meals",
  "empty stomach pain": "pain between meals",
  acidity: "heartburn",
  "burning in stomach": "burning stomach pain",
  "acid coming up": "acid reflux regurgitation",
  "acid in throat": "acid reflux regurgitation",
  "sour water coming up": "regurgitation sour taste",
  indigestion: "indigestion heartburn",
  "stomach fullness": "bloating",
  "feel full fast": "loss of appetite bloating",
  "food not digesting": "indigestion",
  "after eating pain": "vomiting after eating abdominal pain",
  "ate something bad": "vomiting after eating food poisoning",
  "ate outside got sick": "food poisoning vomiting",
  "food poisoning symptoms": "vomiting after eating diarrhea",
  "stomach cramps": "abdominal cramps",
  "stomach spasms": "abdominal cramps",
  "cramps in stomach": "abdominal cramps",

  // ── THROAT ──────────────────────────────────────────────────────────────
  "throat hurts": "sore throat",
  "throat pain": "sore throat",
  "throat is sore": "sore throat",
  "hard to swallow": "difficulty swallowing",
  "painful to swallow": "painful swallowing",
  "swallowing hurts": "painful swallowing",
  "cant swallow": "difficulty swallowing",
  "white spots throat": "white patches throat",
  "pus in throat": "white patches throat",
  "throat has white stuff": "white patches throat",
  "white coating throat": "white patches throat",
  "throat swollen": "sore throat swollen tonsils",
  "tonsils swollen": "swollen tonsils",
  "tonsils hurting": "tonsillitis sore throat",
  "throat feels scratchy": "sore throat",
  "scratchy throat": "sore throat",
  "dry throat": "sore throat",

  // ── EYES ────────────────────────────────────────────────────────────────
  "red eyes": "red eye",
  "eyes are red": "red eye",
  "eyes watering": "watery eye",
  "eyes dripping": "watery eye",
  "eyes crusting": "eye discharge",
  "yellow eye discharge": "eye discharge",
  "sticky eye": "eye discharge",
  "crusty eyes": "eye discharge",
  "eye gunk": "eye discharge",
  "sleep in eyes": "eye discharge",
  "dirt in eyes": "eye discharge",
  "eyes sealed shut": "eye discharge",
  "cannot open eyes in morning": "eye discharge crusty eyes",
  "eyes glued": "eye discharge",
  "blurry vision": "blurred vision",
  "blurred sight": "blurred vision",
  "cannot see clearly": "blurred vision",
  "seeing double": "blurred vision",
  "spots before eyes": "visual disturbance",
  "flashing lights vision": "visual disturbance before headache",
  "eyes sensitive to light": "light sensitivity photophobia",
  "light hurts eyes": "light hurts eyes photophobia",

  // ── URINE ───────────────────────────────────────────────────────────────
  "peeing a lot": "frequent urination",
  "urinating a lot": "frequent urination",
  "toilet a lot": "frequent urination",
  "going to bathroom a lot": "frequent urination",
  "burning pee": "burning urination",
  "pee hurts": "painful urination",
  "pain when urinating": "painful urination",
  "pain while peeing": "painful urination",
  "burning when urinating": "burning urination",
  "fire when peeing": "burning urination",
  "dark pee": "dark urine",
  "dark yellow urine": "dark urine",
  "orange pee": "dark urine",
  "brown pee": "dark urine",
  "blood in pee": "blood in urine",
  "red pee": "blood in urine",
  "pink urine": "blood in urine",
  "smell in urine": "strong smelling urine",
  "urine smells": "strong smelling urine",
  "foul smelling pee": "strong smelling urine",
  "cloudy pee": "cloudy urine",
  "white pee": "cloudy urine",
  "foamy pee": "foamy urine",

  // ── FATIGUE / WEAKNESS ──────────────────────────────────────────────────
  "tired all the time": "extreme fatigue",
  "always tired": "extreme fatigue",
  "very tired": "fatigue",
  "so tired": "fatigue",
  "no energy": "extreme fatigue",
  "no strength": "extreme fatigue weakness",
  "feel weak": "weakness",
  "feeling weak": "weakness",
  weak: "weakness",
  "body weakness": "weakness",
  "not able to do anything": "extreme fatigue weakness",
  "cant get out of bed": "extreme fatigue",
  "body feels heavy": "extreme fatigue weakness",
  "run down": "fatigue general malaise",
  "worn out": "fatigue",
  aches: "body aches",
  "muscle pain": "muscle aches",
  "body pain": "body aches",
  "body is paining": "body aches",
  "whole body paining": "body aches muscle aches",
  "all over pain": "widespread pain body aches",
  shivering: "chills",
  "feeling cold": "chills",
  "cold and shivering": "chills",
  "feeling cold inside": "chills",
  "trembling with cold": "chills",
  "shaking with cold": "chills",
  "cold chills": "chills",
  "goosebumps cold": "chills",

  // ── NOSE ────────────────────────────────────────────────────────────────
  snot: "runny nose",
  "snot coming": "runny nose",
  "nose dripping": "runny nose",
  "nose running": "runny nose",
  "blocked nose": "nasal congestion",
  "nose blocked": "nasal congestion",
  "stuffed nose": "nasal congestion",
  stuffy: "nasal congestion",
  "nose not clear": "nasal congestion",
  "congested nose": "nasal congestion",
  "nose congested": "nasal congestion",
  "can't smell": "loss of smell",
  "cannot smell": "loss of smell",
  "no sense of smell": "loss of smell",
  "smell gone": "loss of smell",
  "smell has gone": "loss of smell",
  "no taste": "loss of taste",
  "can't taste": "loss of taste",
  "food tasteless": "loss of taste",
  "cannot taste food": "loss of taste",
  "taste gone": "loss of taste",
  "food has no taste": "loss of taste",
  sneezing: "sneezing nasal congestion",
  "keep sneezing": "sneezing nasal congestion",

  // ── LYMPH NODES / GLANDS ────────────────────────────────────────────────
  "swollen glands": "swollen lymph nodes",
  "glands swollen": "swollen lymph nodes",
  "lump in neck": "swollen lymph nodes",
  "neck lump": "swollen lymph nodes",
  "glands in neck": "swollen lymph nodes",
  "bumps in neck": "swollen lymph nodes",
  "neck swollen": "swollen lymph nodes",
  "swollen neck": "swollen lymph nodes",
  "tender neck": "tender neck lymph nodes",
  "painful neck lumps": "swollen lymph nodes",

  // ── GENERAL FEELING UNWELL ──────────────────────────────────────────────
  uneasiness: "general discomfort",
  discomfort: "general discomfort",
  "not feeling well": "general malaise",
  "feeling unwell": "general malaise",
  "feeling off": "general malaise",
  "not okay": "general malaise",
  "feeling bad": "general malaise",
  "feeling terrible": "general malaise fever",
  "not good": "general malaise",
  "body not feeling right": "general malaise",
  "something is wrong": "general malaise",
  "feeling sick overall": "general malaise",
  uneasy: "general discomfort",

  // ── PAIN DESCRIPTORS ────────────────────────────────────────────────────
  "dull pain": "mild pain",
  "stabbing pain": "sharp pain",
  "burning pain": "burning sensation",
  "sharp pain": "sharp pain",
  "shooting pain": "sharp pain",
  "constant pain": "persistent pain",
  "mild pain": "mild pain",
  "severe pain": "severe pain",
  "extreme pain": "severe pain",
  "unbearable pain": "severe pain",
  "comes and goes pain": "intermittent pain",

  // ── SENSORY ──────────────────────────────────────────────────────────────
  tingling: "tingling sensation",
  "pins and needles": "tingling sensation",
  "tingling feeling": "tingling sensation",
  "prickling sensation": "tingling sensation",
  numb: "numbness",
  "can't feel": "numbness",
  "no feeling": "numbness",
  stiff: "stiffness",
  "can't move": "stiffness",
  swollen: "swelling",
  puffy: "swelling",
  puffiness: "swelling",

  // ── GI GENERAL ───────────────────────────────────────────────────────────
  bloated: "bloating",
  gas: "bloating",
  "gas trouble": "bloating gas",
  belching: "burping",
  burping: "burping",
  "burping a lot": "burping bloating",
  flatulence: "bloating gas",
  "stomach bloating": "bloating",
  "stomach gas": "bloating gas",
  "no appetite": "loss of appetite",
  "don't feel like eating": "loss of appetite",
  "no hunger": "loss of appetite",
  "not hungry": "loss of appetite",
  "lost appetite": "loss of appetite",

  // ── HEART ────────────────────────────────────────────────────────────────
  "heart racing": "racing heart",
  palpitations: "heart palpitations",
  "heart beating fast": "racing heart",
  "heart pounding": "heart pounding racing heart",
  "heart skipping": "heart palpitations",
  "heart fluttering": "heart palpitations",
  "feeling heartbeat": "heart palpitations",
  "heart beats hard": "heart pounding",
  "fast heartbeat": "racing heart",

  // ── DIZZINESS / FAINTNESS ─────────────────────────────────────────────
  dizzy: "dizziness",
  "feeling dizzy": "dizziness",
  "head spinning": "dizziness spinning sensation",
  spinning: "dizziness spinning sensation",
  "room is spinning": "room spinning vertigo",
  "everything spinning": "everything spinning vertigo",
  "feel like falling": "dizziness balance problems",
  "losing balance": "balance problems dizziness",
  "balance problem": "balance problems dizziness",
  "feel faint": "faintness",
  "about to faint": "faintness",
  "passed out": "fainting",
  blackout: "fainting",
  "went blank": "fainting loss of consciousness",
  fainted: "fainting",

  // ── JAUNDICE ──────────────────────────────────────────────────────────
  "yellow skin": "jaundice",
  "yellow eyes": "jaundice",
  "skin yellowing": "jaundice",
  "eyes are yellow": "jaundice",
  "whites of eyes yellow": "jaundice",
  "skin and eyes yellow": "jaundice",
  "turning yellow": "jaundice",
  "body is yellow": "jaundice",

  // ── SWEAT ──────────────────────────────────────────────────────────────
  "night sweats": "sweating at night",
  "sweating at night": "sweating at night",
  "waking up sweaty": "sweating at night",
  "sweat in sleep": "sweating at night",
  "heavy sweating": "excessive sweating",

  // ── WEIGHT ──────────────────────────────────────────────────────────────
  "weight loss": "unexplained weight loss",
  "losing weight": "unexplained weight loss",
  "lost a lot of weight": "unexplained weight loss",
  "weight dropping": "unexplained weight loss",
  "weight gain": "weight gain",
  "putting on weight": "weight gain",
  "gaining weight": "weight gain",

  // ── HAIR ──────────────────────────────────────────────────────────────
  "losing hair": "hair loss",
  "hair falling": "hair loss",
  "hair falling out": "hair loss",
  "bald patches": "hair loss",
  "hair thinning": "hair thinning hair loss",

  // ── BOWEL ──────────────────────────────────────────────────────────────
  constipated: "constipation",
  "can't poop": "constipation",
  "hard stool": "constipation",
  "no bowel movement": "constipation",
  "haven't pooped": "constipation",
  "trouble pooping": "constipation",
  "blood in stool": "rectal bleeding",
  "blood in poop": "rectal bleeding",
  "bloody stool": "rectal bleeding",
  "red in toilet": "rectal bleeding",
  "blood when wiping": "rectal bleeding",
  "black stool": "dark stool",
  "tarry stool": "dark stool",

  // ── COUGH / BLOOD ────────────────────────────────────────────────────
  "coughing blood": "blood in cough",
  "spitting blood": "blood in cough",
  "cough up blood": "blood in cough",
  "blood from mouth": "blood in cough",
  cough: "cough",
  "dry cough": "dry cough",
  "wet cough": "productive cough",
  "cough with phlegm": "productive cough phlegm",
  "coughing at night": "night cough",
  "cough at night": "night cough",
  "phlegm when coughing": "coughing mucus phlegm",
  "mucus coming out": "coughing mucus",

  // ── JOINT / BONE ──────────────────────────────────────────────────────
  "joint pain": "joint pain",
  "joint ache": "joint pain",
  "joints swollen": "swollen joint",
  "knee pain": "joint pain",
  "wrist pain": "joint pain",
  "ankle pain": "joint pain",
  "stiff joints": "stiff joints",
  "morning stiffness": "morning stiffness joints",
  "joints hurt in morning": "morning stiffness joints",
  "stiff in morning": "morning stiffness joints",
  "big toe pain": "big toe pain gout",
  "toe is swollen red": "big toe swollen red gout",
  "bone pain": "bone pain",
  "bones hurting": "bone pain",
  "pain in bones": "bone pain severe",

  // ── NERVES / NEURO ────────────────────────────────────────────────────
  "face drooping": "facial drooping",
  "face numb": "facial numbness",
  "slurred speech": "slurred speech",
  "can't speak": "speech difficulty",
  "speech slurred": "slurred speech",
  "speech not clear": "slurred speech",
  "words not coming out": "speech difficulty",
  "mouth drooping": "facial drooping",
  "hand shaking": "tremor",
  "hand trembling": "tremor",
  "hands shaky": "tremor",
  "body shaking": "tremor",
  fits: "convulsions",
  shaking: "convulsions",
  "falling and shaking": "convulsions seizure",
  "uncontrolled shaking": "convulsions",
  "sudden fall and shake": "convulsions seizure",
  "loss of consciousness": "loss of consciousness suddenly",
  "went unconscious": "loss of consciousness suddenly",
  "memory problems": "memory problems confusion",
  confused: "confusion",
  "brain fog": "brain fog memory problems",

  // ── CHEST PAIN ───────────────────────────────────────────────────────
  "chest pain when walking": "chest pain on exertion",
  "chest pain exercise": "chest pain on exertion",
  "chest pain on walking": "chest pain on exertion",
  "chest pain goes away rest": "chest pain relieved by rest angina",
  "pain in left arm": "pain radiating to left arm",
  "left arm pain": "pain radiating to left arm",
  "left arm hurts": "pain radiating to left arm",
  "jaw hurts": "jaw pain",
  "pain in jaw": "jaw pain",
  "pain spreading to arm": "chest pain radiating",
  "crushing feeling chest": "crushing chest pain",

  // ── EAR / NOSE / THROAT ──────────────────────────────────────────────
  "ear hurts": "ear pain",
  "ear ache": "ear pain",
  "my ear hurts": "ear pain",
  "inside ear pain": "ear pain",
  "cant hear": "hearing loss",
  "hearing problem": "hearing loss",
  "hearing reduced": "hearing loss",
  ringing: "ear ringing",
  "ringing in ears": "ear ringing",
  "buzzing in ears": "ear ringing",
  "ears ringing": "ear ringing",

  // ── REPRODUCTIVE ─────────────────────────────────────────────────────
  "period pain": "painful periods",
  "painful periods": "painful periods",
  "period cramps": "painful periods",
  "severe period pain": "painful periods",
  "heavy bleeding period": "heavy periods",
  "heavy periods": "heavy periods",
  "lots of bleeding": "heavy periods",
  "missed period": "missed period repeatedly",
  "no period": "missed period repeatedly",
  "irregular period": "irregular periods",
  "periods are irregular": "irregular periods",
  "pain during intercourse": "pain during sex",
  "sex is painful": "pain during sex",
  "excess hair on face": "excess hair growth face",
  "facial hair female": "excess hair growth face",

  // ── SKIN / INFECTIOUS SPECIFIC ────────────────────────────────────────
  "dark spots on face": "skin rash malar rash",
  "butterfly marks on face": "butterfly rash malar rash",
  "face rash cheeks": "facial rash cheeks butterfly rash",
  "cheeks reddish": "facial rash cheeks",
  "rash in sunlight": "rash sun exposure photosensitivity",
  "rash gets worse in sun": "rash sun exposure photosensitivity",
  "swollen cheeks": "cheek swelling parotid",
  "jaw swollen": "swollen jaw cheek swelling",
  "face looks swollen": "cheek swelling",
  "one side face swollen": "cheek swelling parotid",

  // ── TROPICAL DISEASE ───────────────────────────────────────────────────
  "mosquito bite fever": "mosquito bite fever malaria dengue",
  "after mosquito": "mosquito bite fever malaria",
  "bone pain and fever": "severe bone pain fever dengue",
  "eyes pain with fever": "pain behind eyes fever dengue",
  "back pain fever": "severe bone pain fever dengue",
  "food and water fever": "contaminated food fever typhoid",
  "fever after trip": "fever after travel malaria typhoid",
  "flood water contact": "fever after flood leptospirosis",
  "animal bite": "bitten by animal rabies",
  "dog bite": "dog bite sick rabies",
  "bitten by dog": "dog bite sick rabies",

  // ── LEGS / FEET ────────────────────────────────────────────────────────
  "leg swelling": "leg swelling swollen ankles",
  "feet swelling": "swollen feet swollen ankles",
  "ankles swollen": "swelling ankles kidney failure",
  "face swelling": "facial swelling allergic reaction",
  "lips swelling": "lip swelling allergic reaction",
  "tongue swelling": "swollen throat allergic reaction",
  "swollen face": "facial swelling",
  "swollen legs": "leg swelling dvt",
  "calf swollen": "calf swelling dvt",
  "one leg swollen": "calf swelling dvt blood clot leg",
  "leg pain after sitting": "leg pain swelling dvt",
};

// Extra plain-language phrase patterns that map to specific condition keywords
// These are multi-word fragments that the synonym expansion might miss
const PLAIN_LANGUAGE_PATTERNS: Array<{ pattern: RegExp; inject: string }> = [
  // Chickenpox
  {
    pattern: /water(y)?\s*(ball|bag|bubble|dot)s?/i,
    inject: "fluid filled blisters itchy",
  },
  {
    pattern: /small\s*(bubble|ball)s?\s*(on|all over|spread)/i,
    inject: "fluid filled blisters widespread rash",
  },
  {
    pattern: /itch(y|ing)?\s*(bump|dot|spot)s?\s*(all over|body|everywhere)/i,
    inject: "fluid filled blisters itching widespread rash",
  },
  {
    pattern: /blister(s)?\s*(on|all|spread|itch)/i,
    inject: "fluid filled blisters itching",
  },
  {
    pattern: /(bubble|blister|dot)s?\s*everywhere/i,
    inject: "fluid filled blisters widespread rash",
  },
  // Asthma
  {
    pattern: /breath(ing)?\s*(sound|noise|whistle|squeak)/i,
    inject: "wheezing chest tightness",
  },
  {
    pattern: /trouble\s*breath/i,
    inject: "difficulty breathing shortness of breath",
  },
  {
    pattern: /can.?t\s*breath/i,
    inject: "difficulty breathing shortness of breath",
  },
  // COVID
  { pattern: /smell.*(gone|lost|not there|can.?t)/i, inject: "loss of smell" },
  { pattern: /taste.*(gone|lost|not there|can.?t)/i, inject: "loss of taste" },
  // Dengue
  {
    pattern: /(eye|behind eye|eye socket)\s*pain.*(fever|temperature)/i,
    inject: "pain behind eyes fever dengue",
  },
  {
    pattern: /fever.*(bone|joint|eye)\s*pain/i,
    inject: "severe joint pain fever dengue",
  },
  // Malaria
  {
    pattern: /fever\s*(shaking|shiver|chill|cold)/i,
    inject: "fever chills sweating cycle",
  },
  {
    pattern: /(shiver|chill|cold)\s*(then)?\s*(fever|hot)/i,
    inject: "fever chills sweating cycle",
  },
  // GERD
  {
    pattern: /acid.*(throat|mouth|coming up)/i,
    inject: "acid reflux regurgitation sour taste",
  },
  {
    pattern:
      /(sour|bitter)\s*(taste|water|feeling)\s*(in mouth|throat|coming up)/i,
    inject: "regurgitation sour taste heartburn",
  },
  // Appendicitis
  {
    pattern: /(belly.?button|navel|umbilicus)\s*pain/i,
    inject: "pain starts around navel appendicitis",
  },
  {
    pattern: /pain\s*(around|near|at)\s*belly\s*button/i,
    inject: "pain starts around navel",
  },
  // Stroke
  {
    pattern: /face\s*(drooping|falling|one side)/i,
    inject: "facial drooping stroke",
  },
  {
    pattern: /(one side|half)\s*(body|arm|leg)\s*(weak|numb|not moving)/i,
    inject: "sudden arm weakness sudden numbness one side stroke",
  },
  // Meningitis
  {
    pattern: /stiff\s*neck\s*(fever|high temp)/i,
    inject: "stiff neck fever meningitis",
  },
  {
    pattern: /(neck|back)\s*stiff(ness)?\s*(with|and)\s*fever/i,
    inject: "neck stiffness fever meningitis",
  },
  // Shingles
  {
    pattern: /rash\s*(one side|only one|strip|band)/i,
    inject: "band of rash painful rash one side shingles",
  },
  {
    pattern: /burning\s*(skin|rash|pain)\s*(one side|strip|line)/i,
    inject: "burning skin pain rash one side shingles",
  },
  // UTI
  {
    pattern: /burn(ing)?\s*(when|while|during)\s*(pee|urinat)/i,
    inject: "burning urination painful urination",
  },
  {
    pattern: /(pee|urine|urinate)\s*(hurt|pain|burn)/i,
    inject: "burning urination painful urination",
  },
  // Typhoid
  {
    pattern: /fever\s*(stomach|belly|gut)\s*pain/i,
    inject: "sustained fever headache abdominal pain typhoid",
  },
  // Rabies
  {
    pattern: /(dog|cat|animal|bat)\s*(bite|scratch|attack)/i,
    inject: "bitten by animal dog bite sick rabies",
  },
  // Jaundice conditions
  {
    pattern: /skin\s*(turning|going|is|looks)\s*yellow/i,
    inject: "jaundice hepatitis",
  },
  { pattern: /(yellow|gold)\s*skin/i, inject: "jaundice" },
  // Ringworm
  {
    pattern: /circle\s*(shape|mark|rash|patch)\s*(on|skin)/i,
    inject: "ring shaped rash circular rash ringworm",
  },
  {
    pattern: /(round|circle|circular)\s*(spot|mark|patch)\s*(skin|body)/i,
    inject: "ring shaped rash ringworm",
  },
  // Vertigo
  {
    pattern: /room\s*(is\s*)?(spinning|turning|rotating)/i,
    inject: "room spinning vertigo dizziness",
  },
  // Anxiety
  {
    pattern: /heart\s*(racing|pounding|beating fast|palpitat)/i,
    inject: "racing heart anxiety panic attack",
  },
  {
    pattern: /sudden\s*(fear|dread|panic)\s*(no reason|randomly)/i,
    inject: "panic attack anxiety overwhelming fear",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CONDITIONS DATABASE
// ─────────────────────────────────────────────────────────────────────────────
const CONDITIONS: ConditionDefinition[] = [
  // ── RESPIRATORY ────────────────────────────────────────────────────────────
  {
    name: "Asthma",
    pathognomonicKeywords: ["wheezing", "inhaler", "bronchospasm", "asthma"],
    primaryKeywords: [
      "chest tightness",
      "night cough",
      "cough at night",
      "exercise induced breathing",
      "allergic asthma",
      "episodic breathlessness",
      "tight chest",
    ],
    secondaryKeywords: [
      "shortness of breath",
      "difficulty breathing",
      "breathlessness",
      "cough",
      "allergic",
      "dust",
      "pollen",
      "cold air",
    ],
    negativeKeywords: [
      "loss of smell",
      "loss of taste",
      "covid",
      "coronavirus",
      "tested positive",
    ],
    clusters: [
      ["wheezing", "chest tightness"],
      ["shortness of breath", "cough", "chest tightness"],
    ],
    cause:
      "Caused by chronic airway inflammation leading to bronchospasm triggered by allergens (dust, pollen, pet dander), exercise, cold air, respiratory infections, or stress.",
    precautions:
      "1. Identify and avoid personal asthma triggers (allergens, smoke, cold air).\n2. Use prescribed controller inhalers (corticosteroids) daily as directed.\n3. Keep rescue inhaler (albuterol/salbutamol) accessible at all times.\n4. Monitor peak flow regularly to track lung function.\n5. Create an asthma action plan with your doctor for emergencies.",
  },
  {
    name: "COVID-19",
    pathognomonicKeywords: [
      "loss of smell",
      "loss of taste",
      "anosmia",
      "covid",
      "coronavirus",
      "tested positive",
      "covid-19",
    ],
    primaryKeywords: [
      "persistent cough",
      "high fever",
      "shortness of breath",
      "difficulty breathing",
    ],
    secondaryKeywords: [
      "fatigue",
      "body aches",
      "headache",
      "sore throat",
      "runny nose",
    ],
    negativeKeywords: ["wheezing", "inhaler", "asthma", "night cough"],
    clusters: [
      ["loss of smell", "fever"],
      ["loss of taste", "cough"],
      ["fever", "shortness of breath", "fatigue"],
    ],
    cause:
      "Caused by SARS-CoV-2 coronavirus. Spreads through respiratory droplets and aerosols, especially in poorly ventilated areas.",
    precautions:
      "1. Get tested immediately and isolate if positive.\n2. Monitor oxygen levels; seek emergency care if below 94%.\n3. Stay hydrated and rest; take fever reducers as needed.\n4. Wear a well-fitting mask in public settings.\n5. Contact a healthcare provider for guidance on antiviral treatment options.",
  },
  {
    name: "Influenza (Flu)",
    pathognomonicKeywords: [
      "influenza",
      "flu",
      "sudden onset fever",
      "severe muscle aches",
    ],
    primaryKeywords: [
      "body aches",
      "muscle aches",
      "chills",
      "sweating",
      "severe fatigue",
      "high fever",
    ],
    secondaryKeywords: [
      "headache",
      "dry cough",
      "sore throat",
      "runny nose",
      "tiredness",
      "fever",
    ],
    negativeKeywords: [
      "loss of smell",
      "loss of taste",
      "runny nose only",
      "no fever",
    ],
    clusters: [
      ["fever", "chills", "body aches"],
      ["severe fatigue", "muscle aches", "headache"],
    ],
    cause:
      "Caused by influenza A or B viruses. Highly contagious, spreading through respiratory droplets.",
    precautions:
      "1. Get annual flu vaccination as preventive measure.\n2. Rest and drink plenty of fluids.\n3. Take antiviral medications (oseltamivir) if prescribed within 48 hours.\n4. Stay home to avoid spreading.\n5. Use fever reducers like acetaminophen or ibuprofen as directed.",
  },
  {
    name: "Common Cold",
    pathognomonicKeywords: [
      "runny nose",
      "nasal congestion",
      "stuffy nose",
      "sneezing",
      "common cold",
    ],
    primaryKeywords: ["congestion", "watery eyes", "mild cough", "nasal drip"],
    secondaryKeywords: [
      "mild sore throat",
      "mild fever",
      "tiredness",
      "headache",
    ],
    negativeKeywords: [
      "loss of smell",
      "loss of taste",
      "high fever",
      "severe body aches",
      "muscle aches",
    ],
    clusters: [
      ["runny nose", "sneezing"],
      ["congestion", "mild sore throat"],
    ],
    cause:
      "Caused by viral infection, most commonly rhinovirus. Spreads through respiratory droplets and contact with infected surfaces.",
    precautions:
      "1. Rest adequately and stay hydrated with warm fluids.\n2. Use saline nasal spray to relieve congestion.\n3. Avoid close contact with others to prevent spread.\n4. Wash hands frequently with soap and water.\n5. Consider over-the-counter decongestants or antihistamines for symptom relief.",
  },
  {
    name: "Pneumonia",
    pathognomonicKeywords: [
      "pneumonia",
      "productive cough",
      "coughing mucus",
      "rattling breath",
      "lung infection",
    ],
    primaryKeywords: [
      "labored breathing",
      "high fever chills",
      "rust colored sputum",
      "pleuritic chest pain",
    ],
    secondaryKeywords: [
      "chest pain",
      "high fever",
      "chills",
      "shortness of breath",
      "fatigue",
    ],
    negativeKeywords: [],
    clusters: [
      ["high fever", "productive cough", "shortness of breath"],
      ["fever", "chills", "chest pain"],
    ],
    cause:
      "Can be caused by bacteria (Streptococcus pneumoniae), viruses, or fungi. Infects and inflames air sacs in the lungs.",
    precautions:
      "1. Seek immediate medical attention — pneumonia can be life-threatening.\n2. Take prescribed antibiotics or antivirals as directed.\n3. Rest completely and avoid strenuous activity.\n4. Stay well-hydrated to thin mucus secretions.\n5. Get the pneumococcal vaccine to prevent future infections.",
  },
  {
    name: "Bronchitis",
    pathognomonicKeywords: [
      "bronchitis",
      "mucus cough",
      "phlegm",
      "green mucus",
      "yellow phlegm",
      "chest congestion",
    ],
    primaryKeywords: [
      "persistent cough",
      "coughing up mucus",
      "coughing phlegm",
    ],
    secondaryKeywords: [
      "wheezing",
      "low-grade fever",
      "chest discomfort",
      "fatigue",
      "mild fever",
    ],
    negativeKeywords: [],
    clusters: [
      ["persistent cough", "phlegm"],
      ["mucus", "chest congestion"],
    ],
    cause:
      "Acute bronchitis is usually caused by viral infections. Chronic bronchitis is caused by long-term irritation, often from smoking.",
    precautions:
      "1. Rest and drink plenty of fluids.\n2. Use a humidifier to add moisture to the air.\n3. Avoid smoke, dust, and lung irritants.\n4. Over-the-counter cough suppressants may help at night.\n5. See a doctor if symptoms last more than 3 weeks.",
  },
  {
    name: "Tuberculosis (TB)",
    pathognomonicKeywords: [
      "tuberculosis",
      "tb",
      "blood in cough",
      "coughing blood",
      "night sweats weeks",
    ],
    primaryKeywords: [
      "chronic cough weeks",
      "cough months",
      "blood in sputum",
      "sweating at night",
    ],
    secondaryKeywords: [
      "unexplained weight loss",
      "fatigue",
      "fever",
      "chest pain",
      "loss of appetite",
      "persistent cough",
    ],
    negativeKeywords: [],
    clusters: [
      ["blood in cough", "night sweats", "weight loss"],
      ["chronic cough", "fatigue", "fever"],
    ],
    cause:
      "Caused by Mycobacterium tuberculosis bacteria, spread through the air. Primarily affects the lungs.",
    precautions:
      "1. Seek immediate medical testing — TB is curable with proper treatment.\n2. Complete the full 6-9 month antibiotic course (DOTS therapy).\n3. Isolate until declared non-infectious.\n4. Ensure good ventilation in living spaces.\n5. All close contacts must be screened.",
  },
  {
    name: "Sinusitis",
    pathognomonicKeywords: [
      "sinusitis",
      "sinus pain",
      "sinus pressure",
      "facial pressure",
      "post-nasal drip",
    ],
    primaryKeywords: [
      "forehead pain",
      "colored nasal discharge",
      "cheek pain",
      "pain bending forward",
    ],
    secondaryKeywords: [
      "nasal congestion",
      "headache",
      "reduced smell",
      "cough",
      "fever",
      "fatigue",
    ],
    negativeKeywords: [],
    clusters: [
      ["sinus pressure", "nasal congestion", "headache"],
      ["facial pain", "blocked nose"],
    ],
    cause:
      "Caused by inflammation of the sinuses, usually following a cold or allergic rhinitis. Can be bacterial, viral, or fungal.",
    precautions:
      "1. Use saline nasal rinses.\n2. Apply warm compresses for pain relief.\n3. Take prescribed antibiotics if bacterial sinusitis is confirmed.\n4. Use decongestants and antihistamines as directed.\n5. See a specialist for recurrent sinusitis.",
  },
  // ── SKIN ───────────────────────────────────────────────────────────────────
  {
    name: "Chickenpox (Varicella)",
    pathognomonicKeywords: [
      "chickenpox",
      "varicella",
      "fluid filled blisters",
      "itchy blisters",
      "water blisters",
      "pox",
      "vesicles",
    ],
    primaryKeywords: [
      "blister rash",
      "spots all over",
      "widespread rash",
      "crusting blisters",
      "blisters itching",
    ],
    secondaryKeywords: [
      "itching",
      "fever",
      "rash",
      "skin bumps",
      "red spots",
      "fatigue",
      "headache",
      "general discomfort",
    ],
    negativeKeywords: [],
    clusters: [
      ["fluid filled blisters", "itching", "fever"],
      ["widespread rash", "skin bumps", "itching"],
    ],
    cause:
      "Caused by the varicella-zoster virus (VZV). Highly contagious, spreading through respiratory droplets or direct contact with the rash.",
    precautions:
      "1. Stay home — you are contagious until all blisters crust over.\n2. Apply calamine lotion or take antihistamines to relieve itching.\n3. Trim fingernails short to prevent scratching and secondary infection.\n4. Take acetaminophen for fever — AVOID aspirin in children.\n5. Antiviral medications (acyclovir) may be prescribed for severe cases.",
  },
  {
    name: "Measles",
    pathognomonicKeywords: [
      "measles",
      "koplik spots",
      "rash spreading from face",
      "maculopapular rash",
    ],
    primaryKeywords: [
      "rash face neck",
      "rash behind ears",
      "sensitivity to light",
    ],
    secondaryKeywords: [
      "high fever",
      "cough",
      "runny nose",
      "red eyes",
      "rash",
      "widespread rash",
    ],
    negativeKeywords: [],
    clusters: [
      ["rash", "fever", "red eyes", "cough"],
      ["maculopapular rash", "high fever"],
    ],
    cause:
      "Caused by the measles virus (Rubeola), spread through respiratory droplets. Highly contagious.",
    precautions:
      "1. Isolate immediately and seek medical care.\n2. Ensure MMR vaccination is up to date.\n3. Take acetaminophen for fever and stay hydrated.\n4. Vitamin A supplementation may be prescribed.\n5. Report to local health authorities.",
  },
  {
    name: "Shingles (Herpes Zoster)",
    pathognomonicKeywords: [
      "shingles",
      "herpes zoster",
      "band of rash",
      "painful rash one side",
      "stripe of blisters",
      "burning skin pain",
    ],
    primaryKeywords: [
      "rash one side body",
      "nerve pain",
      "tingling before rash",
    ],
    secondaryKeywords: [
      "fluid filled blisters",
      "itching",
      "tingling sensation",
      "sensitivity to touch",
    ],
    negativeKeywords: [],
    clusters: [
      ["burning skin pain", "rash one side"],
      ["nerve pain", "blisters"],
    ],
    cause:
      "Caused by reactivation of the varicella-zoster virus (chickenpox virus), usually due to a weakened immune system.",
    precautions:
      "1. Start antiviral treatment within 72 hours of rash onset.\n2. Take prescribed pain medications.\n3. Keep the rash clean and covered.\n4. Avoid contact with pregnant women and immunocompromised individuals.\n5. Get the Shingrix vaccine to prevent recurrence.",
  },
  {
    name: "Psoriasis",
    pathognomonicKeywords: [
      "psoriasis",
      "silver scales",
      "scaly patches",
      "thick skin patches",
      "plaques on skin",
    ],
    primaryKeywords: [
      "dry skin flaky",
      "skin cracking",
      "nail changes",
      "skin silvery",
    ],
    secondaryKeywords: ["itching", "dry skin", "skin redness", "flaky skin"],
    negativeKeywords: [],
    clusters: [
      ["scaly patches", "itching"],
      ["silver scales", "skin redness"],
    ],
    cause:
      "An autoimmune condition where the immune system accelerates skin cell turnover. Triggered by stress, infections, or medications.",
    precautions:
      "1. Use prescribed topical corticosteroids or vitamin D analogues.\n2. Moisturize regularly with fragrance-free products.\n3. Avoid triggers: stress, alcohol, smoking.\n4. Consider phototherapy under medical supervision.\n5. Systemic or biologic medications for severe cases.",
  },
  {
    name: "Eczema / Dermatitis",
    pathognomonicKeywords: [
      "eczema",
      "dermatitis",
      "itchy patches",
      "atopic",
      "contact dermatitis",
    ],
    primaryKeywords: [
      "skin inflammation",
      "cracked skin",
      "dry itchy skin",
      "skin flare",
    ],
    secondaryKeywords: [
      "dry skin",
      "flaky skin",
      "skin redness",
      "itching",
      "skin patches",
    ],
    negativeKeywords: [],
    clusters: [
      ["itchy patches", "dry skin"],
      ["skin redness", "itching", "flaky skin"],
    ],
    cause:
      "Caused by a weakened skin barrier from genetic and environmental factors. Triggers include soaps, detergents, stress, and allergens.",
    precautions:
      "1. Moisturize frequently with fragrance-free emollients.\n2. Use prescribed topical corticosteroids for flare-ups.\n3. Avoid triggers: harsh soaps, certain fabrics.\n4. Take lukewarm (not hot) showers.\n5. Consider allergy testing to identify allergens.",
  },
  {
    name: "Scabies",
    pathognomonicKeywords: [
      "scabies",
      "mite",
      "burrow tracks",
      "intense nighttime itching",
      "itching worse at night",
    ],
    primaryKeywords: ["between fingers rash", "wrist rash", "genital rash"],
    secondaryKeywords: ["itching", "rash", "skin bumps"],
    negativeKeywords: [],
    clusters: [
      ["itching worse at night", "rash between fingers"],
      ["intense itching", "skin burrows"],
    ],
    cause:
      "Caused by Sarcoptes scabiei mite burrowing into skin. Spreads through prolonged skin-to-skin contact.",
    precautions:
      "1. Apply prescribed permethrin 5% cream to entire body.\n2. Wash all clothing, bedding in hot water.\n3. Treat all household members simultaneously.\n4. Itching may persist weeks after treatment.\n5. Avoid skin contact until treatment is complete.",
  },
  {
    name: "Ringworm (Tinea)",
    pathognomonicKeywords: [
      "ringworm",
      "tinea",
      "ring shaped rash",
      "circular rash",
      "fungal skin infection",
      "ring on skin",
    ],
    primaryKeywords: [
      "athlete's foot",
      "circular patch",
      "round rash",
      "scaly ring",
    ],
    secondaryKeywords: [
      "itching",
      "scaly skin",
      "skin redness",
      "hair loss patch",
      "nail discoloration",
    ],
    negativeKeywords: [],
    clusters: [
      ["ring shaped rash", "itching"],
      ["circular rash", "scaly skin"],
    ],
    cause:
      "Caused by dermatophyte fungi (not a worm). Spreads through direct contact with infected people, animals, or surfaces.",
    precautions:
      "1. Apply antifungal cream (clotrimazole, terbinafine) twice daily.\n2. Keep the area clean and dry.\n3. Do not share towels or personal items.\n4. Oral antifungals needed for scalp or nail infections.\n5. Treat infected pets.",
  },
  {
    name: "Hives (Urticaria)",
    pathognomonicKeywords: [
      "hives",
      "urticaria",
      "wheals",
      "raised itchy welts",
      "welts on skin",
    ],
    primaryKeywords: [
      "sudden itchy bumps",
      "red raised patches",
      "itchy red welts",
    ],
    secondaryKeywords: ["itching", "swelling", "allergic", "rash"],
    negativeKeywords: [],
    clusters: [
      ["hives", "itching"],
      ["raised bumps", "allergic"],
    ],
    cause:
      "Triggered by allergic reactions, infections, medications, stress, or unknown causes causing histamine release.",
    precautions:
      "1. Take antihistamines (cetirizine, loratadine) for relief.\n2. Identify and avoid triggers.\n3. Apply cool compresses.\n4. See a doctor for severe or chronic hives.\n5. Use EpiPen for anaphylaxis if prescribed.",
  },
  {
    name: "Acne",
    pathognomonicKeywords: [
      "acne",
      "pimples",
      "blackheads",
      "whiteheads",
      "zits",
    ],
    primaryKeywords: ["facial spots", "clogged pores", "oily skin"],
    secondaryKeywords: ["skin bumps", "skin redness", "face rash"],
    negativeKeywords: [],
    clusters: [
      ["pimples", "blackheads"],
      ["acne", "oily skin"],
    ],
    cause:
      "Caused by clogged pores from excess sebum, dead skin cells, and bacteria (C. acnes). Worsened by hormones and stress.",
    precautions:
      "1. Wash face twice daily with gentle cleanser.\n2. Use non-comedogenic skincare products.\n3. Apply prescribed benzoyl peroxide or retinoids.\n4. Avoid squeezing pimples.\n5. See a dermatologist for severe or cystic acne.",
  },
  // ── GASTROINTESTINAL ───────────────────────────────────────────────────────
  {
    name: "Gastroenteritis (Stomach Flu)",
    pathognomonicKeywords: [
      "gastroenteritis",
      "stomach flu",
      "stomach cramps vomiting",
      "vomiting and diarrhea",
    ],
    primaryKeywords: ["watery diarrhea", "stomach cramps", "nausea vomiting"],
    secondaryKeywords: [
      "nausea",
      "stomach ache",
      "abdominal cramps",
      "loose stools",
      "fever",
      "vomiting",
      "diarrhea",
    ],
    negativeKeywords: [],
    clusters: [
      ["vomiting", "diarrhea"],
      ["stomach cramps", "nausea", "diarrhea"],
    ],
    cause:
      "Caused by viral (norovirus, rotavirus) or bacterial infections, through contaminated food or water.",
    precautions:
      "1. Rehydrate with oral rehydration solutions.\n2. Rest and avoid solid foods until vomiting subsides.\n3. Wash hands thoroughly after using the bathroom.\n4. Avoid dairy, fatty, or spicy foods during recovery.\n5. Seek medical attention if symptoms persist more than 2 days.",
  },
  {
    name: "GERD / Acid Reflux",
    pathognomonicKeywords: [
      "heartburn",
      "acid reflux",
      "gerd",
      "regurgitation",
      "sour taste",
      "acidity",
    ],
    primaryKeywords: [
      "throat burning",
      "chest burning after eating",
      "burning stomach pain",
    ],
    secondaryKeywords: [
      "burning chest",
      "indigestion",
      "burping",
      "bloating",
      "difficulty swallowing",
    ],
    negativeKeywords: [],
    clusters: [
      ["heartburn", "regurgitation"],
      ["burning chest", "after eating", "burping"],
    ],
    cause:
      "Caused by stomach acid flowing back into the esophagus due to a weakened lower esophageal sphincter.",
    precautions:
      "1. Eat smaller, more frequent meals.\n2. Avoid trigger foods: spicy, fatty, acidic foods, caffeine, alcohol.\n3. Don't lie down within 2-3 hours after eating.\n4. Elevate the head of your bed.\n5. Take antacids or prescribed proton pump inhibitors.",
  },
  {
    name: "Appendicitis",
    pathognomonicKeywords: [
      "appendicitis",
      "lower right abdominal pain",
      "right side abdominal pain",
      "rebound tenderness",
      "appendix pain",
    ],
    primaryKeywords: [
      "pain starts around navel",
      "pain moves to right",
      "right lower quadrant pain",
    ],
    secondaryKeywords: [
      "sharp abdominal pain",
      "nausea",
      "vomiting",
      "fever",
      "loss of appetite",
    ],
    negativeKeywords: [],
    clusters: [
      ["right side abdominal pain", "fever", "nausea"],
      ["lower right pain", "vomiting", "loss of appetite"],
    ],
    cause:
      "Caused by blockage of the appendix, leading to bacterial overgrowth and inflammation. Surgical emergency.",
    precautions:
      "1. SEEK EMERGENCY MEDICAL CARE IMMEDIATELY.\n2. Do not eat, drink, or take laxatives.\n3. Do not apply a heating pad to the abdomen.\n4. Surgery (appendectomy) is the standard treatment.\n5. Follow all post-surgical recovery instructions.",
  },
  {
    name: "Food Poisoning",
    pathognomonicKeywords: [
      "food poisoning",
      "vomiting after eating",
      "diarrhea after eating",
      "after eating sick",
    ],
    primaryKeywords: [
      "contaminated food",
      "sudden vomiting",
      "ate and felt sick",
    ],
    secondaryKeywords: [
      "nausea",
      "stomach pain",
      "cramps",
      "fever",
      "vomiting",
      "diarrhea",
    ],
    negativeKeywords: [],
    clusters: [
      ["vomiting", "after eating"],
      ["nausea", "diarrhea", "after meal"],
    ],
    cause:
      "Caused by consuming food contaminated with bacteria (Salmonella, E. coli), viruses, or toxins.",
    precautions:
      "1. Stay hydrated.\n2. Rest and avoid solid foods initially.\n3. Seek emergency care for bloody stool, high fever, or severe dehydration.\n4. Discard suspected contaminated food.\n5. Practice safe food handling.",
  },
  {
    name: "Peptic Ulcer",
    pathognomonicKeywords: [
      "peptic ulcer",
      "stomach ulcer",
      "gnawing stomach pain",
      "h pylori",
      "pain between meals",
    ],
    primaryKeywords: [
      "burning stomach pain",
      "empty stomach pain",
      "pain relieved eating",
      "dark stool",
    ],
    secondaryKeywords: ["nausea", "bloating", "burping", "loss of appetite"],
    negativeKeywords: [],
    clusters: [
      ["stomach pain", "pain between meals"],
      ["burning stomach", "dark stool", "nausea"],
    ],
    cause:
      "Caused by H. pylori bacteria or NSAID use eroding the stomach or small intestine lining.",
    precautions:
      "1. Get tested for H. pylori and take prescribed antibiotic combination therapy.\n2. Take proton pump inhibitors to reduce stomach acid.\n3. Avoid NSAIDs unless prescribed alternatives.\n4. Stop smoking and reduce alcohol.\n5. Eat regular small meals.",
  },
  {
    name: "Irritable Bowel Syndrome (IBS)",
    pathognomonicKeywords: [
      "ibs",
      "irritable bowel",
      "alternating constipation diarrhea",
      "mucus in stool",
    ],
    primaryKeywords: [
      "bowel habit changes",
      "diarrhea alternating constipation",
    ],
    secondaryKeywords: [
      "abdominal pain",
      "bloating",
      "cramping",
      "diarrhea",
      "constipation",
      "gas",
    ],
    negativeKeywords: [],
    clusters: [
      ["abdominal pain", "bloating", "alternating constipation diarrhea"],
      ["cramping", "mucus in stool"],
    ],
    cause:
      "Involves gut-brain interaction issues, intestinal sensitivity, and changes in gut bacteria.",
    precautions:
      "1. Track and avoid food triggers (dairy, gluten, high-FODMAP foods).\n2. Manage stress through therapy and exercise.\n3. Take prescribed medications for symptom relief.\n4. Eat regular meals.\n5. Consult a gastroenterologist for a personalized plan.",
  },
  {
    name: "Cholera",
    pathognomonicKeywords: [
      "cholera",
      "rice water stool",
      "profuse watery diarrhea",
      "massive dehydration",
    ],
    primaryKeywords: ["severe dehydration sudden", "extreme watery diarrhea"],
    secondaryKeywords: [
      "vomiting",
      "watery diarrhea",
      "weakness",
      "muscle cramps",
      "extreme thirst",
    ],
    negativeKeywords: [],
    clusters: [
      ["rice water stool", "dehydration"],
      ["profuse diarrhea", "vomiting"],
    ],
    cause:
      "Caused by Vibrio cholerae bacteria, spread through contaminated water in areas with poor sanitation.",
    precautions:
      "1. Seek emergency medical care immediately.\n2. Begin oral rehydration therapy urgently.\n3. Take prescribed antibiotics.\n4. Use only boiled or treated water.\n5. Practice strict hand hygiene.",
  },
  {
    name: "Crohn's Disease",
    pathognomonicKeywords: [
      "crohn",
      "crohn's disease",
      "inflammatory bowel disease",
      "bloody diarrhea chronic",
    ],
    primaryKeywords: [
      "chronic diarrhea blood",
      "mouth sores",
      "fistula",
      "perianal disease",
    ],
    secondaryKeywords: [
      "abdominal pain",
      "diarrhea",
      "fatigue",
      "weight loss",
      "rectal bleeding",
    ],
    negativeKeywords: [],
    clusters: [
      ["bloody diarrhea", "abdominal pain", "weight loss"],
      ["chronic diarrhea", "fatigue", "mouth sores"],
    ],
    cause:
      "An autoimmune inflammatory bowel disease where the immune system attacks the gastrointestinal tract.",
    precautions:
      "1. Follow prescribed medication regimen (aminosalicylates, biologics).\n2. Identify and avoid dietary triggers.\n3. Attend regular colonoscopy screenings.\n4. Manage stress.\n5. Work with a gastroenterologist for long-term management.",
  },
  // ── CARDIOVASCULAR ─────────────────────────────────────────────────────────
  {
    name: "Heart Attack (Myocardial Infarction)",
    pathognomonicKeywords: [
      "heart attack",
      "myocardial infarction",
      "crushing chest pain",
      "pain radiating to left arm",
      "jaw pain chest",
    ],
    primaryKeywords: [
      "chest pain radiating",
      "pain in left arm",
      "pressure on chest severe",
    ],
    secondaryKeywords: [
      "chest pain",
      "shortness of breath",
      "nausea",
      "sweating",
      "dizziness",
      "fainting",
    ],
    negativeKeywords: [],
    clusters: [
      ["crushing chest pain", "left arm pain"],
      ["chest pain", "shortness of breath", "sweating"],
    ],
    cause:
      "Caused by blockage in a coronary artery cutting off blood supply to heart muscle.",
    precautions:
      "1. CALL EMERGENCY SERVICES IMMEDIATELY.\n2. Chew an aspirin (325mg) if not allergic.\n3. Remain calm while awaiting help.\n4. Do NOT drive yourself to the hospital.\n5. Follow cardiac rehabilitation after treatment.",
  },
  {
    name: "Hypertension (High Blood Pressure)",
    pathognomonicKeywords: [
      "high blood pressure",
      "hypertension",
      "blood pressure high",
      "systolic high",
    ],
    primaryKeywords: ["blood pressure reading", "bp elevated"],
    secondaryKeywords: [
      "headache",
      "dizziness",
      "blurred vision",
      "nosebleed",
      "heart pounding",
    ],
    negativeKeywords: [],
    clusters: [["high blood pressure", "headache", "dizziness"]],
    cause:
      "Caused by high sodium diet, obesity, inactivity, stress, genetics, or kidney disease. Often asymptomatic.",
    precautions:
      "1. Monitor blood pressure and take medications consistently.\n2. Follow a low-sodium, heart-healthy diet.\n3. Exercise at least 150 minutes per week.\n4. Limit alcohol and quit smoking.\n5. Manage stress.",
  },
  {
    name: "Angina",
    pathognomonicKeywords: [
      "angina",
      "chest pain on exertion",
      "chest tightness exercise",
      "stable angina",
    ],
    primaryKeywords: [
      "chest pain when walking",
      "chest pain relieved by rest",
      "nitroglycerin relief",
    ],
    secondaryKeywords: [
      "chest pressure",
      "shortness of breath",
      "jaw ache",
      "left arm discomfort",
    ],
    negativeKeywords: [],
    clusters: [["chest pain on exertion", "relieved rest"]],
    cause:
      "Caused by reduced blood flow to the heart due to coronary artery disease. Triggered by physical activity or stress.",
    precautions:
      "1. Rest immediately when chest pain occurs.\n2. Take prescribed nitroglycerin.\n3. Avoid triggers: heavy exertion, extreme temperatures.\n4. Take prescribed medications (beta-blockers).\n5. Seek emergency care for worsening chest pain.",
  },
  {
    name: "Deep Vein Thrombosis (DVT)",
    pathognomonicKeywords: [
      "dvt",
      "deep vein thrombosis",
      "blood clot leg",
      "swollen calf",
      "calf swelling",
    ],
    primaryKeywords: [
      "calf pain swelling",
      "leg warmth one sided",
      "after long flight leg pain",
    ],
    secondaryKeywords: [
      "leg pain",
      "leg swelling",
      "warmth in leg",
      "redness on calf",
    ],
    negativeKeywords: [],
    clusters: [["calf swelling", "leg pain", "warmth"]],
    cause:
      "Blood clot in a deep vein, usually the leg. Risk: prolonged immobility, surgery, clotting disorders.",
    precautions:
      "1. Seek urgent medical care — can lead to pulmonary embolism.\n2. Take prescribed anticoagulant medications.\n3. Elevate the affected leg.\n4. Wear compression stockings.\n5. Stay mobile.",
  },
  // ── NEUROLOGICAL ───────────────────────────────────────────────────────────
  {
    name: "Migraine",
    pathognomonicKeywords: [
      "migraine",
      "throbbing headache",
      "one side headache",
      "aura",
      "visual disturbance before headache",
    ],
    primaryKeywords: [
      "pulsating pain",
      "headache worse movement",
      "light sensitivity",
      "sound sensitivity",
    ],
    secondaryKeywords: ["nausea", "vomiting", "headache"],
    negativeKeywords: ["both sides headache", "neck stiffness fever"],
    clusters: [
      ["throbbing headache", "nausea", "light sensitivity"],
      ["one side headache", "aura"],
    ],
    cause:
      "Involves abnormal brain activity affecting nerve signals and blood vessels. Triggers include stress, hormonal changes, and certain foods.",
    precautions:
      "1. Rest in a quiet, dark room during an attack.\n2. Take prescribed triptans early.\n3. Apply cold or warm compresses.\n4. Keep a migraine diary.\n5. Consider preventive medications for frequent migraines.",
  },
  {
    name: "Stroke",
    pathognomonicKeywords: [
      "stroke",
      "facial drooping",
      "arm weakness sudden",
      "speech difficulty sudden",
      "facial paralysis",
      "face drooping",
    ],
    primaryKeywords: [
      "sudden arm weakness",
      "sudden face droop",
      "sudden numbness one side",
      "slurred speech",
    ],
    secondaryKeywords: [
      "sudden severe headache",
      "confusion sudden",
      "vision loss sudden",
      "loss of balance",
    ],
    negativeKeywords: [],
    clusters: [
      ["face drooping", "arm weakness", "speech difficulty"],
      ["sudden numbness", "slurred speech"],
    ],
    cause:
      "Caused by a blood clot blocking brain blood flow (ischemic) or a blood vessel rupturing (hemorrhagic).",
    precautions:
      "1. CALL EMERGENCY SERVICES — use FAST: Face drooping, Arm weakness, Speech, Time.\n2. Note exact time symptoms started.\n3. Do NOT give food or medications.\n4. Begin rehabilitation therapy promptly after treatment.\n5. Control risk factors: hypertension, diabetes, high cholesterol.",
  },
  {
    name: "Epilepsy / Seizure",
    pathognomonicKeywords: [
      "seizure",
      "epilepsy",
      "convulsions",
      "tonic clonic seizure",
      "absence seizure",
    ],
    primaryKeywords: [
      "fits",
      "jerking movements",
      "loss of consciousness suddenly",
      "tongue biting",
    ],
    secondaryKeywords: ["shaking", "confusion after episode"],
    negativeKeywords: [],
    clusters: [
      ["convulsions", "loss of consciousness"],
      ["fits", "jerking movements", "confusion"],
    ],
    cause:
      "Caused by abnormal electrical activity in the brain. Can be idiopathic or due to brain injury, infections, or metabolic issues.",
    precautions:
      "1. During a seizure: keep the person safe and turn on their side.\n2. Do NOT restrain or put anything in their mouth.\n3. Seek emergency care for seizures over 5 minutes.\n4. Take prescribed antiepileptic medications consistently.\n5. Avoid triggers: sleep deprivation, flashing lights, alcohol.",
  },
  {
    name: "Meningitis",
    pathognomonicKeywords: [
      "meningitis",
      "stiff neck fever",
      "neck stiffness fever",
      "non-blanching rash",
      "photophobia fever",
    ],
    primaryKeywords: [
      "severe headache high fever stiff neck",
      "light hurts eyes",
      "rash that doesnt fade",
    ],
    secondaryKeywords: [
      "severe headache",
      "high fever",
      "vomiting",
      "confusion",
      "rash",
    ],
    negativeKeywords: [],
    clusters: [
      ["stiff neck", "high fever", "severe headache"],
      ["photophobia", "fever", "vomiting"],
    ],
    cause:
      "Caused by bacterial or viral infection of the membranes surrounding the brain and spinal cord.",
    precautions:
      "1. SEEK EMERGENCY MEDICAL CARE — bacterial meningitis is life-threatening.\n2. IV antibiotics must start immediately.\n3. Isolate to prevent spread.\n4. Vaccinate with meningococcal vaccines.\n5. Close contacts should receive preventive antibiotics.",
  },
  {
    name: "Tension Headache",
    pathognomonicKeywords: [
      "tension headache",
      "pressure headache",
      "band around head",
      "both sides headache",
      "stress headache",
    ],
    primaryKeywords: ["head pressure", "neck tension", "shoulder tension"],
    secondaryKeywords: ["tight scalp", "headache", "mild pain"],
    negativeKeywords: [
      "throbbing",
      "aura",
      "one side headache",
      "vomiting headache",
      "light sensitivity",
    ],
    clusters: [
      ["band around head", "neck tension"],
      ["both sides headache", "stress"],
    ],
    cause:
      "Caused by muscle tension triggered by stress, poor posture, eye strain, or dehydration.",
    precautions:
      "1. Take OTC pain relievers.\n2. Apply a warm compress to neck and shoulders.\n3. Practice deep breathing and stress reduction.\n4. Maintain good posture.\n5. Stay hydrated and maintain regular sleep.",
  },
  // ── METABOLIC / ENDOCRINE ──────────────────────────────────────────────────
  {
    name: "Type 2 Diabetes",
    pathognomonicKeywords: [
      "diabetes",
      "blood sugar high",
      "hyperglycemia",
      "diabetic",
      "insulin resistance",
    ],
    primaryKeywords: [
      "frequent thirst",
      "frequent urination",
      "increased hunger",
      "slow healing",
    ],
    secondaryKeywords: [
      "blurred vision",
      "fatigue",
      "tingling sensation",
      "numbness",
      "weight loss",
    ],
    negativeKeywords: [],
    clusters: [
      ["frequent thirst", "frequent urination", "fatigue"],
      ["blurred vision", "slow healing", "numbness"],
    ],
    cause:
      "Caused by insulin resistance and impaired insulin secretion. Risk: obesity, inactivity, family history.",
    precautions:
      "1. Monitor blood glucose levels regularly.\n2. Follow a diet low in refined carbohydrates.\n3. Exercise regularly.\n4. Take prescribed medications consistently.\n5. Regular check-ups for eye, kidney, and foot health.",
  },
  {
    name: "Hypothyroidism",
    pathognomonicKeywords: [
      "hypothyroidism",
      "underactive thyroid",
      "low thyroid",
      "thyroid deficiency",
    ],
    primaryKeywords: [
      "cold intolerance",
      "weight gain fatigue",
      "slow heart rate",
    ],
    secondaryKeywords: [
      "fatigue",
      "weight gain",
      "constipation",
      "dry skin",
      "hair loss",
      "depression",
    ],
    negativeKeywords: [],
    clusters: [
      ["fatigue", "weight gain", "cold intolerance"],
      ["hypothyroidism", "hair loss", "dry skin"],
    ],
    cause:
      "Caused by insufficient thyroid hormone production. Common causes: Hashimoto's thyroiditis, iodine deficiency.",
    precautions:
      "1. Take prescribed levothyroxine consistently.\n2. Get regular thyroid function tests.\n3. Avoid taking medication with calcium or iron.\n4. Maintain adequate iodine and selenium intake.\n5. Report chest pain or rapid heartbeat to doctor.",
  },
  {
    name: "Hyperthyroidism",
    pathognomonicKeywords: [
      "hyperthyroidism",
      "overactive thyroid",
      "graves disease",
      "thyroid overactive",
    ],
    primaryKeywords: ["heat intolerance", "bulging eyes", "tremor"],
    secondaryKeywords: [
      "rapid heartbeat",
      "weight loss",
      "sweating",
      "anxiety",
    ],
    negativeKeywords: [],
    clusters: [
      ["rapid heartbeat", "weight loss", "heat intolerance"],
      ["tremor", "anxiety", "sweating"],
    ],
    cause:
      "Caused by excess thyroid hormone. Graves' disease (autoimmune) is most common.",
    precautions:
      "1. Take prescribed antithyroid medications.\n2. Beta-blockers may manage heart rate.\n3. Consider radioactive iodine therapy or surgery.\n4. Monitor thyroid function regularly.\n5. Eye drops and sunglasses for eye symptoms.",
  },
  {
    name: "Gout",
    pathognomonicKeywords: [
      "gout",
      "uric acid",
      "big toe pain",
      "painful big toe",
      "sudden severe joint pain at night",
    ],
    primaryKeywords: ["big toe swollen red", "toe joint extremely painful"],
    secondaryKeywords: [
      "swollen joint",
      "red joint",
      "warm joint",
      "tender joint",
      "kidney stones",
    ],
    negativeKeywords: [],
    clusters: [
      ["big toe pain", "swollen red joint"],
      ["uric acid", "joint pain at night"],
    ],
    cause:
      "Caused by excess uric acid crystallizing in joints. Triggered by red meat, alcohol, and certain medications.",
    precautions:
      "1. Take colchicine or NSAIDs during acute attacks.\n2. Begin urate-lowering therapy (allopurinol) for recurrent gout.\n3. Avoid purine-rich foods: red meat, shellfish, alcohol.\n4. Drink plenty of water.\n5. Maintain a healthy weight.",
  },
  // ── URINARY / RENAL ────────────────────────────────────────────────────────
  {
    name: "Urinary Tract Infection (UTI)",
    pathognomonicKeywords: [
      "uti",
      "burning urination",
      "painful urination",
      "bladder pain",
      "burning when peeing",
    ],
    primaryKeywords: [
      "frequent urination",
      "strong smelling urine",
      "cloudy urine",
      "urgency to urinate",
    ],
    secondaryKeywords: ["blood in urine", "pelvic pain", "mild fever"],
    negativeKeywords: [],
    clusters: [
      ["burning urination", "frequent urination"],
      ["painful urination", "cloudy urine", "pelvic pain"],
    ],
    cause:
      "Caused by bacteria (E. coli) entering the urinary tract. More common in women.",
    precautions:
      "1. See a doctor for antibiotics.\n2. Drink plenty of water.\n3. Urinate frequently and fully.\n4. Wipe front to back.\n5. Cranberry products may help prevent recurrence.",
  },
  {
    name: "Kidney Stones",
    pathognomonicKeywords: [
      "kidney stone",
      "renal calculi",
      "flank pain",
      "back pain radiating groin",
      "colicky pain",
    ],
    primaryKeywords: [
      "pain radiating to groin",
      "waves of severe pain",
      "side and back pain",
    ],
    secondaryKeywords: [
      "blood in urine",
      "nausea",
      "vomiting",
      "frequent urination",
    ],
    negativeKeywords: [],
    clusters: [
      ["flank pain", "blood in urine", "nausea"],
      ["back pain radiating groin", "vomiting"],
    ],
    cause:
      "Formed when minerals crystallize in the kidney. Risk: dehydration, high protein/sodium diet.",
    precautions:
      "1. Drink 2-3 liters water daily to help pass small stones.\n2. Take prescribed pain medications.\n3. Strain urine to collect stone for analysis.\n4. Seek emergency care for severe pain or fever.\n5. Dietary changes based on stone type.",
  },
  {
    name: "Kidney Disease (CKD)",
    pathognomonicKeywords: [
      "kidney disease",
      "chronic kidney",
      "renal failure",
      "kidney failure",
      "dialysis",
    ],
    primaryKeywords: ["decreased urination", "foamy urine", "swelling ankles"],
    secondaryKeywords: ["swollen feet", "fatigue", "nausea"],
    negativeKeywords: [],
    clusters: [
      ["kidney failure", "swollen ankles", "fatigue"],
      ["foamy urine", "decreased urination"],
    ],
    cause:
      "Caused by diabetes, hypertension, or repeated infections gradually reducing kidney function.",
    precautions:
      "1. Control blood pressure and blood sugar.\n2. Follow a kidney-friendly diet.\n3. Avoid NSAIDs and nephrotoxic medications.\n4. Attend regular nephrology appointments.\n5. Prepare for dialysis or transplant evaluation as needed.",
  },
  // ── LIVER ──────────────────────────────────────────────────────────────────
  {
    name: "Hepatitis A",
    pathognomonicKeywords: [
      "hepatitis a",
      "jaundice after travel",
      "contaminated water jaundice",
    ],
    primaryKeywords: [
      "yellow skin",
      "dark urine pale stool",
      "right upper abdomen pain",
    ],
    secondaryKeywords: [
      "jaundice",
      "dark urine",
      "fatigue",
      "nausea",
      "abdominal pain",
      "fever",
    ],
    negativeKeywords: [],
    clusters: [
      ["jaundice", "dark urine", "nausea"],
      ["fever", "fatigue", "jaundice"],
    ],
    cause:
      "Caused by hepatitis A virus, spread through contaminated food or water.",
    precautions:
      "1. Rest and maintain good nutrition.\n2. Avoid alcohol completely.\n3. Practice strict hand hygiene.\n4. Hepatitis A vaccine prevents infection.\n5. Notify household contacts.",
  },
  {
    name: "Hepatitis B",
    pathognomonicKeywords: [
      "hepatitis b",
      "hep b",
      "chronic hepatitis",
      "liver inflammation",
    ],
    primaryKeywords: ["jaundice chronic", "pale stool", "right upper pain"],
    secondaryKeywords: [
      "jaundice",
      "fatigue",
      "abdominal pain",
      "dark urine",
      "nausea",
    ],
    negativeKeywords: [],
    clusters: [["jaundice", "fatigue", "dark urine"]],
    cause:
      "Caused by hepatitis B virus, spread through blood, sexual contact, or mother to child.",
    precautions:
      "1. Get vaccinated.\n2. Take prescribed antiviral medications for chronic cases.\n3. Avoid alcohol.\n4. Inform sexual partners and healthcare providers.\n5. Get regular liver function tests.",
  },
  {
    name: "Liver Cirrhosis",
    pathognomonicKeywords: [
      "cirrhosis",
      "liver cirrhosis",
      "ascites",
      "portal hypertension",
      "liver scarring",
    ],
    primaryKeywords: ["swollen abdomen fluid", "easy bruising", "spider veins"],
    secondaryKeywords: ["jaundice", "fatigue", "confusion", "rectal bleeding"],
    negativeKeywords: [],
    clusters: [["jaundice", "ascites", "easy bruising"]],
    cause:
      "Caused by long-term liver damage from hepatitis, excessive alcohol, or fatty liver disease.",
    precautions:
      "1. Stop alcohol completely.\n2. Take prescribed medications.\n3. Follow a low-sodium diet.\n4. Screen regularly for liver cancer.\n5. Evaluate for liver transplant if advanced.",
  },
  // ── MUSCULOSKELETAL ────────────────────────────────────────────────────────
  {
    name: "Arthritis",
    pathognomonicKeywords: [
      "arthritis",
      "rheumatoid arthritis",
      "osteoarthritis",
      "morning stiffness joints",
      "joint inflammation",
    ],
    primaryKeywords: [
      "stiff joints morning",
      "joint swelling",
      "multiple joint pain",
    ],
    secondaryKeywords: [
      "joint pain",
      "swollen joint",
      "stiff joints",
      "difficulty walking",
    ],
    negativeKeywords: [],
    clusters: [
      ["morning stiffness joints", "joint swelling"],
      ["multiple joint pain", "fatigue"],
    ],
    cause:
      "Osteoarthritis: cartilage breakdown due to aging. Rheumatoid: autoimmune attack on joint tissue.",
    precautions:
      "1. Take prescribed NSAIDs, DMARDs, or biologics.\n2. Perform low-impact exercise.\n3. Apply heat before activity and ice after.\n4. Maintain healthy weight.\n5. Work with a physical therapist.",
  },
  {
    name: "Fibromyalgia",
    pathognomonicKeywords: [
      "fibromyalgia",
      "widespread pain",
      "tender points",
      "all over body pain",
      "chronic widespread pain",
    ],
    primaryKeywords: [
      "pain all over body",
      "tender touch",
      "sleep problems pain",
    ],
    secondaryKeywords: [
      "fatigue",
      "brain fog",
      "memory problems",
      "headache",
      "depression",
    ],
    negativeKeywords: [],
    clusters: [
      ["widespread pain", "fatigue", "sleep problems"],
      ["tender points", "brain fog"],
    ],
    cause:
      "Involves altered pain processing in the central nervous system. Triggered by trauma, infections, or stress.",
    precautions:
      "1. Follow prescribed medications.\n2. Engage in regular low-impact aerobic exercise.\n3. Prioritize sleep hygiene.\n4. Consider cognitive behavioral therapy.\n5. Join a support group.",
  },
  {
    name: "Lower Back Pain",
    pathognomonicKeywords: [
      "lower back pain",
      "lumbar pain",
      "sciatica",
      "spine pain",
      "back ache",
    ],
    primaryKeywords: [
      "back stiffness",
      "radiating leg pain",
      "pain bending",
      "muscle spasm back",
    ],
    secondaryKeywords: ["pain sitting", "back injury"],
    negativeKeywords: [],
    clusters: [["lower back pain", "radiating leg pain"]],
    cause:
      "Commonly caused by muscle strain, herniated disc, arthritis, or poor posture.",
    precautions:
      "1. Apply ice first 48-72 hours, then heat.\n2. Take OTC pain relievers.\n3. Keep moving gently.\n4. Practice proper posture.\n5. Strengthen core through physical therapy.",
  },
  {
    name: "Osteoporosis",
    pathognomonicKeywords: [
      "osteoporosis",
      "bone loss",
      "fragile bones",
      "low bone density",
    ],
    primaryKeywords: ["fracture easily", "height loss", "stooped posture"],
    secondaryKeywords: ["back pain", "fracture"],
    negativeKeywords: [],
    clusters: [["osteoporosis", "fracture easily"]],
    cause:
      "Caused by low bone mineral density due to aging, hormonal changes, or calcium/vitamin D deficiency.",
    precautions:
      "1. Take prescribed bisphosphonates.\n2. Ensure adequate calcium and vitamin D.\n3. Perform weight-bearing exercise.\n4. Remove fall hazards at home.\n5. Get regular bone density scans.",
  },
  {
    name: "Muscle Strain / Sprain",
    pathognomonicKeywords: [
      "muscle strain",
      "pulled muscle",
      "sprain",
      "twisted ankle",
      "muscle tear",
    ],
    primaryKeywords: [
      "after exercise injury",
      "swelling after injury",
      "muscle soreness sudden",
    ],
    secondaryKeywords: ["muscle pain", "stiffness", "muscle spasm"],
    negativeKeywords: [],
    clusters: [["pulled muscle", "swelling after injury"]],
    cause:
      "Caused by overstretching or tearing of muscle fibers or ligaments from sudden movements.",
    precautions:
      "1. Follow RICE: Rest, Ice, Compression, Elevation.\n2. Take ibuprofen to reduce pain and swelling.\n3. Avoid the activity until healed.\n4. Warm up before exercise.\n5. See a physical therapist for persistent pain.",
  },
  // ── MENTAL HEALTH ──────────────────────────────────────────────────────────
  {
    name: "Anxiety / Panic Attack",
    pathognomonicKeywords: [
      "anxiety",
      "panic attack",
      "overwhelming fear",
      "panic",
      "phobia",
    ],
    primaryKeywords: [
      "racing heart anxiety",
      "shortness of breath anxiety",
      "trembling fear",
      "dread",
    ],
    secondaryKeywords: ["heart palpitations", "trembling", "nervous", "worry"],
    negativeKeywords: [],
    clusters: [
      ["panic attack", "racing heart", "shortness of breath"],
      ["anxiety", "trembling", "dread"],
    ],
    cause:
      "Caused by the brain's fight-or-flight response being triggered inappropriately due to stress, genetics, or trauma.",
    precautions:
      "1. Practice deep breathing: inhale 4 counts, hold 4, exhale 6.\n2. Use the 5-4-3-2-1 grounding technique.\n3. Seek Cognitive Behavioral Therapy (CBT).\n4. Regular exercise and sleep reduce anxiety.\n5. Discuss medication options with your doctor.",
  },
  {
    name: "Depression",
    pathognomonicKeywords: [
      "depression",
      "hopelessness",
      "loss of interest",
      "worthlessness",
      "depressed",
      "suicidal thoughts",
    ],
    primaryKeywords: [
      "no motivation",
      "no enjoyment",
      "empty feeling",
      "crying all the time",
    ],
    secondaryKeywords: ["sadness", "fatigue"],
    negativeKeywords: [],
    clusters: [
      ["depression", "hopelessness", "loss of interest"],
      ["sadness", "fatigue", "no motivation"],
    ],
    cause:
      "Caused by biological, psychological, and social factors. Loss, trauma, or chronic stress can trigger episodes.",
    precautions:
      "1. Seek professional help from a therapist or psychiatrist.\n2. Take prescribed antidepressants consistently.\n3. Maintain a routine: sleep, meals, physical activity.\n4. Reach out to trusted friends and family.\n5. Avoid alcohol and recreational drugs.",
  },
  {
    name: "Insomnia",
    pathognomonicKeywords: [
      "insomnia",
      "can't sleep",
      "trouble sleeping",
      "difficulty falling asleep",
      "lying awake",
    ],
    primaryKeywords: ["waking up frequently", "poor sleep quality"],
    secondaryKeywords: ["restless sleep", "tired despite sleeping"],
    negativeKeywords: [],
    clusters: [["can't sleep", "lying awake"]],
    cause:
      "Caused by stress, anxiety, depression, irregular schedules, caffeine, or underlying medical conditions.",
    precautions:
      "1. Maintain a consistent sleep schedule.\n2. Create a relaxing bedtime routine.\n3. Avoid screens, caffeine, and alcohol before bed.\n4. Practice relaxation techniques.\n5. CBT for Insomnia (CBT-I) is highly effective.",
  },
  // ── INFECTIOUS / TROPICAL ──────────────────────────────────────────────────
  {
    name: "Malaria",
    pathognomonicKeywords: [
      "malaria",
      "cyclical fever",
      "fever chills sweating cycle",
      "tropical fever",
      "mosquito bite fever",
    ],
    primaryKeywords: [
      "recurring fever every 2 3 days",
      "fever with shaking chills",
    ],
    secondaryKeywords: [
      "high fever",
      "chills",
      "sweating",
      "headache",
      "muscle aches",
      "nausea",
      "fatigue",
    ],
    negativeKeywords: [],
    clusters: [
      ["cyclical fever", "chills", "sweating"],
      ["fever chills sweating", "headache", "muscle aches"],
    ],
    cause:
      "Caused by Plasmodium parasites transmitted through Anopheles mosquito bites. Common in tropical regions.",
    precautions:
      "1. Seek immediate blood testing and treatment.\n2. Take prescribed antimalarial medications.\n3. Use insect repellent and bed nets.\n4. Take antimalarial prophylaxis before travel.\n5. Stay in air-conditioned or screened accommodation.",
  },
  {
    name: "Dengue Fever",
    pathognomonicKeywords: [
      "dengue",
      "dengue fever",
      "breakbone fever",
      "severe bone pain",
      "pain behind eyes",
    ],
    primaryKeywords: [
      "retro orbital pain",
      "bleeding gums",
      "low platelet",
      "severe joint pain fever",
    ],
    secondaryKeywords: [
      "high fever",
      "severe headache",
      "joint pain",
      "muscle pain",
      "rash",
      "nausea",
    ],
    negativeKeywords: [],
    clusters: [
      ["dengue", "fever", "pain behind eyes"],
      ["high fever", "severe joint pain", "rash"],
    ],
    cause:
      "Caused by dengue virus transmitted by Aedes mosquitoes. Four serotypes exist.",
    precautions:
      "1. Seek medical care and get a dengue blood test.\n2. Rest and drink plenty of fluids.\n3. Take acetaminophen for fever — AVOID aspirin and ibuprofen.\n4. Monitor for warning signs: severe abdominal pain, bleeding.\n5. Eliminate mosquito breeding sites.",
  },
  {
    name: "Typhoid Fever",
    pathognomonicKeywords: [
      "typhoid",
      "typhoid fever",
      "enteric fever",
      "rose spots",
      "sustained fever",
    ],
    primaryKeywords: [
      "step ladder fever",
      "rose colored spots abdomen",
      "constipation then diarrhea fever",
    ],
    secondaryKeywords: ["high fever", "headache", "abdominal pain", "weakness"],
    negativeKeywords: [],
    clusters: [
      ["sustained fever", "headache", "abdominal pain"],
      ["typhoid", "weakness", "constipation"],
    ],
    cause:
      "Caused by Salmonella typhi bacteria, spread through contaminated food and water.",
    precautions:
      "1. Take prescribed antibiotics (ciprofloxacin, azithromycin).\n2. Rest and stay hydrated.\n3. Eat only cooked food and drink safe water.\n4. Get the typhoid vaccine before travel.\n5. Practice strict hand hygiene.",
  },
  {
    name: "HIV/AIDS",
    pathognomonicKeywords: [
      "hiv",
      "aids",
      "human immunodeficiency",
      "antiretroviral",
      "cd4 low",
    ],
    primaryKeywords: ["recurrent infections", "opportunistic infection"],
    secondaryKeywords: [
      "unexplained weight loss",
      "sweating at night",
      "swollen lymph nodes",
      "fatigue",
      "fever",
    ],
    negativeKeywords: [],
    clusters: [
      ["hiv", "recurrent infections", "weight loss"],
      ["night sweats", "swollen lymph nodes", "fatigue"],
    ],
    cause:
      "Caused by HIV virus, transmitted through blood, sexual contact, or mother to child.",
    precautions:
      "1. Start antiretroviral therapy (ART) immediately.\n2. Practice safe sex using condoms.\n3. Never share needles.\n4. Take preventive medications for opportunistic infections.\n5. Get regular CD4 count and viral load monitoring.",
  },
  {
    name: "Leptospirosis",
    pathognomonicKeywords: [
      "leptospirosis",
      "weil's disease",
      "fever after flood",
      "flood fever",
    ],
    primaryKeywords: [
      "high fever sudden after flood",
      "red eyes fever muscle pain",
    ],
    secondaryKeywords: [
      "high fever",
      "headache",
      "muscle pain",
      "red eye",
      "jaundice",
      "vomiting",
    ],
    negativeKeywords: [],
    clusters: [["fever after flood", "muscle pain", "red eye"]],
    cause:
      "Caused by Leptospira bacteria in water contaminated with animal urine. Common after floods.",
    precautions:
      "1. Seek immediate medical care.\n2. Take prescribed antibiotics.\n3. Avoid floodwater contact.\n4. Wear protective footwear in exposed areas.\n5. Take doxycycline prophylaxis for high-risk exposure.",
  },
  {
    name: "Rabies",
    pathognomonicKeywords: [
      "rabies",
      "animal bite fever",
      "hydrophobia",
      "fear of water",
      "dog bite sick",
    ],
    primaryKeywords: [
      "bitten by animal",
      "wound from animal",
      "animal scratch fever",
    ],
    secondaryKeywords: [
      "fever",
      "headache",
      "anxiety",
      "confusion",
      "paralysis",
    ],
    negativeKeywords: [],
    clusters: [["animal bite", "fever", "confusion"]],
    cause:
      "Caused by rabies virus transmitted through the saliva of an infected animal, usually by bite.",
    precautions:
      "1. Wash the wound immediately with soap and water for 15 minutes.\n2. Seek emergency care — post-exposure prophylaxis (PEP) must start immediately.\n3. Complete the full rabies vaccination series.\n4. Report the animal and seek rabies testing if possible.\n5. Untreated rabies is nearly always fatal — do NOT delay.",
  },
  // ── EYE CONDITIONS ─────────────────────────────────────────────────────────
  {
    name: "Conjunctivitis (Pink Eye)",
    pathognomonicKeywords: [
      "pink eye",
      "conjunctivitis",
      "red eye",
      "eye discharge",
      "eye infection",
    ],
    primaryKeywords: ["crusty eyes morning", "sticky eye", "eye crusting"],
    secondaryKeywords: [
      "eye itching",
      "eye burning",
      "watery eye",
      "swollen eyelid",
    ],
    negativeKeywords: [],
    clusters: [
      ["red eye", "eye discharge"],
      ["crusty eyes", "eye itching"],
    ],
    cause:
      "Can be viral, bacterial, allergic, or caused by chemical irritants. Viral and bacterial forms are contagious.",
    precautions:
      "1. Wash hands frequently.\n2. Do not share towels or eye makeup.\n3. Use prescribed antibiotic eye drops for bacterial type.\n4. Apply cool compresses.\n5. Discard and replace eye makeup used during infection.",
  },
  {
    name: "Glaucoma",
    pathognomonicKeywords: [
      "glaucoma",
      "increased eye pressure",
      "tunnel vision",
      "peripheral vision loss",
    ],
    primaryKeywords: [
      "halos around lights",
      "sudden eye pain",
      "vision narrowing",
    ],
    secondaryKeywords: [
      "eye pain",
      "headache around eye",
      "blurred vision",
      "nausea",
    ],
    negativeKeywords: [],
    clusters: [
      ["peripheral vision loss", "eye pressure"],
      ["halos", "blurred vision"],
    ],
    cause: "Caused by increased intraocular pressure damaging the optic nerve.",
    precautions:
      "1. Use prescribed eye drops consistently.\n2. Attend regular eye examinations.\n3. Acute angle-closure is an emergency.\n4. Consider laser or surgery if medications fail.\n5. Inform family members to get screened.",
  },
  // ── ALLERGY / IMMUNE ───────────────────────────────────────────────────────
  {
    name: "Allergic Reaction",
    pathognomonicKeywords: [
      "allergic reaction",
      "hives",
      "anaphylaxis",
      "food allergy",
      "bee sting reaction",
    ],
    primaryKeywords: [
      "allergy",
      "sudden itching after food",
      "swollen throat",
      "lip swelling",
    ],
    secondaryKeywords: [
      "swelling",
      "itching",
      "rash",
      "runny nose",
      "watery eyes",
      "sneezing",
    ],
    negativeKeywords: [],
    clusters: [
      ["hives", "itching", "swelling"],
      ["allergic reaction", "shortness of breath"],
    ],
    cause:
      "Immune system overreacting to a harmless substance such as pollen, pet dander, food, or medications.",
    precautions:
      "1. Identify and avoid known allergens.\n2. Take antihistamines for mild reactions; use EpiPen for severe reactions.\n3. Seek emergency care for anaphylaxis.\n4. Consider allergy testing.\n5. Wear a medical alert bracelet for severe allergies.",
  },
  {
    name: "Lupus (SLE)",
    pathognomonicKeywords: [
      "lupus",
      "sle",
      "butterfly rash",
      "malar rash",
      "systemic lupus",
    ],
    primaryKeywords: [
      "facial rash cheeks",
      "rash sun exposure",
      "joint pain multiple",
    ],
    secondaryKeywords: [
      "fatigue",
      "skin rash",
      "photosensitivity",
      "hair loss",
      "fever",
      "kidney problems",
    ],
    negativeKeywords: [],
    clusters: [
      ["butterfly rash", "joint pain", "fatigue"],
      ["photosensitivity", "hair loss", "fever"],
    ],
    cause:
      "Autoimmune disease where immune system attacks healthy tissues. Triggered by genetics, sunlight, and infections.",
    precautions:
      "1. Take prescribed hydroxychloroquine and corticosteroids.\n2. Use high-SPF sunscreen.\n3. Monitor for organ involvement with regular tests.\n4. Get recommended vaccines.\n5. Maintain regular rheumatology follow-ups.",
  },
  // ── PEDIATRIC ──────────────────────────────────────────────────────────────
  {
    name: "Mumps",
    pathognomonicKeywords: [
      "mumps",
      "swollen parotid",
      "swollen jaw",
      "cheek swelling",
      "salivary gland swelling",
    ],
    primaryKeywords: ["jaw painful swollen", "face swollen sides"],
    secondaryKeywords: [
      "fever",
      "headache",
      "muscle aches",
      "pain chewing",
      "ear pain",
    ],
    negativeKeywords: [],
    clusters: [["cheek swelling", "fever", "pain chewing"]],
    cause:
      "Caused by mumps virus, spread through respiratory droplets. Primarily affects salivary glands.",
    precautions:
      "1. Isolate to prevent spreading.\n2. Apply warm/cool compresses to swollen glands.\n3. Eat soft foods.\n4. Take acetaminophen for pain and fever.\n5. MMR vaccination prevents mumps.",
  },
  {
    name: "Whooping Cough (Pertussis)",
    pathognomonicKeywords: [
      "whooping cough",
      "pertussis",
      "whooping sound",
      "severe coughing fits",
      "paroxysmal cough",
    ],
    primaryKeywords: [
      "violent coughing fits",
      "vomiting after cough",
      "cough worse at night",
    ],
    secondaryKeywords: ["persistent cough", "runny nose", "mild fever"],
    negativeKeywords: [],
    clusters: [["whooping cough", "vomiting after cough"]],
    cause:
      "Caused by Bordetella pertussis bacteria, spread through respiratory droplets. Dangerous in infants.",
    precautions:
      "1. Take prescribed antibiotics (azithromycin).\n2. Isolate until completing 5 days of antibiotics.\n3. Keep patient calm to avoid coughing triggers.\n4. Use a humidifier.\n5. Ensure DTaP vaccination is up to date.",
  },
  // ── BLOOD ──────────────────────────────────────────────────────────────────
  {
    name: "Anemia",
    pathognomonicKeywords: [
      "anemia",
      "iron deficiency",
      "low hemoglobin",
      "pale skin",
      "brittle nails",
    ],
    primaryKeywords: [
      "cold hands",
      "cold feet",
      "pale complexion",
      "irregular heartbeat",
    ],
    secondaryKeywords: ["extreme fatigue", "weakness", "dizziness"],
    negativeKeywords: [],
    clusters: [
      ["fatigue", "pale skin", "dizziness"],
      ["anemia", "cold hands", "brittle nails"],
    ],
    cause:
      "Caused by insufficient red blood cells due to iron deficiency, vitamin B12/folate deficiency, or blood loss.",
    precautions:
      "1. Get a blood test to confirm type.\n2. Take prescribed iron or B12 supplements.\n3. Eat iron-rich foods: meat, beans, spinach.\n4. Combine with vitamin C to enhance iron absorption.\n5. Avoid tea or coffee with meals.",
  },
  {
    name: "Sickle Cell Disease",
    pathognomonicKeywords: [
      "sickle cell",
      "vaso-occlusive crisis",
      "sickle crisis",
      "pain crisis sickle",
    ],
    primaryKeywords: ["severe bone pain episodes", "swollen hands feet baby"],
    secondaryKeywords: [
      "severe pain",
      "fatigue",
      "jaundice",
      "frequent infections",
    ],
    negativeKeywords: [],
    clusters: [["sickle cell", "severe pain episodes"]],
    cause:
      "Caused by an inherited hemoglobin gene mutation producing sickle-shaped red blood cells.",
    precautions:
      "1. Stay well hydrated.\n2. Take prescribed hydroxyurea.\n3. Get vaccinated against pneumococcal infections.\n4. Seek emergency care during a pain crisis.\n5. Attend regular hematology follow-ups.",
  },
  // ── REPRODUCTIVE / STI ─────────────────────────────────────────────────────
  {
    name: "Gonorrhea",
    pathognomonicKeywords: [
      "gonorrhea",
      "urethral discharge",
      "green genital discharge",
      "sexually transmitted gonorrhea",
    ],
    primaryKeywords: ["pus discharge genital", "thick yellow discharge"],
    secondaryKeywords: [
      "burning urination",
      "genital discharge",
      "pelvic pain",
    ],
    negativeKeywords: [],
    clusters: [["genital discharge", "burning urination"]],
    cause:
      "Caused by Neisseria gonorrhoeae bacteria, transmitted through sexual contact.",
    precautions:
      "1. Seek medical care — requires antibiotics.\n2. Notify all recent sexual partners.\n3. Abstain until fully treated.\n4. Use condoms consistently.\n5. Get tested regularly if sexually active.",
  },
  {
    name: "Chlamydia",
    pathognomonicKeywords: ["chlamydia", "chlamydial infection", "silent sti"],
    primaryKeywords: [
      "no symptoms sti",
      "testicular pain",
      "pelvic pain discharge",
    ],
    secondaryKeywords: [
      "abnormal discharge",
      "burning urination",
      "pelvic pain",
    ],
    negativeKeywords: [],
    clusters: [["discharge", "pelvic pain", "burning urination"]],
    cause:
      "Caused by Chlamydia trachomatis bacteria. Most common bacterial STI, often asymptomatic.",
    precautions:
      "1. Get tested — simple urine or swab test.\n2. Take prescribed antibiotics.\n3. Notify and treat all recent partners.\n4. Use condoms consistently.\n5. Annual screenings if sexually active under 25.",
  },
  {
    name: "Polycystic Ovary Syndrome (PCOS)",
    pathognomonicKeywords: [
      "pcos",
      "polycystic ovary",
      "irregular periods",
      "missed period repeatedly",
    ],
    primaryKeywords: [
      "excess hair growth face",
      "acne irregular periods",
      "difficulty conceiving",
    ],
    secondaryKeywords: [
      "weight gain",
      "ovarian cysts",
      "hair thinning",
      "acne",
    ],
    negativeKeywords: [],
    clusters: [
      ["irregular periods", "excess hair", "acne"],
      ["pcos", "difficulty conceiving"],
    ],
    cause:
      "Caused by hormonal imbalance involving excess androgens and insulin resistance.",
    precautions:
      "1. Consult a gynecologist.\n2. Lifestyle changes improve insulin sensitivity.\n3. Take prescribed medications: metformin, oral contraceptives.\n4. Monitor for type 2 diabetes risk.\n5. Track menstrual cycles for medical appointments.",
  },
  {
    name: "Endometriosis",
    pathognomonicKeywords: [
      "endometriosis",
      "painful periods",
      "pain during sex",
      "chronic pelvic pain",
    ],
    primaryKeywords: [
      "heavy periods",
      "pain defecating period",
      "lower back pain period",
    ],
    secondaryKeywords: ["infertility", "bloating", "fatigue"],
    negativeKeywords: [],
    clusters: [["painful periods", "pain during sex", "pelvic pain"]],
    cause:
      "Endometrial-like tissue grows outside the uterus. Exact cause unknown.",
    precautions:
      "1. Consult a gynecologist.\n2. Take prescribed NSAIDs and hormonal therapies.\n3. Surgery may be needed for severe cases.\n4. Maintain a healthy diet.\n5. Discuss fertility preservation if planning a family.",
  },
  // ── EAR / THROAT ───────────────────────────────────────────────────────────
  {
    name: "Tonsillitis",
    pathognomonicKeywords: [
      "tonsillitis",
      "swollen tonsils",
      "red tonsils",
      "inflamed tonsils",
      "white patches throat",
    ],
    primaryKeywords: [
      "pus on tonsils",
      "very sore throat swallowing",
      "bad breath sore throat",
    ],
    secondaryKeywords: [
      "sore throat",
      "fever",
      "difficulty swallowing",
      "swollen lymph nodes",
      "ear pain",
    ],
    negativeKeywords: [],
    clusters: [
      ["swollen tonsils", "sore throat", "fever"],
      ["white patches throat", "difficulty swallowing"],
    ],
    cause:
      "Caused by viral or bacterial infection of the tonsils. Group A Streptococcus is the most common bacterial cause.",
    precautions:
      "1. Rest and drink warm fluids.\n2. Take prescribed antibiotics for bacterial tonsillitis.\n3. Gargle with warm salt water.\n4. Use OTC pain relievers.\n5. Consider tonsillectomy for recurrent cases.",
  },
  {
    name: "Strep Throat",
    pathognomonicKeywords: [
      "strep throat",
      "strep",
      "severe sore throat",
      "white patches throat",
      "throat exudate",
    ],
    primaryKeywords: [
      "throat pain fever no cough",
      "tender neck lymph nodes",
      "pain swallowing severe",
    ],
    secondaryKeywords: [
      "throat pain",
      "difficulty swallowing",
      "fever",
      "headache",
    ],
    negativeKeywords: ["cough", "runny nose"],
    clusters: [
      ["severe sore throat", "fever", "no cough"],
      ["white patches throat", "swollen lymph nodes"],
    ],
    cause:
      "Caused by Group A Streptococcus bacteria, spread through respiratory droplets.",
    precautions:
      "1. See a doctor for strep test and antibiotics.\n2. Complete the full antibiotic course.\n3. Rest and gargle with warm salt water.\n4. Stay home until fever-free for 24 hours.\n5. Replace toothbrush after completing antibiotics.",
  },
  {
    name: "Ear Infection (Otitis Media)",
    pathognomonicKeywords: [
      "ear infection",
      "ear pain",
      "earache",
      "otitis",
      "blocked ear pain",
    ],
    primaryKeywords: ["ear fluid discharge", "pain inside ear"],
    secondaryKeywords: ["fever", "hearing loss", "ear ringing", "headache"],
    negativeKeywords: [],
    clusters: [
      ["ear pain", "fever"],
      ["earache", "hearing loss"],
    ],
    cause:
      "Caused by bacterial or viral infection of the middle ear, often following a cold.",
    precautions:
      "1. See a doctor for assessment.\n2. Apply warm compress for pain relief.\n3. Take OTC pain relievers.\n4. Avoid inserting objects into the ear.\n5. Follow up to ensure full resolution.",
  },
  {
    name: "Vertigo / BPPV",
    pathognomonicKeywords: [
      "vertigo",
      "room spinning",
      "everything spinning",
      "spinning sensation",
      "positional dizziness",
    ],
    primaryKeywords: [
      "dizziness changing position",
      "balance problems standing",
    ],
    secondaryKeywords: [
      "dizziness",
      "nausea",
      "vomiting",
      "hearing loss",
      "ear ringing",
    ],
    negativeKeywords: [],
    clusters: [
      ["spinning sensation", "dizziness", "nausea"],
      ["positional dizziness", "balance problems"],
    ],
    cause:
      "BPPV caused by displaced calcium crystals in inner ear. Meniere's disease and vestibular neuritis are other causes.",
    precautions:
      "1. Perform prescribed Epley maneuver for BPPV.\n2. Move slowly when changing positions.\n3. Take prescribed vestibular suppressants during severe episodes.\n4. Avoid caffeine, salt, alcohol for Meniere's.\n5. Seek immediate care if stroke symptoms are present.",
  },
  // ── DEHYDRATION / HEAT ────────────────────────────────────────────────────
  {
    name: "Dehydration",
    pathognomonicKeywords: [
      "dehydration",
      "extreme thirst",
      "sunken eyes",
      "dry mouth",
      "not drinking water",
    ],
    primaryKeywords: [
      "dark urine",
      "no urination",
      "very thirsty",
      "lightheaded",
    ],
    secondaryKeywords: ["dizziness", "dry skin", "fatigue", "headache"],
    negativeKeywords: [],
    clusters: [
      ["extreme thirst", "dark urine", "dizziness"],
      ["dry mouth", "no urination", "fatigue"],
    ],
    cause:
      "Caused by insufficient fluid intake or excessive loss through sweating, vomiting, or diarrhea.",
    precautions:
      "1. Drink water immediately.\n2. Use oral rehydration solutions for moderate cases.\n3. Avoid caffeine and alcohol.\n4. Eat water-rich foods.\n5. Seek emergency care for severe dehydration.",
  },
  {
    name: "Heat Exhaustion / Heat Stroke",
    pathognomonicKeywords: [
      "heat stroke",
      "heat exhaustion",
      "overheating",
      "hot environment prolonged",
    ],
    primaryKeywords: [
      "very hot skin not sweating",
      "confusion after heat",
      "no sweat high temperature",
    ],
    secondaryKeywords: [
      "heavy sweating",
      "weak pulse",
      "muscle cramps",
      "dizziness",
      "nausea",
      "faintness",
    ],
    negativeKeywords: [],
    clusters: [
      ["heat stroke", "confusion", "high temperature"],
      ["heavy sweating", "muscle cramps", "dizziness"],
    ],
    cause: "Caused by prolonged heat exposure combined with dehydration.",
    precautions:
      "1. Move to cool area immediately.\n2. Drink cool water slowly.\n3. Apply cool wet cloths.\n4. Remove excess clothing.\n5. Seek emergency care if confusion or very high temperature develops.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK RESPONSE
// ─────────────────────────────────────────────────────────────────────────────
const GENERAL_RESPONSE: AnalysisResult = {
  disease: "Symptoms Require Professional Evaluation",
  cause:
    "The symptoms described do not clearly match a specific condition in our database. This may be due to a combination of symptoms, an early-stage illness, an unusual presentation, or a condition requiring clinical testing.",
  precautions:
    "1. Consult a healthcare professional as soon as possible for a proper diagnosis.\n2. Keep a symptom diary: note when symptoms started, their severity, and any triggers.\n3. Stay hydrated and get adequate rest.\n4. Avoid self-medicating without professional guidance.\n5. Seek emergency care if symptoms include severe chest pain, difficulty breathing, sudden weakness, or confusion.",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply synonym expansion to the input text.
 * 1. Appends medical equivalents of any colloquial phrases found (SYNONYM_MAP).
 * 2. Applies regex-based plain-language patterns (PLAIN_LANGUAGE_PATTERNS).
 * Both steps append to the text so original words are preserved.
 */
function expandSynonyms(text: string): string {
  let expanded = text.toLowerCase();

  // Pass 1 – exact phrase synonym map
  for (const [colloquial, medical] of Object.entries(SYNONYM_MAP)) {
    if (expanded.includes(colloquial.toLowerCase())) {
      expanded += ` ${medical}`;
    }
  }

  // Pass 2 – regex plain-language patterns
  for (const { pattern, inject } of PLAIN_LANGUAGE_PATTERNS) {
    if (pattern.test(expanded)) {
      expanded += ` ${inject}`;
    }
  }

  return expanded;
}

/**
 * Score a single keyword against the expanded text.
 * Exact match → 1.0
 * Multi-word partial match (≥70% words of length>3 matched) → 0.6
 */
function keywordScore(keyword: string, expandedText: string): number {
  const kw = keyword.toLowerCase();
  if (expandedText.includes(kw)) return 1;
  const kwWords = kw.split(/\s+/);
  if (kwWords.length > 1) {
    const matched = kwWords.filter(
      (w) => w.length > 3 && expandedText.includes(w),
    );
    if (matched.length >= Math.ceil(kwWords.length * 0.7)) return 0.6;
  }
  return 0;
}

/**
 * Cluster bonus: award extra points when multiple symptoms from a cluster
 * co-occur in the description. This strongly differentiates conditions that
 * share individual keywords.
 */
function clusterBonus(
  clusters: string[][] | undefined,
  expandedText: string,
): number {
  if (!clusters) return 0;
  let bonus = 0;
  for (const cluster of clusters) {
    const hits = cluster.filter((kw) => keywordScore(kw, expandedText) > 0);
    if (hits.length >= 2) bonus += hits.length * 1.5; // 1.5 pts per co-occurring symptom
  }
  return bonus;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeSymptoms(symptomsText: string): AnalysisResult {
  const expanded = expandSynonyms(symptomsText);

  // Track top-2 scores for confidence gap check
  let bestMatch: ConditionDefinition | null = null;
  let bestScore = 0;
  let secondScore = 0;

  for (const condition of CONDITIONS) {
    let score = 0;

    // Pathognomonic keywords: 5 pts each (highly diagnostic)
    for (const keyword of condition.pathognomonicKeywords) {
      score += keywordScore(keyword, expanded) * 5;
    }

    // Primary keywords: 3 pts each
    for (const keyword of condition.primaryKeywords) {
      score += keywordScore(keyword, expanded) * 3;
    }

    // Secondary keywords: 1 pt each
    for (const keyword of condition.secondaryKeywords) {
      score += keywordScore(keyword, expanded) * 1;
    }

    // Cluster co-occurrence bonus
    score += clusterBonus(condition.clusters, expanded);

    // Negative keywords: subtract 5 pts each (strong disambiguation)
    if (condition.negativeKeywords) {
      for (const keyword of condition.negativeKeywords) {
        if (keywordScore(keyword, expanded) > 0) {
          score -= 5;
        }
      }
    }

    if (score > bestScore) {
      secondScore = bestScore;
      bestScore = score;
      bestMatch = condition;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }

  // Minimum confidence threshold — avoid guessing on vague input
  if (!bestMatch || bestScore < 2) {
    return GENERAL_RESPONSE;
  }

  // If the top-2 scores are too close together, reduce false confidence
  // (gap < 2 with both scoring > 4 means ambiguous symptoms)
  if (bestScore - secondScore < 2 && secondScore > 4) {
    return GENERAL_RESPONSE;
  }

  return {
    disease: bestMatch.name,
    cause: bestMatch.cause,
    precautions: bestMatch.precautions,
  };
}

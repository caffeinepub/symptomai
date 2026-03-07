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

  // ── CANCER (COMMON RECOGNIZABLE SYMPTOM PATTERNS) ──────────────────────────
  {
    name: "Lung Cancer",
    pathognomonicKeywords: [
      "lung cancer",
      "pulmonary malignancy",
      "hemoptysis persistent",
    ],
    primaryKeywords: [
      "cough worsening weeks",
      "blood in cough persistent",
      "unexplained weight loss cough",
    ],
    secondaryKeywords: [
      "persistent cough",
      "chest pain",
      "shortness of breath",
      "hoarseness",
      "fatigue",
      "unexplained weight loss",
    ],
    negativeKeywords: [],
    clusters: [
      ["persistent cough", "blood in cough", "weight loss"],
      ["chest pain", "shortness of breath", "fatigue"],
    ],
    cause:
      "Most commonly caused by long-term smoking. Other causes include radon gas, asbestos, and air pollution.",
    precautions:
      "1. Seek immediate medical evaluation and imaging.\n2. Do not ignore persistent cough lasting over 3 weeks.\n3. Stop smoking immediately.\n4. Follow prescribed treatment plan.\n5. Attend all follow-up appointments.",
  },
  {
    name: "Breast Cancer",
    pathognomonicKeywords: [
      "breast cancer",
      "breast lump",
      "nipple discharge blood",
      "breast mass",
    ],
    primaryKeywords: [
      "lump in breast",
      "breast skin dimpling",
      "nipple inversion",
    ],
    secondaryKeywords: [
      "breast pain",
      "swollen armpit",
      "breast swelling",
      "skin changes breast",
    ],
    negativeKeywords: [],
    clusters: [
      ["breast lump", "skin changes breast"],
      ["nipple discharge", "armpit swelling"],
    ],
    cause:
      "Caused by abnormal cell growth in breast tissue, influenced by hormones, genetics (BRCA1/2), and lifestyle factors.",
    precautions:
      "1. Seek immediate medical evaluation.\n2. Perform monthly self-breast exams.\n3. Attend regular mammograms.\n4. Follow prescribed treatment.\n5. Genetic counseling if family history present.",
  },
  {
    name: "Colorectal Cancer",
    pathognomonicKeywords: [
      "colorectal cancer",
      "colon cancer",
      "rectal cancer",
      "bowel cancer",
    ],
    primaryKeywords: [
      "rectal bleeding persistent",
      "change in bowel habits weeks",
      "pencil thin stool",
    ],
    secondaryKeywords: [
      "blood in stool",
      "abdominal pain",
      "weight loss",
      "fatigue",
      "constipation",
      "diarrhea",
    ],
    negativeKeywords: [],
    clusters: [["rectal bleeding", "change in bowel habits", "weight loss"]],
    cause:
      "Caused by abnormal cell growth in the colon or rectum. Risk: age, family history, polyps, inflammatory bowel disease.",
    precautions:
      "1. Seek immediate colonoscopy evaluation.\n2. Regular screening from age 45.\n3. Follow high-fiber, low-red-meat diet.\n4. Maintain healthy weight.\n5. Follow prescribed treatment plan.",
  },
  {
    name: "Cervical Cancer",
    pathognomonicKeywords: [
      "cervical cancer",
      "abnormal pap smear",
      "hpv cervical",
    ],
    primaryKeywords: [
      "abnormal vaginal bleeding",
      "bleeding after intercourse",
      "watery vaginal discharge",
    ],
    secondaryKeywords: ["pelvic pain", "lower back pain", "leg swelling"],
    negativeKeywords: [],
    clusters: [["abnormal vaginal bleeding", "pelvic pain"]],
    cause:
      "Caused by persistent infection with high-risk HPV strains. Detected early through Pap smears.",
    precautions:
      "1. Get regular Pap smears.\n2. Get HPV vaccination.\n3. Report any abnormal bleeding to a doctor.\n4. Follow prescribed treatment.\n5. Avoid smoking.",
  },
  {
    name: "Leukemia",
    pathognomonicKeywords: [
      "leukemia",
      "blood cancer",
      "white blood cell cancer",
      "bone marrow cancer",
    ],
    primaryKeywords: [
      "easy bruising",
      "frequent infections",
      "bone pain severe",
      "swollen lymph nodes painless",
    ],
    secondaryKeywords: [
      "fatigue extreme",
      "pale skin",
      "unexplained weight loss",
      "fever recurrent",
      "bleeding gums",
    ],
    negativeKeywords: [],
    clusters: [
      ["easy bruising", "frequent infections", "bone pain"],
      ["fatigue", "pale skin", "recurrent fever"],
    ],
    cause:
      "Caused by abnormal white blood cell production in bone marrow. Risk: radiation, genetic disorders, certain chemicals.",
    precautions:
      "1. Seek immediate hematology evaluation.\n2. Complete prescribed chemotherapy or targeted therapy.\n3. Avoid infections — maintain strict hygiene.\n4. Monitor blood counts regularly.\n5. Consider bone marrow transplant if recommended.",
  },

  // ── ADDITIONAL INFECTIOUS DISEASES ─────────────────────────────────────────
  {
    name: "Chickungunya",
    pathognomonicKeywords: [
      "chikungunya",
      "joint pain fever mosquito",
      "debilitating joint pain",
    ],
    primaryKeywords: [
      "severe joint pain both sides",
      "sudden high fever joint pain",
    ],
    secondaryKeywords: [
      "fever",
      "rash",
      "joint pain",
      "muscle pain",
      "headache",
      "fatigue",
    ],
    negativeKeywords: [],
    clusters: [["sudden fever", "severe joint pain", "rash"]],
    cause:
      "Caused by chikungunya virus transmitted by Aedes mosquitoes. Common in tropical regions.",
    precautions:
      "1. Rest and drink fluids.\n2. Take acetaminophen for pain — avoid aspirin and ibuprofen.\n3. Use mosquito repellent.\n4. Eliminate standing water around home.\n5. Joint pain may persist weeks to months.",
  },
  {
    name: "Zika Virus",
    pathognomonicKeywords: ["zika", "zika virus", "zika fever"],
    primaryKeywords: ["mild fever rash joint pain", "red eye fever rash"],
    secondaryKeywords: [
      "fever",
      "rash",
      "joint pain",
      "red eye",
      "headache",
      "muscle pain",
    ],
    negativeKeywords: [],
    clusters: [["fever", "rash", "red eye", "joint pain"]],
    cause:
      "Caused by Zika virus transmitted by Aedes mosquitoes. Can cause severe birth defects if contracted during pregnancy.",
    precautions:
      "1. Pregnant women must avoid areas with Zika transmission.\n2. Use mosquito repellent.\n3. Practice safe sex during and after travel.\n4. Rest and stay hydrated.\n5. Report to doctor immediately if pregnant and exposed.",
  },
  {
    name: "Ebola",
    pathognomonicKeywords: [
      "ebola",
      "ebola virus",
      "hemorrhagic fever",
      "bleeding from orifices",
    ],
    primaryKeywords: [
      "sudden high fever weakness vomiting",
      "internal bleeding",
      "bloody diarrhea sudden severe",
    ],
    secondaryKeywords: [
      "high fever",
      "vomiting",
      "diarrhea",
      "rash",
      "bleeding",
    ],
    negativeKeywords: [],
    clusters: [["high fever", "vomiting", "internal bleeding"]],
    cause:
      "Caused by Ebola virus, spread through direct contact with blood or body fluids of infected persons or animals.",
    precautions:
      "1. Seek emergency isolation and medical care immediately.\n2. Avoid contact with infected individuals.\n3. Supportive care includes fluids and treating infections.\n4. Contact tracing of all exposed individuals.\n5. Follow health authority guidelines strictly.",
  },
  {
    name: "Yellow Fever",
    pathognomonicKeywords: [
      "yellow fever",
      "jaundice fever mosquito",
      "hemorrhagic jaundice fever",
    ],
    primaryKeywords: ["fever jaundice bleeding"],
    secondaryKeywords: [
      "high fever",
      "jaundice",
      "headache",
      "muscle aches",
      "vomiting",
      "bleeding",
    ],
    negativeKeywords: [],
    clusters: [["fever", "jaundice", "bleeding"]],
    cause:
      "Caused by yellow fever virus transmitted by Aedes and Haemagogus mosquitoes in tropical Africa and South America.",
    precautions:
      "1. Get yellow fever vaccination before travel.\n2. Use mosquito repellent and bed nets.\n3. Seek immediate medical care.\n4. Supportive treatment for organ failure.\n5. Hospitalization for severe cases.",
  },
  {
    name: "Monkeypox",
    pathognomonicKeywords: [
      "monkeypox",
      "mpox",
      "pox rash lymph nodes",
      "monkeypox rash",
    ],
    primaryKeywords: [
      "rash starts face spreads body",
      "swollen lymph nodes rash",
      "pox lesions",
    ],
    secondaryKeywords: [
      "fever",
      "rash",
      "swollen lymph nodes",
      "headache",
      "muscle aches",
      "fluid filled blisters",
    ],
    negativeKeywords: [],
    clusters: [["rash", "swollen lymph nodes", "fever"]],
    cause:
      "Caused by monkeypox virus, spread through close contact with infected person, animal, or contaminated material.",
    precautions:
      "1. Isolate and seek medical care.\n2. Cover rash with clean dressing.\n3. Avoid contact with immunocompromised individuals.\n4. Practice good hand hygiene.\n5. Smallpox vaccine provides cross-protection.",
  },
  {
    name: "Typhus",
    pathognomonicKeywords: [
      "typhus",
      "rickettsia",
      "louse-borne fever",
      "tick fever typhus",
    ],
    primaryKeywords: ["fever rash lice", "sudden high fever rash trunk"],
    secondaryKeywords: [
      "high fever",
      "headache",
      "rash",
      "muscle pain",
      "confusion",
    ],
    negativeKeywords: [],
    clusters: [["sudden fever", "rash", "headache"]],
    cause:
      "Caused by Rickettsia bacteria transmitted by lice, fleas, or ticks. Associated with poor hygiene conditions.",
    precautions:
      "1. Take prescribed doxycycline antibiotics.\n2. Eliminate lice, fleas, or ticks.\n3. Improve hygiene and sanitation.\n4. Wash clothes and bedding in hot water.\n5. Seek hospitalization for severe cases.",
  },
  {
    name: "Plague",
    pathognomonicKeywords: [
      "plague",
      "bubonic plague",
      "swollen lymph node groin armpit sudden fever",
      "bubo",
    ],
    primaryKeywords: [
      "large painful swollen lymph node fever",
      "sudden high fever bubo",
    ],
    secondaryKeywords: [
      "high fever",
      "chills",
      "weakness",
      "swollen lymph nodes",
      "headache",
    ],
    negativeKeywords: [],
    clusters: [["sudden fever", "large swollen lymph node"]],
    cause:
      "Caused by Yersinia pestis bacteria, transmitted by fleas from rodents.",
    precautions:
      "1. Seek emergency medical care.\n2. Take prescribed antibiotics immediately.\n3. Isolate the patient.\n4. Report to health authorities.\n5. Contact tracing of all exposed individuals.",
  },
  {
    name: "Tetanus",
    pathognomonicKeywords: [
      "tetanus",
      "jaw locked",
      "lockjaw",
      "muscle spasms wound",
    ],
    primaryKeywords: [
      "jaw stiffness",
      "neck stiffness spasm",
      "muscle stiffness after wound",
    ],
    secondaryKeywords: [
      "muscle stiffness",
      "spasms",
      "difficulty swallowing",
      "fever",
    ],
    negativeKeywords: [],
    clusters: [["jaw stiffness", "muscle spasms", "neck stiffness"]],
    cause:
      "Caused by toxin produced by Clostridium tetani bacteria entering through wounds.",
    precautions:
      "1. Seek emergency care immediately.\n2. Ensure tetanus vaccination is up to date.\n3. Clean all wounds thoroughly.\n4. Tetanus immune globulin may be administered.\n5. Hospitalization required for treatment.",
  },
  {
    name: "Diphtheria",
    pathognomonicKeywords: [
      "diphtheria",
      "grey membrane throat",
      "thick coating throat",
      "bull neck",
    ],
    primaryKeywords: ["grey throat coating", "thick membrane tonsils"],
    secondaryKeywords: [
      "sore throat",
      "fever",
      "swollen neck",
      "difficulty swallowing",
      "hoarseness",
    ],
    negativeKeywords: [],
    clusters: [["sore throat", "grey membrane throat", "swollen neck"]],
    cause:
      "Caused by Corynebacterium diphtheriae bacteria, spread through respiratory droplets.",
    precautions:
      "1. Seek emergency care.\n2. Administer diphtheria antitoxin.\n3. Take prescribed antibiotics.\n4. Isolate patient strictly.\n5. Ensure DTP vaccination is up to date.",
  },
  {
    name: "Polio",
    pathognomonicKeywords: [
      "polio",
      "poliomyelitis",
      "paralysis in child fever",
      "limb weakness fever child",
    ],
    primaryKeywords: ["sudden limb weakness", "one limb weakness fever"],
    secondaryKeywords: [
      "fever",
      "muscle weakness",
      "paralysis",
      "headache",
      "stiff neck",
    ],
    negativeKeywords: [],
    clusters: [["sudden weakness", "fever", "limb paralysis"]],
    cause:
      "Caused by poliovirus, spread through contaminated water or food. Largely eradicated through vaccination.",
    precautions:
      "1. Ensure full polio vaccination.\n2. Practice strict hand hygiene.\n3. Seek immediate medical care for any sudden limb weakness.\n4. Physiotherapy for affected limbs.\n5. Report suspected cases to health authorities.",
  },
  {
    name: "Anthrax",
    pathognomonicKeywords: [
      "anthrax",
      "black eschar skin",
      "black painless skin lesion",
      "cutaneous anthrax",
    ],
    primaryKeywords: ["painless black skin ulcer", "skin lesion black center"],
    secondaryKeywords: ["fever", "skin lesion", "swelling", "fatigue"],
    negativeKeywords: [],
    clusters: [["black skin ulcer", "fever", "swelling"]],
    cause:
      "Caused by Bacillus anthracis spores entering through skin, inhalation, or ingestion. Associated with livestock contact.",
    precautions:
      "1. Seek immediate medical care.\n2. Take prescribed antibiotics (ciprofloxacin).\n3. Report to health authorities — potential bioterrorism agent.\n4. Avoid contact with infected animals or products.\n5. Anthrax vaccine for at-risk individuals.",
  },
  {
    name: "Brucellosis",
    pathognomonicKeywords: [
      "brucellosis",
      "undulant fever",
      "fever from animals",
      "animal contact fever",
    ],
    primaryKeywords: [
      "fluctuating fever weeks",
      "joint pain fever after animal contact",
    ],
    secondaryKeywords: [
      "fever",
      "fatigue",
      "joint pain",
      "sweating",
      "back pain",
      "loss of appetite",
    ],
    negativeKeywords: [],
    clusters: [["fever", "joint pain", "animal contact"]],
    cause:
      "Caused by Brucella bacteria from infected animals or unpasteurized dairy products.",
    precautions:
      "1. Take prescribed antibiotic combination therapy.\n2. Avoid unpasteurized dairy products.\n3. Use protective equipment when handling animals.\n4. Boil or pasteurize milk.\n5. Regular follow-up to prevent relapse.",
  },
  {
    name: "Schistosomiasis",
    pathognomonicKeywords: [
      "schistosomiasis",
      "bilharzia",
      "blood in urine after swimming africa",
    ],
    primaryKeywords: [
      "blood in urine after freshwater swimming",
      "liver spleen enlargement",
    ],
    secondaryKeywords: [
      "fever",
      "rash",
      "abdominal pain",
      "blood in urine",
      "fatigue",
    ],
    negativeKeywords: [],
    clusters: [["blood in urine", "freshwater swimming", "fever"]],
    cause:
      "Caused by Schistosoma parasites in freshwater contaminated with human feces.",
    precautions:
      "1. Take prescribed praziquantel.\n2. Avoid swimming in freshwater in endemic areas.\n3. Use safe water sources.\n4. Regular monitoring for organ damage.\n5. Mass drug administration in endemic areas.",
  },
  {
    name: "Leishmaniasis",
    pathognomonicKeywords: [
      "leishmaniasis",
      "kala-azar",
      "sandfly fever non-healing ulcer",
    ],
    primaryKeywords: ["non-healing skin ulcer", "enlarged spleen liver fever"],
    secondaryKeywords: [
      "fever",
      "weight loss",
      "fatigue",
      "skin ulcer",
      "swollen lymph nodes",
    ],
    negativeKeywords: [],
    clusters: [["non-healing ulcer", "fever", "weight loss"]],
    cause:
      "Caused by Leishmania parasites transmitted by sandfly bites. Common in tropical and subtropical regions.",
    precautions:
      "1. Seek immediate medical care and diagnosis.\n2. Take prescribed antiparasitic medications.\n3. Use sandfly repellent and bed nets.\n4. Avoid outdoor activities at peak sandfly times.\n5. Regular monitoring of organ function.",
  },
  {
    name: "Trypanosomiasis (Sleeping Sickness)",
    pathognomonicKeywords: [
      "sleeping sickness",
      "trypanosomiasis",
      "tsetse fly fever",
      "excessive sleeping fever africa",
    ],
    primaryKeywords: [
      "extreme daytime sleepiness fever",
      "confused drowsy fever",
    ],
    secondaryKeywords: [
      "fever",
      "headache",
      "fatigue",
      "confusion",
      "swollen lymph nodes",
    ],
    negativeKeywords: [],
    clusters: [["excessive sleepiness", "confusion", "fever"]],
    cause:
      "Caused by Trypanosoma parasites transmitted by tsetse flies in sub-Saharan Africa.",
    precautions:
      "1. Seek immediate medical care.\n2. Take prescribed antiparasitic medications.\n3. Avoid tsetse fly habitats.\n4. Use insect repellent and protective clothing.\n5. Report to health authorities.",
  },

  // ── RESPIRATORY (ADDITIONAL) ─────────────────────────────────────────────────
  {
    name: "Pulmonary Embolism",
    pathognomonicKeywords: [
      "pulmonary embolism",
      "blood clot lung",
      "pe lung clot",
    ],
    primaryKeywords: [
      "sudden shortness of breath chest pain",
      "coughing blood sudden breathlessness",
    ],
    secondaryKeywords: [
      "shortness of breath",
      "chest pain",
      "rapid heartbeat",
      "blood in cough",
      "leg swelling",
    ],
    negativeKeywords: [],
    clusters: [["sudden shortness of breath", "chest pain", "blood in cough"]],
    cause:
      "A blood clot travels to the lungs, typically from a deep vein in the leg (DVT).",
    precautions:
      "1. SEEK EMERGENCY CARE IMMEDIATELY.\n2. Take prescribed anticoagulants.\n3. Move regularly during long trips.\n4. Wear compression stockings.\n5. Treat underlying DVT.",
  },
  {
    name: "COPD (Chronic Obstructive Pulmonary Disease)",
    pathognomonicKeywords: [
      "copd",
      "emphysema",
      "chronic obstructive",
      "barrel chest",
    ],
    primaryKeywords: [
      "chronic cough smoker",
      "worsening breathlessness years",
      "productive morning cough",
    ],
    secondaryKeywords: [
      "shortness of breath",
      "chronic cough",
      "wheezing",
      "fatigue",
      "mucus",
    ],
    negativeKeywords: [],
    clusters: [["chronic cough", "shortness of breath", "smoking history"]],
    cause:
      "Caused by long-term irritant exposure, most commonly cigarette smoke, causing irreversible airway damage.",
    precautions:
      "1. Stop smoking immediately.\n2. Use prescribed bronchodilators and steroids.\n3. Pursue pulmonary rehabilitation.\n4. Get pneumococcal and flu vaccines.\n5. Avoid air pollutants.",
  },
  {
    name: "Pleural Effusion",
    pathognomonicKeywords: [
      "pleural effusion",
      "fluid around lung",
      "water on lungs",
    ],
    primaryKeywords: [
      "one side chest heaviness breathing",
      "breathlessness lying flat",
    ],
    secondaryKeywords: [
      "shortness of breath",
      "chest pain",
      "dry cough",
      "fever",
    ],
    negativeKeywords: [],
    clusters: [["shortness of breath", "one side chest pain"]],
    cause:
      "Caused by heart failure, pneumonia, cancer, tuberculosis, or liver disease causing fluid to accumulate around lungs.",
    precautions:
      "1. Seek medical evaluation immediately.\n2. Treat the underlying cause.\n3. Thoracentesis to drain fluid if needed.\n4. Monitor for recurrence.\n5. Regular follow-up imaging.",
  },
  {
    name: "Lung Abscess",
    pathognomonicKeywords: [
      "lung abscess",
      "foul smelling sputum cough",
      "pus cough cavity lung",
    ],
    primaryKeywords: [
      "coughing foul smelling phlegm",
      "chest pain high fever cough",
    ],
    secondaryKeywords: [
      "fever",
      "productive cough",
      "weight loss",
      "night sweats",
      "fatigue",
    ],
    negativeKeywords: [],
    clusters: [["foul sputum", "fever", "chest pain"]],
    cause:
      "Caused by bacterial infection creating a pus-filled cavity in the lung, often following aspiration pneumonia.",
    precautions:
      "1. Seek immediate medical care.\n2. Take prolonged antibiotic therapy.\n3. Postural drainage may be recommended.\n4. Surgical drainage if antibiotics fail.\n5. Follow up with imaging.",
  },
  {
    name: "Allergic Rhinitis (Hay Fever)",
    pathognomonicKeywords: [
      "allergic rhinitis",
      "hay fever",
      "seasonal allergy nose",
      "pollen allergy",
    ],
    primaryKeywords: ["sneezing runny nose allergy", "itchy nose eyes pollen"],
    secondaryKeywords: [
      "runny nose",
      "sneezing",
      "itchy eyes",
      "nasal congestion",
      "watery eyes",
    ],
    negativeKeywords: ["fever", "body aches"],
    clusters: [["sneezing", "runny nose", "itchy eyes"]],
    cause:
      "Immune system overreaction to airborne allergens like pollen, dust mites, or animal dander.",
    precautions:
      "1. Take antihistamines.\n2. Use nasal corticosteroid sprays.\n3. Avoid known allergens.\n4. Keep windows closed during high pollen season.\n5. Consider immunotherapy (allergy shots).",
  },

  // ── GASTROINTESTINAL (ADDITIONAL) ────────────────────────────────────────────
  {
    name: "Ulcerative Colitis",
    pathognomonicKeywords: [
      "ulcerative colitis",
      "bloody diarrhea chronic colitis",
      "uc bowel",
    ],
    primaryKeywords: [
      "blood mucus diarrhea",
      "urgent diarrhea blood",
      "rectal bleeding diarrhea",
    ],
    secondaryKeywords: [
      "abdominal pain",
      "diarrhea",
      "rectal bleeding",
      "fatigue",
      "weight loss",
    ],
    negativeKeywords: [],
    clusters: [["bloody diarrhea", "abdominal cramping", "urgency"]],
    cause:
      "Autoimmune inflammatory bowel disease affecting the colon lining. Exact cause unknown.",
    precautions:
      "1. Take prescribed aminosalicylates and immunosuppressants.\n2. Avoid known trigger foods.\n3. Regular colonoscopy.\n4. Manage stress.\n5. Work with a gastroenterologist.",
  },
  {
    name: "Celiac Disease",
    pathognomonicKeywords: [
      "celiac disease",
      "gluten intolerance celiac",
      "wheat allergy intestine",
    ],
    primaryKeywords: [
      "diarrhea after gluten wheat",
      "bloating after bread pasta",
    ],
    secondaryKeywords: [
      "diarrhea",
      "bloating",
      "fatigue",
      "weight loss",
      "abdominal pain",
      "anemia",
    ],
    negativeKeywords: [],
    clusters: [["diarrhea", "bloating", "after wheat bread"]],
    cause: "Autoimmune reaction to gluten damaging the small intestine lining.",
    precautions:
      "1. Follow strict gluten-free diet.\n2. Read all food labels carefully.\n3. Work with a dietitian.\n4. Take prescribed supplements.\n5. Regular monitoring of nutritional deficiencies.",
  },
  {
    name: "Pancreatitis",
    pathognomonicKeywords: [
      "pancreatitis",
      "pancreas inflammation",
      "upper abdominal pain radiating back",
    ],
    primaryKeywords: [
      "severe upper abdominal pain radiates back",
      "pain worse after fatty food",
    ],
    secondaryKeywords: [
      "nausea",
      "vomiting",
      "abdominal pain",
      "fever",
      "loss of appetite",
    ],
    negativeKeywords: [],
    clusters: [
      ["severe upper abdominal pain", "radiating back pain", "nausea"],
    ],
    cause:
      "Caused by gallstones, excessive alcohol, or high triglycerides causing pancreatic enzyme self-digestion.",
    precautions:
      "1. Seek emergency care for severe cases.\n2. Fast to rest the pancreas.\n3. IV fluids and pain management in hospital.\n4. Avoid alcohol completely.\n5. Low-fat diet after recovery.",
  },
  {
    name: "Gallstones / Gallbladder Disease",
    pathognomonicKeywords: [
      "gallstones",
      "cholelithiasis",
      "gallbladder attack",
      "biliary colic",
    ],
    primaryKeywords: [
      "right upper abdomen pain after fatty food",
      "pain below right rib cage",
    ],
    secondaryKeywords: [
      "nausea",
      "vomiting",
      "pain after eating",
      "bloating",
      "jaundice",
    ],
    negativeKeywords: [],
    clusters: [["right upper abdomen pain", "after fatty food", "nausea"]],
    cause:
      "Caused by bile becoming concentrated and forming crystals/stones in the gallbladder.",
    precautions:
      "1. Seek medical evaluation for diagnosis.\n2. Low-fat diet to reduce attacks.\n3. Cholecystectomy (gallbladder removal) is curative.\n4. Avoid fasting — eat regular meals.\n5. Maintain healthy weight.",
  },
  {
    name: "Hepatitis C",
    pathognomonicKeywords: ["hepatitis c", "hep c", "hcv", "silent hepatitis"],
    primaryKeywords: [
      "jaundice intravenous drug",
      "liver inflammation blood contact",
    ],
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
      "Caused by hepatitis C virus, primarily spread through blood-to-blood contact (shared needles, transfusions).",
    precautions:
      "1. Get tested — highly curable with modern antivirals.\n2. Take prescribed direct-acting antivirals.\n3. Avoid alcohol.\n4. Never share needles.\n5. Regular liver monitoring.",
  },
  {
    name: "Rectal Prolapse / Hemorrhoids",
    pathognomonicKeywords: [
      "hemorrhoids",
      "piles",
      "rectal prolapse",
      "anal bleeding painless",
    ],
    primaryKeywords: [
      "bright red blood after toilet",
      "itching around anus",
      "pain sitting",
    ],
    secondaryKeywords: [
      "rectal bleeding",
      "anal itching",
      "pain sitting",
      "protrusion anus",
    ],
    negativeKeywords: [],
    clusters: [["bright red blood toilet", "anal itching", "pain sitting"]],
    cause:
      "Hemorrhoids: swollen veins in rectum/anus from straining, constipation, or pregnancy.",
    precautions:
      "1. Increase fiber and water intake.\n2. Avoid straining during bowel movements.\n3. Use prescribed topical creams.\n4. Sitz baths for comfort.\n5. Surgery for severe prolapsed hemorrhoids.",
  },

  // ── NEUROLOGICAL (ADDITIONAL) ──────────────────────────────────────────────
  {
    name: "Parkinson's Disease",
    pathognomonicKeywords: [
      "parkinson",
      "parkinson's disease",
      "tremor at rest",
      "shuffling walk",
    ],
    primaryKeywords: [
      "resting tremor",
      "slow movement",
      "muscle rigidity",
      "shuffling gait",
    ],
    secondaryKeywords: [
      "tremor",
      "stiffness",
      "balance problems",
      "soft voice",
      "small handwriting",
    ],
    negativeKeywords: [],
    clusters: [["resting tremor", "slow movement", "shuffling walk"]],
    cause:
      "Caused by loss of dopamine-producing neurons in the brain. Exact cause unknown but genetic and environmental factors play a role.",
    precautions:
      "1. Take prescribed levodopa and dopamine agonists.\n2. Regular physical and occupational therapy.\n3. Balance and strength exercises.\n4. Deep brain stimulation for advanced cases.\n5. Attend regular neurology appointments.",
  },
  {
    name: "Alzheimer's Disease",
    pathognomonicKeywords: [
      "alzheimer",
      "dementia",
      "memory loss progressive",
      "forgetting family",
    ],
    primaryKeywords: [
      "progressive memory loss",
      "confusion familiar places",
      "forgetting words sentences",
    ],
    secondaryKeywords: [
      "memory problems",
      "confusion",
      "behavior changes",
      "getting lost",
      "personality change",
    ],
    negativeKeywords: [],
    clusters: [["progressive memory loss", "confusion", "personality change"]],
    cause:
      "Caused by abnormal protein deposits (amyloid plaques, tau tangles) disrupting brain cell communication.",
    precautions:
      "1. Consult a neurologist for evaluation.\n2. Take prescribed cholinesterase inhibitors.\n3. Maintain a safe home environment.\n4. Engage in cognitive exercises.\n5. Support groups for caregivers.",
  },
  {
    name: "Multiple Sclerosis (MS)",
    pathognomonicKeywords: [
      "multiple sclerosis",
      "ms",
      "demyelinating disease",
      "optic neuritis",
    ],
    primaryKeywords: [
      "vision loss one eye",
      "tingling one side body",
      "muscle weakness episodes",
    ],
    secondaryKeywords: [
      "fatigue",
      "numbness",
      "tingling sensation",
      "balance problems",
      "bladder problems",
      "muscle weakness",
    ],
    negativeKeywords: [],
    clusters: [["vision problems", "numbness one side", "fatigue"]],
    cause:
      "Autoimmune disease where the immune system attacks the myelin sheath covering nerve fibers.",
    precautions:
      "1. Take prescribed disease-modifying therapies.\n2. Physical and occupational therapy.\n3. Manage fatigue with pacing techniques.\n4. Stay cool — heat worsens symptoms.\n5. Regular MRI monitoring.",
  },
  {
    name: "Bell's Palsy",
    pathognomonicKeywords: [
      "bell's palsy",
      "facial palsy",
      "one side face drooping sudden no stroke",
      "face weakness",
    ],
    primaryKeywords: [
      "sudden face weakness one side",
      "cannot close eye fully",
    ],
    secondaryKeywords: [
      "facial drooping",
      "eye tearing",
      "drooling",
      "taste changes",
      "ear pain",
    ],
    negativeKeywords: ["arm weakness", "speech difficulty"],
    clusters: [["sudden face weakness", "cannot close eye"]],
    cause:
      "Caused by inflammation of the facial nerve, often triggered by viral infections (herpes simplex).",
    precautions:
      "1. Start steroids within 72 hours for best recovery.\n2. Eye drops to prevent corneal damage.\n3. Tape eye closed at night.\n4. Facial exercises under guidance.\n5. Most cases recover fully within months.",
  },
  {
    name: "Trigeminal Neuralgia",
    pathognomonicKeywords: [
      "trigeminal neuralgia",
      "electric shock face pain",
      "stabbing face pain seconds",
    ],
    primaryKeywords: [
      "sudden electric shock face pain",
      "triggered by chewing face pain",
    ],
    secondaryKeywords: ["face pain", "jaw pain", "cheek pain", "pain eating"],
    negativeKeywords: [],
    clusters: [["sudden severe face pain", "triggered by touch chewing"]],
    cause:
      "Caused by irritation of the trigeminal nerve, often by a blood vessel pressing on it.",
    precautions:
      "1. Take prescribed carbamazepine or other anticonvulsants.\n2. Avoid triggers: wind, chewing, brushing teeth.\n3. Surgery (microvascular decompression) for severe cases.\n4. Gamma knife radiosurgery is an option.\n5. Regular neurologist follow-up.",
  },
  {
    name: "Restless Leg Syndrome",
    pathognomonicKeywords: [
      "restless leg syndrome",
      "rls",
      "legs need to move night",
      "crawling sensation legs",
    ],
    primaryKeywords: [
      "urge to move legs night",
      "uncomfortable leg sensation night",
    ],
    secondaryKeywords: [
      "leg discomfort",
      "sleep problems",
      "leg tingling",
      "leg cramping night",
    ],
    negativeKeywords: [],
    clusters: [["urge to move legs", "night discomfort", "sleep problems"]],
    cause:
      "Caused by abnormal dopamine signaling. Risk: iron deficiency, kidney failure, pregnancy.",
    precautions:
      "1. Take prescribed dopamine agonists or iron supplements.\n2. Massage legs before bed.\n3. Regular moderate exercise.\n4. Avoid caffeine and alcohol.\n5. Maintain a regular sleep schedule.",
  },
  {
    name: "Narcolepsy",
    pathognomonicKeywords: [
      "narcolepsy",
      "sudden sleep attacks",
      "cataplexy",
      "sleep paralysis sudden",
    ],
    primaryKeywords: [
      "sudden uncontrollable sleep daytime",
      "sudden muscle weakness when laughing",
    ],
    secondaryKeywords: [
      "extreme daytime sleepiness",
      "sleep paralysis",
      "hallucinations falling asleep",
    ],
    negativeKeywords: [],
    clusters: [["sudden sleep attacks", "muscle weakness emotion triggered"]],
    cause:
      "Caused by lack of hypocretin (orexin) in the brain, often due to autoimmune destruction of neurons.",
    precautions:
      "1. Take prescribed stimulants (modafinil) and sodium oxybate.\n2. Schedule regular naps.\n3. Avoid driving during attacks.\n4. Maintain consistent sleep schedule.\n5. Inform school or workplace.",
  },

  // ── CARDIOVASCULAR (ADDITIONAL) ────────────────────────────────────────────
  {
    name: "Atrial Fibrillation",
    pathognomonicKeywords: [
      "atrial fibrillation",
      "afib",
      "irregular heartbeat",
      "heart rhythm disorder",
    ],
    primaryKeywords: [
      "irregular rapid heartbeat",
      "palpitations with dizziness",
    ],
    secondaryKeywords: [
      "heart palpitations",
      "shortness of breath",
      "fatigue",
      "dizziness",
      "chest discomfort",
    ],
    negativeKeywords: [],
    clusters: [["irregular heartbeat", "shortness of breath", "fatigue"]],
    cause:
      "Caused by disorganized electrical signals in the heart atria. Risk: hypertension, heart disease, age.",
    precautions:
      "1. Seek medical evaluation for rhythm management.\n2. Take prescribed anticoagulants to prevent stroke.\n3. Rate or rhythm control medications.\n4. Consider cardioversion or ablation.\n5. Manage underlying conditions.",
  },
  {
    name: "Heart Failure",
    pathognomonicKeywords: [
      "heart failure",
      "congestive heart failure",
      "chf",
      "cardiac failure",
    ],
    primaryKeywords: [
      "breathlessness lying flat",
      "ankle swelling breathlessness",
      "waking breathless at night",
    ],
    secondaryKeywords: [
      "shortness of breath",
      "swollen ankles",
      "fatigue",
      "weight gain fluid",
      "reduced exercise tolerance",
    ],
    negativeKeywords: [],
    clusters: [["breathlessness lying flat", "ankle swelling", "fatigue"]],
    cause:
      "Caused by the heart being unable to pump enough blood. Follows heart attack, hypertension, or valve disease.",
    precautions:
      "1. Take prescribed diuretics, ACE inhibitors, beta-blockers.\n2. Restrict salt and fluid intake.\n3. Monitor weight daily for fluid retention.\n4. Attend regular cardiology appointments.\n5. Avoid NSAIDs.",
  },
  {
    name: "Pericarditis",
    pathognomonicKeywords: [
      "pericarditis",
      "heart sac inflammation",
      "sharp chest pain worse lying down",
    ],
    primaryKeywords: [
      "sharp chest pain sitting forward relieved",
      "chest pain worse lying down",
    ],
    secondaryKeywords: ["chest pain", "fever", "fatigue", "heart palpitations"],
    negativeKeywords: [],
    clusters: [
      ["sharp chest pain", "worse lying down", "relieved sitting forward"],
    ],
    cause:
      "Inflammation of the pericardium (sac around the heart). Causes: viral infection, autoimmune, post-heart attack.",
    precautions:
      "1. Take prescribed NSAIDs and colchicine.\n2. Rest and avoid strenuous activity.\n3. Seek emergency care for severe pain.\n4. Corticosteroids for refractory cases.\n5. Regular echocardiogram follow-up.",
  },
  {
    name: "Varicose Veins",
    pathognomonicKeywords: [
      "varicose veins",
      "twisted bulging veins legs",
      "knotted leg veins",
    ],
    primaryKeywords: ["bulging visible veins legs", "aching heavy legs"],
    secondaryKeywords: [
      "leg aching",
      "leg swelling",
      "itching over veins",
      "leg cramps",
    ],
    negativeKeywords: [],
    clusters: [["visible bulging veins", "leg aching", "swelling"]],
    cause:
      "Caused by weakened vein valves allowing blood to pool. Risk: prolonged standing, pregnancy, obesity.",
    precautions:
      "1. Wear compression stockings.\n2. Elevate legs regularly.\n3. Regular walking exercise.\n4. Avoid prolonged standing.\n5. Laser treatment or surgery for severe cases.",
  },

  // ── ENDOCRINE / METABOLIC (ADDITIONAL) ─────────────────────────────────────
  {
    name: "Type 1 Diabetes",
    pathognomonicKeywords: [
      "type 1 diabetes",
      "juvenile diabetes",
      "insulin dependent",
      "diabetic ketoacidosis",
    ],
    primaryKeywords: [
      "sudden weight loss thirst urination young",
      "fruity breath diabetic",
    ],
    secondaryKeywords: [
      "frequent urination",
      "extreme thirst",
      "weight loss",
      "fatigue",
      "blurred vision",
    ],
    negativeKeywords: [],
    clusters: [
      ["frequent urination", "extreme thirst", "weight loss", "fatigue"],
    ],
    cause:
      "Autoimmune destruction of insulin-producing beta cells in the pancreas.",
    precautions:
      "1. Insulin therapy is essential — do not stop.\n2. Monitor blood glucose multiple times daily.\n3. Learn to recognize and treat hypoglycemia.\n4. Follow carbohydrate counting with a dietitian.\n5. Regular check-ups for complications.",
  },
  {
    name: "Addison's Disease",
    pathognomonicKeywords: [
      "addison's disease",
      "adrenal insufficiency",
      "hyperpigmentation fatigue",
    ],
    primaryKeywords: [
      "skin darkening fatigue",
      "low blood pressure fatigue salt craving",
    ],
    secondaryKeywords: [
      "fatigue",
      "weight loss",
      "low blood pressure",
      "dizziness",
      "nausea",
      "skin darkening",
    ],
    negativeKeywords: [],
    clusters: [
      ["fatigue", "weight loss", "skin darkening", "low blood pressure"],
    ],
    cause:
      "Caused by damage to the adrenal glands reducing cortisol and aldosterone production.",
    precautions:
      "1. Take prescribed hydrocortisone and fludrocortisone.\n2. Increase medication during illness or stress.\n3. Wear medical alert ID.\n4. Carry emergency hydrocortisone injection.\n5. Regular endocrinology follow-up.",
  },
  {
    name: "Cushing's Syndrome",
    pathognomonicKeywords: [
      "cushing's syndrome",
      "high cortisol",
      "moon face buffalo hump",
      "cortisol excess",
    ],
    primaryKeywords: [
      "round face weight gain upper body",
      "purple stretch marks",
    ],
    secondaryKeywords: [
      "weight gain",
      "fatigue",
      "high blood pressure",
      "diabetes symptoms",
      "muscle weakness",
      "stretch marks",
    ],
    negativeKeywords: [],
    clusters: [["round face", "weight gain", "purple stretch marks"]],
    cause:
      "Caused by prolonged exposure to high cortisol levels, from tumors or long-term steroid use.",
    precautions:
      "1. Seek endocrinology evaluation.\n2. Reduce or adjust corticosteroid medications.\n3. Surgical removal of tumor if present.\n4. Monitor blood pressure and blood sugar.\n5. Bone density monitoring.",
  },
  {
    name: "Metabolic Syndrome",
    pathognomonicKeywords: [
      "metabolic syndrome",
      "insulin resistance syndrome",
    ],
    primaryKeywords: [
      "high blood pressure high blood sugar obesity",
      "large waist fatigue",
    ],
    secondaryKeywords: [
      "weight gain",
      "fatigue",
      "high blood pressure",
      "frequent urination",
      "abdominal obesity",
    ],
    negativeKeywords: [],
    clusters: [["obesity", "high blood pressure", "high blood sugar"]],
    cause:
      "A cluster of conditions increasing risk of heart disease, stroke, and diabetes. Caused by insulin resistance.",
    precautions:
      "1. Lose weight through diet and exercise.\n2. Follow a low-carbohydrate, low-fat diet.\n3. Exercise at least 150 minutes per week.\n4. Treat each component (BP, sugar, cholesterol).\n5. Regular medical monitoring.",
  },
  {
    name: "Vitamin D Deficiency",
    pathognomonicKeywords: [
      "vitamin d deficiency",
      "low vitamin d",
      "rickets",
      "vitamin d low",
    ],
    primaryKeywords: [
      "bone pain fatigue low sun exposure",
      "muscle weakness sunlight deficiency",
    ],
    secondaryKeywords: [
      "fatigue",
      "bone pain",
      "muscle weakness",
      "depression",
      "frequent illness",
    ],
    negativeKeywords: [],
    clusters: [["bone pain", "fatigue", "muscle weakness"]],
    cause:
      "Caused by insufficient sun exposure, poor dietary intake, or malabsorption.",
    precautions:
      "1. Take prescribed vitamin D supplements.\n2. Get adequate sun exposure.\n3. Eat vitamin D-rich foods (fish, eggs, fortified milk).\n4. Monitor blood levels regularly.\n5. Treat underlying malabsorption if present.",
  },
  {
    name: "Iron Deficiency (without Anemia)",
    pathognomonicKeywords: [
      "iron deficiency",
      "low iron",
      "restless legs iron",
      "spoon nails iron",
    ],
    primaryKeywords: [
      "craving ice dirt",
      "brittle nails hair loss fatigue",
      "spoon-shaped nails",
    ],
    secondaryKeywords: [
      "fatigue",
      "weakness",
      "hair loss",
      "brittle nails",
      "difficulty concentrating",
    ],
    negativeKeywords: [],
    clusters: [["fatigue", "hair loss", "brittle nails"]],
    cause:
      "Caused by inadequate dietary iron, increased demand (pregnancy), or blood loss.",
    precautions:
      "1. Take prescribed iron supplements on empty stomach.\n2. Eat iron-rich foods with vitamin C.\n3. Avoid tea/coffee with meals.\n4. Investigate source of blood loss.\n5. Monitor iron levels.",
  },

  // ── MUSCULOSKELETAL (ADDITIONAL) ───────────────────────────────────────────
  {
    name: "Plantar Fasciitis",
    pathognomonicKeywords: [
      "plantar fasciitis",
      "heel pain first step morning",
      "sharp heel pain morning",
    ],
    primaryKeywords: [
      "heel pain first steps morning",
      "foot arch pain standing",
    ],
    secondaryKeywords: ["foot pain", "heel pain", "pain standing long"],
    negativeKeywords: [],
    clusters: [["heel pain", "first steps morning", "worse after rest"]],
    cause:
      "Caused by inflammation of the plantar fascia, the band of tissue connecting heel to toes. Risk: flat feet, obesity, standing.",
    precautions:
      "1. Stretch plantar fascia and Achilles tendon daily.\n2. Wear supportive footwear with arch support.\n3. Ice the heel after activity.\n4. Physical therapy.\n5. Corticosteroid injection for persistent cases.",
  },
  {
    name: "Carpal Tunnel Syndrome",
    pathognomonicKeywords: [
      "carpal tunnel",
      "wrist numbness night",
      "hand tingling typing",
    ],
    primaryKeywords: [
      "numbness tingling hand wrist night",
      "weak grip hand numbness",
    ],
    secondaryKeywords: [
      "hand numbness",
      "wrist pain",
      "tingling fingers",
      "weak grip",
    ],
    negativeKeywords: [],
    clusters: [["hand tingling", "wrist pain", "numbness at night"]],
    cause:
      "Caused by compression of the median nerve in the carpal tunnel of the wrist.",
    precautions:
      "1. Wear a wrist splint at night.\n2. Ergonomic adjustments at workstation.\n3. Physical therapy.\n4. Corticosteroid injections.\n5. Surgery for severe cases.",
  },
  {
    name: "Tendinitis",
    pathognomonicKeywords: [
      "tendinitis",
      "tendon inflammation",
      "tennis elbow",
      "golfer's elbow",
    ],
    primaryKeywords: [
      "pain with movement specific tendon",
      "shoulder pain overhead movement",
    ],
    secondaryKeywords: [
      "joint pain",
      "tenderness over tendon",
      "swelling around tendon",
      "stiffness",
    ],
    negativeKeywords: [],
    clusters: [["tendon pain", "worse with movement"]],
    cause:
      "Caused by repetitive motion or overuse of a tendon, leading to microscopic tears and inflammation.",
    precautions:
      "1. Rest the affected area.\n2. Ice for 20 minutes several times daily.\n3. Take NSAIDs.\n4. Physical therapy stretching and strengthening.\n5. Avoid the aggravating activity.",
  },
  {
    name: "Scoliosis",
    pathognomonicKeywords: [
      "scoliosis",
      "curved spine",
      "spine curvature",
      "one shoulder higher",
    ],
    primaryKeywords: ["uneven shoulders visible", "curved back visible"],
    secondaryKeywords: [
      "back pain",
      "uneven hips",
      "back stiffness",
      "one shoulder higher",
    ],
    negativeKeywords: [],
    clusters: [["uneven shoulders", "curved spine", "back pain"]],
    cause:
      "Idiopathic in most cases. Can be caused by neuromuscular conditions, congenital defects, or injuries.",
    precautions:
      "1. Regular spine monitoring with X-rays.\n2. Bracing for adolescents with moderate curves.\n3. Physical therapy for posture.\n4. Surgery for severe curves.\n5. Swimming and core strengthening exercises.",
  },
  {
    name: "Ankylosing Spondylitis",
    pathognomonicKeywords: [
      "ankylosing spondylitis",
      "sacroiliac joint pain",
      "spine stiffness young man",
      "bamboo spine",
    ],
    primaryKeywords: [
      "low back stiffness young",
      "morning back stiffness improves exercise",
    ],
    secondaryKeywords: [
      "lower back pain",
      "morning stiffness",
      "hip pain",
      "fatigue",
    ],
    negativeKeywords: [],
    clusters: [
      ["morning back stiffness", "improves with exercise", "young adult"],
    ],
    cause:
      "Autoimmune inflammatory arthritis primarily affecting the spine and sacroiliac joints.",
    precautions:
      "1. Take prescribed NSAIDs and biologics.\n2. Daily stretching and posture exercises.\n3. Swim or cycle for low-impact exercise.\n4. Avoid smoking — worsens progression.\n5. Regular rheumatology follow-up.",
  },

  // ── DERMATOLOGY (ADDITIONAL) ───────────────────────────────────────────────
  {
    name: "Rosacea",
    pathognomonicKeywords: [
      "rosacea",
      "red flushed face",
      "facial redness flushes",
      "bumpy red face nose",
    ],
    primaryKeywords: [
      "facial redness persistent cheeks nose",
      "visible blood vessels face",
    ],
    secondaryKeywords: [
      "facial redness",
      "skin bumps",
      "flushing",
      "eye irritation",
    ],
    negativeKeywords: [],
    clusters: [["persistent facial redness", "flushing", "bumps on face"]],
    cause:
      "Caused by abnormal facial blood vessel reactivity and inflammation. Triggers: alcohol, spicy food, sun, stress.",
    precautions:
      "1. Identify and avoid triggers.\n2. Apply prescribed topical metronidazole or azelaic acid.\n3. Use high-SPF sunscreen daily.\n4. Laser treatment for visible vessels.\n5. Oral antibiotics for inflammatory rosacea.",
  },
  {
    name: "Cellulitis",
    pathognomonicKeywords: [
      "cellulitis",
      "skin infection red hot swollen",
      "spreading red skin infection",
    ],
    primaryKeywords: [
      "spreading redness hot skin fever",
      "red warm swollen skin area",
    ],
    secondaryKeywords: [
      "skin redness",
      "skin swelling",
      "fever",
      "warmth",
      "pain over skin",
    ],
    negativeKeywords: [],
    clusters: [["spreading redness", "warm skin", "fever"]],
    cause:
      "Caused by bacteria (Streptococcus, Staphylococcus) entering through broken skin.",
    precautions:
      "1. Take prescribed antibiotics.\n2. Mark the edge of redness to monitor spread.\n3. Elevate the affected limb.\n4. Seek emergency care if red lines (streaking) appear.\n5. Keep skin moisturized to prevent breaks.",
  },
  {
    name: "Impetigo",
    pathognomonicKeywords: [
      "impetigo",
      "honey crust skin lesion",
      "crusty yellow sores child",
    ],
    primaryKeywords: [
      "golden crusted sores around mouth nose",
      "crusty yellow blisters child skin",
    ],
    secondaryKeywords: [
      "skin sores",
      "skin bumps",
      "itching",
      "fluid filled blisters",
    ],
    negativeKeywords: [],
    clusters: [["honey-colored crust", "skin sores", "child"]],
    cause:
      "Caused by Staphylococcus or Streptococcus bacteria. Common in children, highly contagious.",
    precautions:
      "1. Apply prescribed antibiotic cream or take oral antibiotics.\n2. Keep lesions covered.\n3. Wash hands frequently.\n4. Do not share towels or clothing.\n5. Keep child home from school until crusts clear.",
  },
  {
    name: "Vitiligo",
    pathognomonicKeywords: [
      "vitiligo",
      "white patches skin",
      "depigmented skin",
      "loss of skin color patches",
    ],
    primaryKeywords: [
      "white loss of color skin patches",
      "white patches spreading skin",
    ],
    secondaryKeywords: ["skin patches", "pale skin areas"],
    negativeKeywords: [],
    clusters: [["white patches skin", "spreading depigmentation"]],
    cause:
      "Autoimmune condition where immune cells destroy melanocytes (pigment cells) in the skin.",
    precautions:
      "1. Use prescribed topical corticosteroids or calcineurin inhibitors.\n2. Apply high-SPF sunscreen to white patches.\n3. Phototherapy (narrowband UVB).\n4. Camouflage makeup for cosmetic concerns.\n5. Psychological support if needed.",
  },
  {
    name: "Alopecia",
    pathognomonicKeywords: [
      "alopecia",
      "hair loss patches",
      "bald patches sudden",
      "alopecia areata",
    ],
    primaryKeywords: [
      "circular hair loss patches scalp",
      "sudden round bald patches",
    ],
    secondaryKeywords: ["hair loss", "bald patches", "thinning hair"],
    negativeKeywords: [],
    clusters: [["sudden round bald patches", "scalp"]],
    cause:
      "Alopecia areata: autoimmune attack on hair follicles. Other types: stress, hormonal, genetic.",
    precautions:
      "1. Consult a dermatologist.\n2. Corticosteroid injections for alopecia areata.\n3. Minoxidil topical application.\n4. Stress management.\n5. Wigs or hairpieces for cosmetic support.",
  },
  {
    name: "Seborrheic Dermatitis",
    pathognomonicKeywords: [
      "seborrheic dermatitis",
      "dandruff severe",
      "flaky scalp red skin",
      "cradle cap adult",
    ],
    primaryKeywords: [
      "scalp flaking redness",
      "oily skin flaking eyebrows nose",
    ],
    secondaryKeywords: [
      "flaky skin",
      "scaly patches",
      "skin redness",
      "itching scalp",
    ],
    negativeKeywords: [],
    clusters: [["scalp flaking", "oily skin", "facial redness"]],
    cause:
      "Caused by an inflammatory reaction to Malassezia yeast on oily areas of the skin.",
    precautions:
      "1. Use medicated shampoo (ketoconazole, selenium sulfide).\n2. Apply prescribed antifungal creams.\n3. Avoid triggers: stress, cold weather.\n4. Gently remove scales.\n5. Manage consistently — it tends to recur.",
  },

  // ── MENTAL HEALTH (ADDITIONAL) ─────────────────────────────────────────────
  {
    name: "PTSD (Post-Traumatic Stress Disorder)",
    pathognomonicKeywords: [
      "ptsd",
      "post traumatic stress",
      "flashbacks trauma",
      "nightmares trauma",
    ],
    primaryKeywords: [
      "nightmares about event",
      "avoiding reminders trauma",
      "sudden fear flashbacks",
    ],
    secondaryKeywords: [
      "anxiety",
      "nightmares",
      "irritability",
      "hypervigilance",
      "depression",
      "sleep problems",
    ],
    negativeKeywords: [],
    clusters: [["trauma flashbacks", "nightmares", "avoidance"]],
    cause:
      "Caused by experiencing or witnessing a traumatic event. Involves altered stress response and memory processing.",
    precautions:
      "1. Seek trauma-focused therapy (EMDR or CBT).\n2. Take prescribed medications (SSRIs).\n3. Build a support network.\n4. Practice mindfulness and grounding techniques.\n5. Avoid alcohol and substances.",
  },
  {
    name: "Bipolar Disorder",
    pathognomonicKeywords: [
      "bipolar disorder",
      "manic episode",
      "mania depression",
      "extreme mood swings",
    ],
    primaryKeywords: [
      "extreme euphoria then depression",
      "no need for sleep energy burst",
    ],
    secondaryKeywords: [
      "mood swings",
      "energy bursts",
      "impulsive behavior",
      "depression",
      "irritability",
    ],
    negativeKeywords: [],
    clusters: [["extreme mood swings", "mania", "depression episodes"]],
    cause:
      "Involves neurochemical imbalances. Risk: genetics, stress, substance use.",
    precautions:
      "1. Take prescribed mood stabilizers (lithium, valproate).\n2. Maintain consistent sleep schedule.\n3. Avoid alcohol and recreational drugs.\n4. Regular psychiatry appointments.\n5. Educate family members about the condition.",
  },
  {
    name: "Schizophrenia",
    pathognomonicKeywords: [
      "schizophrenia",
      "hallucinations voices",
      "hearing voices",
      "delusions false beliefs",
    ],
    primaryKeywords: [
      "hearing voices not there",
      "believing being watched",
      "disorganized thinking",
    ],
    secondaryKeywords: [
      "hallucinations",
      "delusions",
      "confused thinking",
      "social withdrawal",
      "flat emotion",
    ],
    negativeKeywords: [],
    clusters: [["hearing voices", "delusions", "disorganized thinking"]],
    cause:
      "Involves dopamine and glutamate pathway dysregulation. Risk: genetics, prenatal stress, cannabis use.",
    precautions:
      "1. Take prescribed antipsychotic medications consistently.\n2. Regular psychiatry follow-up.\n3. Psychosocial rehabilitation.\n4. Family support and education.\n5. Avoid alcohol and drugs — worsen psychosis.",
  },
  {
    name: "OCD (Obsessive-Compulsive Disorder)",
    pathognomonicKeywords: [
      "ocd",
      "obsessive compulsive",
      "intrusive thoughts compulsions",
      "checking repeatedly",
    ],
    primaryKeywords: [
      "intrusive thoughts can't stop",
      "repetitive checking cleaning behavior",
    ],
    secondaryKeywords: [
      "anxiety",
      "repetitive behavior",
      "intrusive thoughts",
      "ritual behavior",
    ],
    negativeKeywords: [],
    clusters: [["intrusive thoughts", "compulsive rituals", "anxiety"]],
    cause:
      "Involves abnormal serotonin signaling and hyperactive brain circuits. Risk: genetics, trauma.",
    precautions:
      "1. Seek CBT with exposure and response prevention (ERP).\n2. Take prescribed SSRIs.\n3. Join a support group.\n4. Learn to tolerate uncertainty.\n5. Avoid reassurance-seeking behaviors.",
  },
  {
    name: "ADHD",
    pathognomonicKeywords: [
      "adhd",
      "attention deficit",
      "hyperactivity disorder",
      "cannot concentrate child",
    ],
    primaryKeywords: [
      "inability to focus long",
      "hyperactive impulsive child adult",
      "easily distracted always",
    ],
    secondaryKeywords: [
      "difficulty concentrating",
      "forgetfulness",
      "impulsive",
      "restlessness",
    ],
    negativeKeywords: [],
    clusters: [["inattention", "hyperactivity", "impulsivity"]],
    cause:
      "Involves dopamine and norepinephrine pathway differences. Genetic and environmental factors.",
    precautions:
      "1. Stimulant medications (methylphenidate, amphetamines) are effective.\n2. Behavioral therapy.\n3. Structured routines and organized environment.\n4. Regular school/workplace accommodations.\n5. Regular psychiatry follow-up.",
  },
  {
    name: "Eating Disorder (Anorexia/Bulimia)",
    pathognomonicKeywords: [
      "anorexia",
      "bulimia",
      "eating disorder",
      "restriction of eating extreme",
      "binge purge",
    ],
    primaryKeywords: [
      "refusing to eat extremely low weight",
      "binge eating then vomiting",
    ],
    secondaryKeywords: [
      "weight loss extreme",
      "food restriction",
      "body image distortion",
      "fatigue",
      "hair loss",
    ],
    negativeKeywords: [],
    clusters: [
      ["food restriction", "extreme weight loss", "body image concern"],
    ],
    cause:
      "Complex interaction of genetic, psychological, and social factors affecting body image and eating.",
    precautions:
      "1. Seek immediate professional help — can be life-threatening.\n2. Nutritional rehabilitation.\n3. Psychotherapy (CBT, family-based therapy).\n4. Medical monitoring for complications.\n5. Support groups for patients and families.",
  },

  // ── OPHTHALMOLOGY (ADDITIONAL) ─────────────────────────────────────────────
  {
    name: "Cataracts",
    pathognomonicKeywords: [
      "cataract",
      "cloudy lens eye",
      "blurry vision worse at night",
      "halo night driving",
    ],
    primaryKeywords: [
      "cloudy foggy vision",
      "colors faded vision",
      "bright light sensitivity",
    ],
    secondaryKeywords: [
      "blurred vision",
      "difficulty reading",
      "halos lights",
      "double vision",
    ],
    negativeKeywords: [],
    clusters: [["cloudy vision", "glare sensitivity", "faded colors"]],
    cause:
      "Caused by protein clumping in the eye lens due to aging, UV exposure, diabetes, or steroid use.",
    precautions:
      "1. Regular eye exams.\n2. Wear UV-protective sunglasses.\n3. Control diabetes and blood pressure.\n4. Surgery (phacoemulsification) is curative.\n5. Prescription glasses for mild cases.",
  },
  {
    name: "Macular Degeneration",
    pathognomonicKeywords: [
      "macular degeneration",
      "amd",
      "central vision loss",
      "distorted central vision",
    ],
    primaryKeywords: [
      "blurry central vision elderly",
      "straight lines appear wavy",
    ],
    secondaryKeywords: [
      "blurred vision",
      "difficulty reading",
      "dark spot center vision",
    ],
    negativeKeywords: [],
    clusters: [["central vision loss", "distorted lines", "elderly"]],
    cause:
      "Caused by deterioration of the macula (central retina) due to aging and oxidative stress.",
    precautions:
      "1. Regular eye exams after 50.\n2. Anti-VEGF injections for wet AMD.\n3. Take AREDS2 supplements for dry AMD.\n4. Use magnifying aids.\n5. Quit smoking.",
  },
  {
    name: "Stye (Hordeolum)",
    pathognomonicKeywords: [
      "stye",
      "hordeolum",
      "eyelid lump painful",
      "red lump eyelid",
    ],
    primaryKeywords: ["painful red lump eyelid", "eyelid swelling tender spot"],
    secondaryKeywords: [
      "eyelid swelling",
      "eye pain",
      "eye discharge",
      "tearing",
    ],
    negativeKeywords: [],
    clusters: [["eyelid lump", "pain", "redness"]],
    cause:
      "Caused by bacterial infection (Staphylococcus) of an eyelid sebaceous gland.",
    precautions:
      "1. Apply warm compresses 4 times daily.\n2. Do not squeeze or pop the stye.\n3. Antibiotic eye drops if prescribed.\n4. Seek care if no improvement after a week.\n5. Replace old eye makeup.",
  },

  // ── UROLOGICAL (ADDITIONAL) ────────────────────────────────────────────────
  {
    name: "Benign Prostatic Hyperplasia (BPH)",
    pathognomonicKeywords: [
      "enlarged prostate",
      "bph",
      "benign prostatic",
      "prostate enlargement",
      "urinary hesitancy old man",
    ],
    primaryKeywords: [
      "difficulty starting urination",
      "weak urine stream elderly male",
    ],
    secondaryKeywords: [
      "frequent urination",
      "incomplete bladder emptying",
      "nocturia",
      "dribbling urine",
    ],
    negativeKeywords: [],
    clusters: [
      [
        "urinary hesitancy",
        "weak stream",
        "frequent urination",
        "elderly male",
      ],
    ],
    cause:
      "Caused by non-cancerous enlargement of the prostate gland, common with aging.",
    precautions:
      "1. Take prescribed alpha-blockers or 5-alpha reductase inhibitors.\n2. Limit evening fluids.\n3. Avoid decongestants and antihistamines.\n4. Regular PSA and prostate exams.\n5. Surgery for severe cases.",
  },
  {
    name: "Prostate Cancer",
    pathognomonicKeywords: [
      "prostate cancer",
      "psa elevated",
      "prostate malignancy",
    ],
    primaryKeywords: [
      "urinary symptoms elderly male blood urine",
      "difficulty urinating older man persistent",
    ],
    secondaryKeywords: [
      "frequent urination",
      "blood in urine",
      "back pain",
      "bone pain",
      "weak urine stream",
    ],
    negativeKeywords: [],
    clusters: [
      ["urinary difficulties", "blood in urine", "back pain", "elderly male"],
    ],
    cause:
      "Abnormal cell growth in the prostate gland. Risk: age, family history, African descent.",
    precautions:
      "1. Regular PSA screening for men over 50.\n2. Follow prescribed treatment plan.\n3. Maintain a healthy diet low in red meat.\n4. Exercise regularly.\n5. Genetic counseling if family history present.",
  },
  {
    name: "Overactive Bladder",
    pathognomonicKeywords: [
      "overactive bladder",
      "urge incontinence",
      "cannot hold urine",
    ],
    primaryKeywords: [
      "sudden urge to urinate cannot hold",
      "leaking urine urgency",
    ],
    secondaryKeywords: [
      "frequent urination",
      "urgency urinate",
      "nocturia",
      "urinary leakage",
    ],
    negativeKeywords: [],
    clusters: [["urge to urinate suddenly", "leakage", "frequent urination"]],
    cause:
      "Caused by involuntary bladder muscle contractions. Risk: age, neurological conditions, caffeine.",
    precautions:
      "1. Take prescribed anticholinergics or beta-3 agonists.\n2. Bladder training exercises.\n3. Reduce caffeine and alcohol.\n4. Pelvic floor exercises.\n5. Keep a bladder diary.",
  },

  // ── OBSTETRIC / GYNECOLOGICAL (ADDITIONAL) ─────────────────────────────────
  {
    name: "Preeclampsia",
    pathognomonicKeywords: [
      "preeclampsia",
      "high blood pressure pregnancy",
      "swelling pregnancy headache",
    ],
    primaryKeywords: [
      "high blood pressure second trimester",
      "swollen face hands pregnancy",
    ],
    secondaryKeywords: [
      "headache",
      "swelling",
      "high blood pressure",
      "blurred vision",
      "upper abdominal pain",
    ],
    negativeKeywords: [],
    clusters: [["pregnancy", "high blood pressure", "swelling", "headache"]],
    cause:
      "Caused by abnormal placental development leading to endothelial dysfunction during pregnancy.",
    precautions:
      "1. Seek immediate medical care — can be life-threatening.\n2. Antihypertensive medications.\n3. Close monitoring of mother and baby.\n4. Low-dose aspirin prophylaxis in at-risk pregnancies.\n5. Delivery is the definitive treatment.",
  },
  {
    name: "Ovarian Cyst",
    pathognomonicKeywords: [
      "ovarian cyst",
      "cyst on ovary",
      "ovarian cyst pain",
    ],
    primaryKeywords: [
      "pelvic pain one side",
      "dull pelvic ache irregular period",
    ],
    secondaryKeywords: [
      "pelvic pain",
      "bloating",
      "irregular periods",
      "pain during sex",
      "nausea",
    ],
    negativeKeywords: [],
    clusters: [["pelvic pain one side", "bloating", "irregular period"]],
    cause:
      "Fluid-filled sacs that develop on the ovary, often related to the menstrual cycle or PCOS.",
    precautions:
      "1. Ultrasound for diagnosis.\n2. Most cysts resolve on their own.\n3. Take prescribed hormonal contraceptives to prevent new cysts.\n4. Surgery for large or persistent cysts.\n5. Seek emergency care for sudden severe pelvic pain.",
  },
  {
    name: "Uterine Fibroids",
    pathognomonicKeywords: [
      "uterine fibroids",
      "fibroids womb",
      "heavy periods fibroids",
      "fibroid uterus",
    ],
    primaryKeywords: [
      "very heavy prolonged periods",
      "pelvic pressure bulk feeling",
    ],
    secondaryKeywords: [
      "heavy periods",
      "pelvic pressure",
      "frequent urination",
      "constipation",
      "back pain",
    ],
    negativeKeywords: [],
    clusters: [["very heavy periods", "pelvic pressure", "bloating"]],
    cause:
      "Non-cancerous smooth muscle tumors in the uterus. Driven by estrogen and progesterone.",
    precautions:
      "1. Consult a gynecologist.\n2. Hormonal medications reduce symptoms.\n3. Uterine artery embolization.\n4. Myomectomy to remove fibroids.\n5. Hysterectomy for definitive treatment.",
  },

  // ── NEONATAL / PEDIATRIC (ADDITIONAL) ─────────────────────────────────────
  {
    name: "Kawasaki Disease",
    pathognomonicKeywords: [
      "kawasaki disease",
      "kawasaki",
      "strawberry tongue child fever rash",
    ],
    primaryKeywords: [
      "high fever child 5 days rash strawberry tongue",
      "red eyes peeling skin child",
    ],
    secondaryKeywords: [
      "fever",
      "rash",
      "red eyes",
      "swollen lymph nodes",
      "red cracked lips",
      "child",
    ],
    negativeKeywords: [],
    clusters: [
      ["prolonged fever child", "rash", "red eyes", "swollen lymph nodes"],
    ],
    cause:
      "Unknown cause. Immune system overactivation causes widespread inflammation of blood vessels in children.",
    precautions:
      "1. Seek immediate pediatric care.\n2. IV immunoglobulin (IVIG) treatment.\n3. Aspirin therapy.\n4. Echocardiogram to check coronary arteries.\n5. Regular cardiac follow-up.",
  },
  {
    name: "Hand, Foot and Mouth Disease",
    pathognomonicKeywords: [
      "hand foot mouth",
      "hfmd",
      "sores mouth hands feet child",
    ],
    primaryKeywords: [
      "blisters mouth palms soles child",
      "painful mouth sores child",
    ],
    secondaryKeywords: [
      "fever",
      "sore throat",
      "rash",
      "fluid filled blisters",
      "child",
    ],
    negativeKeywords: [],
    clusters: [["mouth sores", "rash hands feet", "fever", "child"]],
    cause:
      "Caused by Coxsackievirus, spread through saliva, stool, or respiratory droplets. Common in children under 5.",
    precautions:
      "1. Manage symptoms with acetaminophen for pain and fever.\n2. Ensure adequate hydration.\n3. Keep child home until fever resolves.\n4. Wash hands frequently.\n5. Most cases resolve in 7-10 days.",
  },
  {
    name: "Croup",
    pathognomonicKeywords: [
      "croup",
      "barking cough child",
      "seal cough",
      "croupy cough stridor",
    ],
    primaryKeywords: [
      "harsh barking cough child",
      "noisy breathing stridor child",
    ],
    secondaryKeywords: [
      "fever",
      "hoarse voice",
      "stridor",
      "breathing difficulty",
      "child",
    ],
    negativeKeywords: [],
    clusters: [["barking cough", "stridor", "fever", "child"]],
    cause:
      "Caused by viral infection (parainfluenza) causing swelling of the vocal cords and trachea.",
    precautions:
      "1. Steam inhalation or cool night air may help.\n2. Prescribed dexamethasone reduces airway swelling.\n3. Nebulized epinephrine for severe cases.\n4. Seek emergency care if stridor at rest or blue lips.\n5. Keep child calm — crying worsens symptoms.",
  },
  {
    name: "Febrile Seizure",
    pathognomonicKeywords: [
      "febrile seizure",
      "fever seizure child",
      "convulsion with fever child",
    ],
    primaryKeywords: ["child shaking with fever", "seizure during high fever"],
    secondaryKeywords: [
      "fever",
      "convulsions",
      "shaking",
      "child",
      "loss of consciousness",
    ],
    negativeKeywords: [],
    clusters: [["seizure", "high fever", "child"]],
    cause:
      "Caused by rapid rise in body temperature in young children. Usually harmless.",
    precautions:
      "1. Keep child safe during seizure — lay on side.\n2. Do not put anything in the mouth.\n3. Seek medical evaluation.\n4. Control fever with acetaminophen.\n5. Most children outgrow febrile seizures.",
  },

  // ── ORAL / DENTAL ──────────────────────────────────────────────────────────
  {
    name: "Dental Abscess",
    pathognomonicKeywords: [
      "dental abscess",
      "tooth abscess",
      "tooth pain swollen face",
      "abscess gum",
    ],
    primaryKeywords: [
      "severe throbbing toothache",
      "swollen face jaw toothache",
      "gum swelling pus",
    ],
    secondaryKeywords: [
      "tooth pain",
      "jaw pain",
      "swollen jaw",
      "fever",
      "bad breath",
    ],
    negativeKeywords: [],
    clusters: [["severe toothache", "swollen jaw face", "fever"]],
    cause:
      "Caused by bacterial infection in the tooth pulp or gum, often from untreated cavities.",
    precautions:
      "1. Seek immediate dental care.\n2. Take prescribed antibiotics.\n3. Pain management with ibuprofen.\n4. Root canal or extraction may be needed.\n5. Do not ignore — can spread to jaw/neck.",
  },
  {
    name: "Oral Thrush (Candidiasis)",
    pathognomonicKeywords: [
      "oral thrush",
      "white coating tongue",
      "mouth candidiasis",
      "fungal mouth infection",
    ],
    primaryKeywords: [
      "white patches inside mouth removable",
      "creamy white tongue coating",
    ],
    secondaryKeywords: [
      "sore mouth",
      "difficulty swallowing",
      "loss of taste",
      "dry mouth",
    ],
    negativeKeywords: [],
    clusters: [["white patches mouth", "sore mouth", "difficulty swallowing"]],
    cause:
      "Caused by Candida yeast overgrowth. Risk: antibiotics, immunocompromised, diabetes, dentures.",
    precautions:
      "1. Take prescribed antifungal medications (nystatin, fluconazole).\n2. Rinse mouth after steroid inhaler use.\n3. Maintain good oral hygiene.\n4. Replace old toothbrushes.\n5. Control underlying diabetes.",
  },
  {
    name: "Gingivitis / Periodontitis",
    pathognomonicKeywords: [
      "gingivitis",
      "gum disease",
      "periodontitis",
      "gums bleeding",
    ],
    primaryKeywords: ["bleeding gums brushing", "swollen red gums"],
    secondaryKeywords: [
      "gum bleeding",
      "bad breath",
      "gum pain",
      "loose teeth",
      "gum recession",
    ],
    negativeKeywords: [],
    clusters: [["bleeding gums", "swollen red gums", "bad breath"]],
    cause:
      "Caused by plaque buildup on teeth and gum line causing bacterial infection and inflammation.",
    precautions:
      "1. Brush twice daily with fluoride toothpaste.\n2. Floss daily.\n3. Professional dental cleaning.\n4. Avoid smoking.\n5. Treat with scaling and root planing for periodontitis.",
  },

  // ── TROPICAL / PARASITIC (ADDITIONAL) ────────────────────────────────────
  {
    name: "Roundworm Infection (Ascariasis)",
    pathognomonicKeywords: [
      "ascariasis",
      "roundworm",
      "worms in stool",
      "intestinal worms",
    ],
    primaryKeywords: ["visible worms in stool", "abdominal pain worms"],
    secondaryKeywords: [
      "abdominal pain",
      "nausea",
      "vomiting",
      "diarrhea",
      "weight loss",
      "cough",
    ],
    negativeKeywords: [],
    clusters: [["worms in stool", "abdominal pain", "weight loss"]],
    cause:
      "Caused by Ascaris lumbricoides roundworm. Spread through contaminated soil and feces.",
    precautions:
      "1. Take prescribed albendazole or mebendazole.\n2. Wash hands before eating.\n3. Eat only cooked food.\n4. Wash fruits and vegetables.\n5. Mass deworming for at-risk communities.",
  },
  {
    name: "Tapeworm Infection",
    pathognomonicKeywords: [
      "tapeworm",
      "segments in stool",
      "proglottids stool",
      "tape worm",
    ],
    primaryKeywords: ["white segments in stool", "tapeworm stool"],
    secondaryKeywords: [
      "abdominal pain",
      "weight loss",
      "nausea",
      "diarrhea",
      "fatigue",
    ],
    negativeKeywords: [],
    clusters: [["segments in stool", "weight loss", "abdominal pain"]],
    cause:
      "Caused by consuming undercooked infected meat (beef, pork, fish) containing tapeworm larvae.",
    precautions:
      "1. Take prescribed praziquantel or niclosamide.\n2. Cook meat thoroughly.\n3. Wash hands before eating.\n4. Avoid raw or undercooked meat.\n5. Treat promptly to prevent organ cysts.",
  },
  {
    name: "Pinworm Infection",
    pathognomonicKeywords: [
      "pinworm",
      "threadworm",
      "anal itching night child",
      "itching anus night",
    ],
    primaryKeywords: [
      "itching around anus at night",
      "child scratching anus night",
    ],
    secondaryKeywords: [
      "anal itching",
      "sleep disturbance",
      "irritability child",
    ],
    negativeKeywords: [],
    clusters: [["anal itching at night", "child", "sleep disturbance"]],
    cause:
      "Caused by Enterobius vermicularis. Spreads through egg contamination of hands, food, and surfaces.",
    precautions:
      "1. Take prescribed mebendazole.\n2. Treat all household members.\n3. Wash all bedding and underwear in hot water.\n4. Cut and clean fingernails.\n5. Wash hands frequently.",
  },

  // ── SEXUALLY TRANSMITTED (ADDITIONAL) ─────────────────────────────────────
  {
    name: "Syphilis",
    pathognomonicKeywords: [
      "syphilis",
      "painless genital ulcer",
      "chancre",
      "treponema",
    ],
    primaryKeywords: [
      "painless sore genitals",
      "copper penny rash palms soles",
    ],
    secondaryKeywords: [
      "genital sore",
      "rash",
      "swollen lymph nodes",
      "fever",
      "muscle aches",
    ],
    negativeKeywords: [],
    clusters: [
      ["painless genital sore", "rash palms soles", "swollen lymph nodes"],
    ],
    cause:
      "Caused by Treponema pallidum bacteria, transmitted through sexual contact or mother to child.",
    precautions:
      "1. Seek medical care for antibiotic treatment.\n2. Single penicillin injection for early syphilis.\n3. Notify all sexual partners.\n4. Regular STI screening.\n5. Use condoms consistently.",
  },
  {
    name: "Genital Herpes",
    pathognomonicKeywords: [
      "genital herpes",
      "hsv2",
      "herpes genital sores",
      "recurring genital blisters",
    ],
    primaryKeywords: [
      "painful genital blisters recurring",
      "burning blisters genitals",
    ],
    secondaryKeywords: [
      "fluid filled blisters",
      "genital pain",
      "itching genitals",
      "fever first outbreak",
    ],
    negativeKeywords: [],
    clusters: [["genital blisters", "pain", "recurring outbreaks"]],
    cause:
      "Caused by Herpes Simplex Virus type 2 (HSV-2), spread through sexual contact.",
    precautions:
      "1. Take prescribed antiviral medications (acyclovir, valacyclovir).\n2. Use condoms consistently.\n3. Inform sexual partners.\n4. Avoid sexual contact during outbreaks.\n5. Suppressive therapy reduces transmission.",
  },
  {
    name: "Trichomoniasis",
    pathognomonicKeywords: [
      "trichomoniasis",
      "trich sti",
      "frothy vaginal discharge fishy smell",
    ],
    primaryKeywords: [
      "frothy yellow green vaginal discharge",
      "itching genitals discharge sti",
    ],
    secondaryKeywords: [
      "vaginal discharge",
      "genital itching",
      "burning urination",
      "pelvic discomfort",
    ],
    negativeKeywords: [],
    clusters: [["frothy discharge", "genital itching", "odor"]],
    cause:
      "Caused by Trichomonas vaginalis parasite, the most common curable STI.",
    precautions:
      "1. Take prescribed metronidazole.\n2. Treat all sexual partners simultaneously.\n3. Avoid sexual contact until treatment complete.\n4. Regular STI screening.\n5. Use condoms.",
  },

  // ── MISCELLANEOUS COMMON CONDITIONS ────────────────────────────────────────
  {
    name: "Vitamin B12 Deficiency",
    pathognomonicKeywords: [
      "vitamin b12 deficiency",
      "b12 deficiency",
      "pernicious anemia",
      "megaloblastic anemia",
    ],
    primaryKeywords: [
      "tingling numbness hands feet b12",
      "memory problems fatigue strict vegetarian",
    ],
    secondaryKeywords: [
      "fatigue",
      "weakness",
      "numbness",
      "tingling sensation",
      "memory problems",
      "depression",
      "pale skin",
    ],
    negativeKeywords: [],
    clusters: [["numbness tingling", "fatigue", "memory problems"]],
    cause:
      "Caused by dietary deficiency, malabsorption, pernicious anemia, or prolonged metformin use.",
    precautions:
      "1. Take prescribed B12 injections or oral supplements.\n2. Eat animal products (meat, dairy, eggs).\n3. Fortified foods for vegetarians/vegans.\n4. Regular blood monitoring.\n5. Treat underlying absorption disorder.",
  },
  {
    name: "Chronic Fatigue Syndrome (ME/CFS)",
    pathognomonicKeywords: [
      "chronic fatigue syndrome",
      "me cfs",
      "myalgic encephalomyelitis",
      "post exertional fatigue",
    ],
    primaryKeywords: [
      "extreme fatigue not improved rest",
      "fatigue worse after activity",
    ],
    secondaryKeywords: [
      "severe fatigue",
      "sleep problems",
      "cognitive difficulties",
      "muscle pain",
      "headache",
    ],
    negativeKeywords: [],
    clusters: [
      [
        "severe fatigue",
        "worsened by activity",
        "sleep problems",
        "cognitive difficulties",
      ],
    ],
    cause:
      "Exact cause unknown. Often triggered by viral infection. Involves immune and nervous system dysfunction.",
    precautions:
      "1. Pace activities to avoid post-exertional worsening.\n2. Sleep hygiene.\n3. Manage symptoms with prescribed medications.\n4. Cognitive and physical therapy tailored to condition.\n5. Regular medical monitoring.",
  },
  {
    name: "Raynaud's Phenomenon",
    pathognomonicKeywords: [
      "raynaud's",
      "raynaud",
      "fingers turn white blue cold",
      "color change fingers cold",
    ],
    primaryKeywords: [
      "fingers turn white then blue then red cold",
      "toes fingers numb cold triggered",
    ],
    secondaryKeywords: [
      "cold fingers",
      "color change hands",
      "numbness cold",
      "tingling fingers",
    ],
    negativeKeywords: [],
    clusters: [["color change fingers", "cold triggered", "numbness"]],
    cause:
      "Caused by exaggerated vascular response to cold or stress. Can be primary or secondary to autoimmune disease.",
    precautions:
      "1. Keep hands and feet warm.\n2. Avoid cold exposure and stress.\n3. Take prescribed calcium channel blockers.\n4. Stop smoking.\n5. Screen for underlying autoimmune disease.",
  },
  {
    name: "Hypoglycemia (Low Blood Sugar)",
    pathognomonicKeywords: [
      "hypoglycemia",
      "low blood sugar",
      "sugar crash",
      "blood sugar low",
    ],
    primaryKeywords: [
      "shaking sweating hungry suddenly",
      "trembling confusion hunger sudden",
    ],
    secondaryKeywords: [
      "shakiness",
      "sweating",
      "dizziness",
      "confusion",
      "fatigue",
      "rapid heartbeat",
      "hunger",
    ],
    negativeKeywords: [],
    clusters: [["shakiness", "sweating", "confusion", "hunger sudden"]],
    cause:
      "Caused by excessive insulin, skipped meals, or certain medications lowering blood glucose below normal.",
    precautions:
      "1. Eat 15g of fast-acting sugar immediately (glucose tablets, juice).\n2. Retest blood sugar after 15 minutes.\n3. Eat a meal after correction.\n4. Adjust medications if recurrent.\n5. Carry glucose tablets always.",
  },
  {
    name: "Fainting (Syncope)",
    pathognomonicKeywords: [
      "syncope",
      "fainting",
      "blacking out",
      "passing out briefly",
    ],
    primaryKeywords: [
      "sudden loss of consciousness brief",
      "fainted from standing",
    ],
    secondaryKeywords: [
      "dizziness",
      "lightheadedness",
      "faintness",
      "pale skin before fainting",
      "sweating before faint",
    ],
    negativeKeywords: [],
    clusters: [
      [
        "sudden loss of consciousness",
        "preceded by dizziness",
        "brief recovery",
      ],
    ],
    cause:
      "Caused by temporary drop in blood flow to the brain from dehydration, standing, heat, or cardiac causes.",
    precautions:
      "1. Lie down with legs elevated when feeling faint.\n2. Stay hydrated.\n3. Rise slowly from sitting/lying.\n4. Seek medical evaluation for recurrent fainting.\n5. Cardiac causes must be ruled out.",
  },
  {
    name: "Peptic Esophagitis",
    pathognomonicKeywords: [
      "esophagitis",
      "painful swallowing acid",
      "esophagus inflammation burning",
    ],
    primaryKeywords: [
      "difficulty swallowing burning chest",
      "pain swallowing acid",
    ],
    secondaryKeywords: [
      "painful swallowing",
      "chest burning",
      "heartburn",
      "nausea",
    ],
    negativeKeywords: [],
    clusters: [["painful swallowing", "burning chest", "acid reflux"]],
    cause:
      "Caused by stomach acid irritating the esophagus lining, often from GERD.",
    precautions:
      "1. Take prescribed proton pump inhibitors.\n2. Avoid acidic, spicy foods.\n3. Don't lie down after meals.\n4. Elevate head of bed.\n5. Endoscopy for persistent cases.",
  },
  {
    name: "Diverticulitis",
    pathognomonicKeywords: [
      "diverticulitis",
      "diverticula inflamed",
      "lower left abdominal pain fever",
    ],
    primaryKeywords: [
      "left lower abdominal pain fever",
      "sigmoid colon pain fever",
    ],
    secondaryKeywords: [
      "abdominal pain",
      "fever",
      "nausea",
      "constipation",
      "diarrhea",
      "bloating",
    ],
    negativeKeywords: [],
    clusters: [["left lower abdominal pain", "fever", "nausea"]],
    cause:
      "Caused by infection or inflammation of diverticula (small pouches) in the colon wall.",
    precautions:
      "1. Take prescribed antibiotics.\n2. Clear liquid diet during acute attack.\n3. High-fiber diet after recovery.\n4. Stay well hydrated.\n5. Surgery for recurrent or complicated cases.",
  },
  {
    name: "Hiatal Hernia",
    pathognomonicKeywords: [
      "hiatal hernia",
      "stomach up chest",
      "heartburn bending hernia",
    ],
    primaryKeywords: [
      "heartburn bending lying down",
      "difficulty swallowing burning hernia",
    ],
    secondaryKeywords: [
      "heartburn",
      "chest discomfort",
      "difficulty swallowing",
      "regurgitation",
      "belching",
    ],
    negativeKeywords: [],
    clusters: [["heartburn", "regurgitation", "worse bending lying"]],
    cause:
      "Part of the stomach pushes through the diaphragm into the chest cavity.",
    precautions:
      "1. Take prescribed antacids and PPIs.\n2. Eat smaller meals.\n3. Avoid lying down after eating.\n4. Lose weight if overweight.\n5. Surgery for severe symptomatic cases.",
  },
  {
    name: "Thoracic Outlet Syndrome",
    pathognomonicKeywords: [
      "thoracic outlet syndrome",
      "tos",
      "numbness arm overhead",
      "shoulder arm numbness overhead",
    ],
    primaryKeywords: [
      "arm numbness overhead activity",
      "shoulder neck arm pain tingling",
    ],
    secondaryKeywords: [
      "arm pain",
      "shoulder pain",
      "numbness",
      "tingling arm",
      "weakness arm",
    ],
    negativeKeywords: [],
    clusters: [["arm numbness", "overhead aggravation", "shoulder pain"]],
    cause:
      "Caused by compression of nerves or blood vessels between the collarbone and first rib.",
    precautions:
      "1. Physical therapy with specific exercises.\n2. Avoid aggravating postures.\n3. Anti-inflammatory medications.\n4. Surgery for vascular TOS.\n5. Ergonomic adjustments.",
  },
  {
    name: "Frozen Shoulder (Adhesive Capsulitis)",
    pathognomonicKeywords: [
      "frozen shoulder",
      "adhesive capsulitis",
      "shoulder stiff painful months",
    ],
    primaryKeywords: [
      "shoulder pain stiffness worsening months",
      "cannot lift arm pain",
    ],
    secondaryKeywords: [
      "shoulder pain",
      "stiffness",
      "limited shoulder movement",
    ],
    negativeKeywords: [],
    clusters: [["shoulder stiffness", "pain", "progressive loss of movement"]],
    cause:
      "Caused by inflammation and thickening of the shoulder joint capsule. Common after injury or immobilization.",
    precautions:
      "1. Physical therapy for stretching.\n2. Prescribed NSAIDs and corticosteroid injections.\n3. Shoulder manipulation under anesthesia.\n4. Surgery for refractory cases.\n5. Usually resolves in 1-3 years.",
  },
  {
    name: "Neuropathy (Peripheral)",
    pathognomonicKeywords: [
      "peripheral neuropathy",
      "nerve damage feet",
      "burning feet neuropathy",
      "diabetic neuropathy",
    ],
    primaryKeywords: [
      "burning tingling feet at night",
      "numbness feet glove stocking pattern",
    ],
    secondaryKeywords: [
      "numbness",
      "tingling sensation",
      "burning feet",
      "weakness",
      "loss of balance",
    ],
    negativeKeywords: [],
    clusters: [["burning feet", "tingling", "numbness at night"]],
    cause:
      "Caused by diabetes, B12 deficiency, alcohol, chemotherapy, or other conditions damaging peripheral nerves.",
    precautions:
      "1. Control blood sugar tightly.\n2. Take prescribed medications (gabapentin, pregabalin).\n3. B12 supplementation if deficient.\n4. Foot care to prevent injuries.\n5. Avoid alcohol.",
  },
  {
    name: "Polymyalgia Rheumatica",
    pathognomonicKeywords: [
      "polymyalgia rheumatica",
      "pmr",
      "shoulder hip stiffness elderly",
      "girdle stiffness elderly",
    ],
    primaryKeywords: [
      "shoulder hip stiffness morning elderly",
      "aching shoulders hips elderly morning",
    ],
    secondaryKeywords: [
      "stiffness",
      "shoulder pain",
      "hip pain",
      "fatigue",
      "fever",
      "weight loss",
    ],
    negativeKeywords: [],
    clusters: [["morning stiffness", "shoulder hip pain", "elderly"]],
    cause:
      "Immune-mediated inflammatory condition of the shoulder and hip girdle muscles, more common over 50.",
    precautions:
      "1. Prescribed corticosteroids (prednisolone) are very effective.\n2. Regular rheumatology follow-up.\n3. Monitor for giant cell arteritis (GCA).\n4. Bone protection with calcium/vitamin D.\n5. Gradual steroid tapering.",
  },
  {
    name: "Systemic Sclerosis (Scleroderma)",
    pathognomonicKeywords: [
      "scleroderma",
      "systemic sclerosis",
      "tight hardened skin",
      "thick hard skin autoimmune",
    ],
    primaryKeywords: [
      "hardening tight skin hands face",
      "fingers swell hard skin raynaud",
    ],
    secondaryKeywords: [
      "skin tightening",
      "swallowing difficulty",
      "raynaud's",
      "joint pain",
      "fatigue",
    ],
    negativeKeywords: [],
    clusters: [["hardening skin", "Raynaud's", "swallowing difficulty"]],
    cause:
      "Autoimmune condition causing excess collagen production, hardening skin and damaging internal organs.",
    precautions:
      "1. Take prescribed immunosuppressants.\n2. Protect hands from cold.\n3. Treat acid reflux aggressively.\n4. Regular lung and heart monitoring.\n5. Physiotherapy to maintain joint mobility.",
  },
  {
    name: "Sjögren's Syndrome",
    pathognomonicKeywords: [
      "sjögren",
      "sjogren syndrome",
      "dry eyes dry mouth autoimmune",
    ],
    primaryKeywords: [
      "dry eyes dry mouth persistent",
      "difficulty swallowing dry mouth",
    ],
    secondaryKeywords: [
      "dry eyes",
      "dry mouth",
      "fatigue",
      "joint pain",
      "difficulty swallowing",
    ],
    negativeKeywords: [],
    clusters: [["dry eyes", "dry mouth", "fatigue"]],
    cause:
      "Autoimmune condition where immune cells attack moisture-producing glands (salivary and lacrimal).",
    precautions:
      "1. Use artificial tears and saliva substitutes.\n2. Stay hydrated.\n3. Take prescribed hydroxychloroquine.\n4. Regular dental care.\n5. Monitor for complications (lymphoma).",
  },
  {
    name: "Marfan Syndrome",
    pathognomonicKeywords: [
      "marfan syndrome",
      "tall thin heart problems",
      "aortic aneurysm tall person",
    ],
    primaryKeywords: [
      "very tall thin long limbs heart issues",
      "lens dislocation tall person",
    ],
    secondaryKeywords: [
      "tall stature",
      "joint hypermobility",
      "eye problems",
      "heart murmur",
      "stretch marks",
    ],
    negativeKeywords: [],
    clusters: [["tall thin build", "heart problems", "joint hypermobility"]],
    cause:
      "Genetic disorder in fibrillin-1 protein affecting connective tissue throughout the body.",
    precautions:
      "1. Regular cardiology monitoring for aortic dilation.\n2. Beta-blockers to slow aortic dilation.\n3. Surgery for significant aortic enlargement.\n4. Avoid contact sports and heavy lifting.\n5. Regular ophthalmology check-ups.",
  },
  {
    name: "Acoustic Neuroma",
    pathognomonicKeywords: [
      "acoustic neuroma",
      "vestibular schwannoma",
      "one ear hearing loss tinnitus",
    ],
    primaryKeywords: [
      "one side hearing loss gradually",
      "tinnitus one ear balance problems",
    ],
    secondaryKeywords: [
      "hearing loss",
      "ear ringing",
      "balance problems",
      "dizziness",
    ],
    negativeKeywords: [],
    clusters: [["one-sided hearing loss", "tinnitus", "balance problems"]],
    cause:
      "Benign tumor on the vestibulocochlear nerve. Slow growing, compresses hearing and balance nerves.",
    precautions:
      "1. MRI for diagnosis.\n2. Watchful waiting for small tumors.\n3. Stereotactic radiosurgery (Gamma Knife).\n4. Surgical removal.\n5. Regular audiometry monitoring.",
  },
  {
    name: "Meniere's Disease",
    pathognomonicKeywords: [
      "meniere's disease",
      "meniere disease",
      "episodic vertigo hearing loss tinnitus",
    ],
    primaryKeywords: [
      "episodic severe vertigo hearing loss",
      "spinning dizziness one ear fullness",
    ],
    secondaryKeywords: [
      "vertigo",
      "hearing loss",
      "ear ringing",
      "ear fullness",
      "nausea",
    ],
    negativeKeywords: [],
    clusters: [
      ["episodic vertigo", "hearing loss", "ear fullness", "tinnitus"],
    ],
    cause:
      "Caused by abnormal fluid pressure in the inner ear. Exact cause unknown.",
    precautions:
      "1. Low-salt diet to reduce fluid retention.\n2. Take prescribed diuretics.\n3. Avoid caffeine and alcohol.\n4. Vestibular rehabilitation exercises.\n5. Intratympanic injections for severe cases.",
  },
  {
    name: "Tinnitus",
    pathognomonicKeywords: [
      "tinnitus",
      "ringing in ears constant",
      "buzzing ears no external sound",
    ],
    primaryKeywords: [
      "constant ringing buzzing one or both ears",
      "noise in ears all the time",
    ],
    secondaryKeywords: [
      "ear ringing",
      "hearing loss",
      "dizziness",
      "sleep problems",
    ],
    negativeKeywords: [],
    clusters: [["constant ear ringing", "no external sound"]],
    cause:
      "Caused by noise exposure, ear infections, hearing loss, medication side effects, or stress.",
    precautions:
      "1. Avoid loud noise exposure.\n2. Cognitive behavioral therapy helps management.\n3. White noise or sound therapy.\n4. Hearing aids if hearing loss is present.\n5. Treat underlying cause.",
  },
  {
    name: "Ménière's Attack / Vestibular Neuritis",
    pathognomonicKeywords: [
      "vestibular neuritis",
      "inner ear infection vertigo",
      "labyrinthitis",
    ],
    primaryKeywords: [
      "sudden severe vertigo days",
      "nausea vomiting vertigo days without hearing loss",
    ],
    secondaryKeywords: [
      "vertigo",
      "nausea",
      "vomiting",
      "imbalance",
      "dizziness",
    ],
    negativeKeywords: [],
    clusters: [["sudden severe vertigo", "nausea vomiting", "days duration"]],
    cause:
      "Caused by viral inflammation of the vestibular nerve disrupting balance signals.",
    precautions:
      "1. Take prescribed vestibular suppressants.\n2. Anti-nausea medications.\n3. Rest in quiet, dark environment.\n4. Vestibular exercises to aid recovery.\n5. Usually resolves within weeks.",
  },
  {
    name: "Costochondritis",
    pathognomonicKeywords: [
      "costochondritis",
      "chest wall pain cartilage",
      "rib cartilage pain",
    ],
    primaryKeywords: [
      "chest pain pressing ribs worse movement",
      "rib junction pain pressing",
    ],
    secondaryKeywords: [
      "chest pain",
      "rib pain",
      "pain pressing on chest",
      "pain deep breath",
    ],
    negativeKeywords: [
      "shortness of breath severe",
      "sweating",
      "left arm pain",
    ],
    clusters: [["chest pain", "worse with pressure on ribs", "movement"]],
    cause:
      "Inflammation of the cartilage connecting the ribs to the sternum. Often follows respiratory illness.",
    precautions:
      "1. Take NSAIDs for pain relief.\n2. Apply heat or cold to the chest.\n3. Avoid strenuous activity.\n4. Usually self-limiting.\n5. See a doctor to rule out cardiac causes.",
  },
  {
    name: "Interstitial Cystitis",
    pathognomonicKeywords: [
      "interstitial cystitis",
      "painful bladder syndrome",
      "bladder pain no infection",
    ],
    primaryKeywords: [
      "bladder pain frequent urination no infection",
      "pelvic pain urinary frequency chronic",
    ],
    secondaryKeywords: [
      "pelvic pain",
      "frequent urination",
      "bladder pain",
      "urinary urgency",
    ],
    negativeKeywords: [],
    clusters: [["bladder pain", "frequency", "urgency", "no infection"]],
    cause:
      "Cause unknown. May involve defective bladder lining, nerve dysfunction, or autoimmune factors.",
    precautions:
      "1. Avoid bladder irritants (caffeine, alcohol, spicy food).\n2. Take prescribed pentosan polysulfate or amitriptyline.\n3. Bladder training exercises.\n4. Physiotherapy for pelvic floor.\n5. Intravesical treatments for refractory cases.",
  },
  {
    name: "Polycythemia Vera",
    pathognomonicKeywords: [
      "polycythemia vera",
      "high red blood cell count",
      "too many red cells",
    ],
    primaryKeywords: [
      "ruddy complexion headache itching after shower",
      "itching hot water blood thick",
    ],
    secondaryKeywords: [
      "headache",
      "itching",
      "fatigue",
      "blurred vision",
      "blood clots",
    ],
    negativeKeywords: [],
    clusters: [["itching after shower", "headache", "flushing face"]],
    cause:
      "Caused by JAK2 gene mutation leading to overproduction of red blood cells in bone marrow.",
    precautions:
      "1. Regular phlebotomy to reduce red cell mass.\n2. Take prescribed hydroxyurea.\n3. Low-dose aspirin.\n4. Monitor for blood clots.\n5. Regular hematology follow-up.",
  },
  {
    name: "Lymphoma",
    pathognomonicKeywords: [
      "lymphoma",
      "hodgkin lymphoma",
      "non-hodgkin lymphoma",
      "lymph node cancer",
    ],
    primaryKeywords: [
      "painless swollen lymph nodes persistent",
      "night sweats weight loss swollen glands",
    ],
    secondaryKeywords: [
      "swollen lymph nodes",
      "unexplained weight loss",
      "sweating at night",
      "fatigue",
      "fever",
    ],
    negativeKeywords: [],
    clusters: [
      ["painless lymph node swelling", "night sweats", "weight loss", "fever"],
    ],
    cause:
      "Cancer of lymphocytes. Risk factors include immunosuppression, viral infections (EBV, HIV), and age.",
    precautions:
      "1. Seek urgent medical evaluation and biopsy.\n2. Follow prescribed chemotherapy or radiation.\n3. Regular blood count monitoring.\n4. Avoid infections during immunosuppressive treatment.\n5. Regular follow-up for relapse.",
  },
  {
    name: "Myeloma (Multiple Myeloma)",
    pathognomonicKeywords: [
      "multiple myeloma",
      "myeloma",
      "bone pain anemia kidney problems blood cancer",
    ],
    primaryKeywords: [
      "bone pain back ribs anemia weakness",
      "frequent infections bone pain",
    ],
    secondaryKeywords: [
      "bone pain",
      "fatigue",
      "anemia",
      "kidney problems",
      "frequent infections",
      "back pain",
    ],
    negativeKeywords: [],
    clusters: [["bone pain", "anemia", "frequent infections"]],
    cause:
      "Cancer of plasma cells in bone marrow producing abnormal antibodies. Risk: age, family history.",
    precautions:
      "1. Seek hematology evaluation.\n2. Prescribed chemotherapy, targeted therapy, and stem cell transplant.\n3. Bisphosphonates for bone protection.\n4. Stay hydrated for kidney protection.\n5. Regular monitoring of blood and urine proteins.",
  },

  // ── ADDITIONAL INFECTIOUS ───────────────────────────────────────────────────
  {
    name: "Meningococcemia",
    pathognomonicKeywords: [
      "meningococcemia",
      "meningococcal septicemia",
      "non-blanching petechial rash fever",
    ],
    primaryKeywords: [
      "purple non-fading spots fever",
      "petechiae fever rapidly spreading",
    ],
    secondaryKeywords: ["fever", "rash", "headache", "stiff neck", "vomiting"],
    negativeKeywords: [],
    clusters: [["non-blanching rash", "high fever", "rapid deterioration"]],
    cause:
      "Caused by Neisseria meningitidis bacteria entering the bloodstream. Life-threatening emergency.",
    precautions:
      "1. CALL EMERGENCY SERVICES IMMEDIATELY.\n2. IV antibiotics (cefotaxime, penicillin) within minutes.\n3. Intensive care unit admission.\n4. Meningococcal vaccination prevents infection.\n5. Close contacts require prophylactic antibiotics.",
  },
  {
    name: "Sepsis",
    pathognomonicKeywords: [
      "sepsis",
      "blood poisoning",
      "septicemia",
      "septic shock",
    ],
    primaryKeywords: [
      "high fever confusion rapid breathing fast heart rate infection",
    ],
    secondaryKeywords: [
      "high fever",
      "confusion",
      "rapid breathing",
      "low blood pressure",
      "chills",
    ],
    negativeKeywords: [],
    clusters: [
      ["high fever", "confusion", "rapid heart rate", "suspected infection"],
    ],
    cause:
      "Life-threatening response to infection causing systemic inflammation and organ failure.",
    precautions:
      "1. SEEK EMERGENCY CARE IMMEDIATELY.\n2. IV antibiotics within one hour.\n3. IV fluids for blood pressure support.\n4. Blood cultures before antibiotics.\n5. ICU care for septic shock.",
  },
  {
    name: "Shingella (Shigellosis)",
    pathognomonicKeywords: [
      "shigellosis",
      "shigella",
      "bloody diarrhea dysentery bacteria",
    ],
    primaryKeywords: [
      "bloody diarrhea fever cramping sudden",
      "acute dysentery bloody stool",
    ],
    secondaryKeywords: [
      "bloody diarrhea",
      "abdominal cramps",
      "fever",
      "nausea",
      "vomiting",
    ],
    negativeKeywords: [],
    clusters: [["bloody diarrhea", "fever", "abdominal cramps"]],
    cause:
      "Caused by Shigella bacteria from contaminated food or water. Highly infectious.",
    precautions:
      "1. Take prescribed antibiotics (azithromycin, ciprofloxacin).\n2. Stay hydrated.\n3. Strict hand hygiene.\n4. Avoid preparing food for others.\n5. Report to health authorities if outbreak suspected.",
  },
  {
    name: "Rocky Mountain Spotted Fever",
    pathognomonicKeywords: [
      "rocky mountain spotted fever",
      "rmsf",
      "tick bite rash hands feet fever",
    ],
    primaryKeywords: [
      "fever rash hands feet tick bite",
      "rash starting wrists ankles fever",
    ],
    secondaryKeywords: ["fever", "headache", "rash", "muscle pain", "nausea"],
    negativeKeywords: [],
    clusters: [["fever", "rash palms soles", "recent tick bite"]],
    cause:
      "Caused by Rickettsia rickettsii bacteria transmitted by tick bites.",
    precautions:
      "1. Take prescribed doxycycline immediately.\n2. Remove ticks promptly and correctly.\n3. Use tick repellent outdoors.\n4. Check for ticks after outdoor activities.\n5. Seek care immediately — can be fatal if delayed.",
  },
  {
    name: "Cat Scratch Disease",
    pathognomonicKeywords: [
      "cat scratch disease",
      "cat scratch fever",
      "bartonella cat scratch",
    ],
    primaryKeywords: [
      "swollen lymph nodes near cat scratch",
      "cat scratch enlarged lymph node",
    ],
    secondaryKeywords: [
      "swollen lymph nodes",
      "fever",
      "fatigue",
      "swelling near scratch",
    ],
    negativeKeywords: [],
    clusters: [["cat scratch", "swollen lymph node", "fever"]],
    cause:
      "Caused by Bartonella henselae bacteria transmitted through cat scratches or bites.",
    precautions:
      "1. Usually self-limiting in healthy individuals.\n2. Prescribed antibiotics for severe cases.\n3. Wash all cat scratches with soap and water immediately.\n4. Avoid rough play with cats.\n5. Seek care if lymph nodes are very swollen or fever persists.",
  },
  {
    name: "Q Fever",
    pathognomonicKeywords: [
      "q fever",
      "coxiella burnetii",
      "fever after livestock contact",
    ],
    primaryKeywords: [
      "high fever after animal farm contact",
      "pneumonia hepatitis after farm",
    ],
    secondaryKeywords: [
      "high fever",
      "headache",
      "muscle pain",
      "fatigue",
      "cough",
      "chest pain",
    ],
    negativeKeywords: [],
    clusters: [["fever", "headache", "animal/farm exposure"]],
    cause:
      "Caused by Coxiella burnetii bacteria, spread through infected livestock (cattle, sheep, goats).",
    precautions:
      "1. Take prescribed doxycycline.\n2. Use masks when handling animals.\n3. Pasteurize milk.\n4. Q fever vaccine for high-risk workers.\n5. Long-term antibiotics for chronic Q fever.",
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

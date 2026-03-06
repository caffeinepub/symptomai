export interface AnalysisResult {
  disease: string;
  cause: string;
  precautions: string;
}

interface ConditionDefinition {
  name: string;
  keywords: string[];
  cause: string;
  precautions: string;
}

const CONDITIONS: ConditionDefinition[] = [
  {
    name: "Common Cold",
    keywords: [
      "runny nose",
      "stuffy nose",
      "nasal congestion",
      "sneezing",
      "mild sore throat",
      "mild fever",
      "common cold",
      "congestion",
      "watery eyes",
      "mild cough",
    ],
    cause:
      "Caused by viral infection, most commonly rhinovirus. Spreads through respiratory droplets and direct contact with infected surfaces.",
    precautions:
      "1. Rest adequately and stay hydrated with warm fluids.\n2. Use saline nasal spray to relieve congestion.\n3. Avoid close contact with others to prevent spread.\n4. Wash hands frequently with soap and water.\n5. Consider over-the-counter decongestants or antihistamines for symptom relief.",
  },
  {
    name: "Influenza (Flu)",
    keywords: [
      "influenza",
      "flu",
      "high fever",
      "body aches",
      "muscle aches",
      "chills",
      "severe fatigue",
      "headache",
      "dry cough",
      "sudden onset",
      "sweating",
    ],
    cause:
      "Caused by influenza A or B viruses. Highly contagious, spreading through respiratory droplets when an infected person coughs, sneezes, or talks.",
    precautions:
      "1. Get annual flu vaccination as preventive measure.\n2. Rest and drink plenty of fluids to support recovery.\n3. Take antiviral medications (like oseltamivir) if prescribed within 48 hours of onset.\n4. Stay home to avoid spreading the virus to others.\n5. Use fever reducers like acetaminophen or ibuprofen as directed.",
  },
  {
    name: "COVID-19",
    keywords: [
      "covid",
      "coronavirus",
      "loss of smell",
      "loss of taste",
      "shortness of breath",
      "difficulty breathing",
      "persistent cough",
      "oxygen",
      "quarantine",
      "isolation",
    ],
    cause:
      "Caused by SARS-CoV-2 coronavirus. Spreads primarily through respiratory droplets and aerosols from an infected person, especially in poorly ventilated areas.",
    precautions:
      "1. Get tested immediately and isolate if positive.\n2. Monitor oxygen levels; seek emergency care if below 94%.\n3. Stay hydrated and rest; take fever reducers as needed.\n4. Wear a well-fitting mask in public settings.\n5. Contact a healthcare provider for guidance on antiviral treatment options.",
  },
  {
    name: "Strep Throat",
    keywords: [
      "strep",
      "severe sore throat",
      "throat pain",
      "difficulty swallowing",
      "swollen tonsils",
      "white patches",
      "throat",
      "tonsils",
      "painful swallowing",
      "strep throat",
    ],
    cause:
      "Caused by Group A Streptococcus bacteria. Spreads through respiratory droplets or contact with infected surfaces. Most common in children but can affect adults.",
    precautions:
      "1. See a doctor for a strep test and antibiotic prescription.\n2. Complete the full antibiotic course even if symptoms improve.\n3. Rest your voice and avoid irritants like smoke.\n4. Gargle with warm salt water to reduce throat discomfort.\n5. Stay home until fever-free for 24 hours and on antibiotics for 24 hours.",
  },
  {
    name: "Pneumonia",
    keywords: [
      "pneumonia",
      "chest pain",
      "rattling breath",
      "productive cough",
      "coughing mucus",
      "high fever",
      "chills",
      "lung",
      "chest tightness",
      "labored breathing",
    ],
    cause:
      "Can be caused by bacteria (Streptococcus pneumoniae), viruses, or fungi. Infection inflames air sacs in one or both lungs, which may fill with fluid.",
    precautions:
      "1. Seek immediate medical attention — pneumonia can be life-threatening.\n2. Take prescribed antibiotics (bacterial) or antivirals (viral) as directed.\n3. Rest completely and avoid strenuous activity.\n4. Stay well-hydrated to help thin mucus secretions.\n5. Get pneumococcal vaccine to prevent future infections.",
  },
  {
    name: "Bronchitis",
    keywords: [
      "bronchitis",
      "persistent cough",
      "mucus cough",
      "phlegm",
      "chest congestion",
      "wheezing",
      "low-grade fever",
      "productive cough",
      "bronchial",
    ],
    cause:
      "Acute bronchitis is usually caused by viral infections (same viruses as cold/flu). Chronic bronchitis is caused by long-term irritation, often from smoking or pollution.",
    precautions:
      "1. Rest and drink plenty of fluids to stay hydrated.\n2. Use a humidifier to add moisture to the air.\n3. Avoid smoke, dust, and other lung irritants.\n4. Over-the-counter cough suppressants may help at night.\n5. See a doctor if symptoms last more than 3 weeks or fever develops.",
  },
  {
    name: "Asthma",
    keywords: [
      "asthma",
      "wheezing",
      "breathlessness",
      "tightness in chest",
      "shortness of breath exercise",
      "inhaler",
      "bronchospasm",
      "allergic asthma",
      "night cough",
      "cough at night",
    ],
    cause:
      "Caused by chronic airway inflammation, leading to bronchospasm triggered by allergens, exercise, cold air, respiratory infections, or stress.",
    precautions:
      "1. Identify and avoid personal asthma triggers (allergens, smoke, cold air).\n2. Use prescribed controller inhalers (corticosteroids) daily as directed.\n3. Keep rescue inhaler (albuterol) accessible at all times.\n4. Monitor peak flow regularly to track lung function.\n5. Create an asthma action plan with your doctor for emergencies.",
  },
  {
    name: "Migraine",
    keywords: [
      "migraine",
      "throbbing headache",
      "one side head",
      "light sensitivity",
      "nausea headache",
      "aura",
      "visual disturbance",
      "pulsating pain",
      "sensitivity to light",
      "sensitivity to sound",
    ],
    cause:
      "Migraines involve abnormal brain activity affecting nerve signals, chemicals, and blood vessels. Triggers include hormonal changes, certain foods, stress, sensory stimuli, and sleep disruptions.",
    precautions:
      "1. Rest in a quiet, dark room during an attack.\n2. Take prescribed triptans or pain relievers early in the attack.\n3. Apply cold or warm compresses to the head and neck.\n4. Keep a migraine diary to identify and avoid personal triggers.\n5. Consider preventive medications if migraines occur frequently.",
  },
  {
    name: "Tension Headache",
    keywords: [
      "tension headache",
      "pressure headache",
      "head pressure",
      "band around head",
      "tight headache",
      "stress headache",
      "both sides headache",
      "neck tension",
      "shoulder tension",
    ],
    cause:
      "Caused by muscle tension in the scalp, neck, and shoulders, often triggered by stress, poor posture, eye strain, or dehydration.",
    precautions:
      "1. Take OTC pain relievers like ibuprofen or acetaminophen.\n2. Apply a warm compress to the neck and shoulders.\n3. Practice stress-reduction techniques like deep breathing or meditation.\n4. Maintain good posture and take regular breaks from screens.\n5. Stay hydrated and maintain a regular sleep schedule.",
  },
  {
    name: "Hypertension (High Blood Pressure)",
    keywords: [
      "high blood pressure",
      "hypertension",
      "headache back of head",
      "dizziness",
      "blurred vision",
      "nosebleed",
      "heart pounding",
      "pressure reading",
      "systolic",
      "blood pressure",
    ],
    cause:
      "Often called the 'silent killer,' caused by factors including high sodium diet, obesity, inactivity, stress, genetics, kidney disease, or certain medications.",
    precautions:
      "1. Monitor blood pressure regularly and take prescribed medications consistently.\n2. Follow a low-sodium, heart-healthy diet (DASH diet).\n3. Exercise regularly — at least 150 minutes of moderate activity per week.\n4. Limit alcohol consumption and quit smoking.\n5. Manage stress through relaxation techniques and adequate sleep.",
  },
  {
    name: "Gastroenteritis (Stomach Flu)",
    keywords: [
      "stomach flu",
      "gastroenteritis",
      "vomiting",
      "diarrhea",
      "stomach cramps",
      "nausea",
      "stomach ache",
      "abdominal cramps",
      "loose stools",
      "watery diarrhea",
    ],
    cause:
      "Caused by viral (norovirus, rotavirus) or bacterial infections, typically through contaminated food or water, or contact with an infected person.",
    precautions:
      "1. Rehydrate with oral rehydration solutions, clear broths, or electrolyte drinks.\n2. Rest and avoid solid foods until vomiting subsides, then start with bland foods.\n3. Wash hands thoroughly, especially after using the bathroom.\n4. Avoid dairy, fatty, or spicy foods during recovery.\n5. Seek medical attention if symptoms last more than 2 days or signs of dehydration appear.",
  },
  {
    name: "GERD / Acid Reflux",
    keywords: [
      "heartburn",
      "acid reflux",
      "gerd",
      "burning chest",
      "regurgitation",
      "sour taste",
      "acid taste",
      "indigestion",
      "burning stomach",
      "throat burning",
      "burping",
    ],
    cause:
      "Caused by stomach acid frequently flowing back into the esophagus, weakening the lower esophageal sphincter. Triggers include fatty foods, caffeine, alcohol, large meals, and obesity.",
    precautions:
      "1. Eat smaller, more frequent meals instead of large meals.\n2. Avoid trigger foods: spicy, fatty, acidic foods, caffeine, and alcohol.\n3. Don't lie down within 2-3 hours after eating.\n4. Elevate the head of your bed by 6-8 inches.\n5. Take antacids or prescribed proton pump inhibitors as directed.",
  },
  {
    name: "Food Poisoning",
    keywords: [
      "food poisoning",
      "after eating",
      "contaminated food",
      "food sick",
      "sudden nausea",
      "vomiting after meal",
      "diarrhea after eating",
      "stomach pain meal",
      "bad food",
    ],
    cause:
      "Caused by consuming food contaminated with bacteria (Salmonella, E. coli, Listeria), viruses, or toxins. Common sources include undercooked meat, raw eggs, unpasteurized dairy, and unwashed produce.",
    precautions:
      "1. Stay hydrated — replace fluids and electrolytes lost through vomiting and diarrhea.\n2. Rest and avoid solid foods until symptoms improve.\n3. Seek emergency care for bloody stool, high fever, or severe dehydration.\n4. Discard any suspected contaminated food.\n5. Practice safe food handling: proper cooking temperatures and refrigeration.",
  },
  {
    name: "Appendicitis",
    keywords: [
      "appendicitis",
      "lower right pain",
      "right side abdomen",
      "rebound tenderness",
      "appendix",
      "sharp abdominal pain",
      "pain around navel",
    ],
    cause:
      "Caused by blockage of the appendix, often by fecal matter, leading to bacterial overgrowth, inflammation, and potential rupture if untreated.",
    precautions:
      "1. SEEK EMERGENCY MEDICAL CARE IMMEDIATELY — appendicitis is a surgical emergency.\n2. Do not eat, drink, or take laxatives while waiting for care.\n3. Do not apply a heating pad to the abdomen as it can worsen inflammation.\n4. Surgery (appendectomy) is the standard treatment.\n5. Follow all post-surgical recovery instructions from your surgeon.",
  },
  {
    name: "Urinary Tract Infection (UTI)",
    keywords: [
      "uti",
      "urinary tract",
      "burning urination",
      "frequent urination",
      "painful urination",
      "cloudy urine",
      "blood in urine",
      "pelvic pain",
      "strong smelling urine",
      "bladder pain",
    ],
    cause:
      "Caused by bacteria (most commonly E. coli) entering the urinary tract. More common in women due to shorter urethra. Risk factors include sexual activity, dehydration, and urinary catheters.",
    precautions:
      "1. See a doctor for antibiotics — UTIs rarely clear without treatment.\n2. Drink plenty of water to flush bacteria from the urinary tract.\n3. Urinate frequently and fully empty the bladder.\n4. Wipe from front to back after using the bathroom.\n5. Cranberry products may help prevent recurrence but are not a cure.",
  },
  {
    name: "Allergic Reaction",
    keywords: [
      "allergy",
      "allergic",
      "hives",
      "swelling",
      "itching",
      "rash",
      "runny nose allergy",
      "watery eyes",
      "sneezing allergy",
      "anaphylaxis",
      "bee sting",
    ],
    cause:
      "Caused by the immune system overreacting to a harmless substance (allergen) such as pollen, pet dander, certain foods, insect stings, or medications.",
    precautions:
      "1. Identify and strictly avoid known allergens.\n2. Take antihistamines for mild reactions; use prescribed epinephrine (EpiPen) for severe reactions.\n3. Seek emergency care immediately for signs of anaphylaxis (throat swelling, difficulty breathing).\n4. Consider allergy testing to identify specific triggers.\n5. Wear a medical alert bracelet if you have severe allergies.",
  },
  {
    name: "Eczema / Dermatitis",
    keywords: [
      "eczema",
      "dermatitis",
      "dry skin",
      "flaky skin",
      "skin inflammation",
      "skin redness",
      "itchy skin",
      "skin patches",
      "cracked skin",
      "scaly skin",
    ],
    cause:
      "Caused by a combination of genetic and environmental factors leading to a weakened skin barrier. Triggers include soaps, detergents, stress, sweat, certain fabrics, and allergens.",
    precautions:
      "1. Moisturize the skin frequently with fragrance-free emollients.\n2. Use prescribed topical corticosteroids or calcineurin inhibitors for flare-ups.\n3. Avoid known triggers: harsh soaps, certain fabrics, and extreme temperatures.\n4. Take lukewarm (not hot) showers and pat skin dry gently.\n5. Consider allergy testing to identify contributing allergens.",
  },
  {
    name: "Conjunctivitis (Pink Eye)",
    keywords: [
      "pink eye",
      "conjunctivitis",
      "red eye",
      "eye discharge",
      "eye crusting",
      "eye itching",
      "eye burning",
      "watery eye",
      "eye infection",
      "swollen eye",
    ],
    cause:
      "Can be caused by viral infection (most common), bacterial infection, allergies, or chemical irritants. Viral and bacterial forms are highly contagious.",
    precautions:
      "1. Wash hands frequently and avoid touching your eyes.\n2. Do not share towels, pillowcases, or eye makeup.\n3. Use prescribed antibiotic eye drops for bacterial conjunctivitis.\n4. Apply cool compresses to relieve discomfort.\n5. Discard and replace eye makeup used before/during infection.",
  },
  {
    name: "Anemia",
    keywords: [
      "anemia",
      "pale skin",
      "extreme fatigue",
      "weakness",
      "dizziness",
      "shortness breath exertion",
      "cold hands",
      "cold feet",
      "irregular heartbeat",
      "brittle nails",
      "iron deficiency",
    ],
    cause:
      "Caused by insufficient healthy red blood cells or hemoglobin, often due to iron deficiency, vitamin B12/folate deficiency, chronic disease, blood loss, or bone marrow problems.",
    precautions:
      "1. Get a blood test to confirm type and cause of anemia.\n2. Take prescribed iron, B12, or folate supplements as directed.\n3. Eat iron-rich foods: lean meat, beans, lentils, spinach, and fortified cereals.\n4. Combine iron-rich foods with vitamin C to enhance absorption.\n5. Avoid tea or coffee with meals as they inhibit iron absorption.",
  },
  {
    name: "Type 2 Diabetes",
    keywords: [
      "diabetes",
      "frequent thirst",
      "frequent urination",
      "increased hunger",
      "blurred vision",
      "slow healing",
      "fatigue",
      "tingling",
      "numbness",
      "blood sugar",
      "glucose",
      "diabetic",
    ],
    cause:
      "Caused by insulin resistance and impaired insulin secretion, leading to elevated blood sugar. Risk factors include obesity, physical inactivity, family history, and poor diet.",
    precautions:
      "1. Monitor blood glucose levels regularly as prescribed.\n2. Follow a balanced diet low in refined carbohydrates and added sugars.\n3. Exercise regularly to improve insulin sensitivity.\n4. Take prescribed medications (metformin, insulin) consistently.\n5. Attend regular check-ups for eye, kidney, and foot health monitoring.",
  },
  {
    name: "Anxiety / Panic Attack",
    keywords: [
      "anxiety",
      "panic attack",
      "racing heart",
      "heart palpitations",
      "shortness breath anxiety",
      "trembling",
      "sweating anxiety",
      "fear",
      "dread",
      "chest tightness anxiety",
      "nervous",
      "worry",
    ],
    cause:
      "Caused by the brain's fight-or-flight response being triggered inappropriately. Contributing factors include stress, genetics, brain chemistry, trauma, and certain medical conditions.",
    precautions:
      "1. Practice deep breathing: inhale for 4 counts, hold for 4, exhale for 6.\n2. Ground yourself using the 5-4-3-2-1 sensory technique during a panic attack.\n3. Seek therapy, particularly Cognitive Behavioral Therapy (CBT).\n4. Regular exercise and sleep can significantly reduce anxiety.\n5. Discuss medication options (SSRIs, SNRIs, or anxiolytics) with your doctor.",
  },
  {
    name: "Depression",
    keywords: [
      "depression",
      "sadness",
      "hopelessness",
      "loss of interest",
      "worthlessness",
      "empty feeling",
      "no motivation",
      "crying",
      "despair",
      "no enjoyment",
      "depressed",
    ],
    cause:
      "Caused by a combination of biological (genetics, brain chemistry), psychological, and social factors. Life events like loss, trauma, or chronic stress can trigger episodes.",
    precautions:
      "1. Seek professional help from a therapist or psychiatrist.\n2. Take prescribed antidepressants consistently; effects take 4-6 weeks.\n3. Maintain a routine: regular sleep, meals, and physical activity.\n4. Reach out to trusted friends and family for social support.\n5. Avoid alcohol and recreational drugs which worsen depression.",
  },
  {
    name: "Insomnia",
    keywords: [
      "insomnia",
      "can't sleep",
      "trouble sleeping",
      "waking up",
      "restless sleep",
      "sleep problems",
      "difficulty falling asleep",
      "lying awake",
      "poor sleep",
      "sleep quality",
    ],
    cause:
      "Caused by stress, anxiety, depression, irregular sleep schedules, excessive screen time, caffeine, medications, or underlying medical conditions.",
    precautions:
      "1. Maintain a consistent sleep schedule, even on weekends.\n2. Create a relaxing bedtime routine and cool, dark sleeping environment.\n3. Avoid screens, caffeine, and alcohol 2-3 hours before bed.\n4. Practice relaxation techniques like progressive muscle relaxation.\n5. See a doctor if insomnia persists — Cognitive Behavioral Therapy for Insomnia (CBT-I) is highly effective.",
  },
  {
    name: "Dehydration",
    keywords: [
      "dehydration",
      "not drinking water",
      "dark urine",
      "dry mouth",
      "extreme thirst",
      "no urination",
      "sunken eyes",
      "dizziness standing",
      "lightheaded",
      "dry skin",
    ],
    cause:
      "Caused by insufficient fluid intake or excessive fluid loss through sweating, vomiting, diarrhea, or urination. Hot weather, intense exercise, and illness increase risk.",
    precautions:
      "1. Drink water immediately — for mild dehydration, 1-2 liters can resolve symptoms.\n2. Use oral rehydration solutions (ORS) for moderate to severe dehydration.\n3. Avoid caffeine and alcohol which worsen dehydration.\n4. Eat water-rich foods: cucumbers, watermelon, oranges, and soups.\n5. Seek emergency care for severe dehydration (confusion, no urination for 8+ hours).",
  },
  {
    name: "Heat Exhaustion",
    keywords: [
      "heat exhaustion",
      "heat stroke",
      "overheating",
      "heavy sweating",
      "cool clammy skin",
      "weak pulse",
      "muscle cramps heat",
      "dizziness heat",
      "faintness",
      "hot environment",
    ],
    cause:
      "Caused by prolonged exposure to high temperatures combined with dehydration, leading the body's cooling mechanisms to become overwhelmed.",
    precautions:
      "1. Move to a cool, shaded area or air-conditioned space immediately.\n2. Drink cool water or electrolyte beverages slowly.\n3. Apply cool, wet cloths to the skin or take a cool shower.\n4. Loosen and remove excess clothing.\n5. Seek emergency care if symptoms progress to heat stroke (confusion, no sweating, very high temperature).",
  },
  {
    name: "Muscle Strain",
    keywords: [
      "muscle strain",
      "pulled muscle",
      "muscle pain",
      "muscle soreness",
      "stiffness",
      "muscle spasm",
      "after exercise",
      "overexertion",
      "tender muscle",
      "limited range of motion",
    ],
    cause:
      "Caused by overstretching or tearing of muscle fibers, often from sudden movements, overexertion, poor warm-up, or repetitive strain.",
    precautions:
      "1. Follow RICE: Rest, Ice (20 min every 2-3 hours), Compression, Elevation.\n2. Take OTC anti-inflammatory medications (ibuprofen) to reduce pain and swelling.\n3. Avoid the activity that caused the strain until healed.\n4. Gently stretch and warm up before physical activity in the future.\n5. See a physical therapist if pain persists beyond a few weeks.",
  },
  {
    name: "Arthritis",
    keywords: [
      "arthritis",
      "joint pain",
      "joint swelling",
      "stiff joints",
      "morning stiffness",
      "joint inflammation",
      "rheumatoid",
      "osteoarthritis",
      "creaking joints",
      "joint tenderness",
    ],
    cause:
      "Osteoarthritis is caused by cartilage breakdown due to aging and wear. Rheumatoid arthritis is an autoimmune disorder where the immune system attacks joint tissue.",
    precautions:
      "1. Take prescribed medications: NSAIDs, DMARDs, or biologics as directed.\n2. Perform low-impact exercise (swimming, cycling) to maintain joint mobility.\n3. Apply heat before activity and ice after to manage pain.\n4. Maintain a healthy weight to reduce pressure on weight-bearing joints.\n5. Work with a physical or occupational therapist for adaptive techniques.",
  },
  {
    name: "Lower Back Pain",
    keywords: [
      "back pain",
      "lower back",
      "lumbar pain",
      "spine pain",
      "back ache",
      "back stiffness",
      "sciatica",
      "radiating leg pain",
      "back injury",
      "sitting pain",
    ],
    cause:
      "Commonly caused by muscle or ligament strain, herniated disc, arthritis, osteoporosis, poor posture, or prolonged sitting. Can also stem from kidney issues.",
    precautions:
      "1. Apply ice for the first 48-72 hours, then switch to heat for muscle relaxation.\n2. Take OTC pain relievers like ibuprofen or acetaminophen.\n3. Keep moving with gentle activity — prolonged bed rest worsens back pain.\n4. Practice proper posture and use ergonomic supports when sitting.\n5. Strengthen core muscles through physical therapy exercises to prevent recurrence.",
  },
];

const GENERAL_RESPONSE: AnalysisResult = {
  disease: "Unable to Determine Specific Condition",
  cause:
    "The symptoms described do not clearly match a specific condition in our database. This could be due to a combination of symptoms, early-stage illness, or a condition requiring professional evaluation.",
  precautions:
    "1. Consult a healthcare professional for a proper diagnosis and treatment plan.\n2. Keep a symptom diary: note when symptoms started, their severity, and any triggers.\n3. Stay hydrated and get adequate rest to support your immune system.\n4. Avoid self-medicating without professional guidance.\n5. Seek emergency care if symptoms are severe, rapidly worsening, or include chest pain, difficulty breathing, or loss of consciousness.",
};

export function analyzeSymptoms(symptomsText: string): AnalysisResult {
  const lower = symptomsText.toLowerCase();

  let bestMatch: ConditionDefinition | null = null;
  let bestScore = 0;

  for (const condition of CONDITIONS) {
    let score = 0;
    for (const keyword of condition.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = condition;
    }
  }

  if (!bestMatch || bestScore === 0) {
    return GENERAL_RESPONSE;
  }

  return {
    disease: bestMatch.name,
    cause: bestMatch.cause,
    precautions: bestMatch.precautions,
  };
}

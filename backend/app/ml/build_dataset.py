"""
Comprehensive 115+ Disease Dataset Generator for MEDiScan Clinical Engine.
"""
import csv
import itertools
import random
import json
from pathlib import Path

random.seed(42)

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DISEASES = {
    # ── Respiratory (12) ──
    "Common Cold": (
        "Respiratory",
        ["runny nose", "sneezing", "sore throat", "mild cough", "nasal congestion", "mild headache"],
        "A mild viral infection of the upper respiratory tract that resolves naturally in 7-10 days.",
        ["Rest adequately and drink plenty of warm fluids.", "Use steam inhalation or saline nasal spray.", "Honey and warm water can soothe throat irritation."],
        "Mayo Clinic — Common Cold"
    ),
    "Influenza": (
        "Respiratory",
        ["high fever", "chills", "body ache", "fatigue", "dry cough", "headache", "sore throat"],
        "A contagious viral respiratory illness causing sudden onset of fever, severe body aches, and fatigue.",
        ["Rest in bed and stay well-hydrated.", "Take paracetamol for fever and pain relief under medical advice.", "Antiviral medications may help if taken within 48 hours."],
        "CDC — Influenza"
    ),
    "Asthma": (
        "Respiratory",
        ["wheezing", "shortness of breath", "chest tightness", "persistent cough", "difficulty breathing"],
        "A chronic inflammatory airway condition causing reversible airflow obstruction and breathing difficulty.",
        ["Always carry your prescribed rescue inhaler.", "Identify and avoid known environmental triggers (smoke, dust, pollen).", "Track your peak expiratory flow rate if advised."],
        "Global Initiative for Asthma (GINA)"
    ),
    "Bronchitis": (
        "Respiratory",
        ["persistent cough", "mucus production", "chest discomfort", "mild fever", "fatigue", "wheezing"],
        "Inflammation of the bronchial tubes usually following a cold or viral illness.",
        ["Drink warm fluids to thin bronchial secretions.", "Use a room humidifier to soothe air passages.", "Avoid active and passive cigarette smoke."],
        "American Lung Association — Bronchitis"
    ),
    "Pneumonia": (
        "Respiratory",
        ["high fever", "cough with phlegm", "chest pain", "shortness of breath", "chills", "fatigue", "rapid breathing"],
        "A serious lung infection that causes air sacs to fill with fluid or pus.",
        ["Seek prompt medical diagnosis (chest X-ray/labs).", "Complete the full course of prescribed antibiotics if bacterial.", "Monitor oxygen saturation."],
        "WHO — Pneumonia"
    ),
    "Sinusitis": (
        "Respiratory",
        ["facial pain", "nasal congestion", "thick nasal discharge", "headache", "reduced smell", "pressure around eyes"],
        "Inflammation or swelling of the tissue lining the sinuses, often causing facial pressure.",
        ["Apply warm facial compresses.", "Perform gentle saline nasal rinses.", "Stay hydrated to thin mucus."],
        "Mayo Clinic — Sinusitis"
    ),
    "COPD": (
        "Respiratory",
        ["chronic cough", "shortness of breath with exertion", "excess sputum", "wheezing", "chest tightness", "fatigue"],
        "Chronic Obstructive Pulmonary Disease causing long-term breathing difficulty and airflow blockage.",
        ["Strict smoking cessation.", "Use prescribed bronchodilators and pulmonary rehab.", "Avoid air pollutants and cold air."],
        "GOLD Guidelines — COPD"
    ),
    "Pulmonary Embolism": (
        "Respiratory",
        ["sudden shortness of breath", "sharp chest pain on breathing", "rapid heart rate", "coughing blood", "dizziness"],
        "A blockage in one of the pulmonary arteries in your lungs, usually caused by blood clots from deep veins.",
        ["Seek emergency medical attention (Call 911/112 immediately).", "Do not move excessively; remain seated.", "Hospital anticoagulant therapy required."],
        "AHA — Pulmonary Embolism"
    ),
    "Laryngitis": (
        "Respiratory",
        ["hoarseness", "loss of voice", "tickling sensation in throat", "dry throat", "dry cough"],
        "Inflammation of the vocal cords causing voice hoarseness and throat discomfort.",
        ["Rest your vocal cords; avoid whispering.", "Drink warm soothing liquids and inhale steam.", "Avoid smoking and alcohol."],
        "Mayo Clinic — Laryngitis"
    ),
    "Pharyngitis": (
        "Respiratory",
        ["severe sore throat", "pain with swallowing", "red swollen tonsils", "fever", "swollen neck lymph nodes"],
        "Inflammation of the back of the throat, commonly known as a sore throat.",
        ["Gargle with warm salt water several times a day.", "Drink warm soothing liquids.", "Consult a doctor to test for Strep A bacterial infection."],
        "CDC — Pharyngitis"
    ),
    "Pleural Effusion": (
        "Respiratory",
        ["chest pain on deep inhalation", "shortness of breath", "dry persistent cough", "fever", "rapid shallow breathing"],
        "An unusual buildup of fluid between the layers of tissue that line the lungs and the chest cavity.",
        ["Seek medical evaluation and chest radiography.", "Treat underlying cause (infection, heart failure).", "Thoracentesis may be performed by specialists."],
        "American Thoracic Society — Pleural Effusion"
    ),
    "Sleep Apnea": (
        "Respiratory",
        ["loud snoring", "gasping for air during sleep", "morning headache", "excessive daytime sleepiness", "dry mouth on waking"],
        "A sleep disorder characterized by repeated interruptions in breathing throughout the sleep cycle.",
        ["Undergo a polysomnography sleep study.", "Use a CPAP device as prescribed.", "Maintain a healthy weight and avoid evening alcohol."],
        "National Sleep Foundation — Sleep Apnea"
    ),

    # ── Neurological (12) ──
    "Migraine": (
        "Neurological",
        ["throbbing headache", "nausea", "light sensitivity", "sound sensitivity", "visual aura", "dizziness"],
        "A neurological condition characterized by recurrent, intense throbbing headaches typically on one side.",
        ["Rest in a dark, quiet room.", "Apply a cold compress to the forehead.", "Maintain consistent hydration and sleep schedules."],
        "American Migraine Foundation"
    ),
    "Migraine with Aura": (
        "Neurological",
        ["visual flashes", "blind spots", "tingling in face or hands", "throbbing head pain", "nausea", "light sensitivity"],
        "Migraine headache accompanied by sensory or visual disturbances shortly before head pain starts.",
        ["Take prescribed acute migraine medication at the onset of aura.", "Rest in a dimly lit room.", "Avoid identified food or sensory triggers."],
        "International Headache Society"
    ),
    "Tension Headache": (
        "Neurological",
        ["dull aching head pain", "tightness across forehead", "scalp tenderness", "neck stiffness", "shoulder tension"],
        "The most common type of headache, feeling like a tight band wrapped around the head.",
        ["Apply heat or ice to neck and shoulders.", "Practice stress-reduction and postural ergonomics.", "Stay hydrated and take screen breaks."],
        "Mayo Clinic — Tension Headache"
    ),
    "Cluster Headache": (
        "Neurological",
        ["excruciating pain around one eye", "eye redness", "tearing", "nasal congestion on one side", "restlessness"],
        "Severe, sharp headaches that occur in cyclical patterns or clusters, typically centered around one eye.",
        ["High-flow oxygen therapy via non-rebreather mask.", "Consult a neurologist for triptans and preventive calcium channel blockers.", "Avoid alcohol during cluster periods."],
        "American Neurological Association — Cluster Headache"
    ),
    "Epilepsy": (
        "Neurological",
        ["uncontrolled jerking movements", "temporary confusion", "loss of consciousness", "staring spells", "aura"],
        "A central nervous system disorder in which brain activity becomes abnormal, causing seizures.",
        ["Take antiepileptic medications consistently without missing doses.", "Keep seizure safety guidelines in mind.", "Ensure adequate sleep and manage stress."],
        "Epilepsy Foundation"
    ),
    "Stroke": (
        "Neurological",
        ["sudden facial drooping", "arm weakness", "slurred speech", "sudden severe headache", "loss of balance", "vision loss"],
        "A medical emergency where blood supply to part of the brain is interrupted or reduced.",
        ["CALL EMERGENCY SERVICES IMMEDIATELY (FAST Protocol).", "Note the exact time symptoms started.", "Do not give food, drink, or aspirin until evaluated."],
        "American Stroke Association (FAST Protocol)"
    ),
    "Transient Ischemic Attack (TIA)": (
        "Neurological",
        ["temporary numbness on one side", "brief speech slurring", "transient vision loss", "temporary dizziness", "arm weakness"],
        "A temporary blockage of blood flow to the brain, serving as a critical warning sign for full stroke.",
        ["Seek emergency hospital evaluation immediately.", "Undergo urgent brain imaging and vascular ultrasound.", "Initiate stroke-prevention medication under specialist guidance."],
        "AHA / ASA — TIA Warning"
    ),
    "Multiple Sclerosis": (
        "Neurological",
        ["numbness in limbs", "electric shock sensations", "tremor", "vision loss in one eye", "fatigue", "unsteady gait"],
        "An autoimmune condition where the immune system attacks the protective sheath (myelin) covering nerve fibers.",
        ["Consult a neurologist for disease-modifying therapies (DMTs).", "Engage in physical therapy.", "Avoid extreme heat and fatigue."],
        "National Multiple Sclerosis Society"
    ),
    "Parkinson's Disease": (
        "Neurological",
        ["resting tremor", "muscle stiffness", "slow movement", "impaired balance", "soft voice", "shuffling gait"],
        "A progressive nervous system disorder that affects movement, muscle control, and balance.",
        ["Work closely with a movement disorder specialist.", "Maintain regular physical therapy and balance exercises.", "Follow prescribed dopaminergic medication schedules."],
        "Parkinson's Foundation"
    ),
    "Trigeminal Neuralgia": (
        "Neurological",
        ["sharp stabbing facial pain", "electric shock sensation in cheek", "pain triggered by chewing or brushing teeth", "spontaneous facial spasms"],
        "A chronic pain condition affecting the trigeminal nerve that carries sensation from the face to the brain.",
        ["Consult a neurologist for neuropathic pain modulators.", "Avoid known facial touch triggers.", "Consider neurosurgical evaluation if refractory."],
        "National Institute of Neurological Disorders (NINDS)"
    ),
    "Bell's Palsy": (
        "Neurological",
        ["sudden one-sided facial paralysis", "drooping mouth", "inability to close one eye", "drooling", "loss of taste"],
        "Sudden weakness or paralysis on one side of the face caused by inflammation of the 7th cranial nerve.",
        ["Consult a physician promptly for early corticosteroid therapy.", "Use lubricating eye drops and an eye patch to protect the cornea.", "Gentle facial physical therapy."],
        "Mayo Clinic — Bell's Palsy"
    ),
    "Peripheral Neuropathy": (
        "Neurological",
        ["gradual numbness in feet", "burning pain in hands", "tingling sensations", "extreme sensitivity to touch", "muscle weakness"],
        "Damage to the peripheral nerves often causing tingling, numbness, and burning pain in hands and feet.",
        ["Optimize blood sugar management if diabetic.", "Avoid tight restrictive footwear.", "Consult a neurologist for nerve conduction studies."],
        "NINDS — Peripheral Neuropathy"
    ),

    # ── Digestive & Gastrointestinal (16) ──
    "Gastritis": (
        "Digestive",
        ["upper abdominal pain", "burning stomach", "nausea", "bloating", "loss of appetite", "belching"],
        "Inflammation of the protective lining of the stomach, often caused by NSAIDs, H. pylori, or stress.",
        ["Eat smaller, frequent, non-irritating meals.", "Avoid NSAID pain relievers, caffeine, alcohol, and spicy foods.", "Antacids or acid suppressors can help."],
        "Mayo Clinic — Gastritis"
    ),
    "GERD": (
        "Digestive",
        ["heartburn", "acid regurgitation", "chest burning", "difficulty swallowing", "chronic dry cough", "sour taste in mouth"],
        "Gastroesophageal Reflux Disease causing chronic acid backflow into the esophagus.",
        ["Avoid lying down within 3 hours after meals.", "Elevate the head of your bed 6 inches.", "Limit citrus, chocolate, tomatoes, and carbonated beverages."],
        "American College of Gastroenterology"
    ),
    "Peptic Ulcer": (
        "Digestive",
        ["burning stomach pain between meals", "feeling full too quickly", "bloating", "nausea", "dark stools", "unexplained weight loss"],
        "Open sores that develop on the inside lining of the stomach and the upper portion of the small intestine.",
        ["Get tested for Helicobacter pylori infection.", "Avoid ibuprofen, naproxen, and aspirin.", "Seek immediate care if vomit looks like coffee grounds or stools are black."],
        "Mayo Clinic — Peptic Ulcer Disease"
    ),
    "Appendicitis": (
        "Digestive",
        ["sharp lower right abdominal pain", "nausea", "vomiting", "low-grade fever", "loss of appetite", "rebound tenderness"],
        "A medical emergency involving acute inflammation of the appendix requiring immediate surgical attention.",
        ["GO TO THE EMERGENCY ROOM IMMEDIATELY.", "Do NOT eat, drink, or take pain relievers/laxatives before surgical evaluation.", "Do not apply heat to the abdomen."],
        "American College of Surgeons — Appendicitis"
    ),
    "Gastroenteritis": (
        "Digestive",
        ["watery diarrhea", "stomach cramps", "nausea", "vomiting", "mild fever", "body aches", "dehydration"],
        "Intestinal infection commonly called stomach flu, marked by diarrhea, cramps, nausea, and fever.",
        ["Drink oral rehydration solution (ORS) and electrolyte broths in small sips.", "Eat bland foods (bananas, rice, applesauce, toast - BRAT diet).", "Seek care if unable to hold liquids for 24h."],
        "CDC — Viral Gastroenteritis"
    ),
    "Irritable Bowel Syndrome": (
        "Digestive",
        ["abdominal cramping", "bloating", "gas", "alternating diarrhea and constipation", "mucus in stool", "food intolerance"],
        "A common gastrointestinal disorder that affects the large intestine causing chronic cramping and bowel changes.",
        ["Follow a low-FODMAP dietary approach under supervision.", "Increase soluble fiber intake gradually.", "Manage stress and maintain regular physical activity."],
        "International Foundation for Gastrointestinal Disorders"
    ),
    "Celiac Disease": (
        "Digestive",
        ["chronic diarrhea", "bloating", "gas", "weight loss", "fatigue", "skin rash", "iron deficiency"],
        "An autoimmune reaction to eating gluten, a protein found in wheat, barley, and rye.",
        ["Adopt a strict lifelong gluten-free diet.", "Consult a gastroenterologist for antibody testing and biopsy.", "Take nutritional supplements for deficiencies."],
        "Celiac Disease Foundation"
    ),
    "Gallstones": (
        "Digestive",
        ["sudden severe pain in upper right abdomen", "pain radiating to right shoulder", "nausea", "vomiting", "indigestion after fatty meals"],
        "Hardened deposits of digestive fluid that form in your gallbladder, triggering biliary colic.",
        ["Seek medical evaluation (abdominal ultrasound).", "Avoid high-fat and fried meals.", "Seek immediate care if pain persists past 4 hours or fever develops."],
        "American Gastroenterological Association"
    ),
    "Pancreatitis": (
        "Digestive",
        ["severe upper abdominal pain radiating to back", "nausea", "vomiting", "rapid pulse", "fever", "tenderness to touch"],
        "Inflammation of the pancreas that occurs when digestive enzymes become activated while still in the pancreas.",
        ["Seek emergency medical hospital admission.", "Fast from food and drink initially to rest the pancreas.", "Strictly abstain from alcohol."],
        "National Pancreas Foundation"
    ),
    "Constipation": (
        "Digestive",
        ["hard dry stools", "straining during bowel movements", "feeling of incomplete evacuation", "abdominal fullness", "bloating"],
        "Infrequent or difficult bowel movements typically defined as fewer than three times a week.",
        ["Increase dietary fiber (chia seeds, prunes, vegetables).", "Drink at least 2.5 liters of water daily.", "Engage in regular physical walking."],
        "Mayo Clinic — Constipation"
    ),
    "Diverticulitis": (
        "Digestive",
        ["constant severe lower left abdominal pain", "fever", "nausea", "constipation", "bloating", "abdominal tenderness"],
        "Inflammation or infection of small pouches (diverticula) that develop along the walls of the intestines.",
        ["Consult a doctor promptly for diagnostic imaging and antibiotics.", "Temporarily switch to a clear liquid diet during acute flare.", "Gradually reintroduce high-fiber foods."],
        "American Society of Colon and Rectal Surgeons"
    ),
    "Hemorrhoids": (
        "Digestive",
        ["bright red rectal bleeding", "itching around anus", "pain during bowel movements", "swelling or lump near anus"],
        "Swollen veins in the lowest part of your rectum and anus.",
        ["Take warm sitz baths for 15 minutes twice daily.", "Use high-fiber diet and stool softeners to avoid straining.", "Apply topical hydrocortisone creams."],
        "Mayo Clinic — Hemorrhoids"
    ),
    "Fatty Liver Disease": (
        "Digestive",
        ["fatigue", "dull discomfort in upper right abdomen", "slight liver enlargement", "elevated liver enzymes"],
        "Accumulation of excess fat in liver cells, commonly associated with metabolic syndrome or lifestyle.",
        ["Gradual, healthy weight reduction through Mediterranean diet.", "Engage in 150 minutes of aerobic exercise weekly.", "Avoid alcohol and sugary beverages."],
        "American Liver Foundation"
    ),
    "Hepatitis A": (
        "Digestive",
        ["fatigue", "nausea", "abdominal pain", "dark urine", "pale stools", "yellowing of skin and eyes", "loss of appetite"],
        "A contagious liver infection caused by the hepatitis A virus, usually transmitted via contaminated food or water.",
        ["Rest completely and avoid alcohol or liver-toxic drugs.", "Drink plenty of clean fluids and eat nutritious small meals.", "Strict hand hygiene to prevent spread."],
        "CDC — Hepatitis A"
    ),
    "Crohn's Disease": (
        "Digestive",
        ["recurrent abdominal cramps", "persistent diarrhea", "weight loss", "fatigue", "mouth sores", "rectal bleeding"],
        "A chronic inflammatory bowel disease that affects the lining of the digestive tract.",
        ["Consult a gastroenterologist for biologics or immunosuppressants.", "Eat small frequent meals and track food triggers.", "Stay hydrated and supplement vitamins."],
        "Crohn's & Colitis Foundation"
    ),
    "Ulcerative Colitis": (
        "Digestive",
        ["bloody diarrhea", "urgent need to defecate", "cramping abdominal pain", "rectal pain", "weight loss", "fever"],
        "An inflammatory bowel disease that causes long-lasting inflammation and ulcers in your digestive tract's colon.",
        ["Adhere to prescribed anti-inflammatory maintenance medications.", "Monitor iron levels and nutritional status.", "Consult your specialist for regular colonoscopy."],
        "Crohn's & Colitis Foundation — Ulcerative Colitis"
    ),

    # ── Infectious & Tropical (15) ──
    "Malaria": (
        "Infectious",
        ["cyclical high fever", "shivering chills", "profuse sweating", "headache", "nausea", "body ache", "fatigue"],
        "A mosquito-borne infectious disease caused by Plasmodium parasites, causing severe fever cycles.",
        ["Seek immediate medical blood smear / rapid antigen test.", "Complete full course of artemisinin-based combination therapy (ACT).", "Use mosquito bed nets."],
        "WHO — Guidelines for Malaria"
    ),
    "Dengue Fever": (
        "Infectious",
        ["sudden high fever", "severe headache", "pain behind the eyes", "joint and muscle ache", "skin rash", "mild bleeding"],
        "A mosquito-borne viral infection causing severe flu-like illness, known colloquially as breakbone fever.",
        ["Maintain intensive hydration with electrolyte fluids.", "Take paracetamol for fever; AVOID aspirin, ibuprofen, and NSAIDs.", "Monitor platelet counts daily."],
        "CDC — Dengue Clinical Guidance"
    ),
    "Typhoid Fever": (
        "Infectious",
        ["prolonged step-ladder fever", "headache", "stomach pain", "constipation or diarrhea", "rose-colored rash", "extreme fatigue"],
        "A bacterial infection caused by Salmonella typhi, spreading through contaminated food and drinking water.",
        ["Get blood/stool culture confirmation.", "Take full course of prescribed antibiotics.", "Drink exclusively purified or boiled water."],
        "WHO — Typhoid"
    ),
    "Chikungunya": (
        "Infectious",
        ["abrupt high fever", "severe crippling joint pain", "joint swelling", "rash", "muscle pain", "headache"],
        "A viral disease transmitted to humans by infected mosquitoes causing debilitating joint pain.",
        ["Rest and hydrate adequately.", "Take analgesics and paracetamol for joint pain.", "Gentle physical therapy during recovery."],
        "WHO — Chikungunya"
    ),
    "Chickenpox": (
        "Infectious",
        ["itchy fluid-filled blisters", "fever", "tiredness", "loss of appetite", "headache", "red spots on skin"],
        "A highly contagious viral infection causing an itchy, blister-like rash and mild systemic fever.",
        ["Apply calamine lotion to soothe itching.", "Take cool baths with baking soda or colloidal oatmeal.", "Isolate until all blisters have crusted over."],
        "CDC — Varicella (Chickenpox)"
    ),
    "Shingles": (
        "Infectious",
        ["burning localized pain", "fluid-filled blisters on one side of body", "skin sensitivity", "fever", "itching"],
        "A reactivation of the varicella-zoster virus causing a painful, localized blistering rash.",
        ["Consult a doctor within 72h for antiviral therapy (acyclovir/valacyclovir).", "Keep the rash clean and covered with non-stick dressings.", "Apply cool wet compresses."],
        "CDC — Shingles"
    ),
    "Tuberculosis": (
        "Infectious",
        ["persistent cough for more than 3 weeks", "coughing blood", "night sweats", "unexplained weight loss", "chest pain", "fever"],
        "A serious bacterial infection that mainly affects the lungs, transmitted through airborne droplets.",
        ["Seek immediate sputum testing and chest radiography.", "Strictly complete the 6-month multi-drug antibiotic regimen.", "Wear a mask and ensure good room ventilation."],
        "WHO — Global Tuberculosis Programme"
    ),
    "COVID-19": (
        "Infectious",
        ["fever", "dry cough", "loss of taste or smell", "fatigue", "shortness of breath", "sore throat", "body aches"],
        "A contagious respiratory illness caused by the SARS-CoV-2 coronavirus.",
        ["Isolate in a well-ventilated room and monitor pulse oximeter readings.", "Stay hydrated and get plenty of rest.", "Seek emergency care if oxygen saturation drops below 94%."],
        "CDC — COVID-19 Clinical Care"
    ),
    "Hepatitis B": (
        "Infectious",
        ["fatigue", "poor appetite", "yellowing of skin and eyes", "dark urine", "joint pain", "nausea"],
        "A viral infection that attacks the liver, transmitted through infected blood or bodily fluids.",
        ["Consult a hepatologist for viral load and liver function tests.", "Avoid alcohol and hepatotoxic medications.", "Family members should receive Hepatitis B vaccination."],
        "WHO — Hepatitis B"
    ),
    "Hepatitis C": (
        "Infectious",
        ["chronic fatigue", "joint aches", "mild upper right abdominal discomfort", "jaundice", "loss of appetite"],
        "A blood-borne viral infection that causes liver inflammation, often asymptomatic for decades.",
        ["Direct-acting antiviral (DAA) medications can cure >95% of cases.", "Get screened with an HCV antibody test.", "Avoid all alcohol consumption."],
        "CDC — Hepatitis C"
    ),
    "Mononucleosis": (
        "Infectious",
        ["extreme fatigue", "fever", "severe sore throat", "swollen lymph nodes in neck", "enlarged spleen", "headache"],
        "A contagious viral illness commonly caused by Epstein-Barr virus (EBV), spread through saliva.",
        ["Get plenty of bed rest and drink fluids.", "Avoid contact sports or heavy lifting for 1 month to prevent spleen rupture.", "Use throat lozenges and warm salt gargles."],
        "Mayo Clinic — Mononucleosis"
    ),
    "Lyme Disease": (
        "Infectious",
        ["bullseye skin rash", "fever", "chills", "fatigue", "body aches", "stiff neck", "swollen lymph nodes"],
        "A tick-borne bacterial illness caused by Borrelia burgdorferi transmitted by blacklegged ticks.",
        ["Consult a doctor promptly for early oral doxycycline antibiotic treatment.", "Check skin for ticks after outdoor activities.", "Monitor for joint pain or neurological signs."],
        "CDC — Lyme Disease"
    ),
    "Measles": (
        "Infectious",
        ["high fever", "cough", "runny nose", "red watery eyes", "tiny white spots inside mouth", "blotchy skin rash"],
        "A highly contagious airborne viral disease causing high fever and a full-body blotchy rash.",
        ["Strict isolation to prevent spreading.", "Vitamin A supplementation under medical guidance.", "Drink plenty of fluids and rest in dim lighting."],
        "WHO — Measles"
    ),
    "Cholera": (
        "Infectious",
        ["profuse watery diarrhea", "vomiting", "rapid dehydration", "muscle cramps", "sunken eyes", "low blood pressure"],
        "An acute diarrheal illness caused by infection of the intestine with Vibrio cholerae bacteria.",
        ["IMMEDIATE and aggressive Oral Rehydration Salts (ORS) and IV fluids.", "Seek emergency inpatient hospital stabilization.", "Antibiotic therapy under medical supervision."],
        "WHO — Cholera Response"
    ),
    "Rabies Exposure": (
        "Infectious",
        ["animal bite on skin", "tingling around bite site", "fever", "headache", "anxiety", "agitation"],
        "A fatal viral disease transmitted through the saliva of infected animals (dogs, bats, raccoons).",
        ["WASH BITE WOUND WITH SOAP AND RUNNING WATER FOR 15 MINUTES IMMEDIATELY.", "Seek emergency Post-Exposure Prophylaxis (PEP) vaccination without delay.", "Do not wait for symptoms to appear."],
        "WHO — Rabies Post-Exposure Guide"
    ),

    # ── Cardiovascular (11) ──
    "Hypertension": (
        "Cardiovascular",
        ["morning headache", "dizziness", "shortness of breath", "nosebleeds", "blurred vision", "chest tightness"],
        "Chronic high blood pressure where long-term force of blood against artery walls is elevated.",
        ["Adopt the DASH dietary pattern (low sodium, high potassium).", "Engage in 30 minutes of daily aerobic exercise.", "Take antihypertensive medication consistently as prescribed."],
        "AHA / ACC — Hypertension Guidelines"
    ),
    "Coronary Artery Disease": (
        "Cardiovascular",
        ["chest pressure on exertion", "shortness of breath", "fatigue", "pain radiating to jaw or left arm", "lightheadedness"],
        "Narrowing or blockage of the coronary arteries usually caused by the buildup of cholesterol plaque.",
        ["Consult a cardiologist for ECG, stress test, and lipid profile.", "Maintain heart-healthy Mediterranean diet.", "Strictly control blood pressure and cholesterol."],
        "American Heart Association"
    ),
    "Heart Attack": (
        "Cardiovascular",
        ["crushing chest pain", "pain radiating to left arm neck or jaw", "cold sweat", "shortness of breath", "severe nausea", "dizziness"],
        "A life-threatening medical emergency where blood flow to a section of heart muscle becomes blocked.",
        ["CALL EMERGENCY MEDICAL SERVICES (911/112) IMMEDIATELY.", "Chew one regular 325mg aspirin if advised and not allergic.", "Rest quietly in a semi-upright seated position."],
        "AHA — Heart Attack Warning Signs"
    ),
    "Arrhythmia": (
        "Cardiovascular",
        ["fluttering in chest", "racing heartbeat", "slow heartbeat", "dizziness", "lightheadedness", "fainting episodes"],
        "An irregular heart rhythm where the heart beats too quickly, too slowly, or with an irregular pattern.",
        ["Consult a cardiologist for Holter monitoring and 12-lead ECG.", "Limit caffeine, alcohol, and energy drinks.", "Learn vagal maneuvers if advised by your physician."],
        "Heart Rhythm Society"
    ),
    "Heart Failure": (
        "Cardiovascular",
        ["shortness of breath when lying flat", "swelling in legs and ankles", "persistent fatigue", "rapid weight gain from fluid", "wheezing"],
        "A chronic condition in which the heart muscle cannot pump blood as efficiently as it should.",
        ["Weigh yourself daily and report sudden 2kg increases.", "Adhere strictly to sodium (<2g/day) and fluid restrictions.", "Take prescribed ACE inhibitors, beta-blockers, or diuretics."],
        "Heart Failure Society of America"
    ),
    "Angina Pectoris": (
        "Cardiovascular",
        ["squeezing chest pain with physical exertion", "pressure in chest relieved by rest", "shortness of breath", "nausea"],
        "Chest pain or discomfort caused when heart muscle doesn't receive enough oxygen-rich blood during exertion.",
        ["Stop physical exertion and rest immediately.", "Take sublingual nitroglycerin as prescribed.", "Seek emergency care if pain lasts >5 minutes at rest."],
        "British Heart Foundation — Angina"
    ),
    "Pericarditis": (
        "Cardiovascular",
        ["sharp chest pain worse when lying down", "pain relieved by sitting up and leaning forward", "fever", "heart palpitations"],
        "Inflammation of the pericardium (the fibrous sac surrounding the heart).",
        ["Seek medical evaluation and echocardiography.", "Rest and avoid strenuous exercise.", "Take prescribed anti-inflammatory medications (colchicine/NSAIDs)."],
        "European Society of Cardiology — Pericarditis"
    ),
    "Deep Vein Thrombosis": (
        "Cardiovascular",
        ["swelling in one calf or leg", "throbbing calf pain", "warmth in affected leg", "redness of skin on leg"],
        "A blood clot that forms in a deep vein, usually in the lower legs, posing a risk of pulmonary embolism.",
        ["Seek urgent medical ultrasound evaluation.", "Do NOT massage or vigorously rub the swollen leg.", "Anticoagulant therapy is required."],
        "CDC — DVT"
    ),
    "Peripheral Artery Disease": (
        "Cardiovascular",
        ["cramping leg pain when walking (claudication)", "coldness in lower leg or foot", "weak pulse in legs", "slow-healing sores on toes"],
        "Narrowed arteries that reduce blood flow to the limbs, most commonly the lower extremities.",
        ["Smoking cessation is critical.", "Engage in supervised walking exercise programs.", "Inspect feet daily for wounds or pressure sores."],
        "AHA — Peripheral Artery Disease"
    ),
    "Aortic Stenosis": (
        "Cardiovascular",
        ["breathlessness with exercise", "chest tightness during activity", "fainting or dizziness upon standing", "heart murmur", "fatigue"],
        "Narrowing of the aortic valve opening, restricting blood flow from the left ventricle to the aorta.",
        ["Consult a cardiologist for regular echocardiogram monitoring.", "Avoid heavy isometric lifting.", "Discuss surgical or TAVR valve replacement with specialists."],
        "American College of Cardiology"
    ),
    "Postural Orthostatic Tachycardia (POTS)": (
        "Cardiovascular",
        ["rapid heart rate upon standing", "dizziness on standing", "brain fog", "trembling", "extreme fatigue", "palpitations"],
        "A condition where heart rate increases by over 30 bpm when transitioning from lying to standing, without significant BP drop.",
        ["Increase oral fluid intake (2.5-3L/day) and sodium under medical guidance.", "Wear medical-grade compression stockings.", "Engage in recumbent rowing/swimming exercises."],
        "Dysautonomia International — POTS"
    ),

    # ── Endocrine & Metabolic (10) ──
    "Diabetes Type 1": (
        "Metabolic",
        ["extreme thirst", "frequent urination", "unintended weight loss", "extreme hunger", "fatigue", "blurred vision"],
        "A chronic autoimmune condition in which the pancreas produces little or no insulin.",
        ["Daily blood glucose monitoring and insulin administration.", "Count dietary carbohydrates accurately.", "Check for urine ketones if blood sugar is persistently high."],
        "American Diabetes Association — T1D"
    ),
    "Diabetes Type 2": (
        "Metabolic",
        ["increased thirst", "frequent nighttime urination", "slow-healing cuts", "tingling in hands and feet", "fatigue", "darkened skin patches"],
        "A metabolic disorder characterized by high blood sugar, insulin resistance, and relative lack of insulin.",
        ["Adopt a low-glycemic, fiber-rich whole foods diet.", "Exercise for at least 150 minutes per week.", "Monitor HbA1c every 3-6 months with your doctor."],
        "ADA — Type 2 Diabetes Guidelines"
    ),
    "Hypothyroidism": (
        "Endocrine",
        ["fatigue", "unexplained weight gain", "cold intolerance", "dry skin", "constipation", "muscle weakness", "brittle hair"],
        "An underactive thyroid gland that does not produce enough crucial thyroid hormone.",
        ["Take prescribed levothyroxine consistently on an empty stomach.", "Get thyroid function blood tests (TSH/Free T4) checked periodically.", "Eat a balanced iodine-sufficient diet."],
        "American Thyroid Association"
    ),
    "Hyperthyroidism": (
        "Endocrine",
        ["rapid heart rate", "unintended weight loss", "heat intolerance", "trembling hands", "sweating", "anxiety", "bulging eyes"],
        "An overactive thyroid gland producing an excess of thyroid hormone, speeding up metabolism.",
        ["Consult an endocrinologist for anti-thyroid medication (methimazole) or beta-blockers.", "Avoid excess iodine and caffeine.", "Protect eyes if thyroid eye disease is present."],
        "ATA — Hyperthyroidism"
    ),
    "Cushing's Syndrome": (
        "Endocrine",
        ["round moon face", "weight gain around abdomen", "purple stretch marks", "easy bruising", "high blood pressure", "muscle weakness"],
        "A metabolic disorder caused by prolonged exposure to high levels of cortisol hormone.",
        ["Consult an endocrinologist for 24-hour urinary cortisol testing.", "Gradual tapering of exogenous steroid medications if applicable.", "Monitor bone density and blood pressure."],
        "Endocrine Society — Cushing's"
    ),
    "Addison's Disease": (
        "Endocrine",
        ["extreme fatigue", "hyperpigmentation (darkened skin)", "low blood pressure", "salt cravings", "nausea", "dizziness"],
        "Adrenal insufficiency where the adrenal glands produce insufficient cortisol and aldosterone.",
        ["Take lifelong hormone replacement therapy (hydrocortisone/fludrocortisone).", "Carry an emergency medical alert ID card and injectable hydrocortisone.", "Increase salt intake during hot weather or illness."],
        "National Adrenal Diseases Foundation"
    ),
    "Gout": (
        "Metabolic",
        ["sudden intense joint pain in big toe", "swelling and redness of big toe", "lingering joint discomfort", "limited range of motion"],
        "A painful form of inflammatory arthritis caused by the crystallization of uric acid in joints.",
        ["Apply ice packs and rest the inflamed joint.", "Avoid purine-rich foods (red meat, shellfish, alcohol, beer).", "Stay well-hydrated to help kidneys excrete uric acid."],
        "American College of Rheumatology — Gout"
    ),
    "Metabolic Syndrome": (
        "Metabolic",
        ["large waist circumference", "high blood pressure", "high fasting blood glucose", "high triglycerides", "low HDL cholesterol"],
        "A cluster of metabolic risk factors that increase the risk of heart disease, stroke, and diabetes.",
        ["Achieve 7-10% weight reduction through balanced dietary caloric deficit.", "Engage in daily brisk walking and resistance training.", "Annual lipid and fasting glucose screenings."],
        "National Heart, Lung, and Blood Institute (NHLBI)"
    ),
    "Polycystic Ovary Syndrome": (
        "Endocrine",
        ["irregular periods", "excess facial hair", "severe acne", "thinning hair on scalp", "weight gain", "ovarian cysts"],
        "A hormonal disorder common among women of reproductive age causing enlarged ovaries with small cysts.",
        ["Adopt an anti-inflammatory, insulin-sensitizing diet.", "Consult a gynecologist/endocrinologist for hormonal or metformin therapies.", "Regular cardiovascular and metabolic checkups."],
        "ACOG — Polycystic Ovary Syndrome"
    ),
    "Hypoglycemia": (
        "Metabolic",
        ["shakiness", "sweating", "rapid heartbeat", "dizziness", "confusion", "hunger", "blurred vision"],
        "An abnormally low level of blood sugar (glucose), body's main energy source, common in diabetic therapy.",
        ["Follow the 15-15 rule: Consume 15 grams of fast-acting carbs (juice, glucose tablets) and recheck in 15 minutes.", "Always carry fast-acting glucose.", "Review medication dosing with doctor."],
        "American Diabetes Association — Hypoglycemia"
    ),

    # ── Urologic & Renal (8) ──
    "Urinary Tract Infection": (
        "Urologic",
        ["burning sensation when urinating", "frequent urge to urinate", "cloudy urine", "pelvic pressure", "strong smelling urine"],
        "A bacterial infection of the urinary tract, most commonly affecting the bladder and urethra.",
        ["Drink abundant water to help flush bacteria.", "Complete the full course of prescribed antibiotics.", "Avoid holding urine for extended periods."],
        "CDC — Urinary Tract Infection"
    ),
    "Kidney Stones": (
        "Urologic",
        ["severe sharp flank pain", "pain radiating to lower abdomen and groin", "blood in urine", "nausea", "painful urination"],
        "Hard deposits made of minerals and salts that form inside the kidneys and cause excruciating pain when passing.",
        ["Drink 3 to 4 liters of water daily to facilitate stone passage.", "Take pain relief and alpha-blockers as prescribed by a urologist.", "Strain urine to collect passed stones for analysis."],
        "National Kidney Foundation"
    ),
    "Chronic Kidney Disease": (
        "Urologic",
        ["swelling in ankles and feet", "persistent fatigue", "foamy urine", "nausea", "loss of appetite", "metallic taste in mouth"],
        "Gradual loss of kidney function over time, impairing the body's ability to filter waste from blood.",
        ["Strictly manage blood pressure and blood sugar levels.", "Follow a kidney-friendly diet (controlled protein, sodium, potassium).", "Consult a nephrologist regularly."],
        "KDIGO Clinical Practice Guidelines"
    ),
    "Acute Cystitis": (
        "Urologic",
        ["frequent painful urination", "lower abdominal pressure", "cloudy foul-smelling urine", "blood in urine", "low-grade fever"],
        "Sudden bacterial inflammation of the urinary bladder.",
        ["Take prescribed antibiotics for the full recommended duration.", "Stay well-hydrated with water.", "Apply a warm heating pad to lower abdomen."],
        "Mayo Clinic — Cystitis"
    ),
    "Benign Prostatic Hyperplasia": (
        "Urologic",
        ["weak urine stream", "difficulty starting urination", "frequent nighttime urination", "dribbling after urination", "urinary urgency"],
        "Age-associated non-cancerous enlargement of the prostate gland in men, causing urinary obstruction.",
        ["Avoid fluids 2 hours before bedtime.", "Limit caffeine and alcohol intake.", "Consult a urologist for alpha-blockers or 5-ARIs."],
        "American Urological Association (AUA)"
    ),
    "Glomerulonephritis": (
        "Urologic",
        ["pink or cola-colored urine", "foamy urine", "high blood pressure", "facial puffiness in mornings", "swollen ankles"],
        "Inflammation of the tiny filters in your kidneys (glomeruli), which remove excess fluid, electrolytes, and waste.",
        ["Undergo urinalysis, kidney function blood tests, and renal biopsy.", "Control blood pressure and reduce sodium intake.", "Immunosuppressive therapy if autoimmune."],
        "National Kidney Foundation — Glomerulonephritis"
    ),
    "Pyelonephritis": (
        "Urologic",
        ["high fever", "flank pain on one side", "shivering chills", "nausea", "vomiting", "painful frequent urination"],
        "A severe bacterial kidney infection typically ascending from a lower urinary tract infection.",
        ["Seek prompt medical care for targeted antibiotic therapy.", "Inpatient IV antibiotics may be required for severe cases.", "Maintain abundant oral or IV hydration."],
        "Mayo Clinic — Kidney Infection"
    ),
    "Interstitial Cystitis": (
        "Urologic",
        ["chronic pelvic pain", "persistent urgent need to urinate", "pain when bladder fills", "pain during intercourse"],
        "A chronic, painful bladder condition characterized by bladder pressure and pelvic pain without infection.",
        ["Avoid dietary bladder irritants (coffee, tomatoes, artificial sweeteners).", "Undergo physical therapy for pelvic floor muscles.", "Consult a urologist for bladder instillation therapy."],
        "Interstitial Cystitis Association"
    ),

    # ── Musculoskeletal & Rheumatology (10) ──
    "Osteoarthritis": (
        "Musculoskeletal",
        ["joint pain during or after movement", "joint stiffness in mornings", "loss of joint flexibility", "grating sensation", "bone spurs"],
        "The most common form of arthritis, occurring when protective cartilage on the ends of bones wears down over time.",
        ["Engage in low-impact exercises (swimming, stationary cycling).", "Maintain a healthy weight to reduce joint load.", "Use hot/cold therapy for joint comfort."],
        "Arthritis Foundation"
    ),
    "Rheumatoid Arthritis": (
        "Musculoskeletal",
        ["tender warm swollen joints", "symmetrical joint pain in both hands", "morning joint stiffness lasting >1 hour", "fatigue", "fever"],
        "A chronic autoimmune disorder that primarily affects joints symmetrically, causing painful swelling and bone erosion.",
        ["Consult a rheumatologist for Disease-Modifying Antirheumatic Drugs (DMARDs).", "Engage in gentle range-of-motion physical therapy.", "Balance activity with restorative joint rest."],
        "American College of Rheumatology"
    ),
    "Fibromyalgia": (
        "Musculoskeletal",
        ["widespread musculoskeletal pain", "chronic fatigue", "sleep disturbances", "cognitive brain fog", "tender trigger points"],
        "A disorder characterized by widespread musculoskeletal pain accompanied by fatigue, sleep, memory, and mood issues.",
        ["Maintain gentle regular aerobic exercise (walking, water aerobics).", "Practice sleep hygiene and stress-reduction techniques.", "Medications like duloxetine or pregabalin under doctor guidance."],
        "National Fibromyalgia Association"
    ),
    "Sciatica": (
        "Musculoskeletal",
        ["sharp shooting pain from lower back down leg", "numbness in leg or foot", "tingling in toes", "pain worse when sitting"],
        "Pain radiating along the path of the sciatic nerve, which branches from your lower back through your hips and down each leg.",
        ["Apply alternating ice and warm packs to the lower back.", "Practice gentle hamstring and lower back stretching exercises.", "Avoid prolonged seated positions."],
        "Spine-Health — Sciatica Guide"
    ),
    "Tendinitis": (
        "Musculoskeletal",
        ["dull ache when moving affected tendon", "tenderness to touch", "mild swelling", "joint stiffness near shoulder elbow or heel"],
        "Inflammation or irritation of a tendon, commonly affecting shoulders, elbows (tennis elbow), or Achilles tendon.",
        ["Follow RICE protocol (Rest, Ice, Compression, Elevation).", "Temporarily avoid activities that trigger tendon strain.", "Physiotherapy for eccentric strengthening."],
        "Mayo Clinic — Tendinitis"
    ),
    "Carpal Tunnel Syndrome": (
        "Musculoskeletal",
        ["numbness and tingling in thumb index and middle fingers", "hand weakness", "dropping objects", "pain radiating up forearm"],
        "Compression of the median nerve as it travels through the carpal tunnel in the wrist.",
        ["Wear a supportive wrist splint, especially at night.", "Take ergonomic breaks during typing or repetitive hand tasks.", "Consult a doctor for nerve conduction study."],
        "American Academy of Orthopaedic Surgeons"
    ),
    "Ankylosing Spondylitis": (
        "Musculoskeletal",
        ["chronic lower back pain and stiffness", "pain worse in mornings and improves with exercise", "reduced spine flexibility", "fatigue"],
        "An inflammatory arthritis that causes some of the vertebrae in the spine to fuse over time.",
        ["Consult a rheumatologist for biologic therapies (TNF inhibitors).", "Daily spinal stretching and posture exercises.", "Swimming is highly recommended."],
        "Spondylitis Association of America"
    ),
    "Bursitis": (
        "Musculoskeletal",
        ["joint aching or stiffness", "pain with joint pressure", "swelling and redness over shoulder elbow or hip"],
        "Painful condition that affects the small, fluid-filled sacs (bursae) that cushion the bones, tendons, and muscles.",
        ["Rest and immobilize the affected joint temporarily.", "Apply cold compresses for 20 minutes several times a day.", "Use cushioning pads over pressure points."],
        "Mayo Clinic — Bursitis"
    ),
    "Osteoporosis": (
        "Musculoskeletal",
        ["gradual loss of height over time", "stooped posture", "back pain caused by collapsed vertebra", "bone fractures easily"],
        "A bone disease that occurs when the body loses too much bone, causing bones to become weak and brittle.",
        ["Ensure adequate calcium (1200mg) and Vitamin D (800-1000 IU) intake.", "Engage in weight-bearing and balance exercises.", "Undergo DXA bone mineral density screening."],
        "National Osteoporosis Foundation"
    ),
    "Cervical Spondylosis": (
        "Musculoskeletal",
        ["neck pain and stiffness", "tingling or numbness in arms or fingers", "headache starting at back of neck", "grinding noise when turning neck"],
        "Age-related wear and tear affecting the spinal disks in your neck (cervical spine).",
        ["Practice ergonomic workstation alignment with screen at eye level.", "Perform gentle neck stretching and physical therapy exercises.", "Use a supportive ergonomic cervical pillow."],
        "AAOS — Cervical Spondylosis"
    ),

    # ── Dermatologic (11) ──
    "Eczema": (
        "Dermatologic",
        ["intense skin itching", "dry cracked skin patches", "red to brownish-gray patches", "small raised bumps", "raw sensitive skin from scratching"],
        "A chronic inflammatory skin condition characterized by dry, itchy, and irritated patches.",
        ["Moisturize skin liberally twice daily with fragrance-free thick ointments.", "Take brief lukewarm baths and avoid harsh detergents.", "Use topical corticosteroid creams during flares as prescribed."],
        "National Eczema Association"
    ),
    "Psoriasis": (
        "Dermatologic",
        ["red skin patches covered with thick silvery scales", "dry cracked skin that may bleed", "itching or burning skin", "pitted thickened nails"],
        "An autoimmune skin disease that speeds up the growth cycle of skin cells, leading to thick silvery plaques.",
        ["Apply prescribed topical vitamin D or corticosteroid ointments.", "Keep skin moisturized to prevent cracking.", "Consult a dermatologist for phototherapy or biologics."],
        "National Psoriasis Foundation"
    ),
    "Acne Vulgaris": (
        "Dermatologic",
        ["blackheads and whiteheads", "tender red bumps (papules)", "pimples with pus (pustules)", "deep painful cystic lumps"],
        "A common skin condition that occurs when hair follicles become plugged with oil and dead skin cells.",
        ["Cleanse face gently twice daily with non-comedogenic cleanser.", "Use over-the-counter benzoyl peroxide or salicylic acid.", "Consult a dermatologist for topical retinoids."],
        "American Academy of Dermatology"
    ),
    "Urticaria": (
        "Dermatologic",
        ["raised red itchy welts", "swelling that changes shape and location", "intense itching", "burning sensation on skin"],
        "Hives triggered by allergic reactions, physical pressure, temperature changes, or viral infections.",
        ["Take non-drowsy oral antihistamines (cetirizine, fexofenadine).", "Apply cool damp cloths to soothe itchy areas.", "Avoid hot showers and tight clothing."],
        "American College of Allergy, Asthma & Immunology"
    ),
    "Fungal Skin Infection": (
        "Dermatologic",
        ["circular red itchy rash with raised edges", "scaly skin", "clear skin in center of ring", "skin peeling", "cracked skin"],
        "Superficial fungal infection of the skin commonly called ringworm, athlete's foot, or jock itch.",
        ["Apply over-the-counter topical antifungal cream (clotrimazole, terbinafine) for 2-4 weeks.", "Keep affected area clean and completely dry.", "Avoid sharing personal towels or clothing."],
        "CDC — Fungal Diseases"
    ),
    "Contact Dermatitis": (
        "Dermatologic",
        ["red rash localized to area of contact", "severe itching", "dry cracked scaly skin", "bumps and blisters", "burning sensation"],
        "A red, itchy rash caused by direct contact with a substance or an allergic reaction to it (e.g. nickel, poison ivy, soaps).",
        ["Identify and strictly avoid the offending trigger substance.", "Wash affected skin immediately with mild soap and water.", "Apply cold compresses and calamine lotion."],
        "Mayo Clinic — Contact Dermatitis"
    ),
    "Rosacea": (
        "Dermatologic",
        ["facial redness across cheeks and nose", "visible broken blood vessels", "swollen red bumps resembling acne", "eye irritation"],
        "A common chronic skin condition that causes blushing or flushing and visible blood vessels in your face.",
        ["Wear daily broad-spectrum SPF 50+ mineral sunscreen.", "Avoid known triggers (spicy food, hot beverages, alcohol, extreme weather).", "Use gentle, fragrance-free skincare products."],
        "National Rosacea Society"
    ),
    "Alopecia Areata": (
        "Dermatologic",
        ["round coin-sized smooth bald patches on scalp", "sudden hair loss", "exclamation point hairs", "pitted fingernails"],
        "An autoimmune condition where the immune system attacks hair follicles, causing patchy hair loss.",
        ["Consult a dermatologist for intralesional corticosteroid injections.", "Protect bald scalp patches from sun exposure with hats/SPF.", "Join support communities."],
        "National Alopecia Areata Foundation"
    ),
    "Scabies": (
        "Dermatologic",
        ["intense itching worse at night", "thin wavy burrow tracks on skin", "tiny blisters between fingers wrists and waistline"],
        "An infestation of the skin by the human itch mite (Sarcoptes scabiei), causing severe nighttime itching.",
        ["Apply prescription 5% permethrin cream from neck to toes overnight.", "Wash all bedding, towels, and clothing in hot water.", "Treat all close household contacts simultaneously."],
        "CDC — Scabies Guidance"
    ),
    "Cellulitis": (
        "Dermatologic",
        ["red swollen tender skin area", "skin warm to touch", "rapidly expanding redness", "fever", "blisters over red area"],
        "A potentially serious bacterial skin infection affecting deeper dermis and subcutaneous tissue.",
        ["Seek prompt medical evaluation for oral or IV antibiotics.", "Elevate the affected limb to reduce swelling.", "Mark the border of redness with a pen to monitor progression."],
        "Mayo Clinic — Cellulitis"
    ),
    "Impetigo": (
        "Dermatologic",
        ["red sores around nose and mouth", "sores rupture and form honey-colored crusts", "mild itching", "painless sores"],
        "A highly contagious bacterial skin infection common in young children and infants.",
        ["Apply prescribed topical antibiotic ointment (mupirocin).", "Gently wash sores with mild soap and warm water.", "Keep fingernails short to prevent scratching and spread."],
        "CDC — Impetigo"
    ),

    # ── Hematologic & Nutritional (8) ──
    "Iron Deficiency Anemia": (
        "Hematologic",
        ["extreme fatigue", "pale skin", "weakness", "cold hands and feet", "brittle nails", "shortness of breath with mild exertion"],
        "A condition where blood lacks adequate healthy red blood cells due to insufficient iron.",
        ["Eat iron-rich foods (lean meat, lentils, spinach, fortified cereals).", "Take iron supplements with vitamin C (orange juice) to enhance absorption.", "Avoid drinking tea or coffee with meals."],
        "WHO — Anaemia Guidelines"
    ),
    "Vitamin D Deficiency": (
        "Nutritional",
        ["bone pain", "muscle weakness", "frequent infections", "chronic fatigue", "low mood", "hair loss"],
        "Inadequate levels of vitamin D in the body, impairing calcium absorption and immune health.",
        ["Get 15-20 minutes of safe midday sun exposure.", "Take vitamin D3 supplements as prescribed based on 25-OH vitamin D levels.", "Consume fortified milk, fatty fish, and egg yolks."],
        "Endocrine Society — Vitamin D"
    ),
    "Vitamin B12 Deficiency": (
        "Nutritional",
        ["tingling in hands and feet", "smooth red tongue", "fatigue", "memory problems", "unsteady balance", "pale or jaundiced skin"],
        "Insufficient vitamin B12 leading to anemia and nerve damage, common in vegans, elderly, or malabsorption.",
        ["Take oral or sublingual methylcobalamin B12 supplements.", "Consume fortified nutritional yeast, dairy, or meat.", "Consult a doctor for B12 injections if malabsorptive."],
        "National Institutes of Health (NIH) — Vitamin B12"
    ),
    "Dehydration": (
        "Nutritional",
        ["extreme thirst", "dark yellow urine", "dry mouth", "dizziness upon standing", "infrequent urination", "sunken eyes"],
        "A dangerous condition that occurs when you lose more fluids than you take in.",
        ["Drink oral rehydration salts (ORS) or electrolyte solutions in small regular sips.", "Avoid caffeinated or sugary energy drinks.", "Seek emergency IV fluids if unable to retain fluids."],
        "CDC — Hydration & Dehydration"
    ),
    "Electrolyte Imbalance": (
        "Nutritional",
        ["muscle cramps and spasms", "irregular heartbeat", "confusion", "dizziness", "numbness in fingers", "extreme fatigue"],
        "Disruption in the normal concentration of essential minerals (sodium, potassium, calcium, magnesium) in the blood.",
        ["Consume balanced electrolyte broths or drinks.", "Undergo a Comprehensive Metabolic Panel (CMP) blood test.", "Do not take potassium supplements without physician authorization."],
        "Mayo Clinic — Electrolyte Disorders"
    ),
    "Thrombocytopenia": (
        "Hematologic",
        ["easy or excessive bruising", "petechiae (superficial pinpoint purple spots on skin)", "prolonged bleeding from small cuts", "bleeding gums", "nosebleeds"],
        "An abnormally low level of platelets (thrombocytes) in the blood, impairing normal blood clotting.",
        ["Consult a hematologist for complete blood count (CBC).", "Avoid contact sports and heavy trauma.", "Avoid aspirin, ibuprofen, and other blood-thinning NSAIDs."],
        "National Heart, Lung, and Blood Institute"
    ),
    "Scurvy": (
        "Nutritional",
        ["bleeding gums", "corkscrew body hair", "bruising easily", "joint and muscle aches", "fatigue", "slow wound healing"],
        "A disease caused by severe lack of vitamin C (ascorbic acid) in the diet.",
        ["Consume daily fresh citrus fruits (oranges, lemons), kiwi, bell peppers, and strawberries.", "Take oral Vitamin C supplements.", "Symptoms typically reverse rapidly with supplementation."],
        "NIH — Vitamin C"
    ),
    "Thalassemia Minor": (
        "Hematologic",
        ["mild chronic anemia", "slight fatigue", "pale appearance", "microcytic red blood cells on lab work"],
        "An inherited blood disorder that causes the body to have less hemoglobin and smaller red blood cells.",
        ["Undergo hemoglobin electrophoresis for formal confirmation.", "Genetic counseling before family planning.", "Do not take iron supplements unless iron deficiency is proven by ferritin test."],
        "Cooley's Anemia Foundation"
    ),

    # ── ENT & Ophthalmic (8) ──
    "Otitis Media": (
        "ENT",
        ["sharp ear pain", "muffled hearing", "fluid draining from ear", "fever", "feeling of fullness in ear", "irritability"],
        "An infection of the middle ear, the air-filled space behind the eardrum containing vibrating bones.",
        ["Apply a warm moist cloth over the affected ear.", "Take pain relievers (paracetamol/ibuprofen) as recommended.", "Consult an ENT doctor if ear discharge occurs."],
        "American Academy of Otolaryngology"
    ),
    "Allergic Rhinitis": (
        "ENT",
        ["frequent sneezing", "itchy watery eyes", "clear runny nose", "itchy roof of mouth", "nasal congestion"],
        "An allergic response to airborne allergens such as pollen, pet dander, dust mites, or mold.",
        ["Use daily intranasal corticosteroid spray (fluticasone).", "Take second-generation oral antihistamines (cetirizine/loratadine).", "Keep windows closed during high pollen counts."],
        "AAAI — Allergic Rhinitis"
    ),
    "Tonsillitis": (
        "ENT",
        ["red swollen tonsils", "white or yellow coating on tonsils", "painful swallowing", "fever", "enlarged tender neck nodes", "bad breath"],
        "Inflammation of the tonsils, two oval-shaped pads of tissue at the back of the throat.",
        ["Gargle with warm salt water several times daily.", "Sip warm soothing herbal teas with honey.", "Consult a doctor for rapid strep swab to determine if antibiotics are needed."],
        "Mayo Clinic — Tonsillitis"
    ),
    "Conjunctivitis": (
        "Ophthalmic",
        ["pink or red discoloration of eye", "gritty feeling in eye", "itchy eyes", "watery discharge", "crusty eyelids in morning"],
        "Inflammation of the transparent membrane (conjunctiva) lining the eyelid and eyeball, commonly known as pink eye.",
        ["Apply cool compresses to closed eyelids.", "Avoid touching or rubbing eyes and wash hands frequently.", "Discard old eye makeup and clean contact lenses thoroughly."],
        "American Academy of Ophthalmology"
    ),
    "Dry Eye Syndrome": (
        "Ophthalmic",
        ["burning sensation in eyes", "stinging eyes", "scratchy feeling", "stringy mucus in eyes", "blurred vision after reading"],
        "A common condition that occurs when your tears aren't able to provide adequate lubrication for your eyes.",
        ["Use preservative-free artificial tear eye drops.", "Follow the 20-20-20 rule during screen use (look 20 feet away for 20 seconds every 20 minutes).", "Use a room humidifier."],
        "AAO — Dry Eye"
    ),
    "Glaucoma": (
        "Ophthalmic",
        ["gradual loss of peripheral vision", "tunnel vision in advanced stages", "severe eye pain with halo around lights", "blurred vision"],
        "A group of eye conditions that damage the optic nerve, often caused by abnormally high pressure in the eye.",
        ["Undergo regular comprehensive eye exams including tonometry.", "Take prescribed pressure-lowering eye drops daily without fail.", "Seek emergency care for sudden severe eye pain with vomiting."],
        "Glaucoma Research Foundation"
    ),
    "Cataract": (
        "Ophthalmic",
        ["cloudy or blurry vision", "faded colors", "glare and halos around headlights", "poor night vision", "frequent eyeglasses changes"],
        "A clouding of the normally clear lens of your eye, leading to a decrease in vision.",
        ["Consult an ophthalmologist for regular visual acuity testing.", "Use brighter task lighting when reading.", "Cataract surgery is a safe, definitive outpatient curative procedure."],
        "National Eye Institute — Cataracts"
    ),
    "Benign Paroxysmal Positional Vertigo": (
        "ENT",
        ["sudden spinning sensation when turning head", "dizziness when rolling over in bed", "loss of balance", "nausea with head movement"],
        "A disorder arising from the inner ear characterized by repeated brief episodes of spinning vertigo.",
        ["Consult an ENT specialist or physical therapist for the Epley canalith repositioning maneuver.", "Avoid sudden head movements.", "Sit on the edge of the bed for 1 minute before standing."],
        "Vestibular Disorders Association"
    ),

    # ── Mental Health & Sleep (6) ──
    "Generalized Anxiety Disorder": (
        "Mental Health",
        ["persistent excessive worry", "restlessness", "muscle tension", "difficulty concentrating", "irritability", "sleep disturbance"],
        "Chronic, exaggerated worry and tension about everyday life events without obvious reasons for concern.",
        ["Practice daily mindfulness and diaphragmatic breathing.", "Limit caffeine and alcohol intake.", "Consult a mental health professional for Cognitive Behavioral Therapy (CBT)."],
        "Anxiety and Depression Association of America"
    ),
    "Major Depressive Disorder": (
        "Mental Health",
        ["persistent sad empty mood", "loss of interest in hobbies", "fatigue", "changes in appetite or weight", "feelings of worthlessness", "difficulty sleeping"],
        "A mood disorder that causes a persistent feeling of sadness and loss of interest, affecting daily functioning.",
        ["Reach out to a trusted counselor, psychologist, or psychiatrist.", "Engage in daily gentle walking and structured daily routines.", "Seek emergency support if self-harm thoughts occur."],
        "National Institute of Mental Health (NIMH)"
    ),
    "Panic Disorder": (
        "Mental Health",
        ["sudden intense terror", "pounding racing heart", "chest tightness", "sweating", "trembling", "feeling of choking", "fear of losing control"],
        "A type of anxiety disorder characterized by recurrent unexpected panic attacks.",
        ["Practice the 4-7-8 deep breathing technique during an attack.", "Remind yourself that panic attacks peak in 10 minutes and will pass.", "Consult a therapist for CBT."],
        "NIMH — Panic Disorder"
    ),
    "Insomnia Disorder": (
        "Mental Health",
        ["difficulty falling asleep", "waking up during the night", "waking up too early", "daytime fatigue", "irritability", "difficulty concentrating"],
        "A common sleep disorder that makes it hard to fall asleep, stay asleep, or causes non-restorative sleep.",
        ["Maintain a fixed sleep and wake-up time 7 days a week.", "Avoid screens and blue light 1 hour before bed.", "Keep bedroom cool, dark, and quiet."],
        "American Academy of Sleep Medicine"
    ),
    "Social Anxiety Disorder": (
        "Mental Health",
        ["intense fear of social interactions", "fear of being judged or embarrassed", "blushing and sweating around people", "avoidance of social situations"],
        "An intense, persistent fear of being watched and judged by others in social and performance situations.",
        ["Gradual exposure therapy under professional psychological guidance.", "Practice social interaction in low-stakes safe environments.", "CBT is the gold-standard treatment."],
        "ADAA — Social Anxiety"
    ),
    "Chronic Stress / Burnout": (
        "Mental Health",
        ["emotional exhaustion", "cynicism and detachment", "reduced personal accomplishment", "chronic physical fatigue", "frequent headaches", "digestive upset"],
        "A state of emotional, physical, and mental exhaustion caused by excessive and prolonged stress.",
        ["Establish clear work-life boundaries and scheduled offline downtime.", "Engage in restorative hobbies and daily physical movement.", "Speak with a counselor or occupational health specialist."],
        "World Health Organization — Burn-out"
    ),
}

TEMPLATE_SENTENCES = [
    "I'm experiencing {symptoms}.",
    "Doctor, I've had {symptoms} for the past few days.",
    "Lately I have been feeling {symptoms}.",
    "I have {symptoms}, what could this be?",
    "Patient reports {symptoms} with increasing discomfort.",
    "Suffering from {symptoms}, need medical guidance.",
    "Over the last 48 hours, I noticed {symptoms}.",
    "My main issues right now are {symptoms}.",
    "I feel terrible with {symptoms}.",
    "Clinical notes: Patient presenting with {symptoms}.",
    "Experiencing acute {symptoms}.",
    "I cannot sleep because of {symptoms}.",
    "Woke up today with {symptoms}.",
    "It started yesterday with {symptoms}.",
    "I've been dealing with {symptoms} and it is getting worse.",
]

CATEGORY_TRANSITIONS = [
    "I have ", "Doctor, I've had ", "Suffering from ", "Experiencing ", "Feeling ",
    "Patient presenting with ", "Noticed severe ", "Been having "
]


def generate_rows():
    rows = []
    for disease, (category, symptoms, description, care, source) in DISEASES.items():
        # Combinations of 2-4 symptoms
        for r in range(2, min(len(symptoms) + 1, 5)):
            combos = list(itertools.combinations(symptoms, r))
            # Sample up to 16 combinations
            sampled_combos = random.sample(combos, min(len(combos), 16))
            for combo in sampled_combos:
                phrase = ", ".join(combo[:-1]) + f" and {combo[-1]}" if len(combo) > 1 else combo[0]
                template = random.choice(TEMPLATE_SENTENCES)
                rows.append((template.format(symptoms=phrase), disease))

        # Direct comma combinations
        for combo in itertools.combinations(symptoms, min(3, len(symptoms))):
            phrase = ", ".join(combo)
            prefix = random.choice(CATEGORY_TRANSITIONS)
            text = f"{prefix}{phrase}".strip()
            rows.append((text, disease))

        # Single symptom training cases for robust multi-symptom learning
        for s in symptoms:
            rows.append((f"I have {s}", disease))
            rows.append((f"Feeling {s}", disease))
            rows.append((f"Experiencing {s}", disease))

    random.shuffle(rows)
    return rows


def main():
    rows = generate_rows()
    with open(DATA_DIR / "dataset.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "disease"])
        writer.writerows(rows)

    disease_info = {}
    for disease, (category, symptoms, description, care, source) in DISEASES.items():
        slug = disease.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-").replace("'", "")
        disease_info[slug] = {
            "slug": slug,
            "name": disease,
            "category": category,
            "symptoms": symptoms,
            "description": description,
            "general_care": care,
            "source": source,
        }
    with open(DATA_DIR / "disease_info.json", "w", encoding="utf-8") as f:
        json.dump(disease_info, f, indent=2)

    print(f"Generated {len(rows)} training rows across {len(DISEASES)} comprehensive diseases.")


if __name__ == "__main__":
    main()

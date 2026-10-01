/* Dakshinamurthy engine — study/data engine and bounded item-level SRS adapter.
   Full build-by-build history moved to CHANGELOG.md (12 Sep 2026) so it no
   longer ships as part of this production file. See CHANGELOG.md for the
   verification notes and every documented fix behind the code below. */
window.SM = (function(){

var CURRICULUM = [
["General Surgery Principles & Perioperative Care","D",2,2,5,39,1832,913,0,0],
["Trauma & Burns","D",2,2,5,27,1356,470,14,15],
["Esophagus","A",2,2,1,10,321,456,400,372],
["Stomach","A",2,2,1,8,325,152,452,403],
["Small Intestine","A",1,2,2,1,0,81,255,227],
["Large Intestine, Rectum & Anal Canal","A",2,2,3,13,982,276,878,800],
["Appendix","A",1,2,2,1,47,38,210,208],
["Abdominal Wall, Hernia & Peritoneum","A",1,2,3,16,325,132,323,319],
["Acute Abdomen & GI Bleeding","A",1,2,3,2,172,39,23,19],
["Liver","A",2,2,1,37,2239,140,419,370],
["Gallbladder & Biliary Tract","A",2,2,2,17,304,95,437,395],
["Pancreas","A",2,2,2,31,1253,158,415,366],
["HPB — Combined Overview","A",1,1,2,8,641,130,0,0],
["Spleen","A",1,1,2,2,145,17,224,213],
["Bariatric Surgery","A",0,1,1,2,13,47,17,15],
["Surgical GI — General & Recall","A",1,1,3,22,1586,120,25,20],
["Breast","B",2,2,6,26,1282,880,0,0],
["Thyroid","B",2,2,6,29,1086,658,0,0],
["Parathyroid","B",0,1,6,14,357,0,0,0],
["Adrenal Gland","B",0,1,6,14,415,0,0,0],
["Neuroendocrine Tumours & MEN","B",0,0,6,10,312,49,0,0],
["MSK, Bone & Soft Tissue Sarcoma","B",1,1,5,13,338,101,0,0],
["Skin & Melanoma","B",1,1,5,10,327,0,0,0],
["Head & Neck","B",1,1,6,21,478,63,24,19],
["Surgical Oncology — Principles","B",1,2,5,11,718,121,0,0],
["Kidney & Ureter","C",2,1,7,22,745,87,0,0],
["Bladder","C",1,1,7,28,437,55,0,0],
["Prostate & Seminal Vesicles","C",1,1,7,12,265,35,0,0],
["Urethra, Penis & Testis","C",1,1,7,50,888,93,0,0],
["Uro-Oncology & Uro-Gynaecology","C",0,0,7,22,930,0,0,0],
["Urology — General & Recall","C",1,1,7,10,475,152,0,0],
["Vascular Surgery","C",1,2,7,27,1021,301,0,0],
["Cardiothoracic Surgery","C",2,0,7,32,1260,208,10,8],
["Neurosurgery","C",2,0,7,28,1186,334,0,0],
["Plastic Surgery","C",1,1,7,22,1049,426,0,0],
["Paediatric Surgery","D",1,1,7,21,625,145,0,0],
["Transplant Surgery","D",1,0,6,14,744,56,0,0],
["Biostatistics","D",0,0,6,1,120,100,0,0],
["Metabolic Response, Wound Healing & Nutrition","D",2,2,4,6,370,2475,0,0]
].map(function(r,i){ return {i:i,n:r[0],tr:r[1],yINI:r[2],yNEET:r[3],phase:r[4],nlec:r[5],
  lecmin:r[6],dtq:r[7],spq:r[8],spmin:r[9]}; });
var PHASE_NAME={1:"Upper GI & liver",2:"Biliary, pancreas & small bowel",
  3:"Colorectal, abdominal wall & GI recall",4:"Metabolic response, wound healing & nutrition",
  5:"General surgery, trauma & oncology principles",6:"Breast, endocrine, transplant & statistics",
  7:"Urology, vascular, CTVS, neuro, plastics & paediatrics"};

/* Item-level source data: every individual lecture, MCQ-bank chapter and speed
   quiz, with the exact in-app path to open. Parsed from the source catalogue
   and reconciled item-for-item: 679 lectures / 26,969 min, 9,603 bank, 4,126 speed. */
var ITEMS = {"p":["Doc Tutorials – Hepatobiliary Pancreatic System – 70 · Biliary System","Doc Tutorials – Head & Neck – Head & Neck","Doc Tutorials – Urology – 48 · Urinary Bladder","Speed MCQs – Stomach","Speed MCQs – Liver","Speed MCQs – Pancreas","Speed MCQs – Esophagus","Doc Tutorials – Shackelford's Updates – High Yield Series – Shackelford & Blumgart – 1. Liver","Doc Tutorials – Endocrine Surgery – Thyroid","Doc Tutorials – Vascular Surgery – 25–37 · Vascular Surgery Tutorials","Doc Tutorials – Trauma – 55 · Trauma","Doc Tutorials – GIT","Doc Tutorials – Urology – 37 · Bladder","Doc Tutorials – INI SS – Recall Sessions – 65–75 · INI SS Recall Sessions","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – SKF & BLUM – Mixed Review","Doc Tutorials – Hepatobiliary Pancreatic System – 71 · Pancreas","Doc Tutorials – Vascular Surgery – Updated – 46 · Vascular Surgery – Updated","Doc Tutorials – Cardiothoracic Surgery – 12–24 · CTVS Tutorials","Doc Tutorials – Neuro Surgery – 1–11 · Neurosurgery Tutorials","Doc Tutorials – GI Malignancies","Doc Tutorials – INI SS – Discussion Sessions – INI SS 2025","Doc Tutorials – Urology – 47 · Kidneys and Ureters","Doc Tutorials – Urology – 51 · Penis","Doc Tutorials – Urology – 52 · Testis","Doc Tutorials – Pediatric Surgery – 45 · Pediatric Surgery","Doc Tutorials – Trauma – Trauma","Speed MCQs – Anal Canal","Speed MCQs – Appendix","Doc Tutorials – Surgical Oncology – 76 · Breast","Doc Tutorials – Endocrine Surgery – 81 · Parathyroid","Doc Tutorials – Endocrine Surgery – 17 · Adrenal Gland","Doc Tutorials – Neurosurgery – 44 · Neurosurgery (Elective)","Doc Tutorials – Plastic Surgery – Updated – 47 · Plastic Surgery – Updated","Doc Tutorials – Schwartz Updates – 50 · Urology","Doc Tutorials – Schwartz 11th Ed – 90 · Urology","Doc Tutorials – Hepatobiliary Pancreatic System – 73 · Liver","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Liver","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Pancreas","Doc Tutorials – Endocrine Surgery – 80 · Thyroid","Doc Tutorials – Urology – 36 · Kidneys and Ureters","Doc Tutorials – Genitourinary Tract","Doc Tutorials – Cardiothoracic Surgery – 48 · Cardiothoracic Surgery","Doc Tutorials – Plastic Surgery – 38–45 · Plastic Surgery Tutorials","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – SKF & BLUM – Mixed Review captured)","Speed MCQs – Biliary Tract and GB","Speed MCQs – Gall Bladder","Speed MCQs – Spleen","Doc Tutorials – Urology – 40 · Penis","Doc Tutorials – Urology – 41 · Testis","Doc Tutorials – Urology – 50 · Urethra","Doc Tutorials – INI SS – Discussion Sessions – INI SS 2024","Doc Tutorials – CVTS","Doc Tutorials – Transplant Surgery – 49 · Transplant Surgery","Doc Tutorials – Transplant Surgery – 74 · Transplantation Surgery","Doc Tutorials – General Surgery – Principles – Modern Perioperative Care","Doc Tutorials – General Surgery – Principles – General Surgery Principles","Doc Tutorials – General Surgery – 56 · Part 1 – Modern Perioperative Care","Doc Tutorials – General Surgery – 57 · Part 2 – General Surgery Principles","Doc Tutorials – Basic Principles","Doc Tutorials – Image Based Questions","Doc Tutorials – Trauma","Doc Tutorials – Plastic Surgery","Doc Tutorials – Pediatric Surgery","Speed MCQs – Small Intestine","Speed MCQs – Rectum","Doc Tutorials – Abdominal Wall – 27 · Hernia","Doc Tutorials – General Surgery – 66 · Hernia","Doc Tutorials – Schwartz 11th Ed – 92 · Endocrine Surgery","Doc Tutorials – Surgical Oncology – 79 · Skin","Doc Tutorials – Urology – 43 · Uro Oncology","Doc Tutorials – Urology – 54 · Uro-Oncology","Doc Tutorials – INI SS – Discussion Sessions – Recall Session","Doc Tutorials – General Surgery – Principles – Perioperative Care","Doc Tutorials – Schwartz Updates – 56 · General Surgery","Doc Tutorials – Schwartz 11th Ed – 96 · General Surgery","Doc Tutorials – Pediatric Surgery – 85 · General Surgery","Doc Tutorials – Neurosurgery","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Esophagus","Doc Tutorials – INI SS – Discussion Sessions – INI SS 2023","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Colorectal","Speed MCQs – Colon & Rectum","Speed MCQs – Large Intestine","Speed MCQs – Hernia","Doc Tutorials – Breast, Soft Tissue, Bone & Skin – 18 · Breast Surgery","Doc Tutorials – Schwartz Updates – Surgical Oncology","Doc Tutorials – Schwartz 11th Ed – 91 · Surgical Oncology","Doc Tutorials – Schwartz Updates – 52 · Endocrine Surgery","Doc Tutorials – Endocrine Surgery – 16 · Parathyroid","Doc Tutorials – Endocrine Surgery – 15 · Neuroendocrine Pancreas","Doc Tutorials – Breast, Soft Tissue, Bone & Skin – 19 · Musculoskeletal","Doc Tutorials – Surgical Oncology – 77 · Head & Neck","Doc Tutorials – Urology – 49 · Prostate and Seminal Vesicles","Doc Tutorials – Urology – 42 · Urogynaecology","Doc Tutorials – Urology – 53 · Uro-Gynaecology","Doc Tutorials – Surgical Oncology – 75 · General – Surgical Oncology","Doc Tutorials – NEET SS – Recall Sessions – 57 · CVTS","Doc Tutorials – General Surgery – 58 · Part 3 – Perioperative Care","Doc Tutorials – Miscellaneous","Doc Tutorials – INI SS – Discussion Sessions – INI SS 2026","Speed MCQs – Peritoneum","Doc Tutorials – Shackelford's Updates – High Yield Series – High Yield Series","Doc Tutorials – Breast, Soft Tissue, Bone & Skin – 20 · Bone","Doc Tutorials – Surgical Oncology – 78 · Musculoskeletal","Doc Tutorials – Breast, Soft Tissue, Bone & Skin – 21 · Cutaneous (Skin)","Doc Tutorials – Urology – Prostate & Seminal Vesicles","Doc Tutorials – Urology – 39 · Urethra","Doc Tutorials – NEET SS – Recall Sessions – 63 · Urology","Doc Tutorials – Urology – 46 · Urinary Symptoms and Investigations","Doc Tutorials – NEET SS – Recall Sessions – 58 · Surgical Oncology","Doc Tutorials – NEET SS – Recall Sessions – 59 · Plastic Surgery","Doc Tutorials – Perioperative Care","Doc Tutorials – Bailey 28th Edition Update","Doc Tutorials – Transplant","Speed MCQs – Integrated","Speed MCQs – General / Integrated","Doc Tutorials – Hepatobiliary Pancreatic System","Doc Tutorials – Endocrine Surgery – 82 · Adrenal Gland","Doc Tutorials – Pediatric Surgery – 88 · Urology","Doc Tutorials – NEET SS – Recall Sessions – 62 · Surgical Gastroenterology","Doc Tutorials – NEET SS – Recall Sessions – 61 · Vascular Surgery","Doc Tutorials – NEET SS – Recall Sessions – 60 · Neurosurgery","Doc Tutorials – NEET SS – Recall Sessions – 64 · Pediatric Surgery","Doc Tutorials – General Surgery – Sabiston 22nd Edition Updates","Doc Tutorials – Surgical Gastroenterology","Doc Tutorials – Sabiston 22nd Ed Updates – 89 · Sabiston 22nd Ed Updates","Speed MCQs – Intestinal Obstruction","Speed MCQs – Small Bowel","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Inflammatory Bowel Disease","Speed MCQs – Hiatal Hernia","Speed MCQs – The Abdominal Wall, Hernia and Umbilicus","Doc Tutorials – Endocrine Surgery – 84 · Pancreas","Doc Tutorials – Hepatobiliary Pancreatic System – 72 · Spleen","Doc Tutorials – New / Recently Added – — Top of list","Doc Tutorials – Breast","Doc Tutorials – Thyroid","Doc Tutorials – Endocrine Surgery – Multiple Endocrine Neoplasia","Doc Tutorials – Schwartz Updates – 54 · CVTS","Doc Tutorials – Cardiothoracic Surgery – 12–24 · CTVS Tutorials captured)","Doc Tutorials – Schwartz 11th Ed – 94 · CVTS","Doc Tutorials – Schwartz Updates – 55 · Neurosurgery","Doc Tutorials – Schwartz 11th Ed – 95 · Neurosurgery","Speed MCQs – Lung Trauma","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Peptic Ulcer Disease","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Stomach","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Post Gastrectomy Complications captured)","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Small Bowel Obstruction captured)","Speed MCQs – Inflammatory Bowel Disease","Speed MCQs – Rectum & Anal Canal","Doc Tutorials – General Surgery – 68 · Appendix","Doc Tutorials – General Surgery – 69 · Abdominal Wall, Peritoneum & Mesentry","Speed MCQs – Difficult Abdominal Wall","Doc Tutorials – General Surgery – 67 · Acute GI Bleeding","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – GI Bleed","Speed MCQs – Acute Abdomen","Speed MCQs – GI Bleed","Doc Tutorials – INI SS – Discussion Sessions – Benign Liver Lesion – year not indicated in source","Speed MCQs – Portal Hypertension","Speed MCQs – Biliary Injury","Speed MCQs – Gall Stone Disease","Speed MCQs – Gall Bladder & Biliary Tree","Doc Tutorials – Shackelford & Blumgart – Video Lecture Series (Dr. Basant Singh) – Morbid Obesity","Speed MCQs – Bariatric Surgery","Speed MCQs – Morbid Obesity","Doc Tutorials – Endocrine Surgery – 83 · MEN Syndrome","Speed MCQs – Salivary Glands","Doc Tutorials – Urology – 49 · Prostate and Seminal Vesicles captured)","Doc Tutorials – INI SS – Discussion Sessions – INI SS 2024 captured)","Doc Tutorials – Cardiothoracic Surgery","Speed MCQs – Lung Cancer","Doc Tutorials – Pediatric Surgery – 87 · Pediatric Oncology","Doc Tutorials – Schwartz 11th Ed – 93 · Pediatric Surgery","Doc Tutorials – INI SS – Discussion Sessions – Biostatistics","Doc Tutorials – Biostatistics"],"t":[{"l":[["Shock",53,54],["Fluids & Blood Transfusion",26,54],["Surgical Infections",52,54],["Basic Surgical Skills",65,55],["Imaging in Surgery",50,55],["Endoscopy in Surgery",59,55],["Principles of Minimal Access Surgery",29,55],["Surgical Pathology",33,55],["Clinical Audit & Research",34,55],["Preoperative Assessment",62,72],["Anesthesia and Pain Relief",44,72],["Postoperative and Critical Care",66,72],["Postoperative Complications",60,72],["Patient Safety",37,72],["Infections",44,33],["Schwartz Updates – Shock",40,73],["Schwartz Updates General Surgery Part 1",66,73],["Schwartz Updates General Surgery Part 2",41,73],["65 · MIS INI SS – April 2024",69,13],["Shock",53,56],["Fluids & Blood Transfusion",26,56],["Surgical Infections",52,56],["Basic Surgical Skills",65,57],["Imaging in Surgery",50,57],["Endoscopy in Surgery",59,57],["Principles of Minimal Access Surgery",29,57],["Surgical Pathology",33,57],["Clinical Audit & Research",34,57],["Preoperative Assessment",62,96],["Anesthesia and Pain Relief",44,96],["Postoperative and Critical Care",66,96],["Day Surgery",12,96],["Sabiston 22nd Edition Updates – General Surger…",86,122],["Sabiston 22nd Edition Updates – General Surger…",27,122],["Infections",44,34],["Schwartz Updates – Shock",40,74],["Schwartz Updates General Surgery Part 1",66,74],["Schwartz Updates General Surgery Part 2",41,74],["Barrier Methods",13,74]],"b":[["Shock And Resuscitation",228,58],["Fluids, Electrolytes, Transfusion and Nutrition",85,58],["Infection",106,58],["Basic Surgical Skills and Laparoscopy",56,58],["Radiology And Endoscopy",138,58],["Preoperative Workup",39,110],["Anaesthesia, Pain Relief, Day Care Surgery, Enhanced Recov…",82,110],["Postoperative Care, Patient Safety, Surgical Ethics",44,110],["Surgery in Pregnancy",24,97],["General Surgery",81,59],["Basic Sciences",30,111]],"s":[]},{"l":[["Recent Updates – Trauma Part 1 with Q&A Discussion",111,25],["Recent Updates – Trauma Part 2 with Q&A Discussion",42,25],["Burns Recent Updates",39,25],["Trauma Basics + ATLS",59,25],["Brain, Spine & Faciomaxillary Basics",54,25],["Neck, Chest & Diaphragmatic Injuries",33,25],["Abdominal, Pelvis & Retroperitoneal Injuries",36,25],["Miscellaneous Trauma",46,25],["Burns",50,25],["Genitourinary Trauma",32,33],["Burns",49,73],["Trauma",73,73],["Sabiston 22nd Edition Updates – Trauma Part 1",55,10],["Sabiston 22nd Edition Updates – Trauma Part 2",66,10],["Sabiston 22nd Edition Updates – Burns",16,10],["Recent Updates – Trauma Part 1 with Q&A Discussi…",117,10],["Recent Updates – Trauma Part 2 with Q&A Discuss…",42,10],["Burns Recent Updates",39,10],["Trauma Basics + ATLS",59,10],["Brain, Spine & Faciomaxillary Injury",54,10],["Neck, Chest & Diaphragmatic Injuries",33,10],["Abdominal, Pelvis & Retroperitoneal Injuries",36,10],["Miscellaneous Trauma",46,10],["Burns",50,10],["Pediatric Trauma",14,75],["Genitourinary Trauma",32,34],["Trauma",73,74]],"b":[["General Trauma Principles",60,60],["Central Nervous System",30,60],["Maxillofacial And Extremities",39,60],["Torso",65,60],["Conflict Surgery, Disaster Surgery And Sports Injury",42,60],["Traumatic Brain Injury",80,76],["Reconstruction & Burns",107,61],["Pediatric Trauma",47,62]],"s":[["Lung Trauma",14,15,141]]},{"l":[["Esophagus",13,77],["Esophagus Part 2",13,77],["Motor Disorders of Esophagus",13,77],["Esophageal Perforation",13,77],["GERD",13,77],["Carcinoma Esophagus",72,14],["Management of Esophageal Cancer",10,14],["Esophagus Part 1",0,43],["Esophagus Part 2",65,14],["Esophagus",109,78]],"b":[["Oesophagus",405,11],["Oesophagus",51,19]],"s":[["Ca Esophagus Part 1",25,25,6],["Ca Esophagus Part 2",29,29,6],["Esophagus - Introduction",33,26,6],["Esophagus - Miscellaneous",38,32,6],["Esophagus - Motility Disorders",43,35,6],["Esophageal Motility Disorders Part 1",7,10,6],["Esophageal Perforation, Stricture and Esophagitis",20,20,6],["Esophagitis, Foreign Body, Ulcers And Perforations Part 1",20,20,6],["Esophagitis, Foreign Body, Ulcers And Perforations Part 2",20,20,6],["Esophagus Part - I",50,45,6],["Esophagus Part - II",50,45,6],["Esophagus Part 1",15,15,6],["Esophagus Part 2",20,20,6],["Esophagus Part 3",30,30,6]]},{"l":[["Oesophagus and Stomach",50,123],["Oesophagus and Stomach",50,124],["Peptic Ulcer Disease",13,142],["Carcinoma Stomach",13,143],["Post Gastrectomy Complications",0,144],["Stomach",84,78],["Upper GI",30,20],["Upper GI Part 2",85,20]],"b":[["Stomach",60,11],["Stomach",50,19],["Gastric Cancer – Misc",42,19]],"s":[["Stomach - H.Pylori And Peptic Ulcer Disease",37,30,3],["Stomach Part - 1",10,10,3],["Stomach Part - 2",21,21,3],["Stomach Part - I",50,45,3],["Stomach Part - II",50,45,3],["Stomach Part - II – 2",62,49,3],["Stomach Part - III",48,38,3],["Stomach Part - IV",10,8,3],["Stomach Part - V",6,4,3],["Stomach Part - VI",73,58,3],["Stomach Part 1",25,35,3],["Stomach Part 2",20,20,3],["Stomach Part 3",20,20,3],["Stomach Part 4",20,20,3]]},{"l":[["Small Bowel Obstruction",0,145]],"b":[["Transplant – Small Bowel, Heart, Lung",30,112],["Small Intestine",51,11]],"s":[["Intestinal Obstruction",12,16,125],["Intestinal Obstruction Part II",25,20,125],["Small Bowel",50,45,126],["Small Bowel – 2",4,4,126],["Small Intestine – 1",20,16,63],["Small Intestine – 2",20,16,63],["Small Intestine – 3",15,15,63],["Small Intestine Part 1",15,15,63],["Small Intestine Part 2",20,20,63],["Small Intestine Part I",25,20,63],["Stomach and Small Bowel",49,40,3]]},{"l":[["Inflammatory Bowel Disease Part 1",107,127],["Inflammatory Bowel Disease Part 2",103,127],["Polyposis Syndrome Part 1",106,79],["Polyposis Syndrome Part 2",26,79],["Carcinoma Colon",90,79],["Carcinoma Rectum Part 1",13,79],["Carcinoma Rectum Part 2",100,79],["Colorectal Part 1",46,14],["Inflammatory Bowel Disease Part 1",89,14],["Inflammatory Bowel Disease Part 2",70,14],["Lower GI",60,20],["Lower GI Part 2",110,20],["Colorectal",62,98]],"b":[["Large Intestine, Rectum",40,11],["Anal Canal",62,11],["Miscellaneous",31,11],["Colon",95,19],["Rectum",48,19]],"s":[["Anal Canal Part-1",30,30,26],["Anal Canal Part-2",31,31,26],["Anal Canal Part-3",30,30,26],["Anal Canal Part-4",29,30,26],["Anal Canal",4,4,26],["Anal Canal Surgery Part 1",40,30,26],["Anal Canal – 2",10,8,26],["Anal Canal 1",20,20,26],["Anal Canal 2",27,27,26],["Colon",10,8,80],["Colon & Rectum",25,20,80],["Colon Rectum",6,6,80],["Colorectal and Rectal Cancer + Staging",51,50,80],["Colorectal Cancer",40,32,80],["Inflammatory Bowel Disease MCS",50,50,146],["Large Intestine 1",20,20,81],["Large Intestine 2",15,15,81],["Large Intestine – 3",35,35,81],["Large Intestine – 4",67,54,81],["Large Intestine – 5",30,24,81],["Small and Large Intestine",80,64,113],["Rectal Prolapse",30,30,64],["Rectum",53,43,64],["Rectum Part 1",30,30,64],["Rectum Bailey PART 2",30,30,64],["Rectum Bailey PART 3",20,20,64],["Rectum Bailey PART 4",35,35,64],["Rectum & Anal Canal",30,24,147]]},{"l":[["Appendix",47,148]],"b":[["Appendix",38,11]],"s":[["Appendix Part II",11,9,27],["Appendix Part 1",20,20,27],["Appendix Part 2",20,20,27],["Appendix Part I",40,32,27],["Appendix Part II – 2",5,8,27],["Appendix Part-2 – 2",29,29,27],["Appendix Part-3",30,30,27],["Appendix",25,30,27],["Appendix Part 1 – 2",30,30,27]]},{"l":[["Classification",4,65],["Inguinal Hernia – Anatomy",12,65],["Inguinal Hernia",45,65],["Femoral Hernia",5,65],["Ventral Hernia",23,65],["Unusual Hernia",8,65],["Retroperitoneal Fibrosis",9,33],["Classification",4,66],["Inguinal Hernia – Anatomy",12,66],["Inguinal Hernia",45,66],["Femoral Hernia",5,66],["Ventral Hernia",23,66],["Unusual Hernia",8,66],["Abdominal Wall, Peritoneum & Mesentry",83,149],["Congenital Diaphragmatic Hernia & Lung Anomalies",30,75],["Retroperitoneal Fibrosis",9,34]],"b":[["Hernia",60,11],["Mesentery, Peritoneum & Retroperitoneum",72,11]],"s":[["Peritoneum Part II",7,6,99],["Peritoneum 1",20,20,99],["Peritoneum 2",24,24,99],["Peritoneum and Esophagus",25,20,99],["Abdominal Wall, Umbilicus, Mesentery, Omentum and Retroperitoneum",15,12,114],["Difficult Abdominal Wall",3,2,150],["Esophagus - Hiatal Hernia",12,10,128],["Esophagus - Hiatal Hernia – 2",12,10,128],["Hernia Part 1",20,20,82],["Hernia Part 2",20,20,82],["Hernia Part 3",10,10,82],["Hernia Part II",7,5,82],["Hernia",30,30,82],["Peritoneum, Mesentery, Greater Omentum and Retroperitoneal Space - 2",34,40,113],["The Abdominal Wall, Hernia and Umbilicus Part 1",54,60,129],["The Abdominal Wall, Hernia and Umbilicus Part 2",30,30,129]]},{"l":[["Acute GI Bleeding",73,151],["GI Bleed",99,152]],"b":[["GI Hemorrhage",39,11]],"s":[["Acute Abdomen",5,4,153],["Acute GI Hemorrhage",13,10,114],["GI Bleed",5,5,154]]},{"l":[["Anatomy and Physiology",67,35],["Imaging of Focal Liver Diseases",37,35],["Investigations",21,35],["Portal Hypertension",54,35],["Surgical Infections",45,35],["Tumours",51,35],["Miscellaneous",11,35],["Liver – Bailey and Love 28th Edition Updates",68,35],["Liver and Bile Duct",118,100],["a) Anatomy",72,7],["b) Liver Functions",28,7],["c) Biliary Obstruction",22,7],["d) Liver Blood Flow",43,7],["e) Liver Fibrosis",80,7],["f) Liver Regeneration",28,7],["g) Benign Liver Lesions – Part A",83,7],["h) Benign Liver Lesions – Part B",60,7],["i) Portal Hypertension Part 1",102,7],["j) Portal Hypertension Part 2",86,7],["k) HCC, Colorectal & Liver Metastases Part 1",104,7],["l) HCC, Colorectal & Liver Metastases Part 2",48,7],["m) Liver Resection Part 1",57,7],["n) Liver Resection Part 2",44,7],["Malignant Biliary Disease – Carcinoma Gall Bladder",109,36],["Malignant Biliary Disease – Cholangiocarcinoma",117,36],["Biliary Injury",115,36],["Primary Sclerosing Cholangitis and Choledochal Cyst",87,36],["Stone Disease – Gall Stone Disease, Choledocholithiasis",110,36],["MCQs Discussion – Liver, Pancreas, Biliary System",64,36],["Liver Transplantation",13,36],["Liver Transplantation Part 2",13,36],["Liver Part 1",6,14],["Liver Part 2",70,14],["Liver Part III",6,14],["Liver Transplantation",0,43],["Benign Liver Lesion",113,155],["Liver",87,98]],"b":[["Liver",70,115],["Liver",70,19]],"s":[["Acute Liver Failure",15,12,4],["Cirrhosis and Portal Hypertension",45,35,4],["Liver Basics",51,41,4],["Liver Bailey PART - 1",30,30,4],["Liver Bailey PART - 2",50,60,4],["Liver Bailey Part - 3",40,40,4],["Liver Part 1",20,16,4],["Liver Part 2",20,16,4],["Liver Part 3",20,16,4],["Liver Part 4",20,16,4],["Liver Part 5",20,16,4],["Liver Part 6",20,16,4],["Liver Part 7",20,16,4],["Liver Part 8",20,16,4],["Liver Part 9",20,16,4],["Portal Hypertension",8,8,156]]},{"l":[["75 · INI SS Nov 2024 SGE – Hepatobiliary",51,13],["Anatomy & Physiology",30,0],["Investigations",14,0],["Gall Stone Disease",30,0],["CBD Stones",7,0],["Other Complications",7,0],["Acalculous Cholecystitis",3,0],["Biliary Dyskinesia, SOD Dysfunction",14,0],["PSC Biliary Strictures",8,0],["Choledochal Cyst",9,0],["Benign Masses",7,0],["Surgical Aspects",20,0],["Post Cholecystectomy Syndromes",20,0],["Cholangitis",4,0],["Gallbladder Cancer",18,0],["Bile Duct Cancer",15,0],["Gall Bladder & Bile Ducts – Bailey and Love 28th Edit…",47,0]],"b":[["Gall Bladder & Bile Duct",60,115],["Gall Bladder And Bile Duct",35,19]],"s":[["Biliary Injury",2,2,157],["Biliary Tract and GB - 1",20,16,44],["Biliary Tract and GB - 2",20,16,44],["Biliary Tract and GB - 3",20,16,44],["Biliary Tract and GB - 4",20,16,44],["Biliary Tract and GB - 5",20,16,44],["Biliary Tract and GB - 6",20,16,44],["Biliary Tract and GB - 7",31,24,44],["Gallbladder Part 1",50,50,45],["Gallbladder Part 2",40,40,45],["Gallbladder Part 3",38,40,45],["Gall Bladder Part II",25,20,45],["Gall Bladder",33,33,45],["Gall Bladder – 2",40,40,45],["Carcinoma GB",6,6,45],["Gall Stone Disease",4,4,158],["Gall Bladder & Biliary Tree",48,40,159]]},{"l":[["Anatomy, Physiology, Embryology",30,15],["Acute Pancreatitis",18,15],["Severity Assessment",18,15],["Complication of Acute Pancreatitis",8,15],["Chronic Pancreatitis",47,15],["Cystic Neoplasms",17,15],["Pancreatic Adenocarcinoma",33,15],["Osteoma of Whipple",10,15],["Adjuvant Therapy",4,15],["Pancreatic Trauma",4,15],["Pancreas – Bailey and Love 28th Edition Updates",12,15],["Pancreatic NET Part 1",20,130],["Pancreatic NET Part 2",30,130],["Pancreas and Biliary Tree Part 1",106,100],["Pancreas and Biliary Tree Part 2",55,100],["Acute Pancreatitis",79,37],["Chronic Pancreatitis Part 1",125,37],["Chronic Pancreatitis Part 2",51,37],["Carcinoma Pancreas",62,37],["Pancreatic Surgery Complications",104,37],["Pancreatic Surgery Complications Part 2",32,37],["Cystic Neoplasm Pancreas",61,37],["PNET",68,37],["Cystic Neoplasm Pancreas",46,14],["Acute Pancreatitis",0,43],["Chronic Pancreatitis / Cystic Neoplasm Pancreas",0,43],["Carcinoma Head of Pancreas / Pancreatic Surgery and Complications",0,43],["Pancreas Cancer",0,43],["Chronic Pancreatitis and Carcinoma Pancreas",38,14],["Pancreas And Biliary System",115,78],["Pancreas",60,98]],"b":[["Pancreas",83,115],["Pancreas – Adenocarcinoma",54,19],["Pancreas – Cystic Neoplasm",21,19]],"s":[["Chronic Pancreatitis",3,3,5],["Carcinoma of Pancreas Part 1",25,25,5],["Carcinoma of Pancreas Part 2",25,25,5],["Carcinoma Pancreas",7,6,5],["Cystic Neoplasm of Pancreas",14,11,5],["Exocrine Pancreas II",25,20,5],["Exocrine Pancreatic Cancer",22,18,5],["Pancreas",51,41,5],["Pancreas – 2",25,20,5],["Pancreas - II",15,12,5],["Pancreas Bailey Part 1",60,60,5],["Pancreas Bailey Part 2",49,50,5],["Pancreas Part 1",20,16,5],["Pancreas Part 2",20,16,5],["Pancreas Part 3",20,16,5],["Liver Pancreas / SI / Colorectal",34,27,113]]},{"l":[["HPB",71,123],["HPB",71,124],["HPB Surgery Part 1",75,20],["HPB Surgery Part 2",77,20],["Benign HPB Diseases",110,20],["HPB Surgery Part 3",65,20],["HPB Surgery Part 4",92,20],["Hepatobiliary",80,98]],"b":[["Pediatric GIT + HPB",130,62]],"s":[]},{"l":[["Spleen",136,131],["Spleen – Bailey and Love 28th Edition Updates",9,131]],"b":[["Spleen",17,11]],"s":[["Spleen – 1",40,32,46],["Spleen – 2",3,2,46],["Spleen – 3",40,40,46],["Spleen Bailey",81,81,46],["Spleen Part II",10,8,46],["Splenectomy Part 1",25,25,46],["Splenectomy Part 2",25,25,46]]},{"l":[["Morbid Obesity",13,160],["Morbid Obesity",0,43]],"b":[["Bariatric Surgery",47,11]],"s":[["Bariatric Surgery",10,8,161],["Morbid Obesity",7,7,162]]},{"l":[["NEET SS Recall 2024",85,118],["NEET SS Recall 2022",56,118],["NEET SS Recall 2025",67,118],["72 · Surgical Gastroenterology – April 2024",119,13],["Gastrointestinal Tract",100,100],["SGE Rapid Revision",78,78],["SGE Rapid Revision Part 2",68,78],["SGE High Yield Series Part 1",111,50],["SGE High Yield Series Part 2",53,50],["SGE High Yield Series Part 3",94,50],["SGE High Yield Series Part 4",66,50],["SGE High Yield Series Part 5",106,50],["SGE High Yield Series Part 6",106,50],["SGE High Yield Series MCQs Part 1 – MCQs Discussion 2025",0,166],["SGE High Yield Series MCQs Part 2 – MCQs Discussion 2025",13,50],["Miscellaneous",60,20],["SGE Recall Discussions",112,71],["SGE Recall Question – INI-SS Part 1",69,71],["SGE Recall Question – INI-SS Part 2",74,71],["INISS SGE Recall Part 1",13,71],["INISS SGE Recall Part 2",13,71],["INISS SGE Nov 2025 Recall",123,71]],"b":[["Surgical Gastroenterology",120,59]],"s":[["Gastro Summary",25,20,114]]},{"l":[["Breast Part 1",66,132],["Breast Part 2",47,132],["Anatomy and Physiology, Nipple Discharge",58,83],["Papilloma, Pre Malignant Lesions, Risk Factors & Ri…",54,83],["Imaging, BIRADS",61,83],["Breast Cancer Management",61,83],["Breast Cancer Treatment & Reconstruction",75,83],["Breast – Risk, Hereditary Cancer, Biopsy or FNAC…",69,84],["Breast – Anatomy, Physiology, LCIS, Nipple…",59,84],["Breast – Radiation PMRT – APBI, Hevman Therapy &…",19,84],["Breast – Targeted Therapy, PAGETs, Oncoplasty & Re…",45,84],["Breast – IN SITU DCIS & SLNB",55,84],["Approach to Breast Disorders, ANDI, Triple As…",29,28],["BIRADS",29,28],["Breast Cancer – Risk Factors, Prevention and E…",28,28],["Breast Disorders – Physiology, Benign Condi…",50,28],["Breast Lesions – Risk Stratification and Benign…",21,28],["Contemporary Multimodality Manageme…",61,28],["DCIS, IDC and Management Algorithm o…",27,28],["Special Topics & Evolving Concepts in Breast Canc…",47,28],["Sabiston 22nd Ed Updates – Breast",74,28],["Breast – Risk, Hereditary Cancer, Biopsy or FNAC…",69,85],["Breast – Anatomy, Physiology, LCIS, Nipple…",59,85],["Breast – Radiation PMRT – APBI, Hevman Therapy &…",19,85],["Breast – Targeted Therapy, PAGETs, Oncoplasty & Re…",45,85],["Breast – IN SITU DCIS & SLNB",55,85]],"b":[["Malignant",600,133],["Benign",216,133],["Aesthetics & Breast",64,61]],"s":[]},{"l":[["Anatomy, Physiology",27,8],["Thyroglobulin, Iodine Scan",22,8],["Evaluation",13,8],["Thyroiditis",7,8],["Grave's Disease",7,8],["Plummer's Disease, Surgery, AIT",10,8],["BETHESDA, RCP Staging, FNAC & Management",14,8],["TIRADS, USG High Risk Features",6,8],["Thyroid PTC, FTC",18,8],["Algorithm of DTC Management",22,8],["TT, Lobectomy, Neck Dissection, Genetics",19,8],["Adjuvant Therapy",5,8],["MTC",11,8],["Advance Carcinoma Management Anaplastic…",20,8],["Parathyroid Gland Part 1",56,86],["Parathyroid Gland Part 2",56,86],["Thyroid – Schwartz Updates Part 1",93,86],["Thyroid Investigations and Thyroiditis",47,38],["Diagnostic Systems and Malignancies of the Thyr…",51,38],["Malignant Thyroid Swelling",67,38],["Management of Thyroid Malignancies and their C…",58,38],["Neck Nodes in Thyroid Malignancy",42,38],["Goitre & Evaluation of Thyroid Nodules",39,38],["Thyrotoxicosis",32,38],["Sabiston 22nd Updates – Embryology, Anatomy an…",62,38],["Parathyroid Gland Part 1",56,67],["Parathyroid Gland Part 2",56,67],["Thyroid – Schwartz Updates Part 1",93,67],["Thyroid – Schwartz Updates Part 2",77,67]],"b":[["Malignant",294,134],["Benign",264,134],["Endocrine",100,97]],"s":[]},{"l":[["Parathyroid – Anatomy, Embryology & Histology",16,87],["Physiology of Parathyroid",12,87],["Hypercalcemia & Hyperparathyroidism",10,87],["Primary Hyperparathyroidism",40,87],["Secondary Hyperparathyroidism",8,87],["Parathyroid Embryology Physiology",18,29],["Parathyroid Localisation Surgery Recurrence",30,29],["Parathyroid PHPT Familial",17,29],["Anatomy & Physiology of Parathyroid",42,29],["Parathyroid Disorders and Investigations",61,29],["Parathyroid Hereditary Syndromes",45,29],["Hypercalcemia & Hyperparathyroidism",10,29],["Primary Hyperparathyroidism",40,29],["Secondary Hyperparathyroidism",8,29]],"b":[],"s":[]},{"l":[["Anatomy",18,30],["Embryology",12,30],["Physiology",24,30],["Adrenal Insufficiency",17,30],["Adrenal Incidentaloma, Adrenal Metastasis and A…",11,30],["Cushing's Syndrome",26,30],["Hyperaldosteronism",27,30],["Pheochromocytoma",26,30],["Adrenocortical Cancer",15,30],["Adrenal Gland",63,86],["Adrenal Gland Part 1",36,116],["Adrenal Gland Part 2",29,116],["Adrenal Gland Part 4",48,116],["Adrenal Gland",63,67]],"b":[],"s":[]},{"l":[["Multiple Endocrine Neoplasia Part 1",50,135],["Multiple Endocrine Neoplasia Part 2",19,135],["Gastrinoma",16,88],["Insulinoma",37,88],["Embryology & Classification",15,88],["Molecular Pathophysiology, Evaluati…",25,88],["Rare Pancreatic NET",18,88],["Neuroendocrine Pancreas",43,86],["MEN Syndrome",46,163],["Neuroendocrine Pancreas",43,67]],"b":[["Pancreatic Neuroendocrine Tumors",49,19]],"s":[]},{"l":[["Etiology, Epidemiology",11,89],["Staging & Evaluation",17,89],["Outline of STS Management",6,89],["LPS, LMS, GIST, AS, DFSP",29,89],["Advanced STS, Summary",3,89],["Introduction, Location, Staging, Investigations",28,101],["Benign Tumors",12,101],["Primary Bone Tumors",11,101],["Secondary Bone Tumors & Management",4,101],["Bone Tumors Part 1",26,102],["Bone Tumors Part 2",50,102],["Musculoskeletal",88,102],["Sabiston 22nd Ed Updates – Soft Tissue Sarcomas",53,102]],"b":[["Surgical Oncology + Soft Tissue Sarcoma",101,97]],"s":[]},{"l":[["Benign Lesions",34,103],["Premalignant – Melanoma Types",31,103],["Melanoma Management",31,103],["Non Melanoma Skin Cancer",25,103],["ILP & ILI in Melanoma",10,68],["Skin – Anatomy & Benign Disorders",40,68],["Melanoma",45,68],["Non Melanoma",24,68],["Sabiston 22nd Ed Updates – Melanoma",61,68],["Sabiston 22nd Ed Updates – Non Melanoma",26,68]],"b":[],"s":[]},{"l":[["Ear Disorders",32,1],["Nose, PNS",22,1],["Maxilla",7,1],["Larynx",28,1],["Tracheostomy, Pharynx",14,1],["N Staging",10,1],["Eyelid, Eyeball",16,1],["Salivary Glands",32,1],["Premalignant & TNM Staging",32,1],["Oral Surgery, Cavity",11,1],["General Principles, Lip, Maxilla, Floor of Mouth",27,1],["Head & Neck – Mandible Reconstruction, Flaps Re…",22,1],["Radiation in Head & Neck – SCC",11,1],["CUP, Neck Dissection",17,1],["Investigations & Neck Dissection",26,1],["Head & Neck – Parapharyngeal Mass, Bra…",11,1],["Head & Neck Part 1",30,90],["Head & Neck Part 2",25,90],["Head & Neck Part 3",34,90],["Head & Neck Part 4",18,90],["Head & Neck Part 5",53,90]],"b":[["Head & Neck",50,97],["Pediatric – Head and Neck + RESPI",13,62]],"s":[["Salivary Glands",24,19,164]]},{"l":[["NEET SS Recall 2024 Part 1",41,108],["NEET SS Recall 2024 Part 2",60,108],["NEET SS Recall 2023",107,108],["NEET SS Recall 2022",57,108],["67 · Surgical Oncology Part 1 – April 2024",75,13],["73 · Surgical Oncology Part 2 – April 2024",60,13],["Cancer Biology Part 1",78,94],["Cancer Biology Part 2",113,94],["General Oncology",38,94],["Low & High Grade Appendiceal Mucinous N…",35,94],["Peritoneal Surface Malignancy & HIPEC",54,94]],"b":[["Surgical Oncology",121,59]],"s":[]},{"l":[["Surgical Anatomy of Kidneys",29,39],["Surgical Anatomy of Ureters",18,39],["Embryology of Urinary Tract",11,39],["Congenital Anomalies of Kidneys and Ureters",74,39],["Infections of Urinary Tract",43,39],["Stone Diseases",56,39],["Renal Injuries",30,39],["Benign Tumors of Kidney",9,39],["Kidney Transplantation",52,33],["Urolithiasis",27,33],["Congenital Anomalies of Kidney and Ureter",37,21],["Embryology of Urinary Tracts",9,21],["Urolithiasis",57,21],["Renal Cell Carcinoma and Wilm's Tumor",23,21],["Upper Tract Urothelial Cancer",21,21],["Kidney and Ureter – Infections",21,21],["Surgical Anatomy of Kidneys and Ureters",36,21],["Congenital Anomalies of Kidneys and Ureters",74,21],["Renal Injuries",30,21],["Benign Tumors of Kidney",9,21],["Kidney Transplantation",52,34],["Urolithiasis",27,34]],"b":[["Kidney",73,40],["Ureter",14,40]],"s":[]},{"l":[["Anatomy",23,12],["Physiology of Bladder",3,12],["Innervation of Bladder",6,12],["Bladder Reflexes",11,12],["Urodynamics Overview",19,12],["Neurogenic Bladder",29,12],["Congenital Bladder Anomalies",30,12],["Chronic Inflammatory Conditions of Bladder",22,12],["Bladder Trauma",12,12],["Bladder Stones",9,12],["Schistosomiasis",14,12],["Urinary Diversions",11,12],["Urachal Anomalies",8,2],["Urinary Retention and Catheters",14,2],["Urinary Incontinence",28,2],["Nocturnal Eneuresis",9,2],["Anatomy",23,2],["Physiology of Bladder",3,2],["Innervation of Bladder",6,2],["Bladder Reflexes",11,2],["Urodynamics Overview",19,2],["Neurogenic Bladder",29,2],["Congenital Bladder Anomalies",30,2],["Chronic Inflammatory Conditions of Bladder",22,2],["Bladder Trauma",12,2],["Bladder Stones",9,2],["Schistosomiasis",14,2],["Urinary Diversions",11,2]],"b":[["Bladder",55,40]],"s":[]},{"l":[["Surgical Anatomy",17,104],["PSA",9,104],["Benign Prostatic Hyperplasia",45,104],["Prostate Calculi, Prostatitis",16,104],["Benign Prostatic Hyperplasia",26,33],["Prostate Calculi, Prostatitis",16,91],["Surgical Anatomy – Prostate",32,91],["PSA",11,91],["Benign Prostatic Hyperplasia",0,165],["Carcinoma Prostate",57,91],["Prostatitis",10,91],["Benign Prostatic Hyperplasia",26,34]],"b":[["Prostate",35,40]],"s":[]},{"l":[["Surgical Anatomy",7,105],["Congenital Anomalies",21,105],["Urethral Injuries",55,105],["Female Urethra, Urethritis, Periurethral Abcess, Geni…",35,105],["Anatomy",5,47],["Phimosis",9,47],["Frenulum Breve",1,47],["Paraphimosis",11,47],["Penile Injuries",4,47],["Peyronie's Disease",6,47],["Priapism",56,47],["Anatomy",26,48],["Undescended Testis",39,48],["Testicular Injuries",2,48],["Torsion Testis",21,48],["Varicocele",15,48],["Hydrocele",13,48],["Cysts In Epididymis",3,48],["Erectile Dysfunction",27,33],["Urethral Stricture",13,33],["Female Urethra, Urethritis, Periurethral Abcess, Geni…",35,49],["Surgical Anatomy of Urethra",6,49],["Congenital Anomalies",27,49],["Urethral Injuries",25,49],["Urethral Stricture",24,49],["Urethral Calculi",3,49],["Urethral Neoplasms",3,49],["Surgical Anatomy of Penis",10,22],["Physiology of Penile Erection",13,22],["Diseases of Foreskin",16,22],["Infections of Foreskin",1,22],["Penile Injuries",13,22],["Erectile Dysfunction",14,22],["Peyrone's Disease",13,22],["Priapism",37,22],["Fournier Gangrene",6,22],["Urethritis",13,22],["Surgical Anatomy and Embryology of Testis",35,23],["Undescended Testis",45,23],["Torsion Testis",24,23],["Varicocele",17,23],["Hydrocele",19,23],["Cysts associated with Epididymis",4,23],["Infections of Testis and Epididymis",22,23],["Testicular Tumors",41,23],["Testis – Fournier Gangrene",7,23],["Carcinoma Scrotum, Testicular Trauma",3,23],["Testicular Torsion",3,117],["Erectile Dysfunction",27,34],["Urethral Stricture",13,34]],"b":[["Testis",39,40],["Penis",33,40],["Urethra",21,40]],"s":[]},{"l":[["Stress Urinary Incontinence Part-1",49,92],["Stress Urinary Incontinence Part-2",54,92],["Urogynaecological Fistula",88,92],["Pelvic Organ Prolapse Part-1",23,92],["Pelvic Organ Prolapse Part-2",33,92],["Renal Tumours",31,69],["Bladder Tumours",35,69],["Prostate Cancer",34,69],["Penile Cancer",41,69],["Testicular Tumours",24,69],["Upper Tract Urothelial Tumours",53,69],["Stress Urinary Incontinence Part-1",49,93],["Stress Urinary Incontinence Part-2",54,93],["Urogynaecological Fistula",88,93],["Pelvic Organ Prolapse Part-1",23,93],["Pelvic Organ Prolapse Part-2",33,93],["Renal Tumours",31,70],["Bladder Tumours",35,70],["Prostate Cancer",34,70],["Penile Cancer",41,70],["Testicular Tumours",24,70],["Upper Tract Urothelial Tumours",53,70]],"b":[],"s":[]},{"l":[["NEET SS Recall 2024",17,106],["NEET SS Recall 2023",20,106],["NEET SS Recall 2022",46,106],["NEET SS Recall 2025",35,106],["69 · Urology – April 2024",109,13],["74 · INI SS Nov 2024 Urology",57,13],["Urinary Symptoms and Investigations Part 1",63,107],["Urinary Symptoms and Investigations Part 2",28,107],["Urinary Symptoms and Investigations Part 3",52,107],["Urinary Symptoms and Investigations Part 4",48,107]],"b":[["General Urology",92,40],["Urology",60,59]],"s":[]},{"l":[["Acute Limb Ischemia & Amputation",28,16],["Aortic Syndrome Including Aortic Aneurysm",57,16],["Arterial Disease & Evaluation",30,16],["Carotid Artery Disease",27,16],["Lower Limb Peripheral Arterial Disease",56,16],["Lymphatic Pathology",29,16],["Mesenteric Artery Disease",24,16],["Non-Atherosclerotic Vascular Disease",38,16],["Renal Artery Disease",21,16],["Varicose Veins",46,16],["Venous Thromboembolism",39,16],["NEET SS Recall 2024",48,119],["NEET SS Recall 2023",103,119],["NEET SS Recall 2022",24,119],["25 · Vascular Evaluation & Basics",24,9],["26 · Haemostasis & Thrombosis",32,9],["27 · Acute Limb Ischemia",32,9],["28 · Lower Limb PAOD",49,9],["29 · Aortic Aneurysm Dissection",48,9],["30 · Visceral and Peripheral Aneurysms",65,9],["31 · Carotid Artery Disease",19,9],["32 · Mesenteric Artery Disease",27,9],["33 · Chronic Venous Disease",32,9],["34 · Non-Atherosclerotic Vascular Disease",17,9],["35 · Venous Thromboembolism",44,9],["36 · Dialysis Access",32,9],["37 · Lymphatic Disease",30,9]],"b":[["Aortic Diseases",64,51],["Venous Disorders",64,51],["Peripheral Arterial Diseases",59,51],["Lymphatic Disorders",29,51],["Vascular Neurosurgery",52,76],["Head Neck, Vascular, Endocrine",33,111]],"s":[]},{"l":[["(lecture title not visible in capture)",35,167],["History of Cardiac Surgery",7,41],["Cardiopulmonary Bypass",25,41],["Coronary Artery Diseases",79,41],["Valvular Heart Diseases",78,41],["Congenital Cardiac Surgeries",83,41],["Thoracic Aorta",15,41],["Thoracic Surgery",92,41],["Miscellaneous",12,41],["Thoracic",34,136],["Cardiac",30,136],["NEET SS Recall 2025 Vascular Surgery",28,95],["NEET SS Recall 2024 Part 1",118,95],["NEET SS Recall 2024 Part 2",40,95],["NEET SS Recall 2023",35,95],["NEET SS Recall 2022",50,95],["68 · CVTS – April 2024",43,13],["12 · Thorax & Related Conditions Part 1",42,17],["13 · Thorax & Related Conditions Part 2",43,17],["14 · Thorax & Related Conditions Part 3",14,17],["15 · Adult Cardiac Surgery Part 1",0,137],["16 · Adult Cardiac Surgery Part 2",55,17],["17 · Adult Cardiac Surgery Part 3",42,17],["18 · Congenital Heart Disease Part 1",67,17],["19 · Congenital Heart Disease Part 2",0,137],["20 · Advances in Extra Corporeal Membrane O…",34,17],["21 · Heart, Lung, Heart and Lung Transplant",31,17],["22 · Percutaneous Heart Procedure",17,17],["23 · Pulmonary Embolism",27,17],["24 · Miscellaneous",20,17],["Thoracic",34,138],["Cardiac",30,138]],"b":[["Congenital Heart Diseases",24,51],["Coronary Artery Disease",58,51],["Thorax",99,51],["General Pediatrics + ECMO",27,62]],"s":[["Lung Cancer",10,8,168]]},{"l":[["General Concepts, ICP",45,31],["Vascular Surgery",52,31],["Neuro Oncology",63,31],["Hydrocephalus",20,31],["Pediatric Neurology",24,31],["Spine Surgery",19,31],["Functional Neurology",18,31],["CNS Infections",29,31],["MCQs Discussion",11,31],["Peripheral Nerve Injury",25,139],["Spine Trauma",68,139],["NEET SS Recall 2024",18,120],["NEET SS Recall 2023",113,120],["NEET SS Recall 2022",60,120],["70 · Neurosurgery – April 2024",25,13],["1 · Basic concepts – Neuroanatomy, Radiolog…",100,18],["2 · Head Injury",73,18],["3 · Spine Trauma",30,18],["4 · Cerebrovascular Injury and Pathologies",44,18],["5 · Brain and Spine Tumors",61,18],["6 · Spine Pathology",54,18],["7 · Peripheral Nerve Pathology",27,18],["8 · Peripheral Nerve Trauma",27,18],["9 · Functional Neurosurgery",33,18],["10 · Congenital and Developmental Anomalies",30,18],["11 · CNS Infections",24,18],["Peripheral Nerve Injury",25,140],["Spine Trauma",68,140]],"b":[["Neck And Spine",41,60],["Neurosurgery",120,59],["Spinal Cord",70,76],["Pediatric Neurosurgery, Infections, Hydrocephalus An…",53,76],["Neuroonco Surgery",50,76]],"s":[]},{"l":[["Wound Healing",19,32],["Skin and Subcutaneous Tissues",15,32],["Reconstructive Techniques",152,32],["Oral & Maxillofacial Surgery",45,32],["Head & Neck Reconstruction",30,32],["Hand Surgery Part 1",80,32],["Hand Surgery Part 2",47,32],["Pediatric Plastic Surgery",42,32],["Aesthetic Surgery",53,32],["NEET SS Recall 2024",35,109],["NEET SS Recall 2022",57,109],["Plastic Surgery 2023 Recall",27,109],["NEET SS Recall 2025",30,109],["66 · Plastic Surgery – April 2024",61,13],["38 · Aesthetic Surgery",31,42],["39 · Hand Surgery",103,42],["40 · Head, Trunk & Lower Limb Reconstruction",46,42],["41 · Lymphatic System",25,42],["42 · Oral Maxillofacial Surgery",17,42],["43 · Paediatric Plastic Surgery",18,42],["44 · Reconstructive Technique",53,42],["45 · Wound Healing",63,42]],"b":[["Plastic Surgery",120,59],["Hand Surgery and Upper Extremity",69,61],["Basics",70,61],["Lower Extremity and Trunk",101,61],["Transplant, Pediatric Surgery and Plastic Surgery",66,111]],"s":[]},{"l":[["Chest Wall Deformities",3,24],["General",25,24],["CTVS",33,24],["GIT – 1",118,24],["GIT – 2",9,24],["HPB",12,24],["Urology",43,24],["Trauma",10,24],["Fetal Surgery",9,24],["Oncology",50,24],["NEET SS Recall 2024",31,121],["NEET SS Recall 2023 Part 1",34,121],["NEET SS Recall 2023 Part 2",56,121],["71 · Pediatric Surgery – April 2024",28,13],["Fetal Surgery",17,75],["Foreign Body",4,75],["General Surgery",15,75],["Pediatric Oncology",36,169],["Pediatric Urology Part 1",3,117],["Pediatric Urology Part 2",45,117],["Pediatric Surgery",44,170]],"b":[["Pediatric & Congenital",70,61],["Pediatric Oncology",61,62],["Paediatric Miscellaneous (Gut + Chest Wall + Others)",14,62]],"s":[]},{"l":[["Immunology of Transplant Rejection and Immunosu…",53,52],["Organ Donation & Preservation, Kidney Tran…",67,52],["Surgical Complications, Outcomes of Renal Trans…",12,52],["Heart & Lung Transplantation",37,52],["Pancreas Transplant",66,52],["Intestinal Transplant",42,52],["Liver Transplant",95,52],["Immunology of Transplant Rejection and Immunosu…",53,53],["Organ Donation & Preservation, Kidney Tran…",67,53],["Surgical Complications, Outcomes of Renal Trans…",12,53],["Heart & Lung Transplantation",37,53],["Pancreas Transplant",66,53],["Intestinal Transplant",42,53],["Liver Transplant",95,53]],"b":[["General Transplant Principles",32,112],["Specific Organ Transplants",24,112]],"s":[]},{"l":[["Biostatistics",120,171]],"b":[["Biostatistics",100,172]],"s":[]},{"l":[["Metabolic Response to Injury",77,54],["Surgical Nutrition",54,54],["Wound Healing",54,54],["Metabolic Response to Injury",77,56],["Surgical Nutrition",54,56],["Wound Healing",54,56]],"b":[["Metabolic Response To Injury And Wound Healing",2475,58]],"s":[]}]};
var PATHS = ITEMS.p;
function topicItems(ti){ return ITEMS.t[ti] || {l:[],b:[],s:[]}; }
function pathOf(i){ return PATHS[i]||""; }

/* Penalty is a fraction of one correct answer, so the expected-value maths is
   identical whether NEET-SS is scored out of 600 or out of 150. */
var STYLES = {
  neet:{ key:"neet", label:"NEET-SS", q:150, mins:150, penalty:0.25, opts:4,
    sections:3, sectionQ:50, sectionMins:50, locked:true,
    note:"Three locked sections, 50 questions in 50 minutes each. No returning once a section closes." },
  ini:{ key:"ini", label:"INI-SS", q:80, mins:90, penalty:1/3, opts:4,
    sections:1, sectionQ:80, sectionMins:90, locked:false,
    note:"One 90-minute paper, 80 questions. Flag and return freely." }
};
function paceTarget(st){ return Math.round(st.mins*60/st.q); }

var DEFAULTS = {
  /* One day model. 9 h 15 m of study is the Normal day; Empathy is the same day
     cut to 7 h 15 m and is chosen, never triggered. The old floor/normal/high
     tiers are gone. There is no soft start: 19 September is the schedule start. */
  dailyHours: 9.25, playback: 1.5, anaPerQ: 1.3, pad: 1.0, bankPace: 1.2, lectureShare: 0.36,
  /* Where each repeat pass starts, as a fraction of a topic's slots. Swept
     against the day-load spread: the old 0.40/0.70 crammed both repeats into the
     back third, which starved the middle of every topic and left days at half
     load. 0.20/0.40 cut the spread from 121 to 42 minutes while still keeping
     each pass behind the one before it. */
  p2At: 0.20, p3At: 0.40,
  empathyHours: 7.25,
  gentleMode: true,   /* softer Coach tone by default; a one-tap toggle, not a permanent decision */
  /* Empathy is the default day, not the exception. For someone returning
     after a long gap, 7h15m is already a serious day, and a plan whose
     arithmetic assumes 9h15m every day from a standing start is a plan that
     breaks in week two. Switchable per-day and in Settings. */
  defaultLayer: "empathy",
  /* A deliberate ramp for the first week back: MCQs and their analysis only,
     at a length you can actually finish. Lectures are cut first by CUT_FIRST,
     so a 3-hour target naturally leaves questions plus review — which is the
     work that produces the accuracy data everything else adapts to. Set
     rampDays to 0 to start at full load. */
  rampDays: 7, rampHours: 3,
  /* During the diagnostic window the app stops showing long-range targets and
     drift, because there is no honest data to compute them from yet \u2014 the
     point of these first weeks is to find out what you actually remember, and
     a "40 days behind" banner on day 3 measures nothing real. */
  diagnosticDays: 14,
  startISO: "2026-09-19", hardStartISO: null, correctEvery: 14,
  exams: [ {style:"neet", iso:"2026-12-11"}, {style:"ini", iso:"2027-04-25"} ],
  passes: 3,
  restDow: 0, backupDow: -1, dayBuffer: 0, weekBackup: 360,
  /* Awake 07:00-23:00 leaves 8 h for sleep. Gym 1 h, family/other 1 h,
     entertainment 1 h 30 m and a 1 h lunch come out of that window before any
     study is placed, which is what makes them protected rather than aspirational. */
  /* 10:00 start, 02:00 finish, sleep 02:00-10:00 = 8 h exactly.
     9 h 15 m study + 1 h lunch + 1 h gym on five days/week + 1 h miscellaneous time + 1 h 30 m off
     + 17 breaks x 8 m = 15 h 56 m awake. Gym, family time and the hour off run
     back-to-back from 20:00 to 23:00 so no study time is stranded between them,
     and the day resumes at 23:00. There is no daily buffer: at these numbers the
     day has no spare minute to protect. */
  /* Awake 08:00, study from 09:00, asleep at midnight - eight hours exactly.
     Gym 18:30, the hour and a half off from 22:30, and family time is NOT a
     fixed block: 45 minutes held back from the day's capacity and taken between
     blocks whenever it suits. */
  /* wakeAt is not read by the layout engine (the day starts at dayStart),
     but it anchors two real invariants the test suite checks: an 8-hour
     sleep window against bedtime, and one hour between waking and
     starting. Deleting it as 'unused' would silently remove the only
     record of what the day model actually assumes. */
  wakeAt: 480,
  dayStart: 540, gym: 1110, gymLen: 60, gymDays:[1,2,3,4,5], misc:1290, miscLen:60,
  /* Family time removed entirely to close the 30-45 min shortfall against the
     requested 9h15m study target — the person's own instruction, given the
     arithmetic didn't close any other way without moving a fixed clock time. */
  dinner: 0, dinnerLen: 0, dinnerFloat: false,
  fun: 1350, funLen: 90, bedtime: 1440,
  taperNeet: 10, taperIni: 14, postExamOff: 2
};
var REPAIR_MIN_GAP = 2;   /* a floor against same-week recognition, not a universal rule */
var BREAK = 8, LUNCH = 60, DAY = 86400000;

var ERR_TYPES = [["gap","Never knew it"],["recall","Knew it, could not reach it"],
  ["confuse","Mixed it up with something"],["misread","Misread the question"]];
/* A correct answer needs a reason exactly as much as a wrong one does \u2014
   "confident" and "guessed" are both ways of getting there, and only one of
   them means the knowledge is real. Every attempt in the ledger carries one of
   these, whichever outcome it was. */
var RIGHT_TYPES = [["confident","Knew it confidently"],["eliminated","Eliminated the others"],
  ["partial","Partial recall"],["effort","Recalled with effort"],["guessed","Guessed correctly"]];
/* One remedy per reason, reused everywhere a reason is shown \u2014 Coach, topic
   analysis, Revise \u2014 so the same phrase always means the same fix rather than
   three slightly different rewordings of the same advice. */
var REMEDY = {
  gap:"First exposure, not repair \u2014 this needs to be learned fresh, not re-read.",
  recall:"The material is in there. Drill retrieval \u2014 blank-page recall, not more input.",
  confuse:"Build a discrimination pair: this against the thing it gets mixed with, one difference at a time.",
  misread:"A process fix, not a knowledge fix \u2014 read the last line of the stem twice before answering.",
  guessed:"Right for the wrong reason. Treat it like a miss for review purposes \u2014 the knowledge is not there yet.",
  eliminated:"Elimination worked. Worth confirming you know why the correct answer is correct, not only why the others are not.",
  partial:"Partial recall got you there. One more spaced review should convert this to confident recall.",
  effort:"Recalled with effort \u2014 normal at this stage of spacing. On track, not urgent.",
  confident:"Genuinely known. Nothing to do here beyond the scheduled repeat passes."
};
function pad2(n){ return String(n).length<2 ? "0"+n : String(n); }
function hhmm(m){ return pad2(Math.floor(m/60))+":"+pad2(Math.round(m)%60); }
function iso(d){ return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); }
function fromISO(s){ var p=String(s).split("-"); return new Date(+p[0],(+p[1]||1)-1,+p[2]||1); }
var DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function sortedExams(P){
  return (P.exams||[]).slice().filter(function(e){return e&&e.iso&&STYLES[e.style];})
    .sort(function(a,b){ return a.iso<b.iso?-1:1; });
}
/* Spacing anchors to the NEXT paper, never the far one. */
function nextExam(P,fromISOstr){
  var ex=sortedExams(P);
  for(var i=0;i<ex.length;i++) if(ex[i].iso>=fromISOstr) return ex[i];
  return ex.length?ex[ex.length-1]:null;
}
function daysBetween(a,b){ return Math.round((fromISO(b)-fromISO(a))/DAY); }
function pretty(s){ var d=fromISO(s); return DOW[d.getDay()]+" "+d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear(); }
function shortDate(s){ var d=fromISO(s); return d.getDate()+" "+MON[d.getMonth()]; }

/* ---- budget: the 1-hour daily buffer is carved out BEFORE the 60/40 split,
        so slippage never eats the analysis blocks ---- */
var RE_PACE = 0.8;   /* a question you have already seen goes faster the second time */
/* Minutes of actual work that fit between the start of the day and bedtime,
   once protected time, the meal break, inter-block breaks and the buffer are
   removed. This is the real ceiling; the hours setting is only an upper bound. */
function usableWork(P){
  var span=(P.bedtime||1439)-P.dayStart;
  var meal=P.dayStart<720?LUNCH:20;
  var gymAvg=(P.gym>P.dayStart?(P.gymLen||60)*((Array.isArray(P.gymDays)&&P.gymDays.length)?P.gymDays.length/7:1):0);
  var prot=gymAvg
          +((P.dinner>P.dayStart||P.dinnerFloat)?(P.dinnerLen||45):0)
          +(P.misc>P.dayStart?(P.miscLen||60):0)
          +(P.fun>P.dayStart?(P.funLen||60):0);
  /* Measured, not assumed. Long stretches are split at MAXBLOCK, so a real day
     comes out at about 18 blocks and 17 breaks, not 14 and 13. The old figure
     understated the day by half an hour, which is why the median day was
     finishing past the bedtime it was supposedly planned inside. */
  var breaks=17*BREAK;
  /* Fixed events create dead time: if the afternoon's work ends before the gym,
     those minutes are gone. A margin keeps the hard stop honest instead of
     planning to the theoretical maximum and overrunning every heavy day. */
  var envelope = span - prot - meal - (P.dayBuffer||0) - breaks;
  /* Desk time is what you asked for; the envelope is what the clock allows.
     Whichever is smaller wins, with a small margin for the dead time that
     fixed events create when a block finishes just before one. */
  /* No dead-time discount any more. It existed because a block that would not
     fit before gym was pushed whole past it; the layout now splits that block so
     the run-up is used, and family time is a floating allowance already charged
     above rather than a fixed gap to work around. What is left is the honest
     envelope, so if this comes out under the hours asked for, the hours asked
     for genuinely are not in the day. */
  return Math.max(30, Math.floor(Math.min(P.dailyHours*60, envelope)));
}
/* Repeat passes get faster and need less write-up: the questions are familiar
   and fewer of them are wrong the second and third time. */
var PASS_PACE = [1, 0.8, 0.7];
var PASS_ANA  = [1, 0.5, 0.34];
/* Extra per-topic speedup for pass-2/3 questions ONLY, on top of the flat
   PASS_PACE assumption above \u2014 never applied to pass 1, never changes a
   question count. Only ever a value strictly between 0 and 1 is honoured;
   anything else (missing, 1, >1, non-numeric) is a no-op, so an empty or
   absent masteryPace map behaves identically to before this existed. */
function masteryFactor(ti,P){
  var m=P&&P.masteryPace&&P.masteryPace[ti];
  return (typeof m==='number'&&isFinite(m)&&m>0&&m<1)?m:1;
}
function passFactors(n){
  var q=0, a=0, sp=0;
  for(var i=0;i<n;i++){ q+=PASS_PACE[Math.min(i,2)]; a+=PASS_ANA[Math.min(i,2)]; sp+=(i===0?1:(i===1?0.9:0.8)); }
  return { q:q, a:a, sp:sp };
}
/* Shared by budget() and the slot allocator so capacity planning and what is
   actually scheduled never disagree — a mismatch here would show as a plan
   that says it fits and then does not. */
function anaShare(P,ti){
  var m=(P.topicAcc||{})[ti];
  return (m!=null && m.n>=20) ? Math.max(0.25, Math.min(1, 1-m.acc)) : 0.85;
}
function budget(P, contentDays, slotCount){
  var dailyMin = Math.max(30, Math.min(
    Math.round(P.dailyHours*60) - (P.dayBuffer||0),
    usableWork(P)));
  var nP = Math.max(1, Math.min(3, P.passes||3));
  var F = passFactors(nP);
  var keptListed = CURRICULUM.reduce(function(a,t){ return a+t.lecmin; },0);
  var Lw = keptListed/P.playback*P.pad;
  /* Priced exactly as the allocator hands it out. Pass 1 walks the bank at
     bankPace and the speed quizzes at their own recorded minutes; passes 2 and 3
     re-walk BOTH pools at the repeat paces. The old formula charged speed
     minutes 2.7x while the allocator only ever scheduled them once, so every
     per-slot target was inflated by work that was never handed out \u2014 which is
     why days came out at two-thirds of the hours they were sized for. */
  var rep = 0; for(var pi=1; pi<nP; pi++) rep += PASS_PACE[Math.min(pi,2)];
  var Qw = CURRICULUM.reduce(function(a,t){
    return a + t.dtq*P.bankPace + t.spmin + (t.dtq+t.spq)*P.bankPace*rep; },0);
  var totalQ = CURRICULUM.reduce(function(a,t){return a+t.dtq+t.spq;},0);
  /* Analysis is a protected rate, not a residual — it is the mainstay. */
  var A = CURRICULUM.reduce(function(a,t){ return a+(t.dtq+t.spq)*(P.anaPerQ||1.2)*F.a*anaShare(P,t.i); },0), warn = null;
  var Tm = Lw+Qw+A, perQ = totalQ ? A/totalQ : 0;
  /* Repeat passes are already priced into Qw and A above, so no extra time is
     added here — reQ/re3Q only tell the slot allocator how many repeat
     questions to hand out and when. */
  var days = contentDays || Math.max(1, Math.ceil(Tm/dailyMin));
  var reFrac = 0, reQtotal = 0, reTime = 0, perRe = P.bankPace*PASS_PACE[1];
  var topics = CURRICULUM.map(function(t){
    var lecEff = t.lecmin/P.playback*P.pad;
    var o={}; for(var k in t) o[k]=t[k];
    o.keptLec = t.nlec; o.keptMin = t.lecmin; o.droppedLec = 0;
    o.lecEff=lecEff;
    /* Every question in three passes, no exceptions: the repeat pools are the
       bank AND the speed quizzes, not the bank alone. */
    o.reQ  = nP>=2 ? t.dtq+t.spq : 0;
    o.re3Q = nP>=3 ? t.dtq+t.spq : 0;
    o.work = lecEff + t.dtq*P.bankPace + t.spmin
           + (t.dtq+t.spq)*P.bankPace*rep + (t.dtq+t.spq)*(P.anaPerQ||1.2)*F.a*anaShare(P,t.i);
    return o;
  });
  /* Derive the total from what the topics actually got, so the headline figure
     can never disagree with the sum of its parts. */
  /* Counts only — their minutes are already inside Qw and A. */
  reQtotal = topics.reduce(function(a,t){ return a+t.reQ+t.re3Q; },0);
  var slots = slotCount || days*2;
  /* Slot counts follow work, with a floor of ONE. The old floor of two forced
     every small topic to split into two near-empty slots; with 39 topics that
     manufactured 56 slots of under 150 minutes, and a day built from two of them
     came out at four hours however cleverly the days were paired afterwards. */
  var raw = topics.map(function(t){ return Math.max(1, t.work/Tm*slots); });
  var base = raw.map(function(r){ return Math.max(1, Math.floor(r)); });
  var rem = slots - base.reduce(function(a,b){return a+b;},0);
  var order = raw.map(function(r,i){return i;}).sort(function(a,b){
    return (raw[b]-Math.floor(raw[b]))-(raw[a]-Math.floor(raw[a])); });
  var k=0;
  while(rem>0){ base[order[k%order.length]]++; rem--; k++; }
  while(rem<0){ var j=-1;
    for(var i=0;i<base.length;i++) if(base[i]>1 && (j<0||base[i]>base[j])) j=i;
    if(j<0) break; base[j]--; rem++; }
  topics.forEach(function(t,i){ t.slots=base[i]; });
  return { dailyMin:dailyMin, Lw:Lw, Qw:Qw, A:A, Tm:Tm, perQ:perQ, days:days,
           slots:slots, warn:warn, topics:topics, totalQ:totalQ,
           reFrac:reFrac, reQtotal:reQtotal, reTime:reTime, perRe:perRe,
           passes:nP, F:F, anaPerQ:(P.anaPerQ||1.2), keptListed:keptListed,
           allListed:CURRICULUM.reduce(function(a,t){return a+t.lecmin;},0),
           keptLec:CURRICULUM.reduce(function(a,t){return a+t.nlec;},0),
           capacity:days*dailyMin, shortfall:Tm-days*dailyMin };
}

/* A repeat pass has to START behind the one before it, not merely finish level
   with it. With the window fractions tuned down to 0.20/0.40, ceil() collapsed
   to slot 1 on any topic with five or fewer slots, so its "second pass" ran from
   the first day alongside the first \u2014 second-pass questions on chapters not yet
   seen once. The floors make the ordering structural rather than incidental. */
function passStart(n,P,which){
  if(which===2) return Math.min(Math.max(2,n-1), Math.max(2, Math.ceil(n*(P.p2At||0.40))));
  return Math.min(n, Math.max(passStart(n,P,2)+1, Math.ceil(n*(P.p3At||0.70))));
}

function sequence(B,P,nContent){
  /* Yield weighting follows whichever paper is next: general-surgery breadth
     leads before NEET-SS, GI depth leads after it. */
  var switchAt=nContent;
  var ex=sortedExams(P);
  if(ex.length>1){
    var total=Math.max(1,daysBetween(P.startISO, ex[ex.length-1].iso));
    switchAt=Math.round(nContent*(daysBetween(P.startISO, ex[0].iso)/total));
  }
  var left={}, done={};
  B.topics.forEach(function(t){ left[t.i]=t.slots; done[t.i]=0; });
  var out=[], last=null, guard=0;
  function anyLeft(){ return B.topics.filter(function(t){ return left[t.i]>0; }); }
  while(anyLeft().length && guard++ < 20000){
    var yKey = Math.floor(out.length/2) < switchAt ? "yNEET" : "yINI";
    var rem = anyLeft();
    /* Strict completion order: nothing from a later phase begins until every
       topic in the current phase is finished. */
    var ph = Math.min.apply(null, rem.map(function(t){ return t.phase; }));
    var inPhase = rem.filter(function(t){ return t.phase===ph; });
    /* Interleave across that phase's own topics: phase 1 is entirely one track,
       so separation has to be topic-level, not track-level. */
    var pool = inPhase.filter(function(t){ return t.i!==last; });
    if(!pool.length) pool = inPhase;
    pool.sort(function(a,b){
      return (left[b.i]/b.slots - left[a.i]/a.slots) || (b[yKey]-a[yKey]) || (left[b.i]-left[a.i]); });
    var t=pool[0]; left[t.i]--; done[t.i]++;
    out.push({ti:t.i, part:done[t.i], of:t.slots}); last=t.i;
  }
  /* accumulate then round, so a topic's slices always re-add to its true total */
  var acc={}, run={};
  function take(s,per,key,field){
    var id=s.ti; acc[id]=acc[id]||{}; run[id]=run[id]||{};
    acc[id][key]=(acc[id][key]||0)+per;
    var prev=run[id][key]||0, v=Math.round(acc[id][key])-prev;
    run[id][key]=Math.round(acc[id][key]); s[field]=v;
  }
  /* Walk each topic's real lecture list, bank chapters and speed quizzes in
     order, handing consecutive items to consecutive slots. A block then names
     exactly what to open rather than an anonymous question count. */
  var cursor={};
  /* The second pass walks the chapters on its own cursor so it trails the first
     pass rather than racing it. */
  var reCur={}, re3Cur={};
  function pullPass(cur,ti,budget){
    var it=topicItems(ti);
    var list=(it.b||[]).concat(it.s||[]);   /* bank first, then the speed quizzes */
    var st=cur[ti]=cur[ti]||{i:0,off:0};
    var taken=[], left=budget, guard=0;
    while(left>0 && st.i<list.length && guard++<400){
      var it=list[st.i], avail=it[1]-st.off;
      if(avail<=0){ st.i++; st.off=0; continue; }
      var use=Math.min(avail,left);
      taken.push({item:it,use:use,from:st.off,whole:(st.off===0&&use===it[1])});
      st.off+=use; left-=use;
      if(st.off>=it[1]){ st.i++; st.off=0; }
    }
    return taken;
  }
  function pullRe(ti,b){ return pullPass(reCur,ti,b); }
  function pullRe3(ti,b){ return pullPass(re3Cur,ti,b); }
  function pull(ti,key,budget,sizeFn,limit){
    var list=topicItems(ti)[key]||[];
    if(limit!=null) list=list.slice(0,limit);
    var c=cursor[ti]=cursor[ti]||{l:{i:0,off:0},b:{i:0,off:0},s:{i:0,off:0}};
    var st=c[key], taken=[], left=budget, guard=0;
    while(left>0 && st.i<list.length && guard++<500){
      var it=list[st.i], size=sizeFn(it), avail=size-st.off;
      if(avail<=0){ st.i++; st.off=0; continue; }
      var use=Math.min(avail,left);
      taken.push({ item:it, use:use, from:st.off, whole:(st.off===0 && use===size) });
      st.off+=use; left-=use;
      if(st.off>=size){ st.i++; st.off=0; }
    }
    return taken;
  }
  /* Pass-1 volume per slot is shaped so that TOTAL work per slot stays flat.
     Passes 2 and 3 are confined to the back of a topic (that is what makes them
     spaced), so their per-slot cost is far higher than pass 1's. Handing every
     slot an equal share of pass-1 questions therefore left the last third of
     every topic carrying roughly three times the work of the first third — and
     because phases run in strict order, those heavy tails all landed together.
     Pass 1 is instead front-loaded into whatever headroom each slot has left,
     which flattens the day and strictly increases pass 1's lead over pass 2. */
  var q1Plan={};
  B.topics.forEach(function(t){
    var n=t.slots, bp=P.bankPace, ap=(P.anaPerQ||1.2);
    var u1=bp*PASS_PACE[0]+ap*PASS_ANA[0];
    var u2=bp*PASS_PACE[1]+ap*PASS_ANA[1];
    var u3=bp*PASS_PACE[2]+ap*PASS_ANA[2];
    var p2From=passStart(n,P,2), p3From=passStart(n,P,3);
    var n2=Math.max(1,n-p2From+1), n3=Math.max(1,n-p3From+1);
    var sn = n>1 ? n-1 : 1;
    var flat = t.lecEff/n + (t.spmin + t.spq*ap*PASS_ANA[0])/sn;
    /* Fill each slot's headroom head-first rather than normalising a weight
       vector. Normalising was the bug behind four-hour opening days: when the
       headroom across all slots exceeded the questions available, every slot was
       scaled down together, so the early slots (which carry no second or third
       pass) came out half empty while the late ones still carried their full
       repeat load. Filling greedily puts pass 1 where the room actually is. */
    var T = t.work/n, cap=[], want=0;
    for(var k=1;k<=n;k++){
      var L23=(k>=p2From ? t.reQ*u2/n2 : 0) + (k>=p3From ? t.re3Q*u3/n3 : 0);
      var room=Math.max(0, T-flat-L23)/u1;
      cap.push(room); want+=room;
    }
    var give=[], left=t.dtq;
    if(want<=0){ for(var a=0;a<n;a++) give.push(t.dtq/n); }
    else if(want>=t.dtq){
      /* More room than questions: fill from the front and stop. */
      for(var b=0;b<n;b++){ var v=Math.min(cap[b],left); give.push(v); left-=v; }
      if(left>0.001) for(var c=0;c<n;c++) give[c]+=left/n;
    } else {
      /* Fewer slots' worth of room than questions: hand out the room, then
         spread the surplus evenly so nothing is lost. */
      var extra=(t.dtq-want)/n;
      for(var e=0;e<n;e++) give.push(cap[e]+extra);
    }
    q1Plan[t.i]=give;
  });
  out.forEach(function(s){
    var t=B.topics[s.ti], n=t.slots, q=t.dtq+t.spq;
    /* Interleaved, timed practice is withheld from a topic's first pass.
       Interleaving only starts paying off once basic mastery exists; before
       that it is just noise. Those questions move to passes 2..n instead. */
    var sn = n>1 ? n-1 : 1, first = (n>1 && s.part===1);
    s.first = (s.part===1);
    take(s,(q1Plan[s.ti]&&q1Plan[s.ti][s.part-1]!=null)?q1Plan[s.ti][s.part-1]:t.dtq/n,"dtq","nBank");
    take(s, first?0:t.spq/sn, "spq","nSpeed");
    take(s,t.lecEff/n,"lec","nLecMin");
    take(s, first?0:t.spmin/sn, "spmin","nSpeedMin");
    take(s,t.nlec/n,"nlec","nLec");
    /* Review time must track the questions actually attempted in THIS slot.
       Spreading it flat gave a first-pass slot review minutes for speed questions
       it had not yet seen — 77 minutes of review for 8 questions on day one. */
    s.nAna = 0;   /* filled below, once the slot's question counts are known */
    take(s,(t.keptMin||0)/n,"lecL","nLecListed");
    /* Repeat passes must TRAIL the first pass, not run alongside it. Pass 2 only
       begins once a topic is ~40% through its first pass, pass 3 at ~70%. Because
       each pass is then spread over fewer, later slots, its chapter cursor always
       lags the one ahead of it — which is what makes these spaced repetitions
       rather than the same chapter three times in a week. */
    var p2From = passStart(n,P,2), p3From = passStart(n,P,3);
    var n2 = Math.max(1, n-p2From+1), n3 = Math.max(1, n-p3From+1);
    take(s, (s.part>=p2From ? (t.reQ||0)/n2  : 0), "re",  "nRe");
    take(s, (s.part>=p3From ? (t.re3Q||0)/n3 : 0), "re3", "nRe3");
  });
  /* Second pass: hand out the actual items. Budgets are integers produced by the
     same cumulative rounding as everything else, so nothing is lost. A handful of
     lectures have no recorded duration; they count as 1 so they still get scheduled. */
  out.forEach(function(s){
    s.lecItems  = pull(s.ti,"l",s.nLecListed, function(it){ return Math.max(1,it[1]); }, B.topics[s.ti].keptLec);
    s.bankItems = pull(s.ti,"b",s.nBank,      function(it){ return it[1]; });
    s.reItems   = pullRe(s.ti, s.nRe||0);
    s.re3Items  = pullRe3(s.ti, s.nRe3||0);
    var ap = B.anaPerQ;
    /* Analysis was allocated proportionally to EVERY question — measured at
       546h of a 1,284h plan, 43% of the whole budget, most of it spent
       reviewing answers that were already correct. Analysis is now scaled by
       how much of a topic you actually get wrong.
       Where real accuracy exists it is used directly. Where it does not
       (every topic, on day one) the fallback is deliberately conservative:
       assume a low accuracy so the plan over-provisions rather than
       under-provisions, and tightens on its own as data arrives. A schedule
       that quietly under-books review time for someone returning after four
       years would be a far worse error than one that books too much. */
    var accMap = P.topicAcc || {};
    var known = accMap[s.ti];
    var wrongShare = (known!=null && known.n>=20)
      ? Math.max(0.25, Math.min(1, 1-known.acc))   /* never below 25%: correct answers still need some review */
      : 0.85;                                       /* no data yet — near the old behaviour */
    s.nAna = Math.round((
      (s.nBank + s.nSpeed) * ap * PASS_ANA[0] +
      (s.nRe   || 0)       * ap * PASS_ANA[1] +
      (s.nRe3  || 0)       * ap * PASS_ANA[2]) * wrongShare);
    s.spdItems  = pull(s.ti,"s",s.nSpeed,     function(it){ return it[1]; });
  });
  /* Sweep: a topic whose recorded lecture minutes are zero gets a zero budget,
     so its lectures would never be handed out at all. Anything still unconsumed
     goes onto that topic's last slot. */
  /* Cumulative rounding can leave a handful of repeat questions unhanded at the
     end of a topic. Three passes over every question is a hard rule, so the
     remainder is pushed onto the topic's last slot rather than quietly lost. */
  (function(){
    var seen={};
    out.forEach(function(s){
      seen[s.ti]=seen[s.ti]||{re:0,re3:0};
      seen[s.ti].re+=(s.nRe||0); seen[s.ti].re3+=(s.nRe3||0);
    });
    var last={};
    out.forEach(function(s){ last[s.ti]=s; });
    Object.keys(last).forEach(function(k){
      var ti=+k, t=B.topics[ti], s=last[ti];
      var wantRe=t.reQ||0, wantRe3=t.re3Q||0;
      var dRe=wantRe-seen[ti].re, dRe3=wantRe3-seen[ti].re3;
      if(dRe>0){ s.nRe=(s.nRe||0)+dRe; s.reItems=(s.reItems||[]).concat(pullRe(ti,dRe)); }
      if(dRe3>0){ s.nRe3=(s.nRe3||0)+dRe3; s.re3Items=(s.re3Items||[]).concat(pullRe3(ti,dRe3)); }
    });
  })();
  var lastSlot={};
  out.forEach(function(s){ lastSlot[s.ti]=s; });
  Object.keys(lastSlot).forEach(function(k){
    var ti=+k, s=lastSlot[ti];
    var list=(topicItems(ti).l||[]).slice(0, B.topics[ti].keptLec);
    var c=cursor[ti]&&cursor[ti].l ? cursor[ti].l : {i:0,off:0};
    for(var j=c.i;j<list.length;j++){
      s.lecItems.push({ item:list[j], use:Math.max(1,list[j][1]), from:0, whole:true });
    }
    if(cursor[ti]&&cursor[ti].l) cursor[ti].l.i=list.length;
  });
  return out;
}

/* "3 of 42 · Doc Tutorials > GIT > Stomach" — what to open, in app terms. */
function cleanPath(p){
  return String(p)
    .replace(/\s*[\u2013-]\s*\d+\s*[\u00b7·]/g," \u00b7")   /* strip "– 70 ·" counters */
    .replace(/\d+\s*\/\s*\d+\s*attempted/gi,"")
    .replace(/\b\d+\s*%\s*(complete|done)?/gi,"")
    .replace(/\s*[\u2013-]\s*/g," \u203a ")
    .replace(/\s*[\u00b7·]\s*/g," \u203a ")
    .replace(/\s*\u203a\s*(\u203a\s*)+/g," \u203a ")
    .replace(/\s*\u203a\s*$/,"")
    .replace(/\s{2,}/g," ").trim();
}
function itemLine(entry,kind){
  var it=entry.item, path=pathOf(it[kind==="s"?3:2]);
  var pretty=cleanPath(path);
  if(kind==="l"){
    var d=it[1]?it[1]+" min":"duration not recorded";
    return { name:it[0], where:pretty, qty:(entry.whole?d:entry.use+" of "+it[1]+" min") };
  }
  var tot=it[1];
  return { name:it[0], where:pretty,
    qty:(entry.whole? tot+" questions" : "questions "+(entry.from+1)+"\u2013"+(entry.from+entry.use)+" of "+tot) };
}
function slotWork(s,P){ return s.nBank*P.bankPace
  + (s.nRe||0)*P.bankPace*PASS_PACE[1]*masteryFactor(s.ti,P) + (s.nRe3||0)*P.bankPace*PASS_PACE[2]*masteryFactor(s.ti,P)
  + s.nAna + s.nLecMin + s.nSpeedMin; }

/* Calendar skeleton is built BEFORE slot allocation, so the syllabus is fitted
   to the days that actually exist rather than the other way round. */
function skeleton(P, neededContent){
  var ex=sortedExams(P);
  var win=ex.map(function(e){
    var t = e.style==="neet" ? P.taperNeet : P.taperIni;
    return { e:e, from:iso(new Date(fromISO(e.iso).getTime()-t*DAY)), to:e.iso };
  });
  var days=[], d=fromISO(P.startISO), guard=0, nContent=0, cSince=0;
  var lastExam=ex.length?fromISO(ex[ex.length-1].iso):fromISO(P.startISO);
  /* Run until the syllabus is used up, not until an arbitrary end date — and
     never stop before the last exam has been passed. */
  while((nContent<neededContent || d<=lastExam) && guard++<4000){
    var sd=iso(d), dow=d.getDay(), row;
    var onExam=ex.filter(function(e){return e.iso===sd;})[0];
    var inTaper=win.filter(function(w){return sd>=w.from && sd<w.to;})[0];
    var postOff=ex.filter(function(e){ return sd>e.iso && daysBetween(e.iso,sd)<=P.postExamOff; })[0];
    if(onExam) row={date:sd,rest:true,kind:"exam",exam:onExam};
    else if(inTaper) row={date:sd,rest:true,kind:"taper",exam:inTaper.e,toExam:daysBetween(sd,inTaper.e.iso)};
    else if(postOff) row={date:sd,rest:true,kind:"off",exam:postOff};
    else if(dow===P.backupDow) row={date:sd,rest:true,kind:"backup"};
    else if(dow===P.restDow) row={date:sd,rest:true,kind:"rest"};
    else if(cSince>=(P.correctEvery||14)){
      row={date:sd,rest:true,kind:"correct"}; cSince=0;
    }
    else {
      row={date:sd,rest:false,kind:"content",soft:false};
      nContent++; cSince++;
    }
    days.push(row);
    d=new Date(d.getTime()+DAY);
  }
  /* Taper remains retrieval-only; discontinued assessment modes are not scheduled. */
  days.forEach(function(c){
    if(c.kind!=="taper") return;
    c.sub = c.toExam<=3 ? "light" : "retrieval";
  });
  return days;
}

function repairPairs(cd,B){
  function tr(s){ return s.ti; }
  for(var i=0;i<cd.length;i++){
    var c=cd[i];
    if(c.slots.length<2 || tr(c.slots[0])!==tr(c.slots[1])) continue;
    for(var d=1; d<cd.length; d++){
      var cand=[i-d,i+d], hit=false;
      for(var z=0; z<2; z++){
        var j=cand[z]; if(j<0||j>=cd.length) continue;
        var o=cd[j]; if(o.slots.length<2) continue;
        if(tr(o.slots[0])===tr(o.slots[1])) continue;
        if(tr(c.slots[0])!==tr(o.slots[1]) && tr(o.slots[0])!==tr(c.slots[1])){
          var t=c.slots[1]; c.slots[1]=o.slots[1]; o.slots[1]=t; hit=true; break;
        }
      }
      if(hit) break;
    }
  }
}

function smooth(cd,P,B){
  /* Smooth toward the load the syllabus actually requires, not toward the hours
     setting. Where capacity exceeds need, aiming at the setting makes every day
     heavier than it has to be and leaves the surplus as ragged overruns. */
  var cap=P.dailyHours*60-(P.dayBuffer||0);
  var need=B.Tm/Math.max(1,cd.length);
  var tgt=Math.min(cap,need);
  function w(s){ return slotWork(s,P); }
  for(var pass=0; pass<24; pass++){
    var moved=0;
    for(var i=0;i<cd.length;i++){
      var c=cd[i]; if(c.slots.length<2) continue;
      for(var j=Math.max(0,i-25); j<Math.min(cd.length,i+26); j++){
        if(i===j) continue;
        var d=cd[j]; if(d.slots.length<2) continue;
        var a1=c.slots[0],a2=c.slots[1],b1=d.slots[0],b2=d.slots[1];
        /* Was a same-TRACK veto. Whole phases are a single track \u2014 all of GI is
           track A \u2014 so the veto rejected every candidate swap and smoothing did
           nothing at all across the GI phases, which is where the half-empty
           opening days came from. Separation has to be topic-level, exactly as
           sequence() already assumes. */
        if(a1.ti===b2.ti || b1.ti===a2.ti) continue;
        if(B.topics[a1.ti].phase!==B.topics[b2.ti].phase) continue;
        if(B.topics[b1.ti].phase!==B.topics[a2.ti].phase) continue;
        var cur=Math.abs(w(a1)+w(a2)-tgt)+Math.abs(w(b1)+w(b2)-tgt);
        var nw =Math.abs(w(a1)+w(b2)-tgt)+Math.abs(w(b1)+w(a2)-tgt);
        if(nw<cur-0.5){ c.slots=[a1,b2]; d.slots=[b1,a2]; moved++; break; }
      }
    }
    if(!moved) break;
  }
}

var MAXBLOCK = 75;   /* attention, not arithmetic: nothing runs unbroken past this */
var KL={bank:"Bank MCQs",analysis:"Review the misses",lecture:"Lectures",
  speed:"Speed set \u2014 timed",recall:"Blank-page recall",
  image:"Image identification",repass:"Second pass",repass3:"Third pass"};
function isImagePath(i){ return /Image Based/i.test(pathOf(i)); }
/* Pairwise swaps cannot fix a day that is simply too full — they only trade
   equals. This moves whole slots from the heaviest days to the lightest nearby
   ones until every day fits inside the envelope. */
function level(cd,P,B){
  var cap=usableWork(P);
  function w(c){ return c.slots.reduce(function(a,s){ return a+slotWork(s,P); },0); }
  function trOK(c,s){
    return c.slots.every(function(x){ return x.ti!==s.ti; })
        && c.slots.every(function(x){ return B.topics[x.ti].phase===B.topics[s.ti].phase; });
  }
  for(var pass=0; pass<120; pass++){
    var moved=false;
    var order=cd.map(function(c,i){return i;}).sort(function(a,b){ return w(cd[b])-w(cd[a]); });
    for(var oi=0; oi<order.length; oi++){
      var i=order[oi], c=cd[i];
      if(w(c)<=cap || c.slots.length<2) continue;
      var best=-1, bestW=Infinity, loose=-1, looseW=Infinity;
      for(var j=Math.max(0,i-25); j<Math.min(cd.length,i+26); j++){
        if(j===i) continue;
        var d=cd[j];
        if(d.slots.length>=3) continue;
        var cand=c.slots[c.slots.length-1];
        var samePhase=d.slots.every(function(x){ return B.topics[x.ti].phase===B.topics[cand.ti].phase; });
        if(!samePhase) continue;
        var after=w(d)+slotWork(cand,P);
        if(after>cap) continue;
        if(trOK(d,cand)){ if(after<bestW){ bestW=after; best=j; } }
        /* Last resort only: a day holding two parts of one topic is worse than
           an 8-hour day, but far better than a 10-hour one. Reached only when
           the tail of a phase leaves no other topic to pair with. */
        else if(after<looseW){ looseW=after; loose=j; }
      }
      if(best<0 && loose>=0) best=loose;
      if(best>=0){ cd[best].slots.push(c.slots.pop()); moved=true; }
    }
    if(!moved) break;
  }
}

/* level() only rescues days that are OVER capacity; it has nothing to say about
   days that are far under it. That asymmetry left a long tail of half-empty days
   \u2014 a quarter of the campaign sitting below 70% of the day while other days
   ran over. This pulls slots from the heaviest days onto the lightest until the
   spread stops improving, which is what makes an opening day look like a real
   day rather than a warm-up. */
function balance(cd,P,B){
  if(cd.length<3) return;
  function w(c){ return c.slots.reduce(function(a,s){ return a+slotWork(s,P); },0); }
  var target=cd.reduce(function(a,c){ return a+w(c); },0)/cd.length;
  var cap=usableWork(P);
  function dev(){ return cd.reduce(function(a,c){ return a+Math.abs(w(c)-target); },0); }
  function canTake(c,s){
    return c.slots.length<3
      && c.slots.every(function(x){ return x.ti!==s.ti; })
      && c.slots.every(function(x){ return B.topics[x.ti].phase===B.topics[s.ti].phase; });
  }
  for(var pass=0; pass<60; pass++){
    var moved=false;
    var idx=cd.map(function(c,i){ return i; }).sort(function(a,b){ return w(cd[b])-w(cd[a]); });
    for(var oi=0; oi<idx.length; oi++){
      var i=idx[oi], src=cd[i];
      if(src.slots.length<2 || w(src)<=target) continue;
      var s=src.slots[src.slots.length-1], sw=slotWork(s,P);
      if(w(src)-sw < target-sw*0.5) continue;      /* would only invert the problem */
      var best=-1, bestDev=Infinity;
      for(var j=Math.max(0,i-30); j<Math.min(cd.length,i+31); j++){
        if(j===i) continue;
        var dst=cd[j];
        if(!canTake(dst,s)) continue;
        var after=w(dst)+sw;
        if(after>cap) continue;
        var delta=(Math.abs(w(src)-sw-target)+Math.abs(after-target))
                 -(Math.abs(w(src)-target)+Math.abs(w(dst)-target));
        if(delta<bestDev){ bestDev=delta; best=j; }
      }
      if(best>=0 && bestDev<-1){ cd[best].slots.push(src.slots.pop()); moved=true; }
    }
    if(!moved) break;
  }
}

function dayBlocks(day,P,B){
  var out=[];
  function add(kind,label,mins,ti,note,detail){
    mins=Math.round(mins);
    if(mins<=0) return;
    /* Split long stretches into near-equal parts so a break always lands inside them. */
    var parts=Math.ceil(mins/MAXBLOCK), base=Math.floor(mins/parts), extra=mins-base*parts;
    for(var k=0;k<parts;k++){
      var m=base+(k<extra?1:0);
      out.push({kind:kind, label:label+(parts>1?" ("+(k+1)+"/"+parts+")":""), mins:m, ti:ti,
        head:(KL[kind]||label)+(parts>1?"  "+(k+1)+"/"+parts:""),
        topic: ti!=null ? CURRICULUM[ti].n : null, part:k, parts:parts,
        note:note, detail:(parts>1&&detail)?splitDetail(detail,parts,k):(parts>1?null:detail)});
    }
  }
  function splitDetail(detail,parts,k){
    var m=/^(\d+)\s+(.*)$/.exec(detail);
    if(!m) return detail;
    var tot=+m[1], base=Math.floor(tot/parts), extra=tot-base*parts;
    var v=base+(k<extra?1:0);
    return v+" "+m[2];
  }
  day.slots.forEach(function(s,ix){
    var t=B.topics[s.ti];
    /* Image-identification questions are a distinct exam skill — specimens,
       radiology, instruments — so they get their own block instead of hiding
       inside a general set. */
    var imgQ=0;
    (s.bankItems||[]).forEach(function(e){ if(isImagePath(e.item[2])) imgQ+=e.use; });
    var plainQ=Math.max(0, s.nBank-imgQ);
    if(imgQ>0)
      add("image","Image identification — "+t.n, imgQ*P.bankPace*1.1, s.ti,
        "Specimens, radiology, instruments. Name the finding before you read the options — that is how the paper asks it.",
        imgQ+" image questions");
    add("bank","Bank MCQs — "+t.n, plainQ*P.bankPace, s.ti,
      s.first
        ? "First pass on this topic, before the lecture. Guess anything you do not know — being wrong here is the point, provided you read the answer afterwards. Part 1 of "+s.of+"."
        : "DocTutorials bank, part "+s.part+" of "+s.of+". Commit to an answer before you read the options.",
      plainQ+" questions");
    if(s.nRe3>0)
      add("repass3","Third pass — "+t.n, s.nRe3*(P.bankPace*PASS_PACE[2]*masteryFactor(s.ti,P)), s.ti,
        "Third and final time through these chapters. By now you should be able to say why an option is wrong before reading the explanation — if you cannot, that chapter is not learnt.",
        s.nRe3+" questions");
    if(s.nRe>0)
      add("repass","Second pass — "+t.n, s.nRe*(P.bankPace*PASS_PACE[1]*masteryFactor(s.ti,P)), s.ti,
        "Chapters you have already worked once. Spaced re-attempts are what the spare capacity buys — and they beat finishing early.",
        s.nRe+" questions");
    add("analysis","Review the misses — "+t.n, s.nAna, s.ti,
      "Read every explanation, then say the concept ALOUD from memory with the screen covered \u2014 why the right answer wins, why yours fails. Explaining out loud beats re-reading. Tally each miss with one tap; write up only the ones you were CERTAIN about.",
      "tally each one");
    /* A handful of lectures have no duration in the source catalogue. Without this
       they would round to a zero-minute block and drop out of the plan entirely. */
    var lecN = Math.max(s.nLec, (s.lecItems?s.lecItems.length:0));
    if(lecN>0 && s.nLecMin===0){
      add("lecture","Lectures — "+t.n, 20, s.ti,
        "Duration was not recorded in the source catalogue — 20 min allowed. Adjust on the day.",
        lecN+" lecture"+(lecN===1?"":"s"));
    } else {
      add("lecture","Lectures — "+t.n, s.nLecMin, s.ti,
        Math.round(s.nLecMin*P.playback)+" min of listed video at "+P.playback+"\u00d7 playback.",
        s.nLec+" lecture"+(s.nLec===1?"":"s"));
    }
    if(s.nSpeed>0)
      add("speed","Speed set — "+t.n, Math.max(s.nSpeedMin, Math.round(s.nSpeed*0.91)), s.ti,
        "Exam pace, clock running. Score this one — timed accuracy is tracked separately from bank accuracy.",
        s.nSpeed+" questions");
    if(ix===0 && day.slots.length>1){
      /* A full lunch belongs to a morning start. From noon you have already
         eaten, so this becomes a short reset instead. */
      out.push({kind:"lunch", label:(P.dayStart<720?"Lunch":"Break"),
        mins:(P.dayStart<720?LUNCH:20), ti:null, note:null, detail:null});
    }
  });
  /* Interleave the topics rather than working one to exhaustion then the next.
     Measured before this change: a two-topic day ran every Stomach block, then
     every Esophagus block \u2014 blocked practice, which reliably feels more
     productive than it is. Telling look-alike conditions apart is precisely
     what this paper tests, and that discrimination is trained by alternating,
     not by massing.
     Order within a topic is preserved, and the analysis of a set is kept
     adjacent to the set it belongs to \u2014 interleaving the questions is the
     point; separating a set from its own review would only make the feedback
     worse. */
  if(P.interleave!==false) (function(){
    if(day.slots.length<2) return;
    var fixed=out.filter(function(b){ return b.ti==null; });
    var byTopic={}, order=[];
    out.forEach(function(b){
      if(b.ti==null) return;
      if(!byTopic[b.ti]){ byTopic[b.ti]=[]; order.push(b.ti); }
      byTopic[b.ti].push(b);
    });
    if(order.length<2) return;
    var units={};
    order.forEach(function(ti){
      var u=[], cur=null;
      byTopic[ti].forEach(function(b){
        if(b.kind==="analysis" && cur){ cur.push(b); return; }
        cur=[b]; u.push(cur);
      });
      units[ti]=u;
    });
    var mixed=[], idx={}, more=true;
    order.forEach(function(ti){ idx[ti]=0; });
    while(more){
      more=false;
      order.forEach(function(ti){
        if(idx[ti]<units[ti].length){
          mixed=mixed.concat(units[ti][idx[ti]]);
          idx[ti]++;
        }
        if(idx[ti]<units[ti].length) more=true;
      });
    }
    var mid=Math.floor(mixed.length/2);
    var rebuilt=mixed.slice(0,mid).concat(fixed, mixed.slice(mid));
    out.length=0;
    rebuilt.forEach(function(b){ out.push(b); });
  })();
  if(P.dayBuffer>0) out.push({kind:"buffer",label:"Daily buffer",mins:P.dayBuffer,ti:null,
    note:"Protected slack for slippage. Hit your targets and this hour is yours — do not fill it with more work.",
    detail:"stop early if unused"});
  /* Attach the named source items to each block, split across its parts so a
     block says exactly which lectures or chapters to open. */
  var pools={};
  /* Two slots of the same topic can share a day, so pools accumulate rather
     than overwrite — keying by topic alone silently dropped the first slot. */
  day.slots.forEach(function(sl){
    var bank=(sl.bankItems||[]);
    var p=pools[sl.ti]=pools[sl.ti]||{l:[],b:[],img:[],s:[],re:[],re3:[]};
    p.l  = p.l.concat((sl.lecItems||[]));
    p.b  = p.b.concat(bank.filter(function(e){ return !isImagePath(e.item[2]); }));
    p.img= p.img.concat(bank.filter(function(e){ return isImagePath(e.item[2]); }));
    p.s  = p.s.concat((sl.spdItems||[]));
    p.re = p.re.concat((sl.reItems||[]));
    p.re3= p.re3.concat((sl.re3Items||[]));
  });
  var KEYOF={lecture:"l",bank:"b",speed:"s",image:"b",repass:"re",repass3:"re3"};
  var groups={};
  out.forEach(function(b){
    var kk=KEYOF[b.kind];
    if(kk==null || b.ti==null) return;
    var g=b.ti+"|"+b.kind;
    groups[g]=groups[g]||[];
    groups[g].push(b);
  });
  Object.keys(groups).forEach(function(g){
    var arr=groups[g], ti=arr[0].ti;
    var kk = arr[0].kind==="image" ? "img" : KEYOF[arr[0].kind];
    var pool=(pools[ti]&&pools[ti][kk])||[];
    if(!pool.length) return;
    var total=pool.reduce(function(a,e){return a+e.use;},0);
    var mins=arr.reduce(function(a,b){return a+b.mins;},0)||1;
    var qi=0, qoff=0;
    arr.forEach(function(b,ix){
      var want = (ix===arr.length-1) ? Infinity : Math.round(total*b.mins/mins);
      var got=[], left=want, guard=0;
      while(left>0 && qi<pool.length && guard++<400){
        var e=pool[qi], avail=e.use-qoff;
        if(avail<=0){ qi++; qoff=0; continue; }
        var use=Math.min(avail,left);
        got.push({ item:e.item, use:use, from:e.from+qoff,
                   whole:(qoff===0 && use===e.use && e.whole) });
        qoff+=use; left-=use;
        if(qoff>=e.use){ qi++; qoff=0; }
      }
      b.items=got;
    });
  });
  /* Gym and dinner are real gaps in the timeline, not overlays. A block that
     would run into them is pushed past instead of silently colliding. */
  var fixed=[];
  if(P.gym>P.dayStart)    fixed.push({at:P.gym,    len:P.gymLen||60,    label:"Gym",
    note:"Fixed. Not a reward for finishing the day."});
  /* Floating family time is deliberately NOT pushed into `fixed`: pinning it to
     a clock time is exactly what makes it the first thing sacrificed when a day
     runs long. It is charged against capacity in usableWork and shown as an
     allowance, so the 45 minutes exist whether or not the day goes to plan. */
  if(P.dinner>P.dayStart && !P.dinnerFloat)
    fixed.push({at:P.dinner, len:P.dinnerLen||45, label:"Family dinner", note:"Fixed."});
  if(P.fun>P.dayStart)    fixed.push({at:P.fun, len:P.funLen||60, label:"Time off",
    note:"An hour that is yours. Protected exactly like gym and dinner \u2014 not the first thing to give up when you are behind."});
  fixed.sort(function(x,y){ return x.at-y.at; });
  /* Free recall goes last, right before sleep: what you retrieve last is what
     the night consolidates. */
  add("recall","Blank-page recall", 10, null,
    "Close everything. Write what you remember of today from memory, then check it. Then stop.", null);
  /* Labels are derived from the items actually attached, so a block can never
     claim more lectures than it hands you. */
  out.forEach(function(b){
    if(b.kind!=="lecture") return;
    /* A lecture whose duration is missing from the source catalogue gets a
       time budget of zero, so the allocator hands it no items even though the
       slot's lecture COUNT is non-zero. Without this the block kept a stale
       "1 lecture" label while naming none \u2014 a claim the block could not
       honour. It now says plainly that it cannot name one. */
    var n=b.items?b.items.length:0;
    b.detail = n ? (n+" lecture"+(n===1?"":"s")) : "pick up this topic\u2019s next unwatched lecture";
  });
  var rawItems=cloneItems(out);
  var laidOut=layoutDay(out,P,fixed);
  return { blocks:laidOut.blocks, endMin:laidOut.endMin, work:laidOut.work,
           workEnd:laidOut.workEnd, pastBed:laidOut.pastBed, rawItems:rawItems };
}

/* Deep-enough clone: a plain-field copy, taken BEFORE layout runs, so a block
   list can be re-cut and re-laid-out later (Empathy, arrears fold-back) without
   re-deriving lecture/bank item assignments from scratch. */
function cloneItems(arr){
  return arr.map(function(b){ var o={}; for(var k in b) o[k]=b[k]; return o; });
}

/* Places a list of items on the clock against the day's fixed events (gym,
   family-if-pinned, time off), splitting a block that would otherwise collide
   with one so the run-up before it is used rather than stranded. This is the
   ONLY place that decides where something sits in time; dayBlocks() calls it
   once to build the Normal day, and Empathy / arrears fold-back call it again
   with a different item list so gym and the evening off stay pinned to their
   clock times under every layer instead of drifting when content shrinks. */
function layoutDay(items,P,fixed){
  if(!fixed){
    fixed=[];
    if(P.gym>P.dayStart) fixed.push({at:P.gym, len:P.gymLen||60, label:"Gym",
      note:"Fixed. Not a reward for finishing the day."});
    if(P.dinner>P.dayStart && !P.dinnerFloat)
      fixed.push({at:P.dinner, len:P.dinnerLen||45, label:"Family dinner", note:"Fixed."});
    if(P.fun>P.dayStart) fixed.push({at:P.fun, len:P.funLen||60, label:"Time off",
      note:"An hour that is yours. Protected exactly like gym and the rest — not the first thing to give up when you are behind."});
    fixed.sort(function(x,y){ return x.at-y.at; });
  }
  /* A block that will not fit before the next fixed event used to be pushed
     whole past it, stranding the run-up. Gym at 18:30 after a block ending at
     17:42 left 48 dead minutes, and the same again before the evening off - well
     over an hour a day lost to placement alone. A block long enough to be worth
     splitting is now cut, the front half fills the run-up and the remainder
     continues after the event. MINFILL keeps this from producing slivers. */
  var MINFILL=20;
  var laid=[], tm=P.dayStart, work=0, workEnd=P.dayStart, fi=0;
  var queue=items.slice();
  for(var qi=0; qi<queue.length; qi++){
    var b=queue[qi];
    while(fi<fixed.length && tm+b.mins>fixed[fi].at && tm<=fixed[fi].at+fixed[fi].len){
      var g=fixed[fi], runUp=g.at-tm;
      if(runUp>=MINFILL && b.mins-runUp>=MINFILL &&
         b.kind!=="lunch" && b.kind!=="buffer" && b.kind!=="recall"){
        var head={}, tail={};
        for(var f in b){ head[f]=b[f]; tail[f]=b[f]; }
        head.mins=runUp; tail.mins=b.mins-runUp;
        head.label=b.label+" (a)"; tail.label=b.label+" (b)";
        /* Both pieces used to get the FULL original item list rather than a
           complementary share of it \u2014 a block split around a fixed event
           silently double-counted its questions. Nothing in the original
           build ever summed item counts per block to notice; the re-plan's
           own conservation check did, which is what caught it. */
        if(b.items && b.items.length){
          var parts=splitItems(b.items, head.mins, b.mins);
          head.items=parts[0]; tail.items=parts[1];
        }
        head.split=true; tail.split=true;
        queue.splice(qi,1,head,tail);
        b=head;
        break;                      /* head now fits the run-up; place it */
      }
      if(tm<g.at) tm=g.at;
      laid.push({kind:"protected",label:g.label,note:g.note,mins:g.len,ti:null,
        start:tm,endMin:tm+g.len,detail:null});
      tm+=g.len; fi++;
    }
    b.start=tm; tm+=b.mins; b.endMin=tm;
    if(b.kind!=="lunch"&&b.kind!=="buffer"){ work+=b.mins; workEnd=tm; }
    laid.push(b);
    /* No break immediately before a fixed event - the event IS the break, and
       inserting one pushed gym eight minutes past the time it is pinned to. */
    var nextIsFixed = fi<fixed.length && tm+BREAK>=fixed[fi].at-1;
    if(qi<queue.length-1 && b.kind!=="lunch" && !nextIsFixed) tm+=BREAK;
  }
  while(fi<fixed.length){
    var g2=fixed[fi];
    if(g2.at>=P.dayStart){
      var st2=Math.max(tm,g2.at);
      laid.push({kind:"protected",label:g2.label,note:g2.note,mins:g2.len,ti:null,
        start:st2,endMin:st2+g2.len,detail:null});
      tm=st2+g2.len;
    }
    fi++;
  }
  laid.forEach(function(b,i){ b.i=i; });
  return { blocks:laid, endMin:tm, work:work, workEnd:workEnd,
           pastBed: (P.bedtime && tm>P.bedtime) ? tm-P.bedtime : 0 };
}

/* Trims an item list down to `want` minutes of real work by cutting the
   cheapest-to-lose kinds first (lecture is passive; skipping it costs the
   least). What is protected is cut only as a last resort, and even then only
   down to a floor — an Empathy day that zeroes the miss-review block has
   stopped being a repair day. Used by both Empathy sizing and arrears
   fold-back so the two features cannot fight over the same minutes. */
/* A block's item list is a slice of a topic's question pool, sized to match the
   minutes it was given at build time. Cutting `.mins` without also cutting that
   slice leaves the block claiming its full original question count for a
   fraction of the time — an Empathy day that halves a block's minutes but
   keeps all its questions attached. */
function trimItems(items,frac){
  if(!items||!items.length||frac>=0.999) return items;
  var total=items.reduce(function(a,e){ return a+e.use; },0);
  var want=Math.max(0,Math.round(total*Math.max(0,frac)));
  var out=[], left=want;
  for(var i=0;i<items.length && left>0;i++){
    var e=items[i], use=Math.min(e.use,left);
    out.push({ item:e.item, use:use, from:e.from, whole:(use===e.use && e.whole) });
    left-=use;
  }
  return out;
}
/* Complementary split, not two independent cuts: head gets the first share of
   the item list, tail gets exactly what is left, so nothing is duplicated and
   nothing is dropped when a block is split around a fixed event. */
function splitItems(items,headMins,totalMins){
  if(!items||!items.length||totalMins<=0) return [items,items];
  var total=items.reduce(function(a,e){return a+e.use;},0);
  var headWant=Math.max(0,Math.round(total*headMins/totalMins));
  var head=[], tail=[], seen=0;
  for(var i=0;i<items.length;i++){
    var e=items[i];
    if(seen>=headWant){ tail.push(e); continue; }
    var room=headWant-seen;
    if(e.use<=room){ head.push(e); seen+=e.use; }
    else{
      head.push({ item:e.item, use:room, from:e.from, whole:(room===e.use && e.whole) });
      tail.push({ item:e.item, use:e.use-room, from:e.from, whole:false });
      seen+=room;
    }
  }
  return [head,tail];
}
function cutToTarget(items,want,cutFirst,protect){
  var real=function(b){ return ["lunch","buffer","protected"].indexOf(b.kind)<0; };
  var full=items.reduce(function(a,b){ return a+(real(b)?b.mins:0); },0);
  if(full<=want+1) return items;
  var remaining=full-want;
  function shrink(b,take){
    var old=b.mins;
    b.mins=Math.max(0,old-take);
    if(b.items) b.items=trimItems(b.items, old>0 ? b.mins/old : 0);
  }
  (cutFirst||[]).forEach(function(kind){
    items.forEach(function(b){
      if(remaining<=0||b.kind!==kind) return;
      var take=Math.min(b.mins,remaining);
      shrink(b,take); remaining-=take;
    });
  });
  if(remaining>0.5){
    var prot=items.filter(function(b){ return (protect||[]).indexOf(b.kind)>=0 && b.mins>0; });
    var totalP=prot.reduce(function(a,b){ return a+b.mins; },0);
    var floorFrac=0.5;                       /* never take more than half of protected time */
    var maxCut=totalP*(1-floorFrac);
    var take2=Math.min(maxCut,remaining);
    if(totalP>0) prot.forEach(function(b){ var frac=b.mins/totalP; shrink(b,take2*frac); });
    remaining-=take2;
  }
  return items.filter(function(b){ return b.mins>0.4 || !real(b); })
    .map(function(b){ b.mins=Math.round(b.mins); return b; });
}

function buildPlan(opts){
  var P={}; for(var k in DEFAULTS) P[k]=DEFAULTS[k];
  if(opts) for(var k2 in opts) if(opts[k2]!==undefined) P[k2]=opts[k2];
  /* Mastery-based pace, not mastery-based coverage. A topic with strong,
     retention-confirmed mastery can go FASTER through its already-scheduled
     pass-2/3 questions than the flat repeat-pace assumption below allows \u2014
     freeing daily minutes without ever touching how many questions are
     scheduled. Coverage (every question, three passes) is never negotiable;
     see conservation.test.js. This map is optional and empty by default, so
     every existing caller (including that test) is completely unaffected. */
  if(!P.masteryPace || typeof P.masteryPace!=='object') P.masteryPace={};
  P.exams=sortedExams(P);
  /* Size the syllabus first, then build exactly enough calendar to hold it.
     Soft-start days carry a single slot, so they count as half a day. */
  var probe=budget(P, null);
  /* Blocks are split at MAXBLOCK, rounded to whole minutes, and every day gains
     a fixed recall block, so the laid-out day comes to a few per cent more than
     the arithmetic total. Sizing the calendar off Tm alone therefore built a
     campaign three or four days short and pushed the surplus onto every day as
     an overrun. The margin is measured, not guessed. */
  var LAYOUT_MARGIN = 1.035;
  var needed=Math.max(1, Math.ceil(probe.Tm*LAYOUT_MARGIN/probe.dailyMin));
  var skel=skeleton(P, needed);
  var content=skel.filter(function(c){return !c.rest;});
  var effDays=content.reduce(function(a,c){ return a+(c.soft?0.5:1); },0);
  if(effDays<needed){
    skel=skeleton(P, needed+Math.ceil(needed-effDays));
    content=skel.filter(function(c){return !c.rest;});
  }
  /* Slots must equal what the days will actually consume: two per full day,
     one per soft-start day. Anything else silently drops content. */
  var slotCount=content.reduce(function(a,c){ return a+(c.soft?1:2); },0);
  var B=budget(P, content.length||1, slotCount);
  var SEQ=sequence(B,P,content.length||1);
  var si=0;
  content.forEach(function(c,i){
    var take=c.soft?1:2;
    c.n=i+1; c.slots=SEQ.slice(si,si+take); si+=take;
  });
  content=content.filter(function(c){ return c.slots && c.slots.length; });
  repairPairs(content,B); smooth(content,P,B); level(content,P,B); balance(content,P,B);
  /* Final hard pass: the balancing steps above move slots between days and can
     blur the phase boundaries. This restores strict completion order — every
     phase-1 topic finished before phase 2 opens — while leaving each day the
     same number of slots, so the load balancing survives. */
  (function enforcePhase(){
    var flat=[];
    content.forEach(function(c){ c.slots.forEach(function(sl){ flat.push(sl); }); });
    flat.sort(function(a,b){
      var pa=B.topics[a.ti].phase, pb=B.topics[b.ti].phase;
      if(pa!==pb) return pa-pb;
      return 0;                      /* stable: keeps within-phase interleaving */
    });
    var k=0;
    content.forEach(function(c){
      var n=c.slots.length, next=[];
      for(var i=0;i<n;i++) next.push(flat[k++]);
      c.slots=next;
    });
  })();
  /* The balancing steps move slots between days, which can land a topic's
     part 8 before its part 7. That would put third-pass questions on chapters
     the second pass has not reached — a spaced-repetition schedule running
     backwards. Payloads are re-seated so a topic's parts always run in date
     order, without changing how many slots any day carries. */
  (function enforcePassOrder(){
    var byTopic={};
    content.forEach(function(c){ c.slots.forEach(function(sl){
      (byTopic[sl.ti]=byTopic[sl.ti]||[]).push(sl); }); });
    Object.keys(byTopic).forEach(function(k){
      var refs=byTopic[k];
      var snap=refs.map(function(sl){ var o={}; for(var f in sl) o[f]=sl[f]; return o; });
      snap.sort(function(a,b){ return a.part-b.part; });
      refs.forEach(function(sl,i){
        for(var f in sl) delete sl[f];
        for(var g in snap[i]) sl[g]=snap[i][g];
      });
    });
  })();
  content.forEach(function(c){
    var r=dayBlocks(c,P,B);
    c.blocks=r.blocks; c.endMin=r.endMin; c.work=r.work; c.workEnd=r.workEnd; c.pastBed=r.pastBed||0;
    c.rawItems=r.rawItems; });
  var byDate={}; skel.forEach(function(c){ byDate[c.date]=c; });
  return { P:P, B:B, CAL:skel, content:content, byDate:byDate,
           finish: skel.length?skel[skel.length-1].date:P.startISO };
}

/* Does the whole syllabus actually fit before the paper? The scheduler builds
   as many days as the content needs, which means an over-committed plan quietly
   runs on past the exam instead of failing loudly. This measures the gap and
   prices each lever against it, in hours, so the choice is made on arithmetic
   rather than optimism. */
function feasibility(P){
  var ex=sortedExams(P); if(!ex.length) return null;
  var target=ex[ex.length-1];
  var probe=budget(P,null);
  var skel=skeleton(P, Math.max(1,Math.ceil(probe.Tm/probe.dailyMin)));
  var before=skel.filter(function(c){ return !c.rest && c.date<=target.iso; });
  var effDays=before.reduce(function(a,c){ return a+(c.soft?0.5:1); },0);
  var capMin=effDays*probe.dailyMin, deficit=probe.Tm-capMin;
  var levers=[];
  if(deficit>0){
    var two=budget(merge2(P,{passes:2}),null).Tm;
    /* Three passes over every question is a hard rule, so this is listed for
       arithmetic only \u2014 it is what the gap costs, not a permitted way out. */
    levers.push({ key:"passes", label:"Two passes instead of three \u2014 rules it out",
      saves:Math.round((probe.Tm-two)/60), fits:(two<=capMin),
      note:"Shown so the size of the gap is visible in familiar units. Three passes over every question is a hard rule in this plan; do not take this one." });
    var extra=Math.round(effDays/6);   /* one recovered day per week */
    levers.push({ key:"rest", label:"Study the rest day too",
      saves:Math.round(extra*probe.dailyMin/60), fits:(capMin+extra*probe.dailyMin>=probe.Tm),
      note:"Recovers about "+extra+" days. Cheapest on paper and the first thing to break in practice." });
    /* The hours setting is not a free dial: usableWork caps it at what the clock
       between waking and bedtime actually allows once protected time, the meal
       and inter-block breaks are removed. Raising the setting above that ceiling
       changes nothing, so the lever has to be priced against the ceiling. */
    var needH=probe.Tm/effDays/60, ceilH=usableWork(P)/60;
    var reach=needH<=ceilH+0.01;
    levers.push({ key:"hours", label:"Longer day: "+(Math.ceil(needH*4)/4).toFixed(2)+" h of work",
      saves:Math.round(deficit/60), fits:reach,
      note: reach
        ? "Up from "+(probe.dailyMin/60).toFixed(2)+" h, and the clock allows it."
        : "The clock only allows "+ceilH.toFixed(2)+" h between "+hhmm(P.dayStart)+" and "+hhmm(P.bedtime||1380)+
          " once gym, dinner, the hour off, the meal and breaks come out. Raising the hours setting above that changes nothing on its own \u2014 bedtime or protected time has to move first." });
    var combo=(probe.Tm-two)+extra*probe.dailyMin;
    if(combo>=deficit && !levers[0].fits)
      levers.push({ key:"combo", label:"Two passes AND the rest day",
        saves:Math.round(combo/60), fits:true,
        note:"The only combination that closes the gap without touching the day itself." });
  }
  return { exam:target, style:STYLES[target.style], daysBefore:before.length, effDays:effDays,
           capH:Math.round(capMin/60), needH:Math.round(probe.Tm/60),
           deficitH:Math.round(deficit/60), fits:(deficit<=0),
           dailyH:probe.dailyMin/60, levers:levers };
}
function merge2(a,b){ var o={}; for(var k in a) o[k]=a[k]; for(var j in b) o[j]=b[j]; return o; }

function specialDay(c,P){
  c = (typeof c==="string") ? {kind:c} : (c||{});
  var st = c.exam ? STYLES[c.exam.style] : STYLES.ini;
  var L=[];
  if(c.kind==="exam") L=[["check","Exam day \u2014 "+st.label,0,"Go and get it.",null]];
  else if(c.kind==="off") L=[
    ["check","Day off after the paper",0,
     "Deliberate, not lost. Nothing consolidates on an exhausted brain, and the next block of work starts in two days.",null],
    ["check","Do not pick the paper apart",0,
     "You cannot change it, and rehearsing it now only damages what comes next.",null]];
  else if(c.kind==="taper" && c.sub==="retrieval") L=[
    ["recall","Blank-page recall, high-yield topics",45,
     "From memory first, then verify. The topics the app flags red, not the ones that feel comfortable.",null],
    ["bank","Repair sets \u2014 weak topics only",120,
     "No new material. Previously incorrect questions on whatever is due.","~100 questions"],
    ["analysis","Tally whatever went wrong",45,"Short entries now. The retrieval is the point.",null],
    ["check","Protect sleep",0,
     "Consolidation happens overnight. An hour of sleep traded for revision is a net loss this close in.",null]];
  else if(c.kind==="taper" && c.sub==="light") L=[
    ["check","Light retrieval, high-yield only",60,
     "Your own tallies and diary, not a textbook. Nothing new goes in now.",null],
    ["check","Rehearse the attempt rule",10,
     st.penalty>0.3
       ? "INI-SS: a blind guess is exactly break-even, so a blank costs nothing. Eliminate even one option and attempting is worth it."
       : "NEET-SS: even a blind guess has positive expected value, and sections lock behind you. Leave nothing blank.",null],
    ["check","Logistics",15,"Hall, documents, travel, what time you leave.",null],
    ["check","Normal bedtime",0,"This is the part that still changes your score.",null]];
  else if(c.kind==="correct") L=[
    ["check","Course correction \u2014 the numbers first",25,
     "Open Progress. Read four things: readiness band, calibration, pace against the exam target, and which topics are still red. Do not adjust anything until you have looked.",null],
    ["check","Are you ahead or behind, in days?",15,
     "Compare the day number you are on with the date. Behind is information, not failure \u2014 the fix is to cut scope on the next lighter day, never to lengthen a day.",null],
    ["check","One change only",15,
     "Pick the single biggest lever: playback speed, an exam date, or the day\u2019s start. Changing several at once means you will not know which one worked.",null],
    ["check","Check the confident-wrong rate",15,
     "If certain-and-wrong is above one in six, the problem is calibration, not coverage \u2014 slow down and read stems more carefully before you add hours.",null],
    ["check","Repair sets and diary export",20,
     "Clear whatever is due, then copy the diary out.",null]];
  else if(c.kind==="backup") L=[
    ["check","Catch up whatever slipped",P.weekBackup,
     "Repair sets first, then banks, then lectures \u2014 that is the order of what costs marks. On track? Take the day: this is slack, not a bonus study day.",null],
    ["check","Run the repair sets",0,"Whatever the app says is about to fade.",null],
    ["check","Export the diary",0,"Ten seconds. It cannot be rebuilt.",null]];
  else L=[
    ["check","Run the repair sets",120,"Previously-incorrect questions on whichever topics are due.",null],
    ["check","Re-read this week's confident errors",45,
     "A miss type repeating across different topics is one problem, not several.",null],
    ["check","Two-minute pre-mortem",10,"What is likely to derail the coming week? Move a heavy day now.",null],
    ["check","Export the diary",10,"You are already here.",null]];
  var out=[], tm=P.dayStart, work=0, workEnd=P.dayStart;
  /* Protected life blocks are explicit inputs to layout. Gym is a five-day weekly
     goal by default; Miscellaneous Time is a separate one-hour daily block.
     Neither is consumed by adaptive study replanning. */
  var fixed=[];
  /* BUG (7.3.0): this read `day.date`, a variable that does not exist in this
     function — the parameter is `c`. Any call reaching this line threw
     ReferenceError, which took out ICS calendar export entirely. It survived
     because the UI only calls specialDay for rest/backup/exam days, and the
     export path is the one place that walks every special day at once.
     `c.date` is absent when a caller passes only a kind string, so the
     weekday-dependent gym rule falls back to "scheduled" rather than throwing. */
  var dow = c.date ? fromISO(c.date).getDay() : null;
  if(P.gym>P.dayStart && (dow===null||!Array.isArray(P.gymDays)||P.gymDays.indexOf(dow)>=0)) fixed.push({at:P.gym,len:P.gymLen||60,label:"Gym",note:"Protected weekly goal. Not study time."});
  if(P.misc>P.dayStart) fixed.push({at:P.misc,len:P.miscLen||60,label:"Miscellaneous Time",note:"Protected personal time. Not study time."});
  if(P.dinner>P.dayStart && !P.dinnerFloat) fixed.push({at:P.dinner,len:P.dinnerLen||45,label:"Family dinner",note:"Protected."});
  if(P.fun>P.dayStart) fixed.push({at:P.fun,len:P.funLen||60,label:"Time off",note:"Protected recovery time."});
  fixed.sort(function(a,b){return a.at-b.at;});
  L.forEach(function(x,i){
    var b={i:i,kind:x[0],label:x[1],mins:x[2],ti:null,note:x[3],detail:x[4],start:tm,endMin:tm+x[2]};
    tm+=x[2]; if(x[2]>0){ work+=x[2]; workEnd=tm; tm+=BREAK; }
    out.push(b);
  });
  return { blocks:out, endMin:tm, work:work, workEnd:workEnd, style:st };
}

/* =====================================================================
   EXAM STRATEGY — attempt-or-skip, from your own calibration data
   ===================================================================== */
function evOfAttempt(p,style){ return p - (1-p)*style.penalty; }
function blindEV(style){ return evOfAttempt(1/style.opts, style); }
function breakEven(style){ return style.penalty/(1+style.penalty); }
function attemptRule(calib,style){
  var out=[3,2,1].map(function(c){
    var set=(calib||[]).filter(function(x){return x.c===c;});
    var p=set.length ? set.filter(function(x){return x.ok;}).length/set.length : null;
    var ev=p===null?null:evOfAttempt(p,style);
    return { conf:c, n:set.length, p:p, ev:ev,
      verdict: ev===null?"no data": ev>0.03?"attempt": ev<-0.03?"skip":"line ball" };
  });
  return { levels:out, blind:blindEV(style), breakEven:breakEven(style), style:style };
}

/* Expected marks recoverable per topic — where the next hour pays most.
   Share of the paper is estimated from bank volume weighted by yield, not an
   official blueprint. */
function topicShare(t,yKey,poolQ){ return (t.dtq+t.spq)/poolQ*(0.6+0.4*t[yKey]); }
function marginalGain(scores,style,phase){
  var poolQ=CURRICULUM.reduce(function(a,t){return a+t.dtq+t.spq;},0);
  var yKey= phase==="neet" ? "yNEET" : "yINI";
  return CURRICULUM.map(function(t){
    var sc=(scores||{})[t.i]||{ba:0,bc:0,sa:0,sc:0};
    var att=sc.ba+sc.sa, acc= att>=10 ? (sc.bc+sc.sc)/att : null;
    var expected=topicShare(t,yKey,poolQ)*style.q;
    var gap= acc===null ? 0.35 : Math.max(0,1-acc);
    return { t:t, acc:acc, attempted:att, expected:expected, y:t[yKey],
      gain:expected*gap*(1+style.penalty) };
  }).sort(function(a,b){ return b.gain-a.gain; });
}

/* Projected score with an honest band. Untested topics are assumed a little
   below your tested average, since you generally practise what you were
   already working on. */
function readiness(scores,style,phase){
  var poolQ=CURRICULUM.reduce(function(a,t){return a+t.dtq+t.spq;},0);
  var yKey= phase==="neet" ? "yNEET" : "yINI";
  var num=0,den=0,cov=0,totW=0;
  CURRICULUM.forEach(function(t){
    var w=topicShare(t,yKey,poolQ); totW+=w;
    var sc=(scores||{})[t.i]||{ba:0,bc:0,sa:0,sc:0}, att=sc.ba+sc.sa;
    if(att>=10){ num+=w*(sc.bc+sc.sc)/att; den+=w; cov+=w; }
  });
  if(den<=0) return null;
  var acc=num/den, coverage=cov/totW;
  var proj=acc*coverage+acc*0.85*(1-coverage);
  var band=0.06+0.14*(1-coverage);
  return { acc:acc, coverage:coverage, mid:proj, mockAcc:null, mocks:0,
    lo:Math.max(0,proj-band), hi:Math.min(1,proj+band), qualify:0.5, style:style };
}

/* =====================================================================
   REPAIR SETS — topic-level spacing over the questions you already got
   wrong. The app schedules; DocTutorials holds the items.
   ===================================================================== */
/* Adaptive: intervals contract after weak accuracy and expand after strong,
   rather than every topic waiting a fixed week. A 90%-accurate topic waits
   weeks; a 45% topic comes back in days. */
function topicInterval(acc,reps,capDays){
  var a=Math.max(0,Math.min(1,acc));
  /* Smooth and strictly increasing in accuracy — a piecewise version had a
     discontinuity at 50% that sent a 50%-accurate topic away for longer than a
     49% one. Weak topics come back in days, strong ones in weeks. */
  var base = REPAIR_MIN_GAP + 48*a*a;
  var iv = base*Math.pow(1.6, Math.max(0,reps));   /* expand on each success */
  iv=Math.max(REPAIR_MIN_GAP,iv);
  if(capDays!=null&&capDays>0) iv=Math.min(iv,Math.max(REPAIR_MIN_GAP,capDays*0.18));
  return Math.round(iv);
}
function repairSets(scores,repairs,now,capDays,limit){
  var out=[];
  CURRICULUM.forEach(function(t){
    var sc=(scores||{})[t.i]; if(!sc) return;
    var att=sc.ba+sc.sa; if(att<10) return;
    var acc=(sc.bc+sc.sc)/att;
    var wrong=Math.max(0,(sc.ba-sc.bc)+(sc.sa-sc.sc));
    if(wrong<5) return;
    var r=(repairs||{})[t.i]||{last:0,reps:0};
    var iv=topicInterval(acc,r.reps,capDays);
    var dueAt=r.last?r.last+iv*DAY:now;
    var overdue=(now-dueAt)/DAY;
    if(overdue<0) return;
    out.push({ ti:t.i, t:t, acc:acc, wrong:wrong, reps:r.reps, interval:iv, overdue:overdue,
      sinceDays: r.last?Math.round((now-r.last)/DAY):null,
      take: Math.max(10, Math.min(40, Math.round(wrong*0.5))) });
  });
  out.sort(function(a,b){ return (b.overdue+(1-b.acc)*10)-(a.overdue+(1-a.acc)*10); });
  var by={A:[],B:[],C:[],D:[]};
  out.forEach(function(x){ by[x.t.tr].push(x); });
  var mixed=[], last=null, guard=0;
  while(mixed.length<Math.min(out.length,limit||4) && guard++<200){
    var ks=Object.keys(by).filter(function(k){return by[k].length&&k!==last;})
      .sort(function(a,b){ return by[b].length-by[a].length; });
    var p=ks[0]||Object.keys(by).filter(function(k){return by[k].length;})[0];
    if(!p) break;
    mixed.push(by[p].shift()); last=p;
  }
  return { sets:mixed, total:out.length };
}

/* Confusable pairs, from your own "mixed it up" tallies. Two topics in the
   same track that you keep confusing need one mixed set, not two separate ones. */
function confusionPairs(tallies){
  var list=Object.keys(tallies||{}).map(function(k){
    return { ti:+k, n:(tallies[k]||{}).confuse||0, t:CURRICULUM[+k] };
  }).filter(function(x){ return x.t && x.n>=3; }).sort(function(a,b){ return b.n-a.n; });
  var pairs=[], used={};
  for(var i=0;i<list.length&&pairs.length<3;i++){
    if(used[list[i].ti]) continue;
    for(var j=i+1;j<list.length;j++){
      if(used[list[j].ti]) continue;
      if(list[i].t.phase===list[j].t.phase){
        pairs.push([list[i],list[j]]); used[list[i].ti]=1; used[list[j].ti]=1; break;
      }
    }
  }
  return pairs;
}

/* Floor day — always available, never penalised, never doubled afterwards. */
function floorDay(P){
  var q=P.floorQ||40;
  var attempt=Math.round(q*P.bankPace);
  var review =Math.round(q*(P.anaPerQ||1.2));
  var blocks=[
    {i:0,kind:"bank",label:"Bank MCQs \u2014 anything due",mins:attempt,ti:null,
     note:q+" questions. Pick the topic you were last wrong about. That is the whole ask today.",
     detail:q+" questions"},
    {i:1,kind:"analysis",label:"Read every explanation",mins:review,ti:null,
     note:"Tally each miss. Nothing written up unless you were certain and wrong.",
     detail:"tally each one"}];
  var tm=P.dayStart, work=0;
  blocks.forEach(function(b,i){ b.start=tm; tm+=b.mins; b.endMin=tm; work+=b.mins;
    if(i<blocks.length-1) tm+=BREAK; });
  return { blocks:blocks, endMin:tm, work:work, workEnd:tm };
}

/* ---- review engine: simplified FSRS, validated against a synthetic
        learner simulator (8 archetypes, 150 days) and frozen ---- */
function newMiss(f){
  var now=Date.now();
  return { id:Math.random().toString(36).slice(2,10), t:now, topicId:f.topicId,
    stem:f.stem, right:f.right, why:f.why, errType:f.errType, conf:f.conf,
    /* chose: the option you actually picked. Which wrong option attracted you is
       the diagnostic \u2014 a distractor you keep choosing is a specific confusion,
       not general weakness. path: where the question lives in the source app, so
       you can reopen it rather than search for it. mcqKey: the same identity
       used in the per-question ledger, so Revise can show this question's full
       pass history and a review here writes back into that same record instead
       of living as a disconnected duplicate. */
    chose:f.chose||"", path:f.path||"", mcqKey:f.mcqKey||null,
    S:f.conf===3?0.5:0.8, D:5, reps:0, lapses:0, last:now,
    due:now+(f.conf===3?0.5:1)*DAY, hcw:f.conf===3, recentAcc:0, done:false,
    /* Successive relearning: retirement needs correct recalls on separate DAYS,
       not repetitions within one sitting. */
    sessions:0, lastDay:null,
    /* A confident error that gets feedback but no retrieval afterwards comes
       back at delay. One test the same day blocks it. */
    loop:f.conf===3 };
}
function R(m,now){ return m.S<=0?0:Math.pow(1+(now-m.last)/DAY/(9*m.S),-1); }
var CRITERION = 3;   /* correct recalls, on 3 separate days */
function review(m,outcome,now,daysToExam){
  var c={}; for(var k in m) c[k]=m[k];
  var r=R(m,now);
  var g = outcome==="easy"?4 : outcome==="got"?3 : outcome==="almost"?2 : 1;
  if(g===1){ c.lapses++;
    c.S = c.errType==="recall" ? Math.max(0.6,c.S*0.6) : Math.max(0.4,c.S*0.35);
    c.D = Math.min(10,c.D+1.1);
  } else {
    var e = g===4?1.35 : g===2?0.9 : 1.1;
    c.S = c.S*(1+e*(1.4-c.D*0.06)*(1+2.2*(1-r)));
    c.D = Math.min(10,Math.max(1,c.D-(g-3)*0.55));
  }
  c.recentAcc = 0.6*c.recentAcc + 0.4*(g>=3?1:g===2?0.4:0);
  c.reps++; c.last=now;

  /* Criterion counting. A second correct recall on the same day is a repetition,
     not a relearning session, so it does not count. A lapse costs one session
     rather than wiping the record — relearning attenuates decay, it does not
     restart it. */
  var today = Math.floor(now/DAY);
  if(g>=3){ if(c.lastDay!==today){ c.sessions=(c.sessions||0)+1; c.lastDay=today; } }
  else if(g===1){ c.sessions=Math.max(0,(c.sessions||0)-1); c.lastDay=today; }
  if(g>=3) c.loop=false;              /* the loop is closed by a retrieval, not by feedback */

  var iv = 9*c.S*(1/0.9-1);
  if(g===1) iv = Math.min(iv, c.hcw?0.5:1);

  /* Spread the reviews still owed evenly across the runway rather than expanding
     from a short base. Tested against an independent forgetting model, the
     expanding-and-capped version front-loaded reviews and left the last one far
     from the paper — it lost to plain uniform spacing at every runway length.
     Dividing the runway by the reviews still owed puts the final review near the
     exam whatever the starting point. */
  var owed = Math.max(1, CRITERION - (c.sessions||0) + 1);
  var target = (daysToExam!=null && daysToExam>0) ? Math.max(1, daysToExam/owed)
             : (daysToExam!=null ? 1 : 120);
  /* A lapse still pulls the item straight back; otherwise follow the runway. */
  var gap = (g===1) ? Math.min(iv, c.hcw?0.5:1) : Math.max(iv, target);
  if(daysToExam!=null && daysToExam>0) gap = Math.min(gap, daysToExam*0.9);
  c.due = now + Math.min(120*DAY, Math.max(0.4*DAY, gap*DAY));
  c.done = (c.sessions||0) >= CRITERION;
  return c;
}
/* Confident errors awaiting their same-day retrieval. These jump every queue. */
function loopQueue(misses){
  misses = misses||[];
  return misses.filter(function(m){ return m.loop && !m.done; });
}
function dueQueue(misses,now,cap){
  misses = misses||[];
  var due = misses.filter(function(m){ return !m.done && (m.loop || m.due<=now); })
    .sort(function(a,b){ return ((1-R(b,now))*(b.hcw?1.7:1))-((1-R(a,now))*(a.hcw?1.7:1)); });
  var by={A:[],B:[],C:[],D:[]};
  due.forEach(function(m){ var t=CURRICULUM[m.topicId]; if(t) by[t.tr].push(m); });
  var out=[], last=null, guard=0;
  while(out.length<Math.min(due.length,cap) && guard++<5000){
    var o=Object.keys(by).filter(function(k){ return by[k].length && k!==last; })
      .sort(function(a,b){ return by[b].length-by[a].length; });
    var p=o[0]||Object.keys(by).filter(function(k){return by[k].length;})[0];
    if(!p) break;
    out.push(by[p].shift()); last=p;
  }
  return { queue:out, total:due.length };
}
/* Falling accuracy cuts new intake and adds repair — it never asks for a longer day. */
function failsafe(days,misses,now,scores,startISO){
  days = days||{}; misses = misses||[];
  /* Nothing is owed before the campaign opens, and scored questions count as
     activity even when no day record was ticked. */
  if(startISO && iso(new Date(now)) < startISO) return { mode:"normal" };
  var ks=Object.keys(days);
  var scoredAll=Object.keys(scores||{}).reduce(function(a,k){
    return a+((scores[k].ba||0)+(scores[k].sa||0)); },0);
  /* Never scold a fresh install: nothing has been logged because nothing has happened yet. */
  var everLogged = misses.length>0 || Object.keys(scores||{}).length>0 || ks.some(function(k){
    var d=days[k], ch=d.checks||{}, any=false;
    for(var c in ch) if(ch[c]) any=true;
    return any || (d.bank||0)+(d.speed||0)+(d.mins||0) > 0;
  });
  if(!everLogged) return { mode:"normal" };
  var recent=ks.filter(function(k){ return fromISO(k).getTime()>now-14*DAY; });
  var qs=recent.reduce(function(a,k){ return a+(days[k].bank||0)+(days[k].speed||0); },0);
  var logged=misses.filter(function(m){ return m.t>now-14*DAY; }).length;
  var active=recent.filter(function(k){ return (days[k].bank||0)+(days[k].speed||0)>0; }).length;
  var scored=Object.keys(scores||{}).reduce(function(a,k){
    return a+((scores[k].ba||0)+(scores[k].sa||0)); },0);
  if(qs>=300 && scored<qs*0.5)
    return { mode:"score", head:"Attempted but not scored",
      body:qs+" questions in a fortnight, only "+scored+" with a correct count against them. Without that number the app cannot schedule repair sets or tell you where you stand — it is guessing." };
  if(qs>=400 && logged<qs*0.02)
    return { mode:"diary", head:"No confident errors captured",
      body:"Not one certain-and-wrong answer logged across "+qs+" questions. Either your calibration is remarkable, or the misses that matter most are going unrecorded." };
  if(active===0 && qs===0 && scoredAll===0)
    return { mode:"idle", head:"Nothing logged in two weeks",
      body:"Drop to Floor for one week. No targets, no catch-up. Then ramp again — do not restart at full load." };
  if(active>0 && active<=2)
    return { mode:"light", head:"A thin fortnight",
      body:"Saturday's six hours absorb it. Do not double tomorrow — that is how two missed days become five." };
  return { mode:"normal" };
}
/* Distance to the final bar, never to the next tier. */
function evidenceNeeded(misses){
  misses = misses||[];
  var reviewed=misses.filter(function(m){return m.reps>=1;}).length, total=misses.length;
  var nl=Math.max(0,40-total), nr=Math.max(0,25-reviewed);
  if(!nl && !nr) return { n:0 };
  return nr>=nl ? { n:nr, verb:"reviews done" } : { n:nl, verb:"misses logged" };
}
/* ---------- per-question ledger ----------
   The identity of a question this app never stores the content of has to come
   from where it lives: which source app, which topic, which subtopic, which
   number. That four-part key is what lets the same question be recognised
   again in pass 2 and pass 3, which is the whole point \u2014 an aggregate tally
   can tell you a topic is weak, only a per-question record can tell you THIS
   exact question keeps coming back wrong. */
function mcqKey(app,topicId,subtopic,number){
  return app+"|"+topicId+"|"+String(subtopic||"").trim().toLowerCase()+"|"+String(number||"").trim().toLowerCase();
}
function mergeMcq(a,b){
  var out={};
  [a||{},b||{}].forEach(function(src){
    Object.keys(src).forEach(function(k){
      var v=src[k]; if(!v||!v.attempts) return;
      var o=out[k];
      if(!o) out[k]={ key:v.key,topicId:v.topicId,app:v.app,subtopic:v.subtopic,number:v.number,
        attempts:v.attempts.slice() };
      else {
        var seen={}; o.attempts.forEach(function(x){ seen[x.t]=1; });
        v.attempts.forEach(function(x){ if(!seen[x.t]){ o.attempts.push(x); seen[x.t]=1; } });
        o.attempts.sort(function(p,q){ return p.t-q.t; });
      }
    });
  });
  return out;
}
function exportPayload(st){
  return JSON.stringify({ v:10, schemaVersion:st.schemaVersion||6, at:Date.now(), prefs:st.prefs, misses:st.misses,
    days:st.days, scores:st.scores||{}, calib:st.calib||[],
    tallies:st.tallies||{}, repairs:st.repairs||{}, mcq:st.mcq||{},
    cursors:st.cursors||{}, lecDone:st.lecDone||{}, swaps:st.swaps||[], notes:st.notes||[],
    retiredCount:st.retiredCount||0,
    /* mocks were persisted to local storage but never written into the backup
       payload — a restore silently returned every sat mock score to zero, and
       nothing anywhere reported it. pace, hist and calls found missing the
       same way in a later audit: three fields that exist in state, get saved
       locally, and were simply never wired into export. Same bug, third time,
       which is why a standing round-trip check now exists in the test suite
       rather than relying on catching each instance by hand. */
    pace:st.pace||{}, hist:st.hist||{}, calls:st.calls||{},
    /* adaptiveProfile was the FOURTH field found persisted locally but absent
       from the backup payload, after mocks, pace, hist and calls. It holds the
       per-topic adaptive data the engine learns from your answers, so a restore
       silently reset that learning to nothing. Found by diffing every key
       normalizeState persists against every key exportPayload writes; that diff
       is now a standing check in tests/backup.test.js rather than something
       spotted by eye a fifth time. */
    adaptiveProfile:st.adaptiveProfile||{topics:{},lastUpdate:null},
    /* adaptive4 was the FIFTH such field, and it was found by the derived
       check in tests/backup.test.js on that check's first run rather than by
       another manual read-through. It holds learned strategy performance
       ({strategies,runs}), so losing it resets the engine's judgement about
       which study strategies work for this user. `ics` is the calendar-export
       preference set (detail, alarm, range) — a user choice, so it is restored
       too rather than silently reset to defaults. */
    adaptive4:st.adaptive4||{strategies:{},runs:0},
    recoveryLog:st.recoveryLog||{},
    ics:st.ics||null,
    procedures:st.procedures||{}, aiProfile:st.aiProfile||{}, productPrinciples:st.productPrinciples||{}, notifications:{enabled:!!(st.notifications&&st.notifications.enabled),reminderMinutes:(st.notifications&&st.notifications.reminderMinutes)||30} });
}
function parseBackup(txt){
  var d;
  try { d=JSON.parse(txt); } catch(e){ return {ok:false,error:"That is not valid backup text."}; }
  if(!d||typeof d!=="object"||!Array.isArray(d.misses)) return {ok:false,error:"That is not a SurgiMaster backup."};
  if(d.misses.some(function(m){ return !m||!m.id||m.topicId===undefined; }))
    return {ok:false,error:"Some entries are damaged — not importing."};
  return { ok:true, misses:d.misses, days:d.days||{}, prefs:d.prefs||null,
    adaptiveProfile:(d.adaptiveProfile&&typeof d.adaptiveProfile==='object')?d.adaptiveProfile:null,
    adaptive4:(d.adaptive4&&typeof d.adaptive4==='object')?d.adaptive4:null,
    recoveryLog:(d.recoveryLog&&typeof d.recoveryLog==='object')?d.recoveryLog:{},
    ics:(d.ics&&typeof d.ics==='object')?d.ics:null,
    scores:d.scores||{}, calib:Array.isArray(d.calib)?d.calib:[],
    tallies:d.tallies||{}, repairs:d.repairs||{}, mcq:d.mcq||{},
    cursors:d.cursors||{}, lecDone:d.lecDone||{}, swaps:Array.isArray(d.swaps)?d.swaps:[], notes:Array.isArray(d.notes)?d.notes:[], retiredCount:d.retiredCount||0, pace:d.pace||{}, hist:d.hist||{}, calls:d.calls||{}, procedures:d.procedures||{}, aiProfile:d.aiProfile||{}, productPrinciples:d.productPrinciples||{}, notifications:d.notifications||null, schemaVersion:Number(d.schemaVersion)||Number(d.v)||1 };
}
/* Merge never replaces. On a conflict the more recently reviewed copy wins. */
/* Scores take the max per field — a restore can only ever add attempts, never
   erase them. Calibration entries are deduplicated on their timestamp. */
function mergeScores(a,b){
  var out={}; [a||{},b||{}].forEach(function(src){
    Object.keys(src).forEach(function(k){
      var o=out[k]||{ba:0,bc:0,sa:0,sc:0}, v=src[k]||{};
      ["ba","bc","sa","sc"].forEach(function(f){ o[f]=Math.max(o[f]||0, v[f]||0); });
      if(o.bc>o.ba) o.bc=o.ba;
      if(o.sc>o.sa) o.sc=o.sa;
      out[k]=o;
    });
  });
  return out;
}
/* Tallies take the max per bucket and repair stamps take the latest, so a
   restore can only ever add history, never erase it. */
function mergeTallies(a,b){
  var out={};
  [a||{},b||{}].forEach(function(src){
    Object.keys(src).forEach(function(k){
      var o=out[k]||{}, v=src[k]||{};
      ERR_TYPES.forEach(function(e){ o[e[0]]=Math.max(o[e[0]]||0, v[e[0]]||0); });
      out[k]=o;
    });
  });
  return out;
}
function mergeRepairs(a,b){
  var out={};
  [a||{},b||{}].forEach(function(src){
    Object.keys(src).forEach(function(k){
      var o=out[k]||{last:0,reps:0}, v=src[k]||{};
      out[k]={ last:Math.max(o.last||0,v.last||0), reps:Math.max(o.reps||0,v.reps||0) };
    });
  });
  return out;
}
function mergeCalib(a,b){
  var seen={}, out=[];
  (a||[]).concat(b||[]).forEach(function(x){
    if(!x||seen[x.t]) return; seen[x.t]=1; out.push(x);
  });
  return out.sort(function(p,q){ return p.t-q.t; });
}
function mergeBackup(cur,curDays,inc,incDays){
  var map={}; cur.forEach(function(m){ map[m.id]=m; });
  var added=0,kept=0,updated=0;
  inc.forEach(function(m){
    var mine=map[m.id];
    if(!mine){ map[m.id]=m; added++; }
    else if((m.last||0)>(mine.last||0)){ map[m.id]=m; updated++; }
    else kept++;
  });
  var days={}; for(var k in curDays) days[k]=curDays[k];
  Object.keys(incDays||{}).forEach(function(k){
    var v=incDays[k], c=days[k]||{}, checks={};
    var vc=v.checks||{}, cc=c.checks||{};
    for(var a in vc) checks[a]=vc[a];
    for(var b in cc) checks[b]=cc[b];
    days[k]={ bank:Math.max(c.bank||0,v.bank||0), speed:Math.max(c.speed||0,v.speed||0),
      mins:Math.max(c.mins||0,v.mins||0), layer:c.layer||v.layer, checks:checks };
  });
  return { misses:Object.keys(map).map(function(k){return map[k];}), days:days,
           added:added, kept:kept, updated:updated };
}

/* =====================================================================
   ICS export — RFC 5545. One event per study block so every item carries
   its own alarm, or one per day if you would rather keep the calendar
   quiet. Generated from the same plan object the app renders, so the
   calendar can never drift from the schedule on screen.
   ===================================================================== */
function icsEsc(v){
  return String(v==null?"":v)
    .replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,")
    .replace(/\r?\n/g,"\\n");
}
function icsFold(line){
  /* RFC 5545 folds at 75 OCTETS, not characters. Em dashes and \u00d7 are
     multi-byte, so a character count silently produces over-long lines. */
  function blen(cp){ return cp<0x80?1 : cp<0x800?2 : cp<0x10000?3 : 4; }
  var out="", cur="", used=0, limit=73, i=0;
  while(i<line.length){
    var cp=line.codePointAt(i), chLen=cp>0xFFFF?2:1, ch=line.substr(i,chLen), b=blen(cp);
    if(used+b>limit){
      out += (out?"\r\n ":"") + cur;
      cur=""; used=0; limit=72;
    }
    cur+=ch; used+=b; i+=chLen;
  }
  if(cur) out += (out?"\r\n ":"") + cur;
  return out;
}
function icsStamp(dISO,mins){
  var h=Math.floor(mins/60), m=Math.round(mins)%60;
  return dISO.replace(/-/g,"")+"T"+pad2(h)+pad2(m)+"00";
}
var KIND_LABEL = { bank:"Bank MCQs", speed:"Speed MCQs (timed)", analysis:"Miss write-up",
  lecture:"Lectures", lunch:"Lunch", buffer:"Buffer", check:"Task" };
var KIND_LOC = { bank:"DocTutorials — MCQ bank", speed:"DocTutorials — Speed MCQs",
  lecture:"DocTutorials — Video lectures", analysis:"Mistake diary" };

function buildICS(plan, opt){
  var o = { detail:"block", alarm:10, protect:true, from:null, to:null, tz:"Asia/Kolkata" };
  if(opt) for(var k in opt) if(opt[k]!==undefined) o[k]=opt[k];
  var P=plan.P;
  var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SurgiMaster//INI-SS SGE//EN",
    "CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Dakshinamurthy — INI-SS SGE",
    "X-WR-TIMEZONE:"+o.tz,"BEGIN:VTIMEZONE","TZID:"+o.tz,"BEGIN:STANDARD",
    "DTSTART:19700101T000000","TZOFFSETFROM:+0530","TZOFFSETTO:+0530","TZNAME:IST",
    "END:STANDARD","END:VTIMEZONE"];
  var now=new Date();
  var DTSTAMP=now.getUTCFullYear()+pad2(now.getUTCMonth()+1)+pad2(now.getUTCDate())+"T"+
    pad2(now.getUTCHours())+pad2(now.getUTCMinutes())+pad2(now.getUTCSeconds())+"Z";
  var n=0;

  function ev(date,uid,start,end,summary,desc,loc,cat,busy){
    L.push("BEGIN:VEVENT");
    L.push("UID:"+uid+"@surgimaster");
    L.push("DTSTAMP:"+DTSTAMP);
    L.push("DTSTART;TZID="+o.tz+":"+icsStamp(date,start));
    L.push("DTEND;TZID="+o.tz+":"+icsStamp(date,Math.max(start+5,end)));
    L.push(icsFold("SUMMARY:"+icsEsc(summary)));
    if(desc) L.push(icsFold("DESCRIPTION:"+icsEsc(desc)));
    if(loc)  L.push(icsFold("LOCATION:"+icsEsc(loc)));
    if(cat)  L.push(icsFold("CATEGORIES:"+icsEsc(cat)));
    L.push("TRANSP:"+(busy?"OPAQUE":"TRANSPARENT"));
    L.push("STATUS:CONFIRMED");
    if(o.alarm!==null && o.alarm!==undefined && busy){
      L.push("BEGIN:VALARM");
      L.push("TRIGGER;RELATED=START:"+(o.alarm>0?("-PT"+o.alarm+"M"):"PT0S"));
      L.push("ACTION:DISPLAY");
      L.push(icsFold("DESCRIPTION:"+icsEsc(summary)));
      L.push("END:VALARM");
    }
    L.push("END:VEVENT"); n++;
  }

  plan.CAL.forEach(function(c,ci){
    if(o.from && c.date < o.from) return;
    if(o.to   && c.date > o.to)   return;

    var isContent = !c.rest;
    var blocks, header, ctxLine;
    if(isContent){
      blocks=c.blocks;
      /* A replanned day has no .slots (it is built directly from repacked
         blocks, bypassing the slot-assignment stage entirely) \u2014 fall back to
         deriving the same summary from the blocks themselves so a replanned
         schedule still exports a sensible calendar instead of one that
         silently stops working. */
      if(c.slots && c.slots.length){
        var names=[];
        c.slots.forEach(function(s){ var nm=CURRICULUM[s.ti].n; if(names.indexOf(nm)<0) names.push(nm); });
        header="Day "+c.n+" — "+names.join(" + ");
        var bq=c.slots.reduce(function(a,s){return a+s.nBank;},0);
        var sq=c.slots.reduce(function(a,s){return a+s.nSpeed;},0);
        var lc=c.slots.reduce(function(a,s){return a+s.nLec;},0);
      } else {
        var names=[], bq=0, sq=0, lc=0, lecSeen={};
        (c.blocks||[]).forEach(function(b){
          if(b.ti==null) return;
          var nm=CURRICULUM[b.ti].n; if(names.indexOf(nm)<0) names.push(nm);
          var n=(b.items||[]).reduce(function(a,e){return a+e.use;},0);
          if(b.kind==="bank"||b.kind==="image") bq+=n;
          else if(b.kind==="speed") sq+=n;
          else if(b.kind==="lecture") (b.items||[]).forEach(function(e){ lecSeen[e.item[0]+"|"+e.item[2]]=1; });
        });
        lc=Object.keys(lecSeen).length;
        header="Day "+c.n+" — "+names.join(" + ");
      }
      ctxLine=bq+" bank + "+sq+" speed questions, "+lc+" lecture"+(lc===1?"":"s")+", "+
        (Math.round(c.work/60*10)/10)+" h scheduled.";
    } else {
      var NAMES={ rest:"Rest & review — no new content", backup:"Weekly backup — 6 protected hours",
        taper:"Taper — retrieval only",
        taperlight:"Final days — light retrieval, protect sleep", exam:"EXAM DAY" };
      header=NAMES[c.kind]||c.kind;
      if(c.kind==="backup"||c.kind==="rest"){
        blocks=(c.kind==="backup"
          ? [["check","Catch up whatever slipped",P.weekBackup,"Misses first, then banks, then lectures — that is the order of what actually costs marks. On track? Take the day: this is slack, not a bonus study day."],
             ["check","Run the due queue",0,"Whatever the engine says is about to fade."],
             ["check","Export the diary",0,"Ten seconds. It cannot be rebuilt."]]
          : [["check","Run the due queue",120,"Everything about to fade."],
             ["check","Re-read this week's misses",60,"A miss type repeating across different topics is one problem, not several."],
             ["check","Two-minute pre-mortem",10,"What is likely to derail the coming week? Move a heavy day now, not on the day."],
             ["check","Export the diary",10,"You are already here."]]
        ).map(function(x,i){ return {i:i,kind:x[0],label:x[1],mins:x[2],note:x[3],detail:null,ti:null}; });
        var tm=P.dayStart;
        blocks.forEach(function(b){ b.start=tm; b.endMin=tm+(b.mins||30); tm=b.endMin+8; });
      } else {
        blocks=specialDay(c,P).blocks;   /* was specialDay(c.kind,P,c): the third argument was never a parameter, so the date was thrown away */
      }
      ctxLine=null;
    }

    if(o.detail==="day"){
      var lines=blocks.filter(function(b){return b.mins>0;}).map(function(b){
        return hhmm(b.start)+"–"+hhmm(b.endMin)+"  "+b.label+(b.detail?" ("+b.detail+")":"");
      });
      var body=lines.join("\n")+(ctxLine?"\n\n"+ctxLine:"")+
        (isContent?"\n\nThe last hour is buffer — hit your targets and it is yours.\nBad day? Floor: 40 questions, every miss written up. No penalty, tomorrow is not doubled.":"");
      var st=blocks.length?blocks[0].start:P.dayStart;
      var en=isContent?c.endMin:(blocks.length?blocks[blocks.length-1].endMin:P.dayStart+60);
      ev(c.date,"sm-"+c.date+"-day-"+ci,st,en,header,body,null,"SurgiMaster",true);
    } else {
      blocks.forEach(function(b,bi){
        if(!b.mins && b.kind!=="check") return;
        var t = (b.ti!=null) ? CURRICULUM[b.ti] : null;
        var sum, busy=true, loc=KIND_LOC[b.kind]||null, cat="SurgiMaster";
        if(b.kind==="lunch"||b.kind==="buffer"){ busy=false; }
        if(t) cat="SurgiMaster/"+PHASE_NAME[t.phase];
        sum = b.label + (b.detail? " · "+b.detail : "");
        if(b.kind==="buffer") sum="Buffer — stop early if unused";
        var d=[];
        if(b.note) d.push(b.note);
        if(t){
          d.push("");
          d.push("Topic: "+t.n+"  (Phase "+t.phase+" — "+PHASE_NAME[t.phase]+")");
          d.push("Yield — INI-SS: "+["lower","standard","high"][t.yINI]+" · NEET-SS: "+["lower","standard","high"][t.yNEET]);
          d.push("Whole topic: "+t.nlec+" lectures, "+Math.floor(t.lecmin/60)+"h "+(t.lecmin%60)+
            "m listed, "+t.dtq+" bank"+(t.spq?", "+t.spq+" speed":"")+" questions.");
        }
        if(b.items && b.items.length){
          d.push("");
          d.push("OPEN EXACTLY THIS:");
          var kk={lecture:"l",bank:"b",speed:"s",image:"b",repass:"b"}[b.kind];
          b.items.forEach(function(e){
            var L=itemLine(e,kk);
            d.push("  • "+L.name+"   ("+L.qty+")");
            d.push("      "+L.where);
          });
        }
        if(b.kind==="bank"||b.kind==="speed"){
          d.push("");
          d.push("Log attempted AND correct in the app — per-topic accuracy is what drives the plan.");
        }
        if(b.kind==="analysis"){
          d.push("");
          d.push("For each miss: the right answer, why it wins, why the option you picked fails, and how sure you were before the reveal.");
          d.push("Certain and wrong? You must also RETRIEVE it before the day ends. The write-up is only the feedback.");
        }
        if(isContent){
          d.push("");
          d.push(header+"  ·  "+ctxLine);
        }
        ev(c.date,"sm-"+c.date+"-b"+bi,b.start,b.endMin,sum,d.join("\n"),loc,cat,busy);
      });
    }

    if(o.protect && isContent){
      if(P.gym>P.dayStart)
        ev(c.date,"sm-"+c.date+"-gym",P.gym,P.gym+60,"Gym (protected)",
          "Fixed. Not a reward for finishing the day.",null,"SurgiMaster/Protected",false);
      if(P.dinner>P.dayStart && !P.dinnerFloat)
        ev(c.date,"sm-"+c.date+"-dinner",P.dinner,P.dinner+60,"Family dinner (protected)",
          "Fixed.",null,"SurgiMaster/Protected",false);
    }
  });

  L.push("END:VCALENDAR");
  return { text:L.join("\r\n")+"\r\n", events:n };
}

/* Standalone bounded SM-2 adapter for active-recall records. The mature scheduler
   above remains authoritative for campaign planning; this API owns only item-level
   retrieval intervals so a bad rating can never produce NaN/negative dates. */
function calculateNextInterval(qualityRating,currentEF,currentInterval,repetitions){
  var q=Number.isFinite?Number(qualityRating):Number(qualityRating);
  if(!isFinite(q)) q=0; q=Math.max(0,Math.min(5,q));
  var ef=Number(currentEF); if(!isFinite(ef)) ef=2.5; ef=Math.max(1.3,ef);
  var iv=Number(currentInterval); if(!isFinite(iv)||iv<1) iv=1;
  var reps=Number(repetitions); if(!isFinite(reps)||reps<0) reps=0; reps=Math.floor(reps);
  var nextEF=ef+(0.1-(5-q)*(0.08+(5-q)*0.02));
  nextEF=Math.max(1.3,Math.min(3.0,nextEF));
  var nextInterval;
  if(q<3){ reps=0; nextInterval=1; }
  else {
    if(reps===0) nextInterval=1;
    else if(reps===1) nextInterval=6;
    else nextInterval=Math.max(1,Math.round(iv*ef));
    reps++;
  }
  return {interval:nextInterval,ef:nextEF,reps:reps};
}


/* Adaptive Study Engine 3.0 — pure decision layer. The UI supplies current local
   evidence; this function never mutates the campaign or study record. */
function retentionEstimate(daysSinceSuccess,stabilityDays){
  var d=Number(daysSinceSuccess); if(!isFinite(d)||d<0) d=0;
  var s=Number(stabilityDays); if(!isFinite(s)||s<1) s=7;
  /* Bounded retention estimate: useful for prioritisation, never presented as
     a clinical/scientific probability. It decays smoothly and is anchored to
     the learner's observed review interval. */
  var r=Math.exp(-d/Math.max(2,s));
  return Math.max(0,Math.min(1,r));
}
function adaptivePriority(x){
  x=x||{}; var mastery=Number(x.mastery); if(!isFinite(mastery)) mastery=.5; mastery=Math.max(0,Math.min(1,mastery));
  var acc=Number(x.accuracy); if(!isFinite(acc)) acc=null;
  var p=0;
  p+=(1-mastery)*42;
  if(acc!==null) p+=(1-acc)*22;
  p+=Math.min(18,Math.max(0,Number(x.due)||0)*6);
  p+=Math.min(18,Math.max(0,Number(x.repeatMisses)||0)*6);
  if(x.confidentWrong) p+=16;
  if(x.calibrationState==="overconfident") p+=12;
  if(x.calibrationRisk) p+=Math.min(12,Number(x.calibrationRisk)*12);
  if(x.retentionRisk) p+=Math.min(14,Number(x.retentionRisk)*14);
  if(x.retentionState==="fragile") p+=8;
  if(x.retentionState==="stable") p-=4;
  if(x.recentMiss) p+=8;
  if(x.planned) p+=Number(x.plannedWeight)||5;
  if(x.examSoon) p+=Math.min(15,Number(x.examWeight)||8);
  if(x.highYield) p+=Math.min(10,Number(x.yieldWeight)||4);
  /* Preserve room for exploration so the engine does not repair the same topics forever. */
  if(x.exploration) p+=Math.min(10,Number(x.exploration)*10);
  if(x.stable) p-=22;
  return Math.max(0,Math.min(140,p));
}
/* Adaptive Topic Relationships 3.5 — lightweight, deterministic relationship layer.
   Relationships are deliberately explicit/keyword-based rather than invented from
   opaque embeddings. They are used only to rank related retrieval; the campaign
   scheduler remains authoritative. */
function topicFamily(name){
  var n=String(name||'').toLowerCase();
  if(/liver|biliary|gallbladder|pancreas|hpb|spleen|transplant/.test(n)) return 'HPB-transplant';
  if(/esophagus|stomach|small intestine|acute abdomen|gi bleeding|large intestine|rectum|anal|appendix|hernia|peritoneum|bariatric|surgical gi/.test(n)) return 'GI';
  if(/oncology|neuroendocrine|men|melanoma|sarcoma/.test(n)) return 'oncology';
  if(/breast|thyroid|parathyroid|adrenal/.test(n)) return 'endocrine-breast';
  if(/kidney|ureter|bladder|prostate|urethra|penis|testis|uro-/.test(n)) return 'urology';
  if(/vascular/.test(n)) return 'vascular';
  if(/cardiothoracic/.test(n)) return 'ctvs';
  if(/neurosurgery/.test(n)) return 'neuro';
  if(/plastic|skin/.test(n)) return 'plastic';
  if(/paediatric|pediatric/.test(n)) return 'paediatric';
  if(/trauma|perioperative|metabolic|wound|nutrition|general surgery/.test(n)) return 'general';
  return 'other';
}
function topicRelationIds(ti){
  var t=CURRICULUM[ti]; if(!t) return [];
  var n=String(t.n||'').toLowerCase(), f=topicFamily(t.n), out=[];
  CURRICULUM.forEach(function(x){
    if(x.i===ti) return;
    var xn=String(x.n||'').toLowerCase(), xf=topicFamily(x.n), score=0;
    if(f===xf && f!=='other') score+=3;
    /* High-value cross-topic clinical links. */
    if((/liver|biliary|gallbladder|pancreas|hpb/.test(n)&&/transplant/.test(xn))||
       (/transplant/.test(n)&&/liver|biliary|pancreas|hpb/.test(xn))) score+=3;
    if((/oncology/.test(n)&&/liver|pancreas|large intestine|rectum|stomach|esophagus/.test(xn))||
       (/oncology/.test(xn)&&/liver|pancreas|large intestine|rectum|stomach|esophagus/.test(n))) score+=2;
    if((/hernia|abdominal wall|peritoneum/.test(n)&&/large intestine|small intestine|appendix|acute abdomen/.test(xn))||
       (/hernia|abdominal wall|peritoneum/.test(xn)&&/large intestine|small intestine|appendix|acute abdomen/.test(n))) score+=2;
    if((/vascular/.test(n)&&/kidney|ureter|transplant|pancreas|liver|mesenteric|cardiothoracic/.test(xn))||
       (/vascular/.test(xn)&&/kidney|ureter|transplant|pancreas|liver|mesenteric|cardiothoracic/.test(n))) score+=2;
    if((/wound|nutrition|metabolic/.test(n)&&/trauma|perioperative|plastic|transplant/.test(xn))||
       (/wound|nutrition|metabolic/.test(xn)&&/trauma|perioperative|plastic|transplant/.test(n))) score+=2;
    if(score>0) out.push({i:x.i,score:score,name:x.n});
  });
  return out.sort(function(a,b){return b.score-a.score||a.i-b.i;}).slice(0,8);
}
function topicRelationshipScore(a,b){
  if(!a||!b) return 0;
  if(a.i!=null && b.i!=null){
    var rel=topicRelationIds(a.i); for(var i=0;i<rel.length;i++) if(rel[i].i===b.i) return rel[i].score;
  }
  return (a.family&&b.family&&a.family===b.family&&a.family!=='other')?3:0;
}
function adaptiveInterleave(topics,energy){
  var list=(Array.isArray(topics)?topics:[]).map(function(t){var z={};for(var k in t)z[k]=t[k];z.priority=adaptivePriority(z);return z;})
    .filter(function(t){return !t.stable;}).sort(function(a,b){return b.priority-a.priority;});
  if(list.length<3 || energy==='overwhelmed' || energy==='low') return {enabled:false,topics:list.slice(0,1),reason:''};
  var a=list[0], picks=[a], seen={}; seen[a.i!=null?a.i:a.name]=1;
  for(var i=1;i<list.length && picks.length<3;i++){
    var t=list[i], key=t.i!=null?t.i:t.name;
    var related=!!(a.group&&t.group&&a.group===t.group);
    var complementary=!!(a.family&&t.family&&a.family===t.family);
    var explicit=topicRelationshipScore(a,t)>=2;
    var close=(a.priority-t.priority)<18;
    if(!seen[key] && (related||complementary||explicit||close)){picks.push(t);seen[key]=1;}
  }
  if(picks.length<3) return {enabled:false,topics:[a],reason:''};
  return {enabled:true,topics:picks,reason:'Interleaving is appropriate because several non-stable topics have comparable priority or a meaningful clinical relationship; mixing retrieval reduces single-topic autopilot.'};
}

/* Adaptive Question Selection 3.6 — select exact questions only when the app
   has an item-level ledger identity. The source question banks are not copied
   into the PWA, so this layer never invents question content or IDs. */
function adaptiveQuestionSelect(records, opts){
  opts=opts||{}; var now=Number(opts.now)||Date.now(), topicId=opts.topicId!=null?opts.topicId:null;
  var rows=[]; (Array.isArray(records)?records:[]).forEach(function(m){
    if(!m||!m.key||m.topicId==null||topicId!=null && Number(m.topicId)!==Number(topicId)) return;
    var a=Array.isArray(m.attempts)?m.attempts:[]; if(!a.length) return;
    var last=a[a.length-1]||{}, wrong=a.filter(function(x){return x.outcome==='wrong';}).length;
    var recentWrong=a.slice(-4).filter(function(x){return x.outcome==='wrong';}).length;
    var confidentWrong=a.filter(function(x){return x.outcome==='wrong'&&Number(x.conf)>=3;}).length;
    var days=Math.max(0,(now-(Number(last.t)||now))/DAY);
    var score=0;
    score+=recentWrong*18;
    score+=Math.min(24,wrong*8);
    score+=confidentWrong*16;
    if(last.outcome==='wrong') score+=24;
    if(last.outcome==='fragile') score+=15;
    if(last.outcome==='right') score-=8;
    score+=Math.min(18,days*2);
    /* Avoid immediate repetition unless the item is actively wrong. */
    if(days<1 && last.outcome!=='wrong') score-=25;
    if(days<0.25 && last.outcome==='wrong') score+=4;
    rows.push({key:m.key,topicId:m.topicId,app:m.app||'',subtopic:m.subtopic||'',number:m.number||'',attempts:a.length,
      lastOutcome:last.outcome||null,lastAt:last.t||0,daysSince:days,wrong:wrong,recentWrong:recentWrong,
      confidentWrong:confidentWrong,score:Math.max(0,Math.min(120,score))});
  });
  rows.sort(function(a,b){return b.score-a.score||b.lastAt-a.lastAt||String(a.key).localeCompare(String(b.key));});
  var limit=Math.max(1,Math.min(12,Number(opts.limit)||6));
  var chosen=rows.slice(0,limit), action=String(opts.action||'').toLowerCase();
  if(action==='recall') chosen.sort(function(a,b){return (b.recentWrong+b.confidentWrong)-(a.recentWrong+a.confidentWrong)||b.score-a.score;});
  return {items:chosen,total:rows.length,hasEvidence:rows.length>0,
    reason:rows.length?'Selected from the exact question ledger using recent misses, confident errors, repetition and time since last attempt.':'No exact item-level question history is available for this topic yet; the engine will not invent question identities.'};
}


/* Adaptive Learning Engine 4.0 — difficulty, transfer, composition, stopping,
   exploration and personal strategy signals. Deterministic and evidence-bound. */
function adaptiveDifficulty(x){
  x=x||{}; var raw=x.accuracy, acc=Number(raw), n=Number(x.attempts)||0, cw=Number(x.confidentWrong)||0;
  /* Unknown evidence must stay unknown — null/undefined/empty values are not
     zero accuracy. Difficulty should rise when retrieval is strong and fall
     when the learner is struggling; confident errors add a targeted challenge
     signal without turning a weak topic into an artificially hard test. */
  if(raw==null || raw==='' || !isFinite(acc)) return {level:'unknown',score:50,reason:'Not enough item-level evidence'};
  var score=50+(acc-0.5)*70-Math.min(20,cw*4);
  if(n<5) score=50+(acc-0.5)*45;
  score=Math.max(15,Math.min(90,score));
  var level=score>=70?'productive':score>=58?'challenging':score<=35?'easy':'moderate';
  return {level:level,score:Math.round(score),reason:level==='productive'?'High but useful difficulty':level==='easy'?'Retrieval is currently difficult — keep the challenge controlled':'Difficulty is appropriate for the available evidence'};
}
function adaptiveTransferNeed(x){
  x=x||{}; var mastery=Number(x.mastery); if(!isFinite(mastery)) mastery=.5;
  var acc=Number(x.accuracy); if(!isFinite(acc)) acc=.5;
  var stable=x.retentionState==='stable';
  var need=(mastery>=.65&&acc>=.75&&stable)?0.8:0.25;
  if(x.calibrationState==='overconfident') need=Math.max(need,.65);
  return Math.max(0,Math.min(1,need));
}
function adaptiveSessionCompose(opts){
  opts=opts||{}; var mins=30, action=String(opts.action||'retrieve'), energy=String(opts.energy||'focused');
  var inter=!!opts.interleaved, transfer=Number(opts.transferNeed)||0, difficulty=opts.difficulty||{};
  if(energy==='overwhelmed'||energy==='low') return {mins:30,parts:[{mins:10,type:'recall',label:'Short retrieval'},{mins:10,type:'repair',label:'Targeted repair'},{mins:10,type:'closure',label:'Closed-notes recall'}],reason:'Lower cognitive load while preserving retrieval.'};
  if(action==='repair') return {mins:mins,parts:[{mins:5,type:'recall',label:'Retrieve the weak point'},{mins:15,type:'repair',label:'Repair the reasoning'},{mins:5,type:'transfer',label:'Apply it to a new presentation'},{mins:5,type:'closure',label:'Closed-notes recall'}],reason:'Repair first, then test whether the repaired idea transfers.'};
  if(transfer>=.65) return {mins:mins,parts:[{mins:5,type:'recall',label:'Fast retrieval'},{mins:10,type:'questions',label:'Targeted questions'},{mins:10,type:'transfer',label:'Clinical transfer'},{mins:5,type:'closure',label:'Closed-notes recall'}],reason:'Core retrieval is sufficiently established; application now adds value.'};
  if(inter) return {mins:mins,parts:[{mins:10,type:'retrieve',label:'Topic A retrieval'},{mins:10,type:'retrieve',label:'Topic B retrieval'},{mins:10,type:'retrieve',label:'Topic C retrieval'}],reason:'Comparable weak/related topics make interleaving useful.'};
  if(difficulty.level==='easy') return {mins:mins,parts:[{mins:5,type:'recall',label:'Fast retrieval'},{mins:15,type:'questions',label:'Slightly harder questions'},{mins:5,type:'transfer',label:'Application check'},{mins:5,type:'closure',label:'Closed-notes recall'}],reason:'Increase challenge without turning the block into a test marathon.'};
  return {mins:mins,parts:[{mins:5,type:'recall',label:'Closed-book retrieval'},{mins:15,type:'questions',label:'Targeted questions'},{mins:5,type:'repair',label:'Repair one weak point'},{mins:5,type:'closure',label:'Final retrieval'}],reason:'Balanced retrieval, practice, repair and closure.'};
}
function adaptiveStopSignal(x){
  x=x||{}; var acc=Number(x.recentAccuracy), stable=x.retentionState==='stable', calibrated=x.calibrationState==='well-calibrated';
  if(x.dayComplete) return {stop:true,reason:'Today is complete. More work would borrow from tomorrow.'};
  if(isFinite(acc)&&acc>=.88&&stable&&calibrated) return {stop:true,reason:'Recent retrieval is strong, retention is stable and confidence is calibrated.'};
  return {stop:false,reason:'Continue while the block is still producing useful evidence.'};
}
function adaptiveStrategyScore(profile,strategy){
  profile=profile||{}; var z=profile[strategy]||{n:0,gain:0};
  return (Number(z.gain)||0)+((Number(z.n)||0)<3?0.05:0);
}
function adaptiveStrategyPick(profile,available){
  available=Array.isArray(available)&&available.length?available:['focused','interleaved','transfer'];
  var best=available[0]; for(var i=1;i<available.length;i++) if(adaptiveStrategyScore(profile,available[i])>adaptiveStrategyScore(profile,best)) best=available[i];
  return best;
}
function adaptiveStrategyObserve(profile,strategy,gain){
  profile=profile||{}; strategy=String(strategy||'focused'); var z=profile[strategy]||{n:0,gain:0};
  z.n=(Number(z.n)||0)+1; z.gain=(Number(z.gain)||0)+(Number(gain)||0); z.lastGain=Number(gain)||0; profile[strategy]=z; return profile;
}

function adaptiveDecision(input){
  input=input||{}; var topics=Array.isArray(input.topics)?input.topics:[];
  var mins=Math.max(5,Math.min(240,Number(input.minutes)||30));
  var energy=String(input.energy||'focused'), examSoon=!!input.examSoon;
  var list=topics.map(function(t){
    var z={}; for(var k in t) z[k]=t[k]; z.priority=adaptivePriority(z); return z;
  }).sort(function(a,b){return b.priority-a.priority;});
  var target=list[0]||{name:'one fragile topic',priority:20,stable:false};
  if(target.stable && list.length>1) target=list[1];
  var action=target.confidentWrong||target.due>0||target.calibrationState==='overconfident'?'recall':(target.repeatMisses>0||target.repair?'repair':(target.retentionState==='fragile'?'retain':(target.planned?'planned':'learn')));
  if(energy==='overwhelmed'||energy==='low') mins=Math.min(mins,15);
  if(energy==='tired') mins=Math.min(mins,25);
  if(input.minimum) mins=15;
  var blocks=[];
  if(action==='recall') blocks.push({mins:Math.min(10,Math.max(5,mins>=15?10:5)),type:'recall',label:'Active recall · '+target.name});
  else if(action==='repair') blocks.push({mins:Math.min(15,Math.max(8,mins>=20?12:8)),type:'repair',label:'Repair · '+target.name});
  else if(action==='planned') blocks.push({mins:Math.min(30,Math.max(10,Number(target.plannedMins)||15)),type:'planned',label:'Planned learning · '+target.name});
  else if(action==='retain') blocks.push({mins:Math.min(15,Math.max(8,mins>=20?12:8)),type:'retain',label:'Retention retrieval · '+target.name});
  else blocks.push({mins:Math.min(15,Math.max(8,mins>=20?12:8)),type:'learn',label:'Focused learning · '+target.name});
  var left=mins-blocks[0].mins;
  if(left>=5) blocks.push({mins:Math.min(15,left),type:'questions',label:'Fresh retrieval · '+target.name});
  left=mins-blocks.reduce(function(a,b){return a+b.mins;},0);
  if(left>=5) blocks.push({mins:left,type:'closure',label:'Closed-notes recall · '+target.name});
  var reason=[];
  if(target.confidentWrong) reason.push('confident errors need retrieval');
  if(target.repeatMisses) reason.push(target.repeatMisses+' repeated miss'+(target.repeatMisses===1?'':'es'));
  if(target.due) reason.push(target.due+' recall item'+(target.due===1?'':'s')+' due');
  if(target.accuracy!=null) reason.push(Math.round(target.accuracy*100)+'% recent accuracy');
  if(examSoon) reason.push('exam phase increases retrieval priority');
  return {target:target,action:action,minutes:mins,blocks:blocks,reason:reason,alternatives:list.slice(1,4),skip:(target.stable&&list.length>1)};
}

return { CURRICULUM:CURRICULUM, STYLES:STYLES, REPAIR_MIN_GAP:REPAIR_MIN_GAP,
  skeleton:skeleton, sortedExams:sortedExams, nextExam:nextExam, daysBetween:daysBetween,
  paceTarget:paceTarget, usableWork:usableWork, passFactors:passFactors, evOfAttempt:evOfAttempt, blindEV:blindEV, breakEven:breakEven,
  attemptRule:attemptRule, marginalGain:marginalGain, readiness:readiness,
  repairSets:repairSets, topicInterval:topicInterval, confusionPairs:confusionPairs,
  DOWL:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], DEFAULTS:DEFAULTS,
  ERR_TYPES:ERR_TYPES, RIGHT_TYPES:RIGHT_TYPES, REMEDY:REMEDY, DAY:DAY, buildPlan:buildPlan, feasibility:feasibility, floorDay:floorDay, newMiss:newMiss,
  PHASE_NAME:PHASE_NAME,
  layoutDay:layoutDay, cutToTarget:cutToTarget, cloneItems:cloneItems, splitItems:splitItems, dayBlocks:dayBlocks,
  review:review, R:R, dueQueue:dueQueue, failsafe:failsafe, evidenceNeeded:evidenceNeeded,
  exportPayload:exportPayload, parseBackup:parseBackup, mergeBackup:mergeBackup,
  mcqKey:mcqKey, mergeMcq:mergeMcq,
  loopQueue:loopQueue, CRITERION:CRITERION, specialDay:specialDay,
  mergeScores:mergeScores, mergeCalib:mergeCalib, mergeTallies:mergeTallies, mergeRepairs:mergeRepairs, buildICS:buildICS, calculateNextInterval:calculateNextInterval, adaptivePriority:adaptivePriority, adaptiveInterleave:adaptiveInterleave, adaptiveDecision:adaptiveDecision, adaptiveQuestionSelect:adaptiveQuestionSelect, adaptiveDifficulty:adaptiveDifficulty, adaptiveTransferNeed:adaptiveTransferNeed, adaptiveSessionCompose:adaptiveSessionCompose, adaptiveStopSignal:adaptiveStopSignal, adaptiveStrategyScore:adaptiveStrategyScore, adaptiveStrategyPick:adaptiveStrategyPick, adaptiveStrategyObserve:adaptiveStrategyObserve, topicFamily:topicFamily, topicRelationIds:topicRelationIds, topicRelationshipScore:topicRelationshipScore,
  ITEMS:ITEMS, topicItems:topicItems, pathOf:pathOf, itemLine:itemLine, cleanPath:cleanPath,
  hhmm:hhmm, iso:iso, fromISO:fromISO, pretty:pretty, shortDate:shortDate, DOW:DOW };
})();

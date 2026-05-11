# Oxford Handbook → Troubleshooting Guide Coverage Analysis

A comprehensive sweep of the *Oxford Handbook of Dentistry* (full text, 14,908 paragraphs, ~1.7M tokens) against the 84 problems currently in `data/troubleshooting/`. The goal is to surface every clinical problem a GDP could be presented with that the guide doesn't yet cover.

**Methodology**: 38 chapter-aligned chunks of ~400 paragraphs each, processed in parallel by Sonnet sub-agents. Each agent extracted GDP-presentable conditions, flagged origin (one of the 15 canonical, or `other-<category>`), and tagged matches against the existing 84. The main agent deduplicated by condition name and computed the diff.

**Note**: Each "gap" below is a candidate for the existing `extract-troubleshooting` skill, not a finished entry. Source paragraph indices reference [source-material/oxford-handbook/full-text.txt](../../source-material/oxford-handbook/full-text.txt).

---

## Summary

| Metric | Count |
|---|---:|
| Problems already in the guide | 84 |
| Distinct GDP-presentable conditions found in the handbook | ~250 |
| **Gaps (in handbook, not in guide)** | **~190** |
| Origins with sparsest coverage | throat (3), psychological (3), muscles (3), floor-of-mouth (4), skin (4) |
| Conditions that don't fit any canonical origin | ~70 (mostly `other-jaw`, `other-craniofacial`, `other-salivary`, `other-syndromic`, `other-neuropain`, `other-LA-complication`) |

The handbook is far broader than the troubleshooting guide. The 15-origin taxonomy was built around anatomical sites a GDP would examine; the handbook also documents extensive jaw-bone pathology, salivary gland pathology, craniofacial syndromes, neuropathic pain, LA complications, and medical-emergency presentations. See **Notes** at the end for taxonomy decisions.

---

## Gaps by origin

The actionable list. Each line is a condition the handbook covers that has no entry in `data/troubleshooting/<origin>.json`. Prevalence in a GDP setting varies — many of these are rare. Use the existing prevalence buckets in [.claude/skills/extract-troubleshooting/SKILL.md](../../.claude/skills/extract-troubleshooting/SKILL.md) when authoring entries.

### skin (currently 4 entries)

- **Facial laceration / soft-tissue facial injury** — Cuts, crush injuries, avulsions, penetrating wounds requiring layered closure, nerve/duct assessment, tetanus prophylaxis. [paras 6757–6799]
- **Impetigo** — Highly infectious staphylococcal/streptococcal rash starting around the mouth; may mimic herpes labialis; children. [paras 1889–1891, 12641]
- **Bell's palsy** — Acute unilateral LMN facial nerve palsy; facial droop, cannot close eye, smile, or whistle. [paras 6446, 11156]
- **Ramsay Hunt syndrome** — HZV reactivation in geniculate ganglion; facial palsy + otalgia + vesicular eruption of pinna/ear canal. [paras 6446, 10529–10530]
- **Frey syndrome (gustatory sweating)** — Post-traumatic gustatory flushing/sweating over parotid; common after parotidectomy. [paras 10472–10473, 12323]
- **Romberg syndrome (hemifacial atrophy)** — Progressive unilateral facial soft-tissue atrophy; contralateral epilepsy/trigeminal neuralgia. [paras 10537–10538, 14211]
- **Sturge–Weber anomalad** — Facial port-wine angioma with possible intracranial extension; convulsions, hemiplegia. [paras 10549–10550, 14510]
- **Horner syndrome** — Miosis, ptosis, anhidrosis from cervical sympathetic interruption; may point to bronchogenic carcinoma. [paras 10491–10492]
- **Von Recklinghausen neurofibromatosis** — Multiple neurofibromas with skin pigmentation; facial lesions can be disfiguring. [paras 10557–10558]
- **Facial skin SCC** — Ulcerated lesion with raised edges on sun-exposed facial skin; GDP detection role. [paras 7504–7505, 6942–6948]
- **Facial melanoma** — Rapidly enlarging, bleeding, or colour-changing pigmented lesion. [paras 7506–7507]
- **Seborrhoeic eczema (perioral)** — Skin condition with perioral/facial involvement. [para 14307]

### lips (currently 6 entries)

- **Haemangioma of lip** — Developmental blood vessel lesion at birth; blanches on pressure; 80% regress spontaneously. [paras 5793–5794, 12452]
- **Allergic angio-oedema** — Type I hypersensitivity; rapid lip/FOM/neck swelling; manage as anaphylaxis if severe. [paras 6264–6265, 7695, 10997]
- **Hereditary angio-oedema** — C1-esterase inhibitor deficiency; recurrent lip/FOM/neck swelling; FFP acutely. [paras 6266–6267, 12521]
- **Actinic cheilitis** — Sun-induced keratotic thickening of lower lip; premalignant; sun-block + follow-up. [paras 6252–6253, 10854]
- **Chronic discoid lupus erythematosus (lip)** — Disc-like white plaques on lips; premalignant in women; may progress to SLE. [paras 6373–6374]
- **Median fissure of lips** — Chronic midline fissuring of lower lip; traumatic or inflammatory. [para 13074]
- **Erythema multiforme / Stevens–Johnson (lip involvement)** — Crusted painful erosions of lips and gingivae; HSV/drug-triggered. [paras 6107–6110, 10545]
- **Peutz–Jeghers syndrome (perioral pigmentation)** — Perioral melanotic macules; marker of GI hamartomatous polyposis. [paras 10523–10524, 13765]
- **Plummer–Vinson (Patterson–Brown–Kelly) syndrome** — Dysphagia, hypochromic anaemia, koilonychia, angular cheilitis; premalignant post-cricoid web. [paras 10521–10522, 13641]
- **Kawasaki disease** — Children <5; pyrexia, dry cracked lips, strawberry tongue, cervical lymphadenopathy, red eyes. [paras 10497–10498, 12802]
- **Heerfordt syndrome (uveoparotid fever)** — Sarcoidosis variant with parotid/lacrimal swelling, uveitis, possible facial palsy. [paras 10482–10483, 14798]
- **MEN IIb (oral mucosal neuromas)** — Multiple mucosal neuromas on lips/tongue; phaeochromocytoma, medullary thyroid carcinoma. [paras 7390–7391, 10515–10516]
- **Lesch–Nyhan syndrome (self-mutilation)** — Purine metabolism defect; aggressive self-mutilation of lips; intellectual disability. [paras 10505–10506]
- **Van der Woude syndrome (lip pits)** — Lip pits (minor salivary gland sinuses) with cleft lip/palate; autosomal dominant. [paras 10555–10556, 14803]
- **Orofacial–digital syndrome** — Cleft lip/palate with hypodontia, supernumeraries, finger abnormalities. [paras 10517–10518]
- **Sicca syndrome (primary Sjögren)** — Xerostomia + dry eyes without systemic CTD; raised parotid lymphoma risk. [paras 10539–10540, 14360]
- **Vitiligo (perioral/lip)** — Depigmentation with oral mucosal involvement. [para 14841]
- **Exfoliative cheilitis** — Persistent scaling/crusting of vermilion lip border; anxiety or chronic lip licking. [para 12135]

### cheeks (currently 7 entries)

- **Fibroepithelial polyp** — Sessile or pedunculated fibrous overgrowth from recurrent trauma; dense collagenous tissue. [paras 5783–5784]
- **Granulomata (Crohn's / OFG / sarcoidosis intra-oral)** — Lumps with non-caseating granulomata; foreign body (amalgam) possible. [paras 5791–5792]
- **Vascular malformations (oral)** — Developmental blood vessel lesions growing with patient; flow-rate characterised. [paras 5797–5798]
- **Amalgam tattoo** — Localised blue/black mucosal pigmentation from amalgam implantation; radio-opaque; benign. [paras 6155–6156]
- **Major aphthous ulcers (RAS major)** — Larger (>10mm), longer-lasting ulcers (5–10 weeks); GI/haematological/AIDS associations. [paras 6061–6062]
- **Behçet's disease** — Systemic vasculitis with recurrent oral ulcers + genital ulceration, uveitis, skin lesions. [paras 6065–6066, 10452]
- **Bullous pemphigoid (oral)** — Firm subepithelial blisters; oral involvement in ~20%; may signal malignancy or drug reaction. [paras 6099–6100]
- **Dermatitis herpetiformis (oral)** — Bullae breaking to large erosions; gluten-sensitive. [paras 6101–6102, 11910]
- **Linear IgA disease** — Rare immune-mediated non-specific oral ulceration; systemic steroids or mycophenolate. [paras 6111–6112, 12890]
- **Pemphigus vulgaris (oral)** — IgG autoantibody-mediated acantholysis; fragile blisters/ulcers; oral often precedes skin; potentially fatal. [paras 6086–6087]
- **Bullous lichen planus** — Rare subepithelial blistering variant; large erosions; premalignant potential. [paras 6103–6104]
- **Erosive lichen planus** — Atrophic/erosive variant of oral LP; ~1% malignant potential; 6-monthly follow-up. [paras 6194–6195]
- **White spongy naevus** — Asymptomatic diffuse soft white thickening of oral mucosa; autosomal dominant. [paras 6115–6116, 14869]
- **Panoral leucoplakia** — Entire oral mucosa undergoing hyperplastic field change; high malignant transformation risk. [paras 6135–6136]
- **Proliferative verrucous leukoplakia** — Aggressive multifocal white patches; high malignant transformation; F > M. [paras 6147–6148, 13942]
- **Verrucous carcinoma** — Slow-growing exophytic wart-like low-grade SCC; locally invasive. [paras 6217–6218, 14815]
- **Pseudomembranous candidiasis (oral thrush)** — Creamy white plaques that wipe off; immunocompromised, neonates, elderly. [paras 6037–6039]
- **Erythematous candidosis** — Red shiny atrophic oral mucosa; antibiotics, inhaled steroids, HIV, xerostomia. [paras 6040–6041]
- **Chronic mucocutaneous candidosis** — Rare syndrome of recalcitrant oral/skin candidal plaques with endocrine abnormalities. [paras 6051–6052]
- **Drug-induced lichenoid eruption** — LP-like oral reaction to NSAIDs, gold, oral hypoglycaemics, beta blockers. [paras 6314–6315]
- **Drug-induced oral ulceration (agranulocytosis)** — Severe ulceration from drug-induced marrow suppression; haematological emergency. [paras 6310–6311]
- **Primary herpetic gingivostomatitis** — Widespread painful vesicles/ulcers, cervical nodes, fever, halitosis; first HSV. [paras 1877, 6014–6015]
- **Hand, foot and mouth disease** — Coxsackievirus; oral mucosal ulcers + rash on hands/feet; minimal systemic upset. [paras 1882, 12473]
- **Koplik spots (measles prodrome)** — Small white spots with erythematous margins on buccal mucosa before measles rash. [paras 6028–6029]
- **Glandular fever / EBV oral involvement** — Oral ulceration, palatal petechiae at hard/soft junction; cervical lymphadenopathy. [paras 6030–6031, 1887]
- **Reiter syndrome (oral ulcers)** — Post-infective triad: oral ulcers + urethritis + arthritis + conjunctivitis; HLA-B27. [paras 6033–6034, 14047]
- **MAGIC syndrome** — Mouth and genital ulcers with interstitial chondritis; Behçet's variant. [paras 10507–10508, 12978]
- **Secondary syphilis (snail-track ulcers)** — Serpiginous oral ulceration with sloughy mucous patches; systemic malaise. [paras 6002–6003]
- **Hairy leucoplakia (cheek/tongue)** — EBV-driven corrugated white plaque in HIV/transplant; cannot be wiped off. [para 6032, 12467]
- **Oral papilloma (HPV)** — White/pink papular oral growths; STD/AIDS link possible; excision biopsy. [paras 6010–6011, 1906]
- **Pyoderma gangrenosum (oral)** — Rare ulcerative oral/skin condition associated with IBD. [para 13993]
- **Coeliac disease (oral)** — Recurrent aphthous stomatitis as sole symptom; also angular cheilitis, glossitis. [paras 6386–6387]
- **Ulcerative colitis (oral)** — Aphthous-like ulcers; rare pyostomatitis vegetans. [paras 6388–6389]
- **Crohn's disease (oral)** — Linear long-standing ulcers, cobblestoning, mucosal tags; may predate GI symptoms. [paras 6390–6391, 11701]
- **Dermatomyositis (oral)** — Mouth ulcers and soreness; 15% associated with internal malignancy. [paras 6379–6380]
- **SLE (oral)** — Oral ulceration, purpura, white plaques on buccal mucosa; ANA. [paras 6371–6372]
- **Polyarteritis nodosa** — Systemic vasculitis with oral ulceration and neuropathy. [para 13816]
- **Sarcoidosis (oral)** — Multisystem granulomatous disease; oral lesions may be presenting feature. [paras 7267–7268, 14284]
- **Kaposi's sarcoma (oral)** — HHV-8-related vascular tumour on oral mucosa in AIDS; red-purple pigmented lesion. [paras 6165–6166, 7520]
- **Addison's disease (buccal melanosis)** — Diffuse melanotic pigmentation of buccal mucosa. [paras 6420, 10875, 12062]
- **Cushing syndrome (oral candidosis, moon face)** — Excess cortisol; oral thrush, moon face, facial acne. [para 6422]
- **Histoplasmosis (oral)** — Oral ulceration or indurated lesion in immunocompromised; *Histoplasma capsulatum*. [paras 12535–12536]
- **CMV oral ulceration** — Oral ulceration/mucositis in immunocompromised; may mimic aphthae. [para 11768]
- **Darier's disease** — Genodermatosis with warty papules; oral lesions as white cobblestone plaques. [para 11773]
- **Hailey–Hailey disease** — Rare blistering disorder with oral and skin erosions. [para 11157]
- **Pachyonychia congenita** — Rare ectodermal dysplasia with oral leukoplakia/white plaques. [para 13515]
- **Dyskeratosis congenita** — Inherited leucoplakia with nail dystrophy/skin pigmentation; oral plaques have premalignant potential. [paras 6199–6200]
- **Oral pigmented naevi** — Benign melanocytic lesions of oral mucosa; differentiate from melanoma. [para 13237]
- **Immunosuppression — opportunistic oral infections** — Corticosteroids, ciclosporin, azathioprine, cytotoxics; candidiasis, herpetic ulceration. [paras 7599–7600]
- **HIV-associated candidosis (presenting sign)** — Erythematous, pseudomembranous, or hyperplastic candidosis in young patient; early HIV indicator. [paras 6452–6453]
- **Exfoliative stomatitis** — Widespread mucosal desquamation; drug-related or systemic blistering. [para 12136]

### tongue (currently 8 entries)

- **Macroglossia** — Enlarged tongue: developmental (Down, Beckwith–Wiedemann) or acquired (acromegaly, amyloidosis). [paras 6231–6232, 10450, 7211]
- **Glossodynia / sore tongue** — Burning/sore tongue ± visible changes; iron, B12, candidosis, LP. [paras 6243–6244, 12405]
- **Lymphangioma (tongue)** — Developmental lymphatic lesion; enlarged tongue/cheek/lip (microcystic) or neck (macrocystic). [paras 5795–5796]
- **Tuberculosis oral ulcer (tongue)** — Deep painful ulcer with raised borders, posterior tongue dorsum; immunocompromised/HIV. [paras 5997–5998]
- **Strawberry / raspberry tongue (scarlet fever)** — Streptococcal infection in 4–8 yr-olds; reddened tongue with prominent papillae. [paras 5995–5996, 14289]
- **Syphilitic leucoplakia** — White patch on dorsum of tongue in tertiary syphilis; premalignant. [paras 6123–6124]
- **Amyloidosis (macroglossia, xerostomia)** — Primary AL amyloid; gingival biopsy (Congo red) diagnostic. [para 7211]
- **Lingual thyroid** — Ectopic thyroid at tongue base; midline tongue mass; isotope scan before excision. [paras 7366–7367, 12896]
- **Melkersson–Rosenthal syndrome** — Facial paralysis + orofacial oedema + fissured tongue; OFG variant. [paras 10513–10514, 13097]
- **Hypothyroidism (macroglossia, delayed eruption)** — Congenital: macroglossia, puffy lips, delayed eruption. Adult: facial puffiness. [para 6424]
- **TUGSE** — Persistent oral ulcer with eosinophilic infiltrate; mimics malignancy. [para 14726]
- **Anaemia oral manifestations (atrophic glossitis, burning tongue)** — Iron/B12/folate deficiency; sore atrophic tongue, burning mouth, angular cheilitis. [paras 6403, 10964]

### floor-of-mouth (currently 4 entries)

- **Dermoid cyst** — Developmental midline cyst above mylohyoid; tongue elevation + FOM swelling; conservative excision. [paras 5773–5774]
- **Herpetiform ulcers** — Crop of up to 100 tiny painful ulcers mainly on FOM and tongue; recur continuously; older women. [paras 6063–6064]
- **Hereditary angio-oedema (FOM swelling)** — C1-esterase inhibitor deficiency; recurrent FOM/lip/neck swelling. [paras 6266–6267]
- **Erythroplakia (FOM site)** — Bright red velvety plaque; ≥85% are CIS or frank SCC; FOM is high-risk site. [paras 6192–6193]
- **Erythroleucoplakia (FOM)** — Mixed red/white plaque with elevated malignant transformation risk. [paras 6190–6191]
- **Torus mandibularis** — Bony exostoses on lingual premolar/molar region; developmental; excise only if denture requires. [paras 5804–5805]
- **Intraoral lipoma (FOM)** — Benign adipose tumour; soft compressible swelling. [para 12900]

### palate (currently 5 entries)

- **Submucous cleft palate** — Cleft of palate with intact overlying mucosa; missed until abnormal speech; velopharyngeal insufficiency. [paras 2636–2637]
- **Inflammatory papillary hyperplasia of the palate** — Palatal mucosal overgrowth under ill-fitting denture; Candida-associated. [paras 4651–4652, 11904]
- **Angina bullosa haemorrhagica** — Sudden blood blister on soft palate/cheeks/tongue during eating; benign; must exclude pemphigoid/pemphigus. [paras 6095–6096, 10995]
- **Herpangina** — Coxsackie A in children; small painful ulcers on uvula, palate, fauces; self-limiting 3–5 days. [paras 1884, 6024–6025, 12524]
- **Tertiary syphilis — gumma** — Necrotic granulomatous ulcer of palate or tongue; may perforate palate. [paras 6003–6004]
- **Oral malignant melanoma** — Rare intraoral malignancy; dark, rapidly enlarging irregular lesion; very poor prognosis. [paras 6167–6168]
- **Oral warts / squamous papillomata** — HPV-associated papillated pink/white asymptomatic lumps; excision biopsy. [paras 5799–5801]
- **Palatal petechiae (ITP / purpura)** — Platelet deficiency; palatal petechiae/bruising; also glandular fever, rubella, HIV, vomiting. [para 6413]
- **Marfan syndrome (high-arched palate)** — AD; high-arched palate, joint laxity, aortic dissection risk. [paras 10511–10512]
- **Stickler syndrome (cleft palate variant)** — Cleft palate (20%), flat mid-face, myopia, retinal detachment; 30% of Robin sequence. [paras 10547–10548, 14489]
- **Robin sequence (Pierre Robin)** — Micrognathia, cleft palate, glossoptosis; 30% have Stickler. [paras 10535–10536, 14208]
- **Larsen syndrome** — Cleft palate, flattened facies, multiple congenital joint dislocations. [paras 10503–10504]

### throat (currently 3 entries)

- **Eagle syndrome** — Elongated styloid process; dysphagia and pain on chewing or turning head. [paras 10468–10469, 12002]
- **Trotter syndrome** — Unilateral deafness + trigeminal mandibular pain + ipsilateral palatal immobility + trismus from nasopharyngeal malignancy. [paras 10553–10554, 14743]
- **Oral gonorrhoea (pharyngitis)** — Non-specific stomatitis/pharyngitis, superficial ulcers, purulent gingivitis; oro-genital contact. [paras 6007–6008]
- **Glandular fever (oropharyngeal)** — EBV pharyngitis with tonsillar exudate, lymphadenopathy, oral ulceration; mimics tonsillitis. [paras 12400, 12679]

### muscles (currently 3 entries)

- **TMJ internal derangement / disc displacement** — Anterior disc displacement; click at 2–3mm opening; locking when disc fails to reduce. [paras 6540–6557]
- **TMJ ankylosis** — Bony/fibrous union restricting jaw movement, usually post childhood intracapsular fracture/infection. [paras 6807–6808]
- **TMJ dislocation** — Condyle anterior to articular eminence with mouth locked open; acute or recurrent. [paras 6815–6816]
- **Condylar hyperplasia** — Rare progressive unilateral condylar overgrowth; facial asymmetry, occlusal discrepancy. [paras 6817–6818, 11622]
- **TMJ arthritides (RA, psoriatic, gouty)** — Inflammatory arthritis of TMJ; joint pain, stiffness, tenderness, crepitus. [paras 6821–6822, 13956]
- **TMJ osteoarthrosis** — Degenerative condylar cartilage disease; crepitus, limited painful movement, X-ray condylar erosions; self-limiting ~3 years. [paras 6823–6824]
- **Systemic sclerosis (oral, restricted opening)** — Diffuse CT sclerosis; restricted mouth opening, dysphagia, waxy facies, Raynaud's. [paras 6375–6376]
- **Rheumatoid arthritis (TMJ)** — TMJ pain, swelling, limited opening; 10% of RA cases; pannus possible. [paras 6369–6370, 7430]
- **Juvenile idiopathic arthritis (TMJ ankylosis)** — TMJ ankylosis and restricted opening in children. [paras 7432–7433, 12797]
- **Ankylosing spondylitis (TMJ)** — Seronegative arthritis with TMJ involvement, limited opening. [para 11003]
- **Polymyalgia rheumatica** — Linked to temporal arteritis; jaw claudication. [para 13819]
- **Polymyositis** — Inflammatory myopathy with masticatory muscle involvement. [para 13820]
- **Orofacial dyskinesia** — Phenothiazines, metoclopramide, or Parkinson's; repetitive orofacial movements; metoclopramide may cause masseteric trismus. [para 6448]

### periodontal (currently 7 entries)

- **Furcation involvement** — Bone loss into bi-/trifurcation, classified I–III; mobility, deep pocketing, or incidental radiographic finding. [paras 3289–3299]
- **Residual / persistent pocketing** — Deep supra-alveolar or infrabony pockets remaining after non-surgical therapy; reassessment, possible surgery. [paras 3338–3339]
- **Tooth mobility (periodontal/occlusal)** — Pathological mobility I–III from loss of support or occlusal overload. [paras 3319–3331]
- **Peri-implant mucositis** — Reversible plaque-induced inflammation of soft-tissue cuff around an implant; bleeding on probing. [paras 3333, 5352]
- **High frenal attachment** — Fibrous frenum close to gingival margin; impedes plaque control or contributes to recession. [paras 3274–3275]
- **Aggressive periodontitis (localised/generalised)** — Rapid severe attachment loss disproportionate to plaque; molars/incisors localised in younger patients; familial. [paras 2750–2752, 3084]
- **Necrotising ulcerative periodontitis (NUP)** — Extension of NUG with attachment/bone loss; severe in immunocompromised. [paras 3103–3107]
- **Periodontitis as manifestation of systemic disease** — Severe/refractory/atypical periodontitis from underlying systemic disease (diabetes, haematological, immunodeficiency). [para 2754]
- **Mucous membrane (cicatricial) pemphigoid (desquamative gingivitis)** — Subepithelial bullae that rupture and scar; desquamative gingivitis; conjunctival scarring; women >60. [paras 6097–6098]
- **Combined perio–endo lesion** — Coexisting periodontal pocket and pulp necrosis coalesced; deep narrow pocket to apex, non-vital tooth. [paras 3127–3132, 5172]
- **Pyogenic granuloma (pregnancy/non-pregnancy)** — Red fleshy nodular swelling from recurrent trauma; bleeds easily. [paras 5781–5782]
- **Pregnancy epulis** — Exaggerated inflammatory response to plaque during pregnancy; indistinguishable from pyogenic granuloma. [paras 5779–5780]
- **Peripheral giant cell granuloma** — Deep red gingival swelling from chronic irritation; vascular, multinuclear giant cells. [paras 5777–5778]
- **Congenital epulis** — Benign soft-tissue swelling on alveolar ridge of neonates. [paras 11631, 12099]
- **Leukaemia-associated gingivitis** — Gingival enlargement, spontaneous bleeding from leukaemic infiltrate; may be presenting sign. [paras 2742, 6407]
- **Cyclical neutropenia** — Recurrent oral ulceration, acute periodontal flares, NUG in 3–4 week cycles. [para 6409]
- **HIV gingivitis / linear gingival erythema** — Severe gingivitis with intense red band at margin disproportionate to OH. [paras 6456–6457]
- **HIV periodontitis** — Severe localised rapid periodontal destruction in HIV+ patient. [paras 6460–6461]
- **Hereditary gingival fibromatosis** — Genetic dense fibrous gingival overgrowth covering crowns; may delay eruption. [para 2746]
- **Scurvy gingivitis** — Vitamin C deficiency; severe haemorrhagic gingivitis, oedematous purplish tissues; rare. [para 2745]
- **Puberty gingivitis** — Plaque-induced gingivitis exacerbated by pubertal hormonal changes in adolescents. [para 2741]
- **Ehlers–Danlos syndrome (oral)** — Severe early-onset periodontitis, easy bleeding, hypermobile TMJ; risk of IE. [paras 6367–6368, 10470]
- **Chediak–Higashi syndrome** — Defective neutrophil function; severe gingivitis, periodontitis, aphthae in young children. [paras 10458–10459]
- **Papillon–Lefèvre syndrome** — Palmoplantar hyperkeratosis + aggressive periodontitis affecting both dentitions from childhood. [paras 10519–10520, 13595]
- **Bleeding disorders (post-extraction haemorrhage)** — Coagulopathy; prolonged bleeding post-extraction, spontaneous gingival haemorrhage. [paras 11194, 11200]
- **ITP (palatal petechiae, gingival bleeding)** — Platelet deficiency; oral petechiae, gingival bleeding, difficult haemostasis. [paras 12618–12619]
- **Diabetes mellitus oral manifestations** — Severe periodontal disease, xerostomia, candidiasis, sialosis, burning mouth, lichenoid reactions. [paras 6432, 11919]
- **Pregnancy/puberty/menopause oral manifestations** — Hormonal exacerbations of gingivitis; menopausal burning mouth or oral soreness. [para 6434]

### primary-dentition (currently 7 entries)

- **Natal teeth** — Teeth present at birth, usually lower primary incisors; aspiration risk; Riga-Fede ulceration. [paras 1137, 13248]
- **Teething** — Local gingival discomfort and disturbed sleep during primary tooth eruption. [para 1139]
- **Eruption cyst** — Bluish fluctuant soft-tissue swelling over an erupting tooth in a child; usually self-resolves. [paras 1141, 11759]
- **Premature exfoliation of primary teeth** — Early tooth loss; systemic causes (neutropenia, leukaemia, hypophosphatasia) — urgent referral. [paras 1164, 1250]
- **Hypomineralised second primary molars (HSPM)** — Developmental enamel defect sharing features with MIH; post-eruptive breakdown, hypersensitivity. [paras 1231–1232]
- **Gemination / fusion (double teeth)** — Developmental anomaly: unusually wide or doubled crown. [paras 1256–1263, 11978]
- **Non-vital primary molar pulp** — Death of primary molar pulp from caries or trauma; inter-radicular radiolucency, sinus, swelling. [paras 1569–1582]
- **Post-traumatic discolouration of primary teeth** — Grey/reddish = reversible; later grey = necrosis; yellow = calcification. [paras 1678–1681]
- **Traumatic ankylosis of primary tooth** — PDL damage → bony replacement → infra-occlusion → extraction. [paras 1682–1683]
- **Premature loss of primary teeth (centre-line shift)** — Early loss of primary canines/first molars; drifting → arch asymmetry. [paras 2183–2191]
- **Hypophosphatasia (premature exfoliation)** — Metabolic disorder causing cementum aplasia; premature exfoliation of primary teeth. [para 1250]

### permanent-dentition (currently 10 entries)

- **Dental caries — arrested** — Inactive lesion, hard/leathery, dark; can stabilise/regress under favourable conditions. [paras 548–550]
- **Root surface caries** — Caries on exposed root dentine after recession; >40 yrs; reduced saliva, medications, high sugar. [paras 559–560, 3746–3747]
- **Pit and fissure caries** — Hard to detect early; rapid progression; less responsive to fluoride; sealant or restoration. [paras 585–587]
- **Approximal caries** — Interproximal lesion radiographic detection; preventive if enamel only, restored if dentine involved. [paras 587–591]
- **Radiation caries** — Rapidly progressing cervical caries post head/neck RT; radiation-induced xerostomia. [paras 1522, 14004]
- **Rampant caries** — Rapidly progressing caries affecting multiple teeth; may affect resistant surfaces. [paras 1520–1521]
- **Dental fluorosis** — Chronic excess fluoride; white opacities to severe pitting; endemic in high-fluoride water. [paras 618, 1215, 12285]
- **Chronological hypoplasia** — Enamel defects distributed chronologically from systemic insult during development. [paras 1212–1214]
- **Enamel hypoplasia (general)** — Pitted, grooved, thinned enamel from matrix disturbance; aesthetic and structural concern. [para 1197]
- **Amelogenesis imperfecta** — Hereditary enamel disorder; hypoplastic/hypocalcified/hypomaturation forms; sensitivity, aesthetics. [paras 1233–1240]
- **Dentinogenesis imperfecta** — Hereditary dentine disorder; opalescent brown/blue teeth, bulbous crowns, short roots; OI association. [paras 1242–1248, 7394]
- **Hypercementosis** — Excessive cementum; bulbous root on radiograph; complicates extraction. [paras 1250–1251]
- **Dens in dente (dens invaginatus)** — Marked palatal invagination (commonly upper lateral); predisposes to early pulp death. [paras 1269–1270, 11810]
- **Dilaceration** — Distortion of crown/root from trauma to predecessor; commonly upper central incisor. [paras 1271–1274, 11943]
- **Turner tooth** — Localised enamel/dentine hypoplasia of a permanent premolar from periapical infection of overlying primary. [paras 1276–1277, 14754]
- **Tetracycline intrinsic staining** — Grey-brown banded discolouration from tetracycline incorporation during mineralisation. [paras 1284–1286]
- **Discoloured root-filled tooth** — Grey/brown of endodontically treated tooth; non-vital bleaching or post-retained crown. [paras 3851–3852]
- **Tooth sensitivity following whitening** — Transient sensitivity and gingival irritation from bleaching; resolves after cessation. [paras 3824–3825]
- **Cervical resorption following non-vital bleaching** — Thermocatalytic internal bleaching → cervical resorption; pink spot, widened PDL, pain. [paras 3863–3864]
- **Localised white-spot enamel (post-ortho/fluorosis/hypoplasia)** — Outer enamel discolouration amenable to microabrasion. [paras 3865–3866]
- **Crown fracture — enamel and dentine** — Exposed dentine needs protection; composite + calcium hydroxide base. [paras 1692–1693]
- **Crown fracture with pulp exposure** — Pulp cap, Cvek pulpotomy, or full pulpotomy depending on exposure size, root maturity, time elapsed. [paras 1705–1724]
- **Root fracture (permanent tooth)** — <10% of permanent injuries; prognosis depends on level and gingival crevice communication. [paras 1726–1737]
- **Concussion / subluxation of tooth** — Mild traumatic injury without displacement (concussion) or with PDL injury (subluxation); tender to percussion. [paras 11616]
- **Lateral luxation of permanent tooth** — Labial/lateral/palatal displacement; prompt repositioning, flexible splinting. [paras 1760–1762]
- **Intrusive luxation of permanent tooth** — Tooth driven into socket, often with alveolar fracture; high risk of pulp death/root resorption. [paras 1765–1766]
- **Extrusive luxation of permanent tooth** — Partial displacement from socket; reposition under LA, splint 1–2 weeks. [paras 1767–1768]
- **Post-traumatic internal root resorption** — Chronic pulpal inflammation; progressive dentine resorption; pulp extirpation + calcium hydroxide. [paras 1833–1834]
- **Post-traumatic external root resorption** — PDL damage → surface/replacement/inflammatory resorption; replacement is progressive. [paras 1835–1836]
- **Post-traumatic root canal obliteration** — 6–35% of luxation injuries; calcification of pulp canal; necrosis only 13–16%. [paras 1837–1838]
- **Congenitally absent upper lateral incisor** — ~2% of population; associated with displaced canines; orthodontic or prosthetic management. [paras 1840–1842]
- **Median diastema** — Space between upper central incisors; frenum, peg/absent lateral incisor, midline supernumerary; ~7% adolescents. [paras 2240–2251]
- **Failure of/delayed eruption** — Eruption sequence disruption >6 months; crowding, supernumerary, retained primary, dentigerous cyst, systemic causes. [paras 1143–1158]
- **Ectopic eruption of first permanent molar** — Upper 6 impacts against distal of E; 2–5% of children. [paras 1162, 12014]
- **Impacted upper first permanent molar (general)** — Prevalence 2–6%; impacts against distal of E; rare spontaneous disimpaction after age 8. [paras 2179–2180]
- **Root resorption from impacted canine** — Palatally displaced/impacted canine resorbs lateral/central incisor roots; urgent referral. [paras 2287–2288]
- **Hypodontia (oligodontia)** — Developmental absence of permanent teeth; 3.5–6.5% prevalence; upper laterals, second premolars, third molars. [paras 1169–1178, 12588]
- **Hyperdontia (supernumerary teeth)** — Extra teeth, most common in premaxilla; can cause crowding, displacement, eruption failure. [paras 1179–1192, 12577]
- **Generalised spacing (hypodontia/microdontia)** — Spacing from hypodontia, microdontia, or disproportionate jaws; combined restorative-ortho. [paras 2238–2239]
- **Reversible / irreversible / chronic pulpal damage** (existing entries cover the core) — see also occlusal overload: pain on biting, hot/cold sensitivity, possible mobility from excessive occlusal contacts; bruxism-associated. [paras 3439–3444]
- **Sclerosed / obliterated root canal** — Pulp canal obliteration post-trauma/age; relevant if pulp necrosis needs RCT but canal hard to find. [paras 5154–5156]
- **Pulp stones** — Calcifications in pulp chamber/canal; obstruct RCT access; may be incidental radiographic finding. [paras 5156–5158]
- **Endodontic instrument fracture** — Separated file within a root canal; bypass, ultrasonic retrieval, or periradicular surgery. [paras 5158–5160]
- **Root canal perforation** — Iatrogenic communication root canal ↔ periodontium; or from pathological resorption. [paras 5165–5170]
- **Persistent/recurrent periapical periodontitis after RCT** — Periapical pathology persists/develops/recurs post-RCT; reassessment or retreatment. [paras 5198–5200]
- **Pericoronitis** — Inflammation/infection of operculum over partially erupted tooth (usually lower 8); pain, swelling, foul taste. [paras 5729–5730]
- **Dry socket (alveolar osteitis)** — Post-extraction pain onset 2–4 days; exposed necrotic bone; smoking/OCP risk. [paras 5731–5734, 11994]
- **Radicular (inflammatory) cyst** — Very common; arises from necrotic pulp; apical/lateral/residual; painless unless infected. [paras 5828–5829]
- **Dentigerous cyst** — Forms around crown of unerupted tooth from reduced enamel epithelium; can delay eruption; painless buccal expansion. [paras 5832–5833]
- **Compound/complex odontome** — Malformation of dental hard tissues; compound = denticles, complex = irregular mass; often incidental on X-ray. [paras 5868–5869]
- **Drug-induced perimolysis (bulimia)** — Severe palatal erosion of upper teeth from repeated vomiting; GDP often first to suspect ED. [para 7592] — note: existing guide has psychological/ED erosion entry
- **GORD-related erosion** — Reflux esophagitis; bad taste, sore throat, tooth erosion from acid regurgitation. [paras 7273–7274]
- **Mental nerve compression by denture** — Aching electric-shock sensation along lower lip/chin in edentulous after resorption. [paras 6834–6835]
- **Congenital syphilis (Hutchinson incisors, mulberry molars)** — Peg-shaped notched incisors, mulberry molars from transplacental T. pallidum. [paras 6005–6006, 11633]
- **Taurodontism** — Enlarged pulp chambers in molars; marker for several syndromes. [para 14585]
- **Epidermolysis bullosa (oral)** — Inherited blistering disorder; trauma triggers bullae/erosions; scarring limits function; caries susceptibility. [paras 6092, 12090]
- **Bridge abutment tooth loss of vitality** — Pulp necrosis in bridge abutment; spontaneous pain, periapical tenderness; RCT often through retainer. [paras 4235–4246]
- **Rickets (oral effects)** — Vitamin D deficiency; enamel and dentine defects in children. [para 14202]
- **Hyperparathyroidism (jaw lesions, lamina dura loss)** — Loss of lamina dura, ground-glass bone, multilocular "brown tumour"; primary or secondary HPT. [paras 6430, 7358, 5771]
- **Chronic kidney disease (renal osteodystrophy)** — Renal osteodystrophy + secondary HPT; jaw lesions on radiographs. [paras 7319–7327]
- **Gigantism/acromegaly (jaw enlargement, tooth spacing, mandibular prognathism)** — Excess GH post epiphyseal fusion; spacing, prognathism, macroglossia. [paras 7350–7351, 6418]
- **Osteogenesis imperfecta (DI association, fracture risk)** — Type 1 collagen defect; DI, blue sclera, multiple fractures; GDP may diagnose DI first. [paras 7394–7395]
- **Osteopetrosis (jaw infection risk, poor healing)** — Increased bone density, poor vascularity; jaw prone to infection difficult to eradicate; pathological fractures. [paras 7396–7397]
- **Cleidocranial dysostosis (multiple unerupted teeth)** — Membranous bone formation defect; multiple unerupted permanent teeth, retained primaries. [paras 7400–7401, 10460]
- **Pycnodysostosis** — Micrognathia, osteopetrosis, dwarfism; extractions high-risk. [paras 10527–10528, 13992]
- **MRONJ / BRONJ** — Exposed necrotic jaw bone from bisphosphonate/denosumab/anti-angiogenic; non-healing socket; pain or painless. [paras 5510, 7405, 11054]
- **Hypohydrotic ectodermal dysplasia** — Hypodontia with absent/sparse hair, sweat glands; saddle nose. [paras 10495–10496]
- **Zollinger–Ellison syndrome (erosion)** — Gastrin-secreting tumour; severe GORD with possible oral erosion. [para 14904]
- **Restoration failure — aesthetics** — Discoloured/stained restoration; amalgam corrosion, composite staining, underlying dentine discoloration. [paras 3776–3777]
- **Restoration failure — marginal integrity/ditching** — Amalgam creep or composite shrinkage; gap/step at margin; risk of secondary caries. [paras 3778–3780]
- **Restoration failure — bulk fracture** — Restorative material fracture from heavy occlusal loading, poor cavity design, inadequate bonding. [paras 3781–3782]

### fixed-prosthesis (currently 6 entries)

- **Implant fracture** — Fracture of the fixture itself; mobility or loss of prosthesis without bone loss. [paras 5314–5315]
- **Abutment screw fracture / loosening** — Loose mobile implant crown; patient notices movement or clicking. [paras 5316–5318]
- **Implant prosthesis complication** — Porcelain fracture, acrylic wear, clip failure on overdenture, cement failure; loose implant-retained restoration. [paras 5316–5317]
- **Early implant failure (failure to osseointegrate)** — Mobility/pain within 2 yrs; inadequate prep, overheating, infection, premature loading. [paras 5348–5350]
- **Late implant failure** — Loss of osseointegrated implant from overloading or peri-implantitis; mobility, pain, bone loss. [paras 5348–5350]

### removable-prosthesis (currently 6 entries)

- **Inflammatory papillary hyperplasia of the palate** — Lumpy red palatal mucosa under ill-fitting denture; Candida-associated; see palate gap too. [paras 4651–4652]
- **RPD gingival stripping** — Tissue-borne acrylic partial sinks and traumatises gingivae of abutment teeth; recession, soft-tissue trauma, mobility. [paras 4335–4365]
- **Paget's disease — ill-fitting dentures** — Chaotic bone remodelling enlarges jaws; ill-fitting dentures, hypercementosis; BRONJ risk. [paras 7411–7412]

### psychological (currently 3 entries)

- **Dental phobia (avoidance, neglected dentition)** — Phobic anxiety; avoidance leads to severely neglected dentition presenting in crisis. [paras 7590–7591]
- **Atypical facial pain** — Chronic unrelenting facial pain not conforming to nerve distributions; diagnosis of exclusion; 50% depression; tricyclics. [paras 6350–6351, 11110]

### lifestyle (currently 5 entries)

(No new entries — existing covers the core lifestyle drivers. The handbook's treatment of substance abuse, smoking, alcohol, and diet is well represented by the current five entries.)

---

## Origins outside the canonical 15

The handbook describes a substantial body of conditions that don't fit any of the current 15 origins. These would either need new origins or a "miscellaneous" container. Listed here so the user can decide whether to extend the taxonomy.

### other-jaw / other-jaw-fracture (jaw bone pathology and fractures)

- **Mandibular fracture** — Commonest facial skeleton fracture; inability to occlude, lingual haematoma, step deformity, IDN paraesthesia. [paras 6676–6692, 11621]
- **Le Fort I / II / III fractures** — Lower maxillary / pyramidal mid-face / craniofacial dysjunction respectively; characteristic clinical signs. [paras 6694–6708]
- **Zygomatic (malar) fracture** — Periorbital bruising, subconj haemorrhage, diplopia, infra-orbital paraesthesia, cheek flattening. [paras 6712–6716]
- **Orbital floor (blowout) fracture** — Enophthalmos, diplopia in upgaze, "hanging drop" sign. [paras 6717–6718]
- **White-eye blowout fracture (paediatric)** — Trapdoor with no external bruising; severe pain, intractable vomiting; 48h emergency. [paras 6719–6720]
- **Retrobulbar haemorrhage** — Painful proptosed eye, decreasing visual acuity; emergency lateral canthotomy. [paras 6698–6699]
- **Nasal fracture** — Nasal bone disruption with deviation, epistaxis, obstruction. [paras 6721–6722]
- **NOE (nasoethmoidal) fracture** — Telecanthus, bilateral black eyes, nasal depression, CSF leak. [paras 6723–6724]
- **Septal haematoma** — Post-traumatic blood between septal cartilage and perichondrium; emergency drainage. [paras 6725–6726]
- **Condylar fracture** — Mandibular condyle fracture; pain, swelling, limited opening; deviation on opening. [para 11621]
- **Alveolar bone fracture during extraction** — Fracture of alveolar bone (incl. tuberosity); pain, mobility of adjacent teeth. [paras 5500–5502]
- **Odontogenic keratocyst (OKC)** — Rapidly growing jaw cyst; parakeratinized; multilocular X-ray; high recurrence from daughter cysts. [paras 5834–5835]
- **Aneurysmal bone cyst** — Expansile vascular spongy bone lesion; painless jaw swelling; trauma → rapid expansion. [paras 5840–5841, 11754]
- **Ameloblastoma** — Commonest odontogenic tumour; posterior mandible; unicystic or polycystic; rare metastases. [paras 5858–5859]
- **Pindborg tumour (CEOT)** — Rare odontogenic tumour with characteristic calcifications on OPG. [para 13783]
- **Odontogenic myxoma** — Locally aggressive jaw tumour from odontogenic ectomesenchyme. [para 13235]
- **Solitary osteoma** — Benign bone-forming tumour; may arise in jaw (Gardner association). [para 13490]
- **Ossifying fibroma** — Well-demarcated fibro-osseous jaw lesion; painless buccal/lingual cortex expansion; radiolucent with radio-opaque margin. [paras 5855, 13485]
- **Central giant cell granuloma (intra-osseous)** — Painless intra-osseous swelling or incidental radiolucency. [paras 5806–5807, 12384]
- **Paget's disease of bone** — Jaw involvement (maxilla > mandible) in >55s; bony swelling, hypercementosis, 'cotton wool' X-ray; raised ALP. [paras 5810–5811]
- **Fibrous dysplasia** — Childhood-onset painless hard jaw swelling; ground-glass X-ray; bone replaced by fibrous tissue. [paras 5812–5813, 12203]
- **Cherubism** — Hereditary bilateral fibrous dysplasia variant in 2–4 yr olds; bilateral jaw swelling. [paras 5814–5815]
- **Brown tumour (hyperparathyroidism)** — Giant cell soft-tissue or intra-osseous lesion from HPT; raised Ca²⁺/PTH; regresses once treated. [paras 5771–5772]
- **Myeloma (jaw)** — Macroglossia from amyloid; osteolytic punched-out jaw lesions; pain, paraesthesia, pathological fracture. [paras 6411, 7203]
- **Histiocytosis-X (Langerhans cell histiocytosis)** — Solitary eosinophilic granuloma (mandible common), Hand–Schüller–Christian, Letterer–Siwe (fatal). [paras 10486–10490]
- **Actinomycosis** — *Actinomyces israelii*; persistent low-grade infection with sinuses and woody swelling; prolonged amoxicillin. [paras 5735–5736]
- **Staphylococcal cervicofacial lymphadenitis** — Lymph node infection in children; may mimic slapped face; drainage + flucloxacillin. [paras 5737–5738]
- **Atypical mycobacterial lymphadenitis** — Cold, non-tender cervical lymphadenopathy in children; excision definitive. [paras 5739–5740]
- **Necrotising fasciitis (cervicofacial)** — Rare, rapidly fatal; necrotic tissue; wide excision + IV antibiotics + resuscitation. [paras 5743–5744]
- **Cervicofacial lymphadenopathy (general)** — Reactive (dental abscess, glandular fever) vs pathological (lymphoma, metastatic, leukaemia, TB). [paras 6487–6506]

### other-salivary

- **Bacterial sialadenitis (acute/chronic)** — Painful unilateral major gland swelling, purulent duct discharge. [paras 6276–6277]
- **Mumps (viral sialadenitis)** — Acute bilateral parotid swelling in children/young adults. [para 6277]
- **Sjögren syndrome** — Autoimmune xerostomia + keratoconjunctivitis sicca ± CTD; 5% salivary lymphoma risk. [paras 6290–6291]
- **Pleomorphic salivary adenoma (parotid)** — Commonest benign salivary tumour; firm slow-growing parotid swelling; recurrence if enucleated. [paras 6292–6293, 6913]
- **Warthin's tumour (adenolymphoma)** — Benign cystic parotid tumour in older male smokers; bilateral in 10%; soft fluctuant. [paras 6913–6914]
- **Acinic cell carcinoma** — Malignant salivary gland tumour; firm enlarging parotid mass. [para 10845]
- **Salivary gland carcinoma (adenoid cystic, mucoepidermoid)** — Pain, rapid growth, facial nerve involvement; perineural spread. [paras 6292–6294, 6915]
- **Recurrent parotitis of childhood** — Episodic unilateral parotid swelling in children, distinct from mumps. [para 14060]
- **Mikulicz disease (lymphoepithelial lesion)** — Chronic salivary/lacrimal gland enlargement, distinct from Sjögren's. [para 12969]
- **Sialolithiasis — parotid** — Recurrent episodic pain and swelling of parotid provoked by eating. [paras 6933–6934]
- **Sialosis (non-inflammatory parotid enlargement)** — Bilateral parotid enlargement; eating disorders, alcoholism, diabetes. [para 14358]
- **HIV-associated salivary disease** — Lymphoepithelial cysts or focal lymphocytic sialadenitis of parotid; more common in HIV children. [para 6469]

### other-craniofacial / other-syndromic

- **Cleft lip and palate** — Congenital orofacial cleft; unilateral/bilateral, complete/incomplete; 1:1000 Caucasian births. [paras 2630–2673]
- **Dental anomalies associated with CLP** — Hypodontia, supernumerary, hypoplasia, delayed eruption in cleft region. [paras 2647–2648]
- **Class III in repaired CLP** — Skeletal Class III from restricted maxillary growth post primary cleft surgery. [paras 2669–2672]
- **Hemifacial microsomia** — 1:5000 births; unilateral hypoplasia of ramus/condyle/soft tissue; first/second arch defect. [paras 10484–10485]
- **Apert syndrome** — Craniosynostosis + syndactyly; severe mid-face retrusion, exophthalmos; ICP risk. [paras 10448–10449]
- **Crouzon syndrome** — Commonest craniosynostosis; mid-face hypoplasia, proptosis, beaten-copper skull radiograph. [paras 10464–10465]
- **Treacher Collins syndrome** — Autosomal dominant first-arch defect; mandibular retrognathia, malar hypoplasia, deafness, cleft palate in 30%. [paras 10551–10552, 14729]
- **Goldenhar syndrome** — Variant of hemifacial microsomia; microtia, macrostomia, absent ramus, epibulbar dermoids. [paras 10476–10477]
- **Binder syndrome (maxillonasal dysplasia)** — Severe mid-facial retrusion; hypoplastic frontal sinuses; no intellectual deficit. [paras 10454–10455]
- **Down syndrome (trisomy 21)** — Macroglossia, delayed eruption, mid-face retrusion; atlanto-axial subluxation; cardiac defects. [paras 10466–10467]
- **Beckwith–Wiedemann syndrome** — Macroglossia, exomphalos, gigantism; tongue reduction sometimes required; hypoglycaemia risk. [paras 10450–10451]
- **Cri du chat syndrome (5p−)** — Microcephaly, hypertelorism, intellectual disability. [paras 10462–10463]
- **Hurler syndrome (mucopolysaccharidosis)** — Coarse facies, skeletal dysostosis, corneal clouding, intellectual disability. [paras 10493–10494]
- **Klippel–Feil anomalad** — Cervical vertebral fusion, short neck; positioning relevance. [paras 10501–10502]
- **Progeria** — Rare premature ageing with dental/craniofacial abnormalities. [para 13941]
- **Castleman syndrome** — Rare massive cervical lymph node hyperplasia resembling lymphoma. [paras 10456–10457]
- **Gardner syndrome** — Multiple jaw/facial osteomas + intestinal polyps (malignant potential) + epidermoid cysts. [paras 10474–10475]
- **Gorlin–Goltz syndrome** — Multiple BCCs + multiple OKCs of jaws + bifid ribs + calcified falx cerebri. [paras 10478–10479]
- **McCune–Albright (Albright) syndrome** — Polyostotic fibrous dysplasia + café-au-lait + endocrine abnormality. [paras 10446–10447]

### other-sinus

- **Acute maxillary sinusitis** — Cheek pain/tenderness, nasal stuffiness; mimics upper molar pathology; fluid level on OM X-ray. [paras 5878–5879, 10865]
- **Chronic maxillary sinusitis** — Persistent antral infection with mucosal hypertrophy, polyps, post-nasal drip; often linked to dental cause. [paras 5880–5881]
- **Oro-antral communication (OAC, acute)** — Created during upper molar root removal; air/fluid passes between mouth and nose. [paras 5504–5505]
- **Oro-antral fistula (OAF, chronic)** — Epithelium-lined tract post-extraction; fluid reflux into nose; air bubbles on closed-nostril blow. [paras 5882–5883]
- **Implant-related sinus problems** — Implant protrusion into antrum; sinusitis or OAF symptoms. [paras 5310–5311]
- **Silent sinus syndrome** — Spontaneous maxillary sinus collapse; painless facial asymmetry, enophthalmos, diplopia. [paras 10541–10542]

### other-neuropain

- **Trigeminal neuralgia** — Excruciating paroxysmal electric-shock facial pain in trigeminal distribution; trigger zones; carbamazepine. [paras 6331–6332]
- **Post-herpetic neuralgia** — Chronic burning pain in trigeminal dermatome following HZV; may persist months/years. [paras 6022–6023]
- **Cluster headache (periodic migrainous neuralgia)** — Severe unilateral periorbital pain with autonomic symptoms; nocturnal clustering. [paras 6340–6341]
- **Temporal arteritis (giant cell arteritis)** — Severe temporal/frontal ache, jaw claudication in >70s; urgent prednisolone; raised ESR. [paras 6336–6337, 14607]
- **MS / CVA — altered facial sensation** — Intracranial lesion causing facial/oral paraesthesia or anaesthesia in trigeminal distribution. [para 6444]
- **Trigeminal nerve lesion (general)** — Sensory deficit/motor weakness of CN V; first clue to CNS or skull base pathology. [para 7450]
- **Atypical odontalgia / phantom tooth pain** — Chronic dental pain at edentulous site or sound tooth; diagnosis of exclusion; tricyclics. [paras 6351–6352]
- **IAN / lingual / mental nerve injury post extraction** — Paraesthesia or anaesthesia in dermatomal distribution; persistent if neurotmesis. [paras 5500, 7770]

### other-LA-complication

- **Local anaesthetic toxicity** — Circumoral numbness, dizziness, metallic taste, drowsiness, convulsions, cardiovascular collapse; intravascular injection. [paras 7711–7717, 8405–8415]
- **Failure of local anaesthesia** — Inadequate analgesia; poor technique, infected tissue, intravascular, dense bone. [paras 8441–8450]
- **Pain on injection / nerve contact** — Sharp electric-shock on needle contact during IDB; transient. [paras 8451–8455]
- **Haematoma following LA injection** — Traumatic vessel laceration; expanding haematoma or ischaemic patch. [paras 8457–8460]
- **Facial palsy following IDB** — Transient LMN facial palsy from LA into parotid; resolves with LA. [paras 8461–8462]
- **Needle-tract infection** — Rare infection along injection track; swelling, pain, trismus post-injection. [paras 8466–8467]
- **Lip/cheek trauma from anaesthetised soft tissue** — Patient bites anaesthetised lip/cheek; mucosal ulceration; common in children. [paras 8464–8465]
- **Needle fracture** — Rare; broken-off needle requires imaging and surgical retrieval. [paras 8460]
- **Post-intraligamentary discomfort, dry socket risk** — PDL injection; temporary extrusion soreness, increased dry socket. [paras 8436–8437]

### other-medical-emergency

- **Vasovagal syncope (fainting)** — Most common medical emergency in dental practice; transient LoC from reduced cerebral perfusion. [para 12184]
- **Adrenal insufficiency / steroid crisis** — Long-term corticosteroid patient may collapse peri-operatively; supplementation protocol. [paras 8593–8594]
- **Hypoglycaemia in diabetic patient** — Sweating, confusion, LoC; oral glucose or IM glucagon. [paras 7944–7949]
- **Acute asthma exacerbation in chair** — Bronchospasm; β2 agonist, oxygen. [implicit at 7320–7563]
- **Anaphylaxis** — Type I hypersensitivity with airway/cardiovascular compromise; IM adrenaline, oxygen, fluids. [paras 6264, 7695]
- **Acute angio-oedema** — Sudden severe facial/neck swelling; airway risk; allergic or hereditary. [paras 7695, 10997]
- **Inhaled foreign body (tooth/instrument)** — Aspirated during procedure; choking, cough, or asymptomatic; CXR, bronchoscopy. [paras 7763–7771]
- **Malignant hyperpyrexia** — Rare inherited susceptibility to volatile anaesthetic agents; relevant to GA planning. [para 12988]
- **Phaeochromocytoma — hypertensive crisis under LA/GA** — Adrenal tumour; MEN association; LA with vasoconstrictor risk. [para 13767]
- **Reye's syndrome (aspirin in children)** — Aspirin-associated hepatoencephalopathy in children; dental prescribing relevance. [para 14197]

### other-haematological

- **Haemophilia A / B — prolonged oral bleeding** — Factor VIII/IX deficiency; characteristically delayed ooze ~1h post trauma. [paras 7221–7224]
- **Von Willebrand's disease** — Combined platelet/factor VIII disorder; mucosal purpura, post-extraction bleeding. [paras 7225–7226, 14843]
- **Warfarin / NOAC anticoagulation** — Bleeding risk requires INR check or NOAC management plan before extraction. [paras 7232, 8263]
- **Platelet disorders (ITP, drug-induced thrombocytopenia)** — Purpura, nosebleeds, prolonged oral bleeding. [paras 7215–7216]
- **Myeloproliferative disorders** — Anaemia, bleeding tendency, infection susceptibility; oral/peri-op implications. [paras 7201–7202]
- **Lymphoma — neck swelling** — Solid lymphoid tumour; consider in differential of unexplained neck swelling. [para 7205]
- **Sickle cell anaemia (oral implications)** — Mucosal pallor, infarcts, perioperative implications. [para 14361]
- **Anaemia (general) — pallor, glossitis, angular cheilitis, ulcers** — Iron/B12/folate deficiency; classic oral presentation. [paras 7182–7183]
- **Leukaemia — oral presentation** — Gingival hypertrophy, spontaneous bleeding, candidosis, mucosal pallor. [paras 6407, 7199]

### other-trauma

- **Tooth fragment inhalation / soft tissue embedding** — Tooth fragments post-trauma may be inhaled or embedded in lip/soft tissues; CXR mandatory if unaccounted. [paras 1601–1602]
- **Soft tissue lip/cheek laceration with embedded debris** — Foreign body retention if not adequately explored at primary closure. [implicit at 6757–6799]
- **Traumatic hypomineralization/hypoplasia/dilaceration of permanent successor** — Trauma to primary in <4 yrs causes developmental defect in permanent successor. [paras 1686–1687]

### other-systemic (oral signs of systemic disease)

- **Liver disease (oral implications)** — Hepatitis B/C, cirrhosis: coagulopathy, impaired drug excretion, transmission risk. [paras 7290–7308]
- **Diabetes mellitus oral manifestations** — Severe periodontal disease, xerostomia, candidiasis, sialosis, burning mouth. (also under periodontal) [paras 6432, 11919]
- **Hyperparathyroidism / Hypoparathyroidism** — Jaw lesions/lamina dura loss vs hypocalcaemia tetany + enamel hypoplasia. [paras 6428, 6430]
- **Acromegaly** — Macroglossia, lip enlargement, tooth spacing, mandibular prognathism. [paras 6418, 12387]
- **Coeliac disease oral signs** — Recurrent aphthous stomatitis, angular cheilitis, glossitis; haematinic deficiency. [paras 6386–6387]
- **Crohn's / IBD oral manifestations** — Cobblestoning, mucosal tags, linear ulcers; may predate GI symptoms. [paras 6390, 11701]
- **Sarcoidosis oral lesions** — Multisystem granulomatous; oral lesions may be presenting feature. [paras 7267, 14284]
- **Osteomalacia** — Vitamin D deficiency; jaw bone softening; implant and healing implications. [para 13491]
- **Osteoporosis with bisphosphonate use** — BRONJ risk after extractions. [paras 7405–7406]
- **MEN IIb** — Oral mucosal neuromas + phaeochromocytoma + medullary thyroid carcinoma. [paras 7390–7391]
- **Infective endocarditis risk / cardiac valve disease** — Valvular damage requires dental bacteraemia control; septic foci clearance. [paras 7248–7251]
- **Myasthenia gravis** — Neuromuscular junction disorder; dysphagia, facial weakness; GA relevance. [para 13227]
- **Nephrotic syndrome (oral implications)** — Healing implications; gingival oedema possible. [para 13270]
- **Enamel-renal syndrome** — Amelogenesis imperfecta + nephrocalcinosis. [para 12061]

### other-head-neck

- **Branchial cyst** — Deep-seated cystic swelling anterior to sternomastoid at hyoid; congenital remnant prone to infection. [paras 7056–7057]
- **Cystic hygroma** — Congenital lymphatic malformation; soft transilluminable neck swelling. [para 11752]
- **Sebaceous cyst (face/neck)** — Firm slow-growing lump with central punctum. [para 11764]
- **Neurolemmoma (schwannoma)** — Benign nerve sheath tumour; intraoral or neck mass. [para 13274]
- **Laryngocele** — Air-filled laryngeal sac cyst; neck lump. [para 12831]
- **Kikuchi syndrome** — Self-limiting necrotising lymphadenitis; cervical lymphadenopathy in young adults. [para 12813]
- **Oral toxoplasmosis** — Opportunistic infection with oral/lymph node manifestations in immunocompromised. [para 14701]

### other-post-op

- **Post-extraction haemorrhage** — Persistent or recurrent socket bleeding; immediate, reactionary (<48h), secondary (~7d, infective). [paras 5513–5528]
- **Retained root fragment** — Root apex/fragment left in socket; pain, infection, delayed healing if >3mm. [paras 5499–5500]
- **Surgical emphysema** — Air-driven instrument or compressed-air syringe forces air into fascial spaces; crackle on palpation; airway risk if extensive. [paras 7992+]

### other-orthodontic / other-eruption

- **Class I crowding** — Normal molar relationship with crowded incisors; UK's commonest ortho presentation. [paras 2059–2065]
- **Class II div 1 malocclusion (increased overjet)** — Proclined upper incisors, OJ >4mm; risk of incisor trauma. [paras 2292–2319]
- **Class II div 2 malocclusion (deep overbite)** — Retroclined upper centrals + proclined laterals; deep overbite, traumatic to palatal mucosa. [paras 2322–2348]
- **Class III malocclusion (reverse overjet)** — Mandibular prognathism or maxillary retrusion; unfavourable growth tendency. [paras 2372–2400]
- **Anterior open bite** — No vertical incisor overlap; skeletal vertical growth, digit-sucking, or tongue thrust; relapse-prone. [paras 2349–2371]
- **Posterior crossbite** — Buccal cusps of lower premolars/molars buccal to upper; may cause mandibular displacement. [paras 2009–2015]
- **Posterior crossbite with mandibular displacement** — Deflecting cuspal contact; mandible postures laterally; centre-line shift. [paras 2421–2424]
- **Bilateral lingual crossbite (scissor bite)** — Upper buccal segments occlude buccal to lowers; narrow mandible or wide maxilla. [paras 2426–2427]
- **Palatally displaced canine** — Unerupted upper canine palatally; ~2% of patients; risk of incisor root resorption. [paras 2265–2288]
- **Buccally displaced / ectopic canine** — Upper canine erupts buccally due to arch crowding; space creation, alignment. [paras 2259–2262]
- **Tooth transposition** — Two adjacent teeth interchange position; canine + first premolar in maxilla commonest. [paras 2263–2264]
- **Increased overbite (traumatic)** — Deep bite causing palatal or lower incisor gingival trauma. [paras 11660]

### other-implant

- (Implant problems are mostly captured under fixed-prosthesis gaps above; see implant fracture, screw fracture, early/late failure, prosthesis complications. Gingival recession around implant — also relevant.)

---

## Notes

1. **Granularity calibration**: This pass extracted at handbook-paragraph granularity, which means some "gaps" are simply variants of conditions already in the guide (e.g. major RAS vs. existing minor RAS; multiple lichen planus subtypes). When authoring, decide whether each variant deserves its own entry or whether the existing entry should be broadened.

2. **Taxonomy decision needed for jaw / craniofacial / salivary**: The handbook has substantial sections on jaw cysts and tumours, salivary gland disease, craniofacial syndromes, neuropathic pain, and medical emergencies that don't fit the current 15 origins. Options:
   - Extend the origin list (e.g. add `jaw`, `salivary`, `craniofacial`, `neuropain`).
   - Force-fit into nearest existing (e.g. salivary into "floor-of-mouth" or new "throat", jaw cysts under "permanent-dentition" if odontogenic).
   - Create a single `other` origin for miscellaneous.

3. **OSCE/index sections (paras 10636+)**: These are largely cross-references and short scenario stubs, not full clinical descriptions. Many conditions surfaced here were already extracted from the main chapters; the index just confirmed them. A handful of novelties (Kikuchi, lipoma, malignant hyperpyrexia, Mikulicz, taurodontism, TUGSE, etc.) came purely from index sweeps.

4. **What this analysis did NOT do**:
   - Did not author full troubleshooting entries (use `extract-troubleshooting` skill for that).
   - Did not classify prevalence buckets.
   - Did not include `data/troubleshooting/_oxford-extraction-raw.md` in app navigation; it's a working file.

5. **Suggested next steps**:
   1. User reviews this list and culls problems considered out-of-scope for the guide (e.g. craniofacial syndromes a UK GDP would refer immediately; medical emergencies that belong in a separate emergency-protocol guide; obscure systemic conditions).
   2. For each retained gap, run `extract-troubleshooting` to produce a full entry with prevalence, etiology/presentation/results/defining characteristics/treatment/prognosis, and citations.
   3. Consider broadening sparse origins: throat (3), psychological (3), muscles (3), floor-of-mouth (4), skin (4). These have the highest delta vs. the handbook's coverage.

---

*Generated 2026-05-11 from `source-material/oxford-handbook/full-text.txt` via 38 parallel Sonnet sub-agent extractions. Raw per-chunk output is preserved at [_oxford-extraction-raw.md](./_oxford-extraction-raw.md).*

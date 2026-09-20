"use client";

import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Droplets, 
  Sprout, 
  ShieldAlert, 
  Sparkles, 
  X,
  ExternalLink,
  Phone
} from "lucide-react";
import Image from "next/image";

interface LearnTabProps {
  onBack: () => void;
  labels: Record<string, string>;
  currentLanguage?: string;
}

interface Article {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  categoryHi: string;
  readTime: string;
  readTimeHi: string;
  image: string;
  summary: string;
  summaryHi: string;
  fullText: string[];
  fullTextHi: string[];
}

interface Scheme {
  id: string;
  name: string;
  nameHi: string;
  tag: string;
  tagHi: string;
  tagColor: string;
  subsidy: string;
  subsidyHi: string;
  emoji: string;
  overview: string;
  overviewHi: string;
  benefits: string[];
  benefitsHi: string[];
  eligibility: string[];
  eligibilityHi: string[];
  documents: string[];
  documentsHi: string[];
  portalUrl: string;
  helpline: string;
}

const ARTICLES: Article[] = [
  {
    id: "a1",
    title: "Optimizing Wheat Irrigation During Crown Root Initiation",
    titleHi: "गेहूं की ताजमूल अवस्था (CRI) में सही सिंचाई का महत्व",
    category: "Irrigation Management",
    categoryHi: "सिंचाई प्रबंधन",
    readTime: "3 min read",
    readTimeHi: "3 मिनट का पाठ",
    image: "/images/crop_wheat.jpg",
    summary: "Crown root stage (20-25 days after sowing) is the most critical stage for wheat irrigation in Malwa region.",
    summaryHi: "बुवाई के 20-25 दिन बाद सीआरआई अवस्था पर पहली सिंचाई गेहूं की पैदावार के लिए सबसे महत्वपूर्ण होती है।",
    fullText: [
      "The first irrigation at Crown Root Initiation (CRI) stage (20-25 days after sowing) is crucial for wheat yields.",
      "Delaying this irrigation can reduce tillering by up to 20-30%.",
      "Apply 25-30 mm of water if soil moisture falls below 50% available water capacity.",
      "Avoid excess flooding to prevent root rot and nutrient leaching.",
    ],
    fullTextHi: [
      "बुवाई के 20-25 दिन बाद ताजमूल (CRI) अवस्था पर पहली सिंचाई अवश्य करें।",
      "इस समय पानी न मिलने से कल्ले (tillers) कम निकलते हैं और उत्पादन 20-30% तक गिर सकता है।",
      "हल्की सिंचाई (25-30 मिमी) करें ताकि जड़ों तक नमी पहुंचे और जलभराव न हो।",
      "सिंचाई के 2-3 दिन बाद यूरिया की पहली टॉप-ड्रेसिंग करें।",
    ]
  },
  {
    id: "a2",
    title: "Split Application of Nitrogen for Higher Soybean Yields",
    titleHi: "सोयाबीन में उर्वरक प्रबंधन एवं पोषण संतुलन",
    category: "Fertilizer Tips",
    categoryHi: "उर्वरक सलाह",
    readTime: "4 min read",
    readTimeHi: "4 मिनट का पाठ",
    image: "/images/crop_soybean.jpg",
    summary: "How to split Urea and DAP applications to maximize root nodules and pod development.",
    summaryHi: "सोयाबीन में जड़ों की ग्रंथियों और फलियों के विकास के लिए संतुलित डीएपी और यूरिया का प्रयोग।",
    fullText: [
      "Soybeans fix atmospheric nitrogen via root nodules, but require starter doses during early vegetative growth.",
      "Apply 20% nitrogen at sowing along with recommended phosphorus (DAP/SSP).",
      "Top-dress with light nitrogen only if yellowing appears during flowering stage.",
      "Incorporate bio-fertilizers like Rhizobium and PSB for enhanced nutrient uptake.",
    ],
    fullTextHi: [
      "सोयाबीन की जड़ों में राइजोबियम बैक्टीरिया हवा से नाइट्रोजन सोखते हैं, लेकिन शुरुआती विकास में थोड़ी खाद जरूरी होती है।",
      "बुवाई के समय डीएपी या सिंगल सुपर फास्फेट के साथ पोटाश दें।",
      "फूल आते समय पत्तों पर 19:19:19 या सूक्ष्म पोषक तत्वों का छिड़काव करें।",
      "अत्यधिक यूरिया देने से बचें क्योंकि इससे पौधे ज्यादा बढ़ जाते हैं और फलियां कम लगती हैं।",
    ]
  },
  {
    id: "a3",
    title: "Managing Fall Armyworm in Maize Fields",
    titleHi: "मक्का में फॉल आर्मीवर्म और कीटों से बचाव के उपाय",
    category: "Pest & Disease",
    categoryHi: "कीट व रोग सुरक्षा",
    readTime: "5 min read",
    readTimeHi: "5 मिनट का पाठ",
    image: "/images/crop_maize.jpg",
    summary: "Early detection symptoms, pheromone traps, and biological control strategies for maize crops.",
    summaryHi: "शुरुआती लक्षण, फेरोमोन ट्रैप और नीम के तेल से मक्का में कीट नियंत्रण के आसान तरीके।",
    fullText: [
      "Scout maize whorls regularly for pinholes and saw-dust like frass.",
      "Install 4-5 pheromone traps per hectare for early pest detection.",
      "Spray neem seed kernel extract (NSKE 5%) or Bacillus thuringiensis at early instar stages.",
      "Apply chemical sprays strictly in late evenings if infestation crosses 10% threshold.",
    ],
    fullTextHi: [
      "मक्के की पोंगी (गांठे) में बारीक छेद और लकड़ी के बुरादे जैसा मल दिखते ही सतर्क हो जाएं।",
      "खेत में प्रति एकड़ 4-5 फेरोमोन ट्रैप लगाएं ताकि कीटों की संख्या का पता चल सके।",
      "प्रारंभिक अवस्था में 5% नीम तेल (NSKE) का छिड़काव करें।",
      "हमेशा शाम के समय छिड़काव करें ताकि कीटों पर दवा का असर गहरा हो।",
    ]
  },
  {
    id: "a4",
    title: "FIR Seed Treatment: Protect Crops from 80% Diseases",
    titleHi: "FIR बीज उपचार तकनीक — 80% फफूंद व कीटों से पक्की मुक्ति",
    category: "Seed Technology",
    categoryHi: "बीज तकनीक",
    readTime: "3 min read",
    readTimeHi: "3 मिनट का पाठ",
    image: "/images/crop_wheat.jpg",
    summary: "Follow the FIR rule: Fungicide ➔ Insecticide ➔ Rhizobium before sowing to eliminate root rot and collar rot.",
    summaryHi: "बुवाई से पहले 'F-I-R' क्रम में बीज शोधन करने से जड़ गलन, दीमक और उकठा रोग की संभावना शून्य हो जाती है।",
    fullText: [
      "Always treat seeds in strict 'FIR' order: Fungicide (e.g. Carbendazim/Thiram) first, Insecticide (e.g. Imidacloprid) second, and Rhizobium/Trichoderma bio-culture last.",
      "This precise sequence forms an external chemical shield against soil fungi while keeping beneficial bio-agents alive.",
      "Requires only 2-3g per kg of seed, boosting germination rate to 95%.",
      "Always shade-dry treated seeds for 30 minutes before sowing; never expose to direct midday sun."
    ],
    fullTextHi: [
      "बुवाई से पहले हमेशा 'F-I-R' नियम अपनाएं: F (Fungicide - बाविस्टिन या थीरम 2 ग्राम/किग्रा), I (Insecticide - इमिडाक्लोप्रिड या क्लोरपायरीफॉस), और R (Rhizobium या ट्राइकोडर्मा कल्चर)।",
      "इस क्रम से बीज पर फफूंद व कीट से सुरक्षा कवच बन जाता है और मित्र बैक्टीरिया भी जीवित रहते हैं।",
      "मात्र ₹15-20 प्रति एकड़ के खर्च में फसल का अंकुरण 95% तक पहुंचता है और शुरुआती 30 दिन तक कोई बीमारी नहीं आती।",
      "उपचारित बीजों को हमेशा छांव में सुखाकर ही बुवाई करें, तेज धूप में कभी न रखें।"
    ]
  },
  {
    id: "a5",
    title: "Nano Urea & Nano DAP Foliar Spray: Cut Input Costs by 50%",
    titleHi: "नैनो यूरिया व नैनो डीएपी का सही छिड़काव व भारी बचत",
    category: "Modern Nutrition",
    categoryHi: "आधुनिक पोषण",
    readTime: "4 min read",
    readTimeHi: "4 मिनट का पाठ",
    image: "/images/nano_urea.jpg",
    summary: "1 bottle of Nano Urea equals one 45kg bag. Spray at 4ml/litre before 10 AM for 80% nitrogen absorption.",
    summaryHi: "1 बोतल नैनो यूरिया = 45 किलो की एक बोरी। सुबह 10 बजे से पहले 4ml/लीटर छिड़काव करने का वैज्ञानिक तरीका।",
    fullText: [
      "Nano Urea and Nano DAP deliver nutrients directly through leaf stomata with 80%+ efficiency vs 30% for conventional granular urea.",
      "Dosage: Mix 4ml Nano Urea per litre of clean water (60ml per 15L backpack sprayer).",
      "Apply first spray during active tillering/branching and second spray 15 days later just before flowering.",
      "Always spray before 9:30 AM or after 4:00 PM when leaf stomata are open for maximum absorption."
    ],
    fullTextHi: [
      "नैनो यूरिया पत्तियों के सूक्ष्म छिद्रों (Stomata) से सीधे पौधे के अंदर पहुंचता है, जिसकी कार्यक्षमता 80% से अधिक है जबकि दानेदार यूरिया की मात्र 30% होती है।",
      "मात्रा: 4 मिलीलीटर नैनो यूरिया प्रति लीटर पानी (15 लीटर के स्प्रे पंप में 60 मिली)।",
      "पहला छिड़काव कल्ले निकलने (Tillering) के समय और दूसरा फूल आने से ठीक पहले करें।",
      "हमेशा सुबह 10 बजे से पहले या शाम 4 बजे के बाद ही छिड़कें जब धूप हल्की हो और पत्तों के रंध्र खुले हों।"
    ]
  },
  {
    id: "a6",
    title: "Nipping Technique in Chickpea: Boost Branching & Yield by 40%",
    titleHi: "चने व दलहन में 'खूंटाई' (Nipping) — 40% अधिक फलियां व पैदावार",
    category: "Yield Maximization",
    categoryHi: "उत्पादन वृद्धि",
    readTime: "3 min read",
    readTimeHi: "3 मिनट का पाठ",
    image: "/images/crop_soybean.jpg",
    summary: "Pinching the top 2 inches of chickpea plants 30-35 days after sowing stimulates heavy lateral branching.",
    summaryHi: "बुवाई के 30-35 दिन बाद चने के ऊपरी 2 इंच सिरे को तोड़ने से कल्ले और फलियां 40% तक बढ़ जाती हैं।",
    fullText: [
      "Nipping (topping) is the scientific removal of apical shoot tips (top 2 inches) 30-35 days after sowing when plants are 15-20 cm high.",
      "Breaks apical dominance, triggering 8-12 robust secondary and tertiary lateral branches.",
      "More branches directly translate to 35-40% more flower pods and heavier grain weight per plant.",
      "Follow immediately with a light foliar spray of NPK 19:19:19 to rapidly feed newly emerging branches."
    ],
    fullTextHi: [
      "बुवाई के 30 से 35 दिन बाद जब चने के पौधे 15-20 सेमी ऊंचे हों, उनके ऊपरी कोमल सिरों (2 इंच) को अंगूठे और उंगली से तोड़ दें।",
      "ऊपरी सिरा टूटने से पौधे की लंबाई में बढ़ने की गति रुकती है और बगल से 8 से 12 नई मजबूत शाखाएं फूटती हैं।",
      "शाखाएं जितनी ज्यादा होंगी, फूल और घाटियां (pods) उतनी ही ज्यादा लगेंगी, जिससे पैदावार 30-40% तक बढ़ जाती है।",
      "खूंटाई के 2 दिन बाद 19:19:19 खाद का 5 ग्राम प्रति लीटर पानी में हल्का छिड़काव करने से नई शाखाएं तेजी से बढ़ती हैं।"
    ]
  },
  {
    id: "a7",
    title: "Neem Oil & Sticky Traps: Cost-Effective Organic Pest Control",
    titleHi: "नीम तेल व पीला चिपचिपा ट्रैप — सस्ता देसी कीट नियंत्रण",
    category: "Organic Protection",
    categoryHi: "जैविक सुरक्षा",
    readTime: "4 min read",
    readTimeHi: "4 मिनट का पाठ",
    image: "/images/neem_oil.jpg",
    summary: "Install 6 yellow sticky traps per acre and spray 10,000 PPM neem oil to eradicate whiteflies and aphids organically.",
    summaryHi: "10,000 PPM नीम तेल और प्रति एकड़ 6 पीले ट्रैप लगाने से रस चूसक कीट (माहू, सफेद मक्खी, थ्रिप्स) बिना केमिकल दवा के खत्म।",
    fullText: [
      "Sap-sucking insects (whiteflies, aphids, jassids, thrips) are naturally attracted to bright yellow and blue wavelengths.",
      "Install 6-8 yellow and blue sticky traps per acre at 1 foot above the crop canopy.",
      "Spray 10,000 PPM Neem Oil (Azadirachtin) at 3-4 ml per litre water mixed with 1 teaspoon of mild liquid soap as a surfactant.",
      "Disrupts pest feeding, inhibits egg hatching, and leaves beneficial ladybird beetles and honeybees completely unharmed."
    ],
    fullTextHi: [
      "रस चूसक कीट (सफेद मक्खी, माहू, थ्रिप्स) पीले और नीले रंग की ओर आकर्षित होते हैं। फसल से 1 फीट ऊपर प्रति एकड़ 6-8 पीले चिपचिपे कार्ड लगाएं।",
      "शुरुआती अवस्था में 10,000 PPM नीम तेल का 3-4 मिली प्रति लीटर पानी में 1 चम्मच शैम्पू या साबुन घोलकर छिड़काव करें।",
      "नीम का तेल कीटों की भूख और प्रजनन क्षमता को खत्म कर देता है, जिससे कीट अंडे नहीं दे पाते और नई पीढ़ी नहीं बनती।",
      "यह मित्र कीटों (जैसे लेडीबर्ड बीटल और मधुमक्खियों) को बिना नुकसान पहुंचाए महंगे रसायनों का ₹1,000-₹2,000 का खर्च बचाता है।"
    ]
  }
];

const SCHEMES: Scheme[] = [
  {
    id: "s1",
    name: "PM Krishi Sinchayee Yojana (PMKSY) - Per Drop More Crop",
    nameHi: "प्रधानमंत्री कृषि सिंचाई योजना (ड्रिप व स्प्रिंकलर सब्सिडी)",
    tag: "Irrigation Subsidy",
    tagHi: "55% - 80% सब्सिडी",
    tagColor: "bg-blue-100 text-blue-700",
    subsidy: "55% to 80% Subsidy",
    subsidyHi: "55% से 80% तक अनुदान",
    emoji: "💧",
    overview: "Provides heavy financial assistance for installing modern Micro-Irrigation systems (Drip and Sprinkler) to maximize water efficiency.",
    overviewHi: "खेतों में ड्रिप और स्प्रिंकलर (फव्वारा) सिंचाई उपकरण लगाने के लिए सरकार द्वारा भारी वित्तीय अनुदान दिया जाता है ताकि पानी की बचत हो।",
    benefits: [
      "Up to 55% subsidy for general farmers and up to 80% for small/marginal farmers.",
      "Saves 40% to 50% water while increasing crop yield by 20% to 30%.",
      "Direct benefit transfer (DBT) into farmer bank accounts."
    ],
    benefitsHi: [
      "छोटे और सीमांत किसानों को ड्रिप/फव्वारा लगाने पर 80% तक तथा सामान्य किसानों को 55% तक सब्सिडी।",
      "पानी की 40-50% बचत और पैदावार में 25-30% की भारी बढ़ोतरी।",
      "अनुदान राशि सीधे किसान के बैंक खाते में DBT के माध्यम से ट्रांसफर।"
    ],
    eligibility: [
      "All farmers possessing agricultural land in their name.",
      "Valid electricity connection or solar pump for water source."
    ],
    eligibilityHi: [
      "सभी किसान जिनके पास स्वयं के नाम पर कृषि भूमि है।",
      "सिंचाई के लिए पानी का सुनिश्चित स्रोत (कुआं, बोरवेल या तालाब)।"
    ],
    documents: ["Aadhaar Card", "Land Record (Khasra/Khatauni)", "Bank Passbook", "Water Source Certificate"],
    documentsHi: ["आधार कार्ड", "खसरा-खतौनी की नकल", "बैंक पासबुक", "जल स्रोत प्रमाण"],
    portalUrl: "https://pmksy.gov.in",
    helpline: "1800-180-1551"
  },
  {
    id: "s2",
    name: "PM-KUSUM Solar Agriculture Pump Scheme",
    nameHi: "पीएम कुसुम सोलर पंप योजना (मुफ्त सौर ऊर्जा)",
    tag: "Solar Energy",
    tagHi: "60% - 90% सब्सिडी",
    tagColor: "bg-yellow-100 text-yellow-800",
    subsidy: "Up to 90% Subsidy",
    subsidyHi: "90% तक सरकारी मदद",
    emoji: "☀️",
    overview: "Enables farmers to install 3HP, 5HP, and 7.5HP solar pumps with up to 90% subsidy, eliminating diesel and heavy electricity costs.",
    overviewHi: "डीजल और बिजली के बिल से आजादी के लिए 3HP से 7.5HP तक के सोलर पंप पर केंद्र और राज्य सरकार मिलकर 90% तक सब्सिडी देती हैं।",
    benefits: [
      "60% direct subsidy (Central + State) and 30% low-interest bank loan (Only 10% farmer share).",
      "Zero recurring electricity bills and reliable daytime irrigation power.",
      "Surplus solar electricity can be sold back to the grid for extra income."
    ],
    benefitsHi: [
      "60% सीधी सब्सिडी और 30% आसान बैंक लोन — किसान को केवल 10% लागत देनी होती है।",
      "बिजली कटने का झंझट खत्म, दिन के समय धूप से भरपूर सिंचाई की सुविधा।",
      "अतिरिक्त सौर बिजली को ग्रिड को बेचकर हर साल अतिरिक्त कमाई का मौका।"
    ],
    eligibility: [
      "Individual farmers, farmer groups, and cooperatives.",
      "Cultivable agricultural land with available groundwater."
    ],
    eligibilityHi: [
      "व्यक्तिगत किसान, स्वयं सहायता समूह एवं कृषि सहकारी समितियां।",
      "कृषि योग्य भूमि और पानी का साधन उपलब्ध होना चाहिए।"
    ],
    documents: ["Aadhaar Card", "Land Registry / Khasra", "Bank Account Details", "Passport Photo"],
    documentsHi: ["आधार कार्ड", "जमीन के कागजात (खसरा/खतौनी)", "बैंक खाता पासबुक", "पासपोर्ट फोटो"],
    portalUrl: "https://pmkusum.mnre.gov.in",
    helpline: "1800-180-3333"
  },
  {
    id: "s3",
    name: "PM-Kisan Samman Nidhi",
    nameHi: "पीएम किसान सम्मान निधि योजना",
    tag: "Income Support",
    tagHi: "₹6,000 / वर्ष",
    tagColor: "bg-green-100 text-[#1B7A3D]",
    subsidy: "₹6,000 per Year",
    subsidyHi: "₹6,000 प्रति वर्ष",
    emoji: "💰",
    overview: "Direct income support of ₹6,000 per year transferred directly to landholding farmers in 3 equal installments of ₹2,000.",
    overviewHi: "सभी भूमिधारक किसान परिवारों को बीज, खाद व खेती खर्च के लिए ₹6,000 प्रति वर्ष 3 समान किस्तों (₹2,000 प्रत्येक) में सीधे बैंक खाते में।",
    benefits: [
      "100% centrally funded direct cash transfer.",
      "Helps meet input costs (seeds, fertilizers) before peak sowing seasons.",
      "Transferred automatically via e-KYC linked Aadhaar bank accounts."
    ],
    benefitsHi: [
      "शत-प्रतिशत केंद्र सरकार द्वारा वित्तपोषित सीधी नकद सहायता।",
      "बुवाई के समय बीज और खाद खरीदने के लिए समय पर आर्थिक संबल।",
      "e-KYC के जरिए सीधे किसान के आधार लिंक बैंक खाते में सुरक्षित भुगतान।"
    ],
    eligibility: [
      "All small, marginal, and landholding farmer families.",
      "Must have active Aadhaar with land ownership."
    ],
    eligibilityHi: [
      "सभी भूमिधारक किसान परिवार (संस्थागत भूमिधारक व सरकारी पेंशनभोगी को छोड़कर)।",
      "आधार कार्ड और बैंक खाता डीबीटी सक्षम होना चाहिए।"
    ],
    documents: ["Aadhaar Card", "Land Khatauni", "Bank Account Details", "Active Mobile Number"],
    documentsHi: ["आधार कार्ड", "खसरा/खतौनी नकल", "बैंक पासबुक", "मोबाइल नंबर (ओटीपी के लिए)"],
    portalUrl: "https://pmkisan.gov.in",
    helpline: "155261 / 1800-115-526"
  },
  {
    id: "s4",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    nameHi: "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
    tag: "Crop Insurance",
    tagHi: "100% सुरक्षा क्लेम",
    tagColor: "bg-purple-100 text-purple-700",
    subsidy: "Full Crop Loss Protection",
    subsidyHi: "फसल नुकसान की पूरी भरपाई",
    emoji: "🛡️",
    overview: "Comprehensive risk insurance covering crop damage caused by unseasonal rain, drought, floods, pests, and natural disasters.",
    overviewHi: "बेमौसम बारिश, ओलावृष्टि, सूखा या कीट प्रकोप से होने वाले फसल नुकसान की पूरी भरपाई के लिए सबसे सस्ती व सुरक्षित सरकारी बीमा योजना।",
    benefits: [
      "Nominal premium: Only 1.5% for Rabi crops, 2.0% for Kharif crops, and 5% for commercial/horticultural crops.",
      "Full sum insured payout directly to farmer in case of calamity.",
      "Post-harvest loss coverage up to 14 days after harvesting."
    ],
    benefitsHi: [
      "अत्यंत कम प्रीमियम: रबी फसलों के लिए मात्र 1.5%, खरीफ के लिए 2% और बागवानी के लिए 5%।",
      "प्राकृतिक आपदा या बीमारी से फसल नष्ट होने पर वास्तविक नुकसान का शत-प्रतिशत क्लेम।",
      "कटाई के बाद खेत में सूखने रखी फसल को 14 दिनों तक सुरक्षा कवर।"
    ],
    eligibility: [
      "All farmers including sharecroppers and tenant farmers growing notified crops."
    ],
    eligibilityHi: [
      "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान (बटाईदार सहित)।"
    ],
    documents: ["Aadhaar Card", "Land Possession Certificate (LPC)", "Sowing Certificate / Patwari Report", "Bank Passbook"],
    documentsHi: ["आधार कार्ड", "जमीन का पर्चा/खतौनी", "बुवाई प्रमाण पत्र (पटवारी रिपोर्ट)", "बैंक पासबुक"],
    portalUrl: "https://pmfby.gov.in",
    helpline: "1800-180-1551"
  },
  {
    id: "s5",
    name: "Soil Health Card Scheme",
    nameHi: "मृदा स्वास्थ्य कार्ड योजना (मुफ्त मिट्टी जांच)",
    tag: "Soil Testing",
    tagHi: "नि:शुल्क जांच कार्ड",
    tagColor: "bg-emerald-100 text-emerald-800",
    subsidy: "100% Free Soil Testing",
    subsidyHi: "100% मुफ्त सरकारी जांच",
    emoji: "🌱",
    overview: "Provides customized soil test reports analyzing 12 essential nutrients with crop-specific fertilizer advisory.",
    overviewHi: "आपके खेत की मिट्टी के 12 प्रमुख पोषक तत्वों (NPK, जिंक, pH आदि) की मुफ्त लैब जांच और संतुलित खाद की मात्रा बताने वाला कार्ड।",
    benefits: [
      "Reduces excess fertilizer wastage and cuts farming expenses by 15-20%.",
      "Maintains soil fertility and improves crop productivity.",
      "Issued every 2 years by the state agriculture department."
    ],
    benefitsHi: [
      "अनावश्यक खाद का खर्च 15-20% तक कम होता है और पैसे की बचत होती है।",
      "मिट्टी की उपजाऊ शक्ति लंबे समय तक बनी रहती है।",
      "प्रत्येक 2 वर्ष में कृषि विभाग द्वारा नवीनीकृत स्वास्थ्य कार्ड जारी किया जाता है।"
    ],
    eligibility: [
      "All farmers across all districts in India."
    ],
    eligibilityHi: [
      "भारत के किसी भी राज्य का कोई भी किसान अपने खेत का नमूना जमा कर सकता है।"
    ],
    documents: ["Aadhaar Card", "Soil Sample from Field", "Khasra Number"],
    documentsHi: ["आधार कार्ड", "खेत से मिट्टी का नमूना", "खसरा नंबर"],
    portalUrl: "https://soilhealth.dac.gov.in",
    helpline: "011-23382012"
  },
  {
    id: "s6",
    name: "Kisan Credit Card (KCC)",
    nameHi: "किसान क्रेडिट कार्ड (सस्ता कृषि ऋण)",
    tag: "Low Interest Loan",
    tagHi: "4% रियायती ब्याज",
    tagColor: "bg-amber-100 text-amber-800",
    subsidy: "4% Interest Rate",
    subsidyHi: "मात्र 4% ब्याज पर ₹3 लाख तक",
    emoji: "💳",
    overview: "Offers institutional credit up to ₹3 Lakhs at a subsidized interest rate of 4% (with 3% prompt repayment incentive).",
    overviewHi: "खेती, खाद, बीज व कृषि औजारों के लिए ₹3 लाख तक का आसान ऋण मात्र 4% रियायती ब्याज दर पर, बिना किसी बिचौलिए के।",
    benefits: [
      "Collateral-free loan up to ₹1.60 Lakhs.",
      "Subsidized interest rate: 7% base rate with 3% rebate for timely repayment = effectively 4%.",
      "Flexible repayment schedule aligned with crop harvest periods."
    ],
    benefitsHi: [
      "₹1.60 लाख तक का ऋण बिना किसी जमीन बंधक (बिना गारंटी) के उपलब्ध।",
      "समय पर चुकाने पर 3% की अतिरिक्त छूट — प्रभावी ब्याज मात्र 4% प्रति वर्ष।",
      "फसल कटने और बिकने के अनुसार आसान भुगतान की सुविधा।"
    ],
    eligibility: [
      "Individual owner-cultivators, tenant farmers, and Self Help Groups (SHGs)."
    ],
    eligibilityHi: [
      "व्यक्तिगत किसान, पट्टेदार, बटाईदार एवं पशुपालन/मत्स्य पालन करने वाले किसान।"
    ],
    documents: ["Aadhaar Card", "PAN Card", "Land Records (Khasra)", "Bank Application Form"],
    documentsHi: ["आधार कार्ड", "पैन कार्ड", "जमीन की खतौनी", "बैंक शाखा में आवेदन"],
    portalUrl: "https://myscheme.gov.in",
    helpline: "1800-115-526"
  }
];

export const LearnTab: React.FC<LearnTabProps> = ({ onBack, labels, currentLanguage = "hi" }) => {
  const [activeSegment, setActiveSegment] = useState<"guides" | "schemes">("guides");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#F4F7F5]">
      {/* Top Header with Back button */}
      <div className="p-4 bg-white/70 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">
              {currentLanguage === "en" ? "Knowledge & Schemes" : "कृषि ज्ञान व सरकारी योजनाएं"}
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              {currentLanguage === "en" ? "Govt subsidies, tips & modern agronomy" : "सरकारी सब्सिडी, योजनाएं व कृषि तकनीक"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4 pb-28 overflow-y-auto">
        
        {/* Segment Switcher Toggle */}
        <div className="flex bg-white rounded-2xl p-1 shadow-xs border border-gray-100">
          <button
            type="button"
            onClick={() => setActiveSegment("guides")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSegment === "guides"
                ? "bg-[#1B7A3D] text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{currentLanguage === "en" ? "Crop Guides" : "फसल तकनीक व टिप्स"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("schemes")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSegment === "schemes"
                ? "bg-[#1B7A3D] text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">🏛️</span>
            <span>{currentLanguage === "en" ? "Govt Schemes" : "सरकारी योजनाएं"}</span>
            <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded-full text-[9px] font-black">
              NEW
            </span>
          </button>
        </div>

        {/* SECTION 1: CROP GUIDES */}
        {activeSegment === "guides" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Featured Tip Banner */}
            <div className="bg-gradient-to-br from-[#1B7A3D] to-[#2E9B56] rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 
                  {currentLanguage === "en" ? "DRISHTI Smart Tip" : "DRISHTI स्मार्ट टिप"}
                </span>
              </div>
              <h2 className="font-bold text-base leading-snug">
                {currentLanguage === "en" 
                  ? "Save up to 30% water using sensor-based irrigation timing" 
                  : "शाम के समय सिंचाई करने से 30% तक पानी की बचत होती है"}
              </h2>
              <p className="text-xs text-green-100 font-medium mt-1 leading-relaxed">
                {currentLanguage === "en" 
                  ? "Irrigating in the evening prevents high evaporation loss and ensures deeper root absorption." 
                  : "शाम को वाष्पीकरण कम होता है जिससे पानी सीधे जड़ों तक पहुंचता है और फसल स्वस्थ रहती है।"}
              </p>
            </div>

            {/* Quick Smart Field Hacks Horizontal Carousel */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                  <span className="text-base">⚡</span>
                  <span>{currentLanguage === "en" ? "Quick Field Hacks" : "त्वरित स्मार्ट ट्रिक्स"}</span>
                </h3>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {currentLanguage === "en" ? "4 Golden Rules" : "4 अचूक फॉर्मूले"}
                </span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 no-scrollbar -mx-1 px-1 snap-x">
                {/* Hack 1 */}
                <div className="min-w-[215px] max-w-[215px] snap-start bg-white rounded-2xl p-3.5 border border-emerald-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">☀️</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        30% खाद बचत
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 mt-2">
                      {currentLanguage === "en" ? "Apply Urea strictly in evening" : "यूरिया हमेशा शाम को डालें"}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      {currentLanguage === "en" 
                        ? "Midday heat causes 30% ammonia gas loss (volatilization). Evening ensures full root intake."
                        : "कड़क धूप में यूरिया डालने पर 30% नाइट्रोजन गैस बनकर उड़ जाता है। शाम को डालने पर पूरी खाद जड़ों को मिलती है।"}
                    </p>
                  </div>
                </div>

                {/* Hack 2 */}
                <div className="min-w-[215px] max-w-[215px] snap-start bg-white rounded-2xl p-3.5 border border-amber-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🧪</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                        पोषक सुरक्षा
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 mt-2">
                      {currentLanguage === "en" ? "Never mix Zinc with DAP" : "जिंक और डीएपी कभी न मिलाएं"}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      {currentLanguage === "en"
                        ? "Mixing them binds them into insoluble Zinc Phosphate, rendering both nutrients useless."
                        : "दोनों साथ मिलाने पर अघुलनशील जिंक फॉस्फेट बन जाता है जिससे दोनों बेकार हो जाते हैं। 3 दिन का अंतर रखें।"}
                    </p>
                  </div>
                </div>

                {/* Hack 3 */}
                <div className="min-w-[215px] max-w-[215px] snap-start bg-white rounded-2xl p-3.5 border border-blue-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🧴</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        अचूक चिपकाव
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 mt-2">
                      {currentLanguage === "en" ? "Add 1 spoon shampoo to spray" : "स्प्रे में 1 चम्मच शैम्पू मिलाएं"}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      {currentLanguage === "en"
                        ? "Acts as a cheap surfactant, spreading medicine evenly on waxy leaves so it resists rain wash-off."
                        : "सस्ते स्टीकर का काम करता है। दवा पूरे पत्ते पर फैलकर चिपक जाती है और बारिश में भी नहीं धुलती।"}
                    </p>
                  </div>
                </div>

                {/* Hack 4 */}
                <div className="min-w-[215px] max-w-[215px] snap-start bg-white rounded-2xl p-3.5 border border-rose-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🌸</span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                        फूल सुरक्षा
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 mt-2">
                      {currentLanguage === "en" ? "Avoid heavy watering at flowering" : "फूल आते समय भारी पानी न दें"}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      {currentLanguage === "en"
                        ? "Excess moisture cools the soil and causes massive flower drop, cutting yield."
                        : "फूल आने पर ज्यादा पानी भरने से परागण रुकता है और फूल झड़ने लगते हैं। हमेशा हल्की नमी बनाए रखें।"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Cards */}
            <div className="space-y-3 pt-1">
              <h3 className="font-bold text-gray-800 text-sm px-1">
                {currentLanguage === "en" ? "Farming Best Practices & Guides" : "उन्नत कृषि पद्धतियां व मार्गदर्शिका"}
              </h3>

              {ARTICLES.map((art: Article) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                      <Image
                        src={art.image}
                        alt={art.title}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 pr-2">
                      <span className="text-[11px] font-bold text-[#1B7A3D] uppercase tracking-wide">
                        {currentLanguage === "en" ? art.category : art.categoryHi}
                      </span>
                      <h4 className="font-bold text-gray-900 text-[14px] leading-snug truncate mt-0.5">
                        {currentLanguage === "en" ? art.title : art.titleHi}
                      </h4>
                      <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                        {currentLanguage === "en" ? art.readTime : art.readTimeHi}
                      </p>
                    </div>
                  </div>

                  <div className="text-gray-400 shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: GOVT SCHEMES & SUBSIDIES */}
        {activeSegment === "schemes" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Schemes Highlight Banner */}
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#1E6091] to-[#2E86AB] rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                  🏛️ {currentLanguage === "en" ? "Government Agriculture Subsidies" : "सरकारी कृषि अनुदान व योजनाएं"}
                </span>
              </div>
              <h2 className="font-bold text-base leading-snug">
                {currentLanguage === "en"
                  ? "Apply for Drip & Solar Subsidies to save water & maximize income"
                  : "ड्रिप सिंचाई व सोलर पंप पर 55% से 90% तक सरकारी सब्सिडी प्राप्त करें"}
              </h2>
              <p className="text-xs text-blue-100 font-medium mt-1 leading-relaxed">
                {currentLanguage === "en"
                  ? "Find eligibility criteria, subsidy amounts, required documents & direct portal links."
                  : "योजना की पात्रता, अनुदान राशि, जरूरी कागजात और आवेदन पोर्टल की पूरी जानकारी नीचे देखें।"}
              </p>
            </div>

            {/* Schemes Grid List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-gray-800 text-sm">
                  {currentLanguage === "en" ? "Active Central & State Schemes (6)" : "प्रमुख सरकारी योजनाएं व सब्सिडी (6)"}
                </h3>
              </div>

              {SCHEMES.map((scheme: Scheme) => (
                <div
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#1B7A3D] transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                      {scheme.emoji}
                    </div>
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${scheme.tagColor}`}>
                          {currentLanguage === "en" ? scheme.tag : scheme.tagHi}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-1">
                        {currentLanguage === "en" ? scheme.name : scheme.nameHi}
                      </h4>
                      <p className="text-[12px] text-gray-500 font-medium mt-0.5 line-clamp-1">
                        {currentLanguage === "en" ? scheme.overview : scheme.overviewHi}
                      </p>
                    </div>
                  </div>

                  <div className="text-gray-400 shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Article Detail Sheet */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            <div className="flex items-center justify-between sticky top-0 bg-white pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#1B7A3D] uppercase tracking-wide">
                {currentLanguage === "en" ? selectedArticle.category : selectedArticle.categoryHi}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-40 rounded-2xl overflow-hidden relative">
              <Image
                src={selectedArticle.image}
                alt={selectedArticle.title}
                fill
                className="object-cover"
              />
            </div>

            <h2 className="font-bold text-gray-900 text-lg leading-snug">
              {currentLanguage === "en" ? selectedArticle.title : selectedArticle.titleHi}
            </h2>

            <div className="space-y-2.5">
              {(currentLanguage === "en" ? selectedArticle.fullText : selectedArticle.fullTextHi).map((paragraph: string, idx: number) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A3D] mt-2 shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedArticle(null)}
              className="w-full py-3 rounded-xl bg-[#1B7A3D] text-white font-bold text-sm shadow-md hover:bg-[#166533] transition-all mt-4 cursor-pointer"
            >
              {currentLanguage === "en" ? "Done Reading" : "पढ़ लिया (बंद करें)"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Government Scheme Detail Sheet */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between sticky top-0 bg-white pb-3 border-b border-gray-100 z-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedScheme.emoji}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedScheme.tagColor}`}>
                  {currentLanguage === "en" ? selectedScheme.subsidy : selectedScheme.subsidyHi}
                </span>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scheme Title & Overview */}
            <div>
              <h2 className="font-extrabold text-gray-900 text-lg leading-snug">
                {currentLanguage === "en" ? selectedScheme.name : selectedScheme.nameHi}
              </h2>
              <p className="text-xs text-gray-600 font-medium mt-2 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                {currentLanguage === "en" ? selectedScheme.overview : selectedScheme.overviewHi}
              </p>
            </div>

            {/* Key Benefits */}
            <div>
              <h3 className="text-xs font-bold text-[#1B7A3D] uppercase tracking-wider mb-2">
                {currentLanguage === "en" ? "⭐ Key Scheme Benefits" : "⭐ योजना के मुख्य लाभ"}
              </h3>
              <div className="space-y-1.5">
                {(currentLanguage === "en" ? selectedScheme.benefits : selectedScheme.benefitsHi).map((ben: string, i: number) => (
                  <div key={i} className="flex gap-2 text-xs text-gray-700 font-medium">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{ben}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                {currentLanguage === "en" ? "📋 Eligibility Criteria" : "📋 कौन पात्र है (पात्रता)"}
              </h3>
              <div className="space-y-1.5">
                {(currentLanguage === "en" ? selectedScheme.eligibility : selectedScheme.eligibilityHi).map((el: string, i: number) => (
                  <div key={i} className="flex gap-2 text-xs text-gray-600 font-medium">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{el}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                {currentLanguage === "en" ? "📄 Required Documents" : "📄 जरूरी दस्तावेज"}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(currentLanguage === "en" ? selectedScheme.documents : selectedScheme.documentsHi).map((doc: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-xl text-[11px] font-semibold">
                    {doc}
                  </span>
                ))}
              </div>
            </div>

            {/* Helpline & Action Portal */}
            <div className="pt-2 space-y-2.5 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs font-medium text-gray-500 px-1">
                <span>{currentLanguage === "en" ? "Toll-Free Helpline:" : "टोल-फ्री हेल्पलाइन:"}</span>
                <span className="font-bold text-gray-900">{selectedScheme.helpline}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedScheme(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-all cursor-pointer"
                >
                  {currentLanguage === "en" ? "Close" : "बंद करें"}
                </button>

                <a
                  href={selectedScheme.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-2 py-3 rounded-xl bg-[#1B7A3D] text-white font-bold text-xs shadow-md hover:bg-[#166533] transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
                >
                  <span>{currentLanguage === "en" ? "Open Official Portal ↗" : "आधिकारिक पोर्टल खोलें ↗"}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

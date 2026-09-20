import re
from typing import Dict, Any, Optional, List, Tuple

# Comprehensive Agronomy Knowledge Matrix
# Supports Hindi (Devanagari), Hinglish (Roman Script), English, and Marathi
# Formatted cleanly without raw markdown symbols

CROP_PATTERNS = {
    "wheat": {
        "keywords": ["गेहूं", "गेहू", "gehun", "gehu", "genhu", "wheat", "गहू", "gahu"],
        "name_hi": "गेहूं",
        "name_en": "Wheat"
    },
    "mustard": {
        "keywords": ["सरसों", "sarson", "mustard", "राई", "rai", "मोहरी", "mohari"],
        "name_hi": "सरसों",
        "name_en": "Mustard"
    },
    "gram": {
        "keywords": ["चना", "चने", "chana", "chane", "gram", "chickpea", "हरभरा", "harbhara"],
        "name_hi": "चना",
        "name_en": "Gram / Chickpea"
    },
    "rice": {
        "keywords": ["धान", "चावल", "dhan", "chawal", "rice", "paddy", "भात", "तांदूळ", "bhaat"],
        "name_hi": "धान (चावल)",
        "name_en": "Rice / Paddy"
    },
    "soybean": {
        "keywords": ["सोयाबीन", "soybean", "soya", "soyabean"],
        "name_hi": "सोयाबीन",
        "name_en": "Soybean"
    },
    "maize": {
        "keywords": ["मक्का", "मका", "makka", "maize", "corn", "maka"],
        "name_hi": "मक्का",
        "name_en": "Maize"
    },
    "cotton": {
        "keywords": ["कपास", "kapas", "cotton", "नरमा", "narma", "कापूस", "kapus"],
        "name_hi": "कपास",
        "name_en": "Cotton"
    },
    "potato": {
        "keywords": ["आलू", "aalu", "aaloo", "potato", "बटाटा", "batata"],
        "name_hi": "आलू",
        "name_en": "Potato"
    },
    "tomato": {
        "keywords": ["टमाटर", "tamatar", "tomato", "टोमॅटो"],
        "name_hi": "टमाटर",
        "name_en": "Tomato"
    },
    "onion": {
        "keywords": ["प्याज", "pyaz", "pyaj", "onion", "कांदा", "kanda"],
        "name_hi": "प्याज",
        "name_en": "Onion"
    },
    "sugarcane": {
        "keywords": ["गन्ना", "ganna", "sugarcane", "ऊस", "us"],
        "name_hi": "गन्ना",
        "name_en": "Sugarcane"
    }
}

TOPIC_PATTERNS = {
    "weather_sowing": [
        "mausam", "mosam", "weather", "temperature", "taapman", "sardi", "garmi", "thand", "climate",
        "buwai", "bona", "boai", "sowing", "kheti kab", "kab kare", "kab boe", "kab lagaye", "kab karna",
        "sahi samay", "sahi mausam", "season", "मौसम", "तापमान", "बुवाई", "कब बोएं", "सही समय", "हवामान"
    ],
    "fertilizer": [
        "khad", "fertilizer", "urea", "yuriya", "dap", "npk", "potash", "zinc", "nano urea", "khurak",
        "poshan", "nutrient", "यूरिया", "खाद", "डीएपी", "पोटाश", "नैनो यूरिया", "पोषक तत्व", "खत"
    ],
    "irrigation": [
        "pani", "sinchai", "paani", "water", "irrigation", "drip", "sprinkler", "favvara", "pehla pani",
        "pani kab", "सिंचाई", "पानी", "ड्रिप", "फव्वारा", "सिंचन", "पाणी"
    ],
    "disease_pest": [
        "rog", "bimari", "keeda", "keet", "kida", "sundi", "illi", "fungus", "faphund", "peela", "peeli", "peele", "yellow",
        "blight", "dawa", "dawai", "dawae", "spray", "keetnashak", "chepa", "maho", "kharpatwar", "weed", "patti", "patte",
        "pattiyan", "ilaj", "upchar", "bachav", "dhabbey", "dhabbe", "rust",
        "पत्ता पीला", "रोग", "बीमारी", "कीट", "कीड़ा", "दवा", "दवाई", "स्प्रे", "फफूंद", "खरपतवार", "माहो", "अळी", "इलाज", "उपचार"
    ],
    "seeds": [
        "beej", "seed", "variety", "kism", "kisam", "upchar", "treatment", "उन्नत बीज", "किस्म", "बीज उपचार", "बियाणे"
    ],
    "schemes": [
        "subsidy", "subcidy", "yojana", "sarkari", "scheme", "pm kisan", "kusum", "solar pump", "bima",
        "grant", "अनुदान", "योजना", "सब्सिडी", "सरकारी योजना", "सोलर पंप", "बीमा"
    ],
    "scanner": [
        "scanner", "camera", "photo", "scan", "tasveer", "फोटो", "स्कैनर", "कैमरा", "जांच"
    ],
    "fields": [
        "field", "khet", "plot", "khet jode", "my fields", "खेत", "प्लॉट", "मेरे खेत", "शेत"
    ]
}

# Clean, Farmer-Friendly Agronomic Advisories (No raw Markdown syntax)
EXPERT_ADVISORIES = {
    ("wheat", "weather_sowing"): {
        "answer": (
            "🌾 गेहूं की खेती के लिए सही मौसम व बुवाई समय:\n\n"
            "• उत्तम बुवाई समय: 15 अक्टूबर से 25 नवंबर (रबी सीजन) गेहूं की बुवाई का सबसे आदर्श समय है।\n"
            "• अनुकूल तापमान: बुवाई व अंकुरण के समय 20°C से 22°C तापमान सर्वोत्तम रहता है। वृद्धि के समय 15-18°C और पकते समय 22-25°C तापमान चाहिए।\n"
            "• महत्वपूर्ण चेतावनी: यदि तापमान 25°C से अधिक हो तो बुवाई न करें, क्योंकि अधिक गर्मी में कल्ले (tillers) कम फूटते हैं और पैदावार घट जाती है।\n"
            "• खेत की तैयारी: बुवाई से पहले खेत में पलेवा (Palewa) देकर पर्याप्त नमी तैयार रखें। पहली सिंचाई 20-25 दिन बाद 'ताजमूल अवस्था (CRI)' पर अवश्य करें।"
        ),
        "action": "advisory",
        "action_label": "🌾 गेहूं सिंचाई व खाद योजना देखें"
    },
    ("wheat", "fertilizer"): {
        "answer": (
            "🌾 गेहूं में खाद व यूरिया प्रबंधन:\n\n"
            "• बुवाई के समय (Basal Dose): 1 बैग DAP (50 किग्रा) + आधा बैग पोटाश (MOP) प्रति एकड़ डालें।\n"
            "• यूरिया देने का सही समय: यूरिया को हमेशा दो किस्तों में दें:\n"
            "  1. पहली किस्त: बुवाई के 21-25 दिन बाद पहली सिंचाई (CRI) के 2-3 दिन बाद जब पैर जमीन में न धंसे (1 बैग यूरिया + 5 किग्रा जिंक सल्फेट)।\n"
            "  2. दूसरी किस्त: बुवाई के 42-45 दिन बाद दूसरी सिंचाई पर (1 बैग यूरिया)।\n"
            "• महत्वपूर्ण टिप: कभी भी तेज धूप में यूरिया न फेंकें, हमेशा दोपहर बाद शाम के समय ओट (नमी) वाली मिट्टी में डालें।"
        ),
        "action": "advisory",
        "action_label": "🌾 गेहूं के लिए सटीक खाद गणना करें"
    },
    ("wheat", "irrigation"): {
        "answer": (
            "🌾 गेहूं में सिंचाई का वैज्ञानिक समय:\n\n"
            "• पहली सिंचाई (सबसे महत्वपूर्ण): बुवाई के 20-25 दिन बाद 'ताजमूल अवस्था (CRI Stage)' पर पहली हल्की सिंचाई अवश्य करें। इस समय पानी चूकने पर 30-40% उपज घट सकती है।\n"
            "• दूसरी सिंचाई: कल्ले फूटते समय (40-45 दिन)।\n"
            "• तीसरी सिंचाई: गांठें बनते समय (60-65 दिन)।\n"
            "• चौथी सिंचाई: फूल आने व दाना भरते समय (85-90 दिन)।\n"
            "• टिप: दाना भरते समय तेज हवा चलने पर पानी न दें, फसल गिर (lodging) सकती है।"
        ),
        "action": "advisory",
        "action_label": "💧 गेहूं सिंचाई शेड्यूल देखें"
    },
    ("wheat", "seeds"): {
        "answer": (
            "🌾 गेहूं की प्रमुख किस्में व बीज उपचार:\n\n"
            "• उन्नत किस्में: HD-2967, HD-3086, DBW-187 (करण वंदना), DBW-222, PBW-550।\n"
            "• देरी से बुवाई हेतु: WR-544 (पूसा गोल्ड), PBW-373, Raj-3765।\n"
            "• बीज दर: सामान्य बुवाई में 40-45 किग्रा प्रति एकड़।\n"
            "• बीज उपचार (FIR तकनीक): 2 ग्राम थीरम + 1 ग्राम कार्बेन्डाजिम प्रति किग्रा बीज से उपचारित करें।"
        ),
        "action": "advisory",
        "action_label": "🌾 गेहूं की विस्तृत एडवाइजरी देखें"
    },
    ("wheat", "general"): {
        "answer": (
            "🌾 गेहूं की संपूर्ण खेती गाइड:\n\n"
            "गेहूं की अच्छी पैदावार के लिए 20-22°C तापमान और दोमट मिट्टी सबसे उपयुक्त है। बुवाई 15 अक्टूबर से 25 नवंबर के बीच 40 किग्रा बीज दर से करें। सबसे जरूरी बात: बुवाई के 21 दिन बाद 'ताजमूल अवस्था (CRI Stage)' पर पहली सिंचाई और यूरिया की पहली खुराक दें।"
        ),
        "action": "advisory",
        "action_label": "🌾 गेहूं फसल व सिंचाई योजना देखें"
    },

    ("mustard", "weather_sowing"): {
        "answer": (
            "🌿 सरसों की खेती के लिए सही मौसम व बुवाई:\n\n"
            "• सही बुवाई समय: 25 सितंबर से 25 अक्टूबर सरसों की बुवाई का सबसे अनुकूल समय है।\n"
            "• अनुकूल तापमान: बुवाई के समय 25°C से 28°C और पौधों की वृद्धि के समय 15°C से 20°C ठंडा मौसम आवश्यक है।\n"
            "• बीज दर: 1.5 से 2 किग्रा प्रति एकड़। कतार से कतार दूरी 30 सेमी रखें।\n"
            "• पानी की आवश्यकता: सरसों में 1 से 2 हल्की सिंचाई (फूल आने से पहले और फलियां बनते समय) काफी होती हैं।"
        ),
        "action": "advisory",
        "action_label": "🌿 सरसों फसल एडवाइजरी देखें"
    },
    ("mustard", "disease_pest"): {
        "answer": (
            "🌿 सरसों में माहो (Aphid/चेपा) व रोगों का उपचार:\n\n"
            "• सरसों में फूल आते समय माहो (हरा या काला चेपा) रस चूसता है जिससे फलियां नहीं बनतीं।\n"
            "• रोकथाम: प्रकोप दिखते ही इमिडाक्लोप्रिड 17.8% SL (Imidacloprid) 1 मिली प्रति 3 लीटर पानी में, या थायमेथोक्सम 25% WG (5 ग्राम प्रति 15 लीटर पंप) का छिड़काव करें।\n"
            "• जैविक उपचार: 5 मिली नीम का तेल प्रति लीटर पानी में मिलाकर शाम के समय छिड़कें।"
        ),
        "action": "scanner",
        "action_label": "📸 पत्ता रोग स्कैनर से जांचें"
    },
    ("mustard", "general"): {
        "answer": (
            "🌿 सरसों की खेती गाइड:\n\n"
            "सरसों रबी की मुख्य तिलहनी फसल है। 25 सितंबर से 25 अक्टूबर तक बुवाई करें। इसमें अधिक पानी की जरूरत नहीं होती—सिर्फ 2 हल्की सिंचाई पर्याप्त हैं। फूल आते समय माहो कीट से फसल की सुरक्षा करें।"
        ),
        "action": "advisory",
        "action_label": "🌿 सरसों की सलाह देखें"
    },

    ("gram", "weather_sowing"): {
        "answer": (
            "🌱 चने की खेती के लिए सही मौसम व बुवाई:\n\n"
            "• बुवाई का सही समय: 15 अक्टूबर से 10 नवंबर।\n"
            "• अनुकूल तापमान: बुवाई के समय 20°C से 25°C तापमान उत्तम रहता है। अधिक गर्मी में उकठा (Wilt) रोग का खतरा बढ़ जाता है।\n"
            "• स्मार्ट टिप (खूंटाई / Nipping): बुवाई के 30-35 दिन बाद ऊपर की 2 सेमी कलिकाएं तोड़ दें। इससे 3 गुना ज्यादा शाखाएं फूटती हैं और पैदावार 25% बढ़ती है।"
        ),
        "action": "advisory",
        "action_label": "🌱 चना फसल एडवाइजरी देखें"
    },
    ("gram", "general"): {
        "answer": (
            "🌱 चने की उन्नत खेती:\n\n"
            "चना कम पानी वाली मिट्टी के लिए बेहतरीन फसल है। बुवाई 15 अक्टूबर से 10 नवंबर के बीच करें। बीज को ट्राइकोडर्मा (Trichoderma) 5 ग्राम/किग्रा से उपचारित करें ताकि उकठा रोग न लगे। बुवाई के 35 दिन बाद खूंटाई (Nipping) जरूर करें।"
        ),
        "action": "advisory",
        "action_label": "🌱 चना फसल योजना देखें"
    },

    ("rice", "general"): {
        "answer": (
            "🌾 धान (चावल) की उन्नत खेती व जल प्रबंधन:\n\n"
            "• रोपाई का समय: 20 जून से 15 जुलाई (खरीफ सीजन)।\n"
            "• पानी की बचत (AWD विधि): हर समय खेत में पानी भरा रखने की जगह 'वैकल्पिक सूखा व गीला' विधि अपनाएं, जिससे 30% पानी बचता है और कल्ले ज्यादा फूटते हैं।\n"
            "• खैरा रोग रोकथाम: रोपाई के 20 दिन बाद 5 किग्रा जिंक सल्फेट + 2.5 किग्रा बुझा चूना प्रति एकड़ छिड़कें।"
        ),
        "action": "advisory",
        "action_label": "🌾 धान एडवाइजरी देखें"
    },

    ("soybean", "general"): {
        "answer": (
            "🌱 सोयाबीन की उन्नत खेती:\n\n"
            "• बुवाई समय: मानसून की पहली अच्छी बारिश (75-100 मिमी) के बाद 20 जून से 10 जुलाई।\n"
            "• उन्नत तकनीक: जलभराव से बचाव के लिए रिज-फरो (Ridge & Furrow) या ब्रॉड बेड फरो (BBF) विधि से बुवाई करें।\n"
            "• बीज उपचार: राइजोबियम कल्चर (Rhizobium) और पीएसबी से बीज उपचार अवश्य करें।"
        ),
        "action": "advisory",
        "action_label": "🌱 सोयाबीन एडवाइजरी देखें"
    },

    ("maize", "general"): {
        "answer": (
            "🌽 मक्का की खेती व फॉल आर्मीवर्म से बचाव:\n\n"
            "• कतार से कतार दूरी 60 सेमी और पौधे से पौधे दूरी 20 सेमी रखें।\n"
            "• सिंचाई के नाजुक समय: घुटने की ऊंचाई पर और नर-मंजरी (Tasseling) निकलते समय।\n"
            "• फॉल आर्मीवर्म कीट नियंत्रण: मक्के की पोंगी में इमामेक्टिन बेंजोएट 5% SG (0.5 ग्राम/लीटर) का छिड़काव करें।"
        ),
        "action": "advisory",
        "action_label": "🌽 मक्का एडवाइजरी देखें"
    },

    ("cotton", "general"): {
        "answer": (
            "☁️ कपास की खेती व गुलाबी सुंडी नियंत्रण:\n\n"
            "• बुवाई समय: उत्तर भारत में अप्रैल-मई, मध्य व दक्षिण भारत में जून।\n"
            "• गुलाबी सुंडी (Pink Bollworm) रोकथाम: खेत में 4-5 फेरोमोन ट्रैप लगाएं। प्रकोप दिखने पर प्रोफेनोफॉस 50% EC 2 मिली प्रति लीटर या नीम तेल का छिड़काव करें।"
        ),
        "action": "advisory",
        "action_label": "☁️ कपास एडवाइजरी देखें"
    }
}

# General Topic Answers (When no single crop is specified)
GENERAL_TOPIC_ADVISORIES = {
    "fertilizer": {
        "answer": (
            "🌱 खाद व यूरिया डालने का वैज्ञानिक तरीका:\n\n"
            "• सही समय: यूरिया को हमेशा हल्की सिंचाई के 2 से 3 दिन बाद 'शाम के समय' डालें जब मिट्टी में ओट (पर्याप्त नमी) हो।\n"
            "• सावधानी: कभी भी तेज धूप या सूखी मिट्टी में यूरिया न डालें, इससे 40% नाइट्रोजन गैस बनकर उड़ जाती है।\n"
            "• नैनो यूरिया (Nano Urea): दानेदार यूरिया की जगह कल्ले फूटते समय 4 मिली नैनो यूरिया प्रति लीटर पानी में मिलाकर पत्तियों पर छिड़कें। यह 80% ज्यादा असरदार है।"
        ),
        "action": "advisory",
        "action_label": "🌾 अपने खेत के लिए सटीक खाद गणना करें"
    },
    "irrigation": {
        "answer": (
            "💧 सिंचाई व जल प्रबंधन सलाह:\n\n"
            "• सिंचाई करने से पहले हमेशा DRISHTI के लाइव वेदर अलर्ट में अगले 48 घंटों की बारिश का पूर्वानुमान चेक करें।\n"
            "• सिंचाई हमेशा शाम या रात के समय करें ताकि वाष्पीकरण से पानी का नुकसान न हो।\n"
            "• ड्रिप (टपक) सिंचाई अपनाने से 50% पानी बचता है और पैदावार 25% तक बढ़ती है। सरकार इस पर 55% से 80% तक सब्सिडी भी दे रही है।"
        ),
        "action": "alerts",
        "action_label": "🔔 लाइव मौसम व सिंचाई अलर्ट देखें"
    },
    "disease_pest": {
        "answer": (
            "📸 पत्ता पीलापन, कीट व रोग की पहचान:\n\n"
            "• अगर पत्तों में पीलापन, काले धब्बे या कीड़े दिख रहे हैं, तो तुरंत DRISHTI के 'पत्ता रोग स्कैनर' का उपयोग करें।\n"
            "• कैमरे से प्रभावित पत्ते की साफ फोटो खींचें। AI सेकंडों में बीमारी का नाम, फफूंदनाशक दवा और सही खुराक बता देगा।"
        ),
        "action": "scanner",
        "action_label": "📸 पत्ता रोग स्कैनर खोलें"
    },
    "schemes": {
        "answer": (
            "🏛️ किसानों के लिए प्रमुख सरकारी योजनाएं व सब्सिडी:\n\n"
            "1. PM-KUSUM योजना: खेत में सोलर पंप लगाने पर 60% से 90% तक की भारी सब्सिडी।\n"
            "2. PMKSY (ड्रिप/फव्वारा सिंचाई): टपक व फव्वारा सिंचाई यंत्रों पर 55% से 80% तक का अनुदान।\n"
            "3. PM-Kisan सम्मान निधि: प्रत्येक पंजीकृत किसान को ₹6,000 प्रति वर्ष की सीधी वित्तीय सहायता।\n"
            "4. PM फसल बीमा योजना (PMFBY): मौसम की मार, ओलावृष्टि व सूखे से फसल नुकसान पर पूरा मुआवजा।"
        ),
        "action": "schemes",
        "action_label": "🏛️ सभी सरकारी योजनाएं व सब्सिडी देखें"
    },
    "scanner": {
        "answer": (
            "📸 DRISHTI पत्ता रोग स्कैनर:\n\n"
            "आप अपनी फसल के बीमार पत्ते की फोटो खींचकर तुरंत AI से रोग की जांच कर सकते हैं। यह गेहूं के रतुआ (Rust), धान के झुलसा (Blast), सरसों के सफेद रतुआ और टमाटर के अगेती झुलसा जैसे 30+ रोगों को 98% सटीकता से पहचानता है।"
        ),
        "action": "scanner",
        "action_label": "📸 पत्ता रोग स्कैनर खोलें"
    },
    "fields": {
        "answer": (
            "🌱 मेरे खेत (My Fields) प्रबंधन:\n\n"
            "आप DRISHTI में अपने सभी खेतों (Plots) का रकबा, फसल का नाम और स्थान सुरक्षित रख सकते हैं। इससे सिस्टम प्रत्येक खेत के लिए अलग-अलग मौसम, नमी और खाद की सटीक सलाह प्रदान करता है।"
        ),
        "action": "fields",
        "action_label": "🌱 मेरे खेत (My Fields) खोलें"
    }
}


def detect_crop(query_lower: str) -> Optional[str]:
    """Detects crop from Hindi, Hinglish, or English keywords."""
    for crop_key, data in CROP_PATTERNS.items():
        for kw in data["keywords"]:
            pattern = rf"\b{re.escape(kw)}\b"
            if re.search(pattern, query_lower) or kw in query_lower:
                return crop_key
    return None


def detect_topic(query_lower: str) -> Optional[str]:
    """Detects agricultural intent/topic."""
    for topic_key, keywords in TOPIC_PATTERNS.items():
        for kw in keywords:
            if kw in query_lower:
                return topic_key
    return None


def clean_markdown(text: str) -> str:
    """Removes all raw markdown syntax like **bold**, ## headers, etc."""
    if not text:
        return ""
    # Strip asterisks
    text = re.sub(r"\*{1,3}(.*?)\*{1,3}", r"\1", text)
    # Strip header symbols #
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    return text.strip()


def ask_agri_assistant(query: str, language: str = "hi") -> Dict[str, Any]:
    """
    Intelligent Agronomy Agent:
    1. Robustly parses Devanagari Hindi, Roman Hinglish, English, and Marathi.
    2. Identifies Crop + Action/Topic combination.
    3. Returns clean, farmer-friendly agronomic advisory with deep links.
    4. Free of raw Markdown symbols!
    """
    if not query or not query.strip():
        return {
            "query": query,
            "answer": "कृपया अपना कृषि संबंधित सवाल पूछें।",
            "action": "advisory",
            "action_label": "🌾 नई फसल सलाह शुरू करें",
            "is_conversational": True
        }

    q = query.strip().lower()

    # Step 1: Detect entities
    crop = detect_crop(q)
    topic = detect_topic(q)

    # Step 2: Crop + Topic Specific Match
    if crop and topic:
        if (crop, topic) in EXPERT_ADVISORIES:
            item = EXPERT_ADVISORIES[(crop, topic)]
            return {
                "query": query,
                "answer": clean_markdown(item["answer"]),
                "action": item.get("action", "advisory"),
                "action_label": item.get("action_label", "🌾 फसल सलाह देखें"),
                "is_conversational": True
            }
        
        if (crop, "general") in EXPERT_ADVISORIES:
            item = EXPERT_ADVISORIES[(crop, "general")]
            return {
                "query": query,
                "answer": clean_markdown(item["answer"]),
                "action": item.get("action", "advisory"),
                "action_label": item.get("action_label", "🌾 फसल सलाह देखें"),
                "is_conversational": True
            }

    # Step 3: Crop only Match
    if crop:
        if (crop, "general") in EXPERT_ADVISORIES:
            item = EXPERT_ADVISORIES[(crop, "general")]
            return {
                "query": query,
                "answer": clean_markdown(item["answer"]),
                "action": item.get("action", "advisory"),
                "action_label": item.get("action_label", "🌾 फसल सलाह देखें"),
                "is_conversational": True
            }
        crop_hi = CROP_PATTERNS[crop]["name_hi"]
        return {
            "query": query,
            "answer": clean_markdown(
                f"🌾 {crop_hi} की खेती के लिए महत्वपूर्ण सलाह:\n\n"
                f"• {crop_hi} की अच्छी बढ़वार के लिए खेत में 50-70% नमी बनाए रखें।\n"
                f"• बुवाई के समय अनुशंसित बीज दर और संतुलित उर्वरक (NPK) का प्रयोग करें।\n"
                f"• नीचे दिए गए बटन पर टैप करके अपने खेत का सटीक डेटा दर्ज करें और कस्टमाइज्ड सिंचाई-खाद शेड्यूल पाएं।"
            ),
            "action": "advisory",
            "action_label": f"🌾 {crop_hi} के लिए सलाह प्राप्त करें",
            "is_conversational": True
        }

    # Step 4: Topic only Match
    if topic and topic in GENERAL_TOPIC_ADVISORIES:
        item = GENERAL_TOPIC_ADVISORIES[topic]
        return {
            "query": query,
            "answer": clean_markdown(item["answer"]),
            "action": item.get("action", "advisory"),
            "action_label": item.get("action_label", "🌾 सलाह प्राप्त करें"),
            "is_conversational": True
        }

    # Step 5: Agriculture Keywords Fallback
    agri_words = ["kheti", "fasal", "khad", "dawa", "dawai", "keeda", "keet", "pani", "khet", "kisan", "sinchai", "mitti", "paidawar", "upaj", "farming", "crop", "farm", "fertilizer", "soil", "harvest", "yield", "शेती", "पीक"]
    if any(w in q for w in agri_words):
        return {
            "query": query,
            "answer": clean_markdown(
                "🌾 DRISHTI कृषि विशेषज्ञ सलाह:\n\n"
                "फसल की भरपूर पैदावार के लिए 3 मूल सिद्धांतों का पालन करें:\n"
                "1. मिट्टी की नमी: खेत में नमी 50% से 70% के बीच रखें। अधिक या बहुत कम पानी से जड़ें कमजोर होती हैं।\n"
                "2. संतुलित पोषण (NPK): यूरिया को हमेशा सिंचाई के 2-3 दिन बाद शाम के समय डालें।\n"
                "3. समय पर रोग प्रबंधन: पत्तियों में पीलापन या कीट दिखते ही फोटो खींचकर पत्ता रोग स्कैनर से जांचें।\n\n"
                "आप नीचे दिए गए बटन से अपने खेत के लिए सटीक सिंचाई व खाद योजना प्राप्त कर सकते हैं।"
            ),
            "action": "advisory",
            "action_label": "🌾 अपने खेत के लिए सटीक सलाह प्राप्त करें",
            "is_conversational": True
        }

    # Step 6: Smart Contextual Fallback
    return {
        "query": query,
        "answer": clean_markdown(
            "🌾 DRISHTI AI कृषि सलाहकार:\n\n"
            "मैं आपके खेती के सवालों में मदद के लिए तैयार हूँ।\n\n"
            "आप मुझसे पूछ सकते हैं:\n"
            "• फसलों की खेती: गेहूं, सरसों, चना, धान या मक्का की बुवाई का सही मौसम व तापमान\n"
            "• खाद व यूरिया: यूरिया डालने का सही समय और नैनो यूरिया का छिड़काव\n"
            "• रोग व कीट: पत्तों में पीलापन, माहो या सुंडी का वैज्ञानिक उपचार\n"
            "• सरकारी योजनाएं: सोलर पंप (PM-KUSUM) व ड्रिप सिंचाई पर सब्सिडी"
        ),
        "action": "advisory",
        "action_label": "🌾 नई फसल सलाह शुरू करें",
        "is_conversational": True
    }

import re
from typing import Dict, Any, List, Optional

# Hindi/Marathi/English Spoken Numbers Mapping
NUMBER_MAP = {
    "शून्य": 0, "zero": 0,
    "एक": 1, "one": 1,
    "दो": 2, "two": 2,
    "तीन": 3, "three": 3,
    "चार": 4, "four": 4,
    "पांच": 5, "five": 5,
    "छह": 6, "छः": 6, "six": 6,
    "सात": 7, "seven": 7,
    "आठ": 8, "eight": 8,
    "नौ": 9, "nine": 9,
    "दस": 10, "ten": 10,
    "ग्यारह": 11, "eleven": 11,
    "बारह": 12, "twelve": 12,
    "तेरह": 13, "thirteen": 13,
    "चौदह": 14, "fourteen": 14,
    "पंद्रह": 15, "fifteen": 15,
    "सोलह": 16, "sixteen": 16,
    "सत्रह": 17, "seventeen": 17,
    "अठारह": 18, "eighteen": 18,
    "उन्नीस": 19, "nineteen": 19,
    "बीस": 20, "twenty": 20,
    "इक्कीस": 21, "twenty one": 21,
    "बाईस": 22, "twenty two": 22,
    "तेईस": 23, "twenty three": 23,
    "चौबीस": 24, "twenty four": 24,
    "पच्चीस": 25, "twenty five": 25,
    "छब्बीस": 26, "twenty six": 26,
    "सत्ताईस": 27, "twenty seven": 27,
    "अट्ठाईस": 28, "twenty eight": 28,
    "उनतीस": 29, "twenty nine": 29,
    "तीस": 30, "thirty": 30,
    "इकतीस": 31, "thirty one": 31,
    "बत्तीस": 32, "thirty two": 32,
    "तैंतीस": 33, "thirty three": 33,
    "चौंतीस": 34, "thirty four": 34,
    "पैंतीस": 35, "thirty five": 35,
    "छत्तीज़": 36, "thirty six": 36,
    "सैंतीस": 37, "thirty seven": 37,
    "अड़तीस": 38, "thirty eight": 38,
    "उनतालीस": 39, "thirty nine": 39,
    "चालीस": 40, "forty": 40,
    "इकतालीस": 41, "forty one": 41,
    "बयालीस": 42, "forty two": 42,
    "तैंतालीस": 43, "forty three": 43,
    "चौवालीस": 44, "forty four": 44,
    "पैंतालीस": 45, "forty five": 45,
    "छियालीस": 46, "forty six": 46,
    "सैंतालीस": 47, "forty seven": 47,
    "अड़तालीस": 48, "forty eight": 48,
    "उनचास": 49, "forty nine": 49,
    "पचास": 50, "fifty": 50,
    "इक्यावन": 51, "fifty one": 51,
    "बावन": 52, "fifty two": 52,
    "तिरेपन": 53, "fifty three": 53,
    "चौवन": 54, "fifty four": 54,
    "पचपन": 55, "fifty five": 55,
    "छप्पन": 56, "fifty six": 56,
    "सत्तावन": 57, "fifty seven": 57,
    "अट्ठावन": 58, "fifty eight": 58,
    "उनसठ": 59, "fifty nine": 59,
    "साठ": 60, "sixty": 60,
    "इकसठ": 61, "sixty one": 61,
    "बासठ": 62, "sixty two": 62,
    "तिरसठ": 63, "sixty three": 63,
    "चौंसठ": 64, "sixty four": 64,
    "पैंसठ": 65, "sixty five": 65,
    "छियासठ": 66, "sixty six": 66,
    "सड़सठ": 67, "sixty seven": 67,
    "अड़सठ": 68, "sixty eight": 68,
    "उनहत्तर": 69, "sixty nine": 69,
    "सत्तर": 70, "seventy": 70,
    "इकहत्तर": 71, "seventy one": 71,
    "बहत्तर": 72, "seventy two": 72,
    "तिहत्तर": 73, "seventy three": 73,
    "चौहत्तर": 74, "seventy four": 74,
    "पचहत्तर": 75, "seventy five": 75,
    "छिहत्तर": 76, "seventy six": 76,
    "सतहत्तर": 77, "seventy seven": 77,
    "अठहत्तर": 78, "seventy eight": 78,
    "उन्नासी": 79, "seventy nine": 79,
    "अस्सी": 80, "eighty": 80,
    "इक्यासी": 81, "eighty one": 81,
    "बयासी": 82, "eighty two": 82,
    "तिरासी": 83, "eighty three": 83,
    "चौरासी": 84, "eighty four": 84,
    "पचासी": 85, "eighty five": 85,
    "छियासी": 86, "eighty six": 86,
    "सतासी": 87, "eighty seven": 87,
    "अट्ठासी": 88, "eighty eight": 88,
    "नवासी": 89, "eighty nine": 89,
    "नब्बे": 90, "ninety": 90,
    "इक्यानबे": 91, "ninety one": 91,
    "बानवे": 92, "ninety two": 92,
    "तिरानवे": 93, "ninety three": 93,
    "चौरानवे": 94, "ninety four": 94,
    "पचानवे": 95, "ninety five": 95,
    "छियानवे": 96, "ninety six": 96,
    "सत्तानवे": 97, "ninety seven": 97,
    "अट्ठानवे": 98, "ninety eight": 98,
    "निन्यानवे": 99, "ninety nine": 99,
    "सौ": 100, "hundred": 100
}

CROP_MAP = {
    "गेहूं": "wheat", "गेहू": "wheat", "gehu": "wheat", "gehun": "wheat", "wheat": "wheat", "गहू": "wheat",
    "चावल": "rice", "धान": "rice", "chawal": "rice", "dhan": "rice", "rice": "rice", "paddy": "rice", "भात": "rice", "तांदूळ": "rice",
    "कपास": "cotton", "kapas": "cotton", "cotton": "cotton", "कापूस": "cotton",
    "मक्का": "maize", "मका": "maize", "makka": "maize", "maize": "maize", "corn": "maize",
    "गन्ना": "sugarcane", "ganna": "sugarcane", "sugarcane": "sugarcane", "ऊस": "sugarcane",
    "आलू": "potato", "aaloo": "potato", "aalu": "potato", "potato": "potato", "बटाटा": "potato",
    "टमाटर": "tomato", "tamatar": "tomato", "tomato": "tomato", "टोमॅटो": "tomato",
    "सोयाबीन": "soybean", "soybean": "soybean", "soyabean": "soybean",
    "सरसों": "mustard", "sarson": "mustard", "mustard": "mustard", "मोहरी": "mustard",
    "चना": "gram", "chana": "gram", "chickpea": "gram", "हरभरा": "gram",
    "प्याज": "onion", "pyaj": "onion", "pyaz": "onion", "onion": "onion", "कांदा": "onion",
    "बाजरा": "bajra", "bajri": "bajra", "pearl millet": "bajra", "बाजरी": "bajra",
    "मूंगफली": "groundnut", "mungfali": "groundnut", "groundnut": "groundnut", "भुईमूग": "groundnut"
}

def parse_number(text: str) -> Optional[float]:
    """Tries to extract a number from a string, parsing Hindi words or digits."""
    text = text.strip().lower()
    if not text:
        return None
        
    # Check digits
    match = re.search(r'([0-9]+(?:\.[0-9]+)?)', text)
    if match:
        return float(match.group(1))
        
    # Check words (sort keys by length descending to match longest first, e.g. इकतीस before तीस)
    for word in sorted(NUMBER_MAP.keys(), key=len, reverse=True):
        if word in text:
            return float(NUMBER_MAP[word])
            
    return None

def extract_fields(transcript: str) -> Dict[str, Any]:
    """
    Parses a voice transcript into DRISHTI form fields deterministically.
    """
    lower = transcript.lower()
    result: Dict[str, Any] = {
        "transcript": transcript,
        "extracted_fields": {},
        "missing_fields": ["crop_type", "soil_moisture", "temperature", "rainfall"],
        "confidence": {}
    }
    
    # 1. Detect Crop
    for kw, crop_val in CROP_MAP.items():
        if kw.lower() in lower:
            result["extracted_fields"]["crop_type"] = crop_val
            result["confidence"]["crop_type"] = 0.95
            result["missing_fields"].remove("crop_type")
            break

    # Extract all number phrases
    # Regex finds digits OR words from our NUMBER_MAP
    word_pattern = "|".join(NUMBER_MAP.keys())
    num_regex = re.compile(f'([0-9]+(?:\.[0-9]+)?|{word_pattern})')
    
    # Keyword patterns
    moist_pattern = re.compile(r'(?:moisture|nami|नमी|ओलावा)\s*(?:is|=|level|प्रतिशत|percent|%|\s)?\s*([0-9]+(?:\.[0-9]+)?|' + word_pattern + r')')
    temp_pattern = re.compile(r'(?:temp|temperature|tapman|तापमान|डिग्री|degree)\s*(?:is|=|level|\s)?\s*([0-9]+(?:\.[0-9]+)?|' + word_pattern + r')')
    rain_pattern = re.compile(r'(?:rain|rainfall|barish|varsha|बारिश|वर्षा|पाऊस)\s*(?:is|=|level|mm|मिलीमीटर|\s)?\s*([0-9]+(?:\.[0-9]+)?|' + word_pattern + r')')

    # 2. Extract Moisture
    moist_match = moist_pattern.search(lower)
    if moist_match:
        val = parse_number(moist_match.group(1))
        if val is not None:
            result["extracted_fields"]["soil_moisture"] = val
            result["confidence"]["soil_moisture"] = 0.95
            result["missing_fields"].remove("soil_moisture")

    # 3. Extract Temperature
    temp_match = temp_pattern.search(lower)
    if temp_match:
        val = parse_number(temp_match.group(1))
        if val is not None:
            result["extracted_fields"]["temperature"] = val
            result["confidence"]["temperature"] = 0.95
            result["missing_fields"].remove("temperature")

    # 4. Extract Rainfall
    rain_match = rain_pattern.search(lower)
    if rain_match:
        val = parse_number(rain_match.group(1))
        if val is not None:
            result["extracted_fields"]["rainfall"] = val
            result["confidence"]["rainfall"] = 0.95
            result["missing_fields"].remove("rainfall")

    # 5. Fallback logic: positional numbers if keywords missed
    if len(result["missing_fields"]) > 0:
        all_nums = []
        for m in num_regex.finditer(lower):
            n = parse_number(m.group(1))
            if n is not None:
                all_nums.append(n)
                
        # Exclude numbers we already extracted safely
        extracted_vals = list(result["extracted_fields"].values())
        unassigned_nums = [n for n in all_nums if n not in extracted_vals and isinstance(n, (int, float))]
        
        # If we have unassigned numbers, assign them to missing fields in typical order (moisture, temp, rain)
        # Only if we can reasonably guess (e.g. moisture usually 0-100, temp 10-50)
        idx = 0
        while idx < len(unassigned_nums) and len(result["missing_fields"]) > 0:
            num = unassigned_nums[idx]
            
            if "soil_moisture" in result["missing_fields"] and 0 <= num <= 100:
                result["extracted_fields"]["soil_moisture"] = num
                result["confidence"]["soil_moisture"] = 0.6
                result["missing_fields"].remove("soil_moisture")
            elif "temperature" in result["missing_fields"] and 5 <= num <= 50:
                result["extracted_fields"]["temperature"] = num
                result["confidence"]["temperature"] = 0.6
                result["missing_fields"].remove("temperature")
            elif "rainfall" in result["missing_fields"] and 0 <= num <= 300:
                result["extracted_fields"]["rainfall"] = num
                result["confidence"]["rainfall"] = 0.6
                result["missing_fields"].remove("rainfall")
            idx += 1

    # Remove string types from missing_fields to avoid frontend crashes
    # Just a cleanup step
    result["missing_fields"] = [f for f in result["missing_fields"] if f in ["crop_type", "soil_moisture", "temperature", "rainfall"]]

    return result

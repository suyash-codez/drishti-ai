export interface ParsedVoiceData {
  crop_type?: string;
  soil_moisture?: number;
  temperature?: number;
  rainfall?: number;
}

const CROP_MAP: { [key: string]: string } = {
  // Hindi / Hinglish
  "गेहूं": "wheat",
  "गेहू": "wheat",
  "gehu": "wheat",
  "gehun": "wheat",
  "wheat": "wheat",
  "गहू": "wheat",

  "चावल": "rice",
  "धान": "rice",
  "chawal": "rice",
  "dhan": "rice",
  "rice": "rice",
  "paddy": "rice",
  "भात": "rice",
  "तांदूळ": "rice",

  "कपास": "cotton",
  "kapas": "cotton",
  "cotton": "cotton",
  "कापूस": "cotton",

  "मक्का": "maize",
  "मका": "maize",
  "makka": "maize",
  "maize": "maize",
  "corn": "maize",

  "गन्ना": "sugarcane",
  "ganna": "sugarcane",
  "sugarcane": "sugarcane",
  "ऊस": "sugarcane",

  "आलू": "potato",
  "aaloo": "potato",
  "aalu": "potato",
  "potato": "potato",
  "बटाटा": "potato",

  "टमाटर": "tomato",
  "tamatar": "tomato",
  "tomato": "tomato",
  "टोमॅटो": "tomato",

  "सोयाबीन": "soybean",
  "soybean": "soybean",
  "soyabean": "soybean",

  "सरसों": "mustard",
  "sarson": "mustard",
  "mustard": "mustard",
  "मोहरी": "mustard",

  "चना": "gram",
  "chana": "gram",
  "chickpea": "gram",
  "हरभरा": "gram",

  "प्याज": "onion",
  "pyaj": "onion",
  "pyaz": "onion",
  "onion": "onion",
  "कांदा": "onion",

  "बाजरा": "bajra",
  "bajra": "bajra",
  "बाजरी": "bajra",

  "मूंगफली": "groundnut",
  "mungfali": "groundnut",
  "groundnut": "groundnut",
  "भुईमूग": "groundnut",
};

export function parseVoiceTranscript(text: string): ParsedVoiceData {
  const result: ParsedVoiceData = {};
  const lower = text.toLowerCase();

  // 1. Detect Crop
  for (const [kw, cropVal] of Object.entries(CROP_MAP)) {
    if (lower.includes(kw.toLowerCase())) {
      result.crop_type = cropVal;
      break;
    }
  }

  // 2. Extract Numbers with contextual keywords
  // Check moisture: "nami", "moisture", "percent", "%"
  const moistRegex = /(?:moisture|nami|नमी|ओलावा)\s*(?:is|=|level)?\s*([0-9]+(?:\.[0-9]+)?)/i;
  const moistMatch = lower.match(moistRegex);
  if (moistMatch) {
    result.soil_moisture = parseFloat(moistMatch[1]);
  }

  // Check temperature: "temp", "temperature", "tapman", "degree", "celsius"
  const tempRegex = /(?:temp|temperature|tapman|तापमान|डिग्री|degree)\s*(?:is|=|level)?\s*([0-9]+(?:\.[0-9]+)?)/i;
  const tempMatch = lower.match(tempRegex);
  if (tempMatch) {
    result.temperature = parseFloat(tempMatch[1]);
  }

  // Check rainfall: "rain", "rainfall", "barish", "varsha", "mm"
  const rainRegex = /(?:rain|rainfall|barish|varsha|बारिश|वर्षा|पाऊस)\s*(?:is|=|level)?\s*([0-9]+(?:\.[0-9]+)?)/i;
  const rainMatch = lower.match(rainRegex);
  if (rainMatch) {
    result.rainfall = parseFloat(rainMatch[1]);
  }

  // Fallback: If only raw numbers were spoken, assign sequentially
  const allNumbers = lower.match(/[0-9]+(?:\.[0-9]+)?/g);
  if (allNumbers && allNumbers.length > 0) {
    const nums = allNumbers.map(Number);
    if (result.soil_moisture === undefined && nums[0] !== undefined) {
      result.soil_moisture = nums[0];
    }
    if (result.temperature === undefined && nums[1] !== undefined) {
      result.temperature = nums[1];
    }
    if (result.rainfall === undefined && nums[2] !== undefined) {
      result.rainfall = nums[2];
    }
  }

  return result;
}

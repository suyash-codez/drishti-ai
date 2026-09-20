"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  ChevronLeft, 
  Camera, 
  Image as ImageIcon, 
  Loader2, 
  Info, 
  CheckCircle2, 
  RefreshCw, 
  X,
  ExternalLink,
  ShoppingBag,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Leaf,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { uploadLeafPhoto, DiseaseDetectionResponse } from "../lib/api";

interface CropDiseaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: Record<string, string>;
  currentLanguage?: string;
}

export const CropDiseaseModal: React.FC<CropDiseaseModalProps> = ({
  isOpen,
  onClose,
  labels,
  currentLanguage = "hi",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);
  const [isMagnified, setIsMagnified] = useState(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async (facing: "environment" | "user" = "environment") => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraError(null);
    setCameraActive(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      const msg =
        err.name === "NotAllowedError"
          ? "कैमरा अनुमति नहीं मिली। ब्राउज़र सेटिंग्स में कैमरा Allow करें।"
          : err.name === "NotFoundError"
          ? "कोई कैमरा नहीं मिला। गैलरी से फ़ोटो अपलोड करें।"
          : `Camera Error: ${err.message}`;
      setCameraError(msg);
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (isOpen && !result && !previewUrl) {
      startCamera(facingMode);
    }
    return () => {
      if (!isOpen) stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCaptureSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `leaf_${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      stopCamera();
      setSelectedFile(file);
      setPreviewUrl(url);
      setResult(null);
      setErrorMsg(null);
      await performAnalysis(file);
    }, "image/jpeg", 0.92);
  };

  const handleFlipCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      stopCamera();
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setErrorMsg(null);
      await performAnalysis(file);
    }
  };

  const performAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await uploadLeafPhoto(file, currentLanguage);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? "Failed to analyze image" : "पत्ते का विश्लेषण विफल रहा"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg(null);
    startCamera(facingMode);
  };

  const handleClose = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg(null);
    setCameraError(null);
    onClose();
  };

  const isEn = currentLanguage === "en";

  const getBadgeColor = (confidence: number) => {
    if (confidence < 0.6) return "bg-red-100 text-red-700 border-red-200";
    if (confidence < 0.85) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  };

  const getSeverityText = (confidence: number) => {
    if (confidence < 0.6) return isEn ? "Low Confidence" : "कम सटीकता स्तर";
    if (confidence < 0.85) return isEn ? "Moderate Confidence" : "मध्यम सटीकता स्तर";
    return isEn ? "High Confidence" : "उच्च सटीकता (High Confidence)";
  };

  const getDiseaseRemedyInfo = (prediction: string, isEn: boolean) => {
    const key = (prediction || "").toLowerCase();

    // 1. Rust Diseases (Puccinia / Cedar Rust)
    if (key.includes("rust")) {
      return {
        category: isEn ? "Fungal Rust (Puccinia)" : "फफूंद संक्रमण (रस्ट / जंग रोग)",
        symptoms: isEn 
          ? "Orange-brown raised pustules on leaf surface, reducing photosynthetic leaf area by 30-45% and leading to premature leaf drop."
          : "पत्तियों की सतह पर उभरे हुए पीले-भूरे दाने (Pustules), जो प्रकाश संश्लेषण 30-45% तक घटा देते हैं और पत्तियां पीली होकर सूखने लगती हैं।",
        products: [
          {
            name: "Tata Rallis Contaf Plus",
            brand: "Tata Rallis",
            chemical: "Hexaconazole 5% SC",
            dosage: isEn ? "2 ml / liter water (30 ml per 15L pump)" : "2 मिली प्रति लीटर पानी (30 ml प्रति 15L पंप)",
            type: "chemical" as const,
            estPrice: "₹240 (250 ml)",
            link: "https://www.bighaat.com/search?q=hexaconazole",
            storeName: "BigHaat Official",
            image: "/products/prod_contaf.jpg",
          },
          {
            name: "Indofil M-45 (Mancozeb 75% WP)",
            brand: "Indofil Industries",
            chemical: "Mancozeb 75% WP",
            dosage: isEn ? "2.5 g / liter water (35-40 g per pump)" : "2.5 ग्राम प्रति लीटर पानी (35-40 g प्रति पंप)",
            type: "chemical" as const,
            estPrice: "₹195 (500 g)",
            link: "https://www.bighaat.com/search?q=mancozeb",
            storeName: "BigHaat / IFFCO",
            image: "/products/prod_mancozeb.jpg",
          },
          {
            name: isEn ? "IFFCO Bio-Fungicide (Trichoderma)" : "IFFCO बायो-फंगिसाइड (ट्राइकोडर्मा)",
            brand: "IFFCO",
            chemical: "Trichoderma Viride 1% WP",
            dosage: isEn ? "5 g / liter water (Eco-Safe)" : "5 ग्राम प्रति लीटर पानी (सुरक्षित जैविक)",
            type: "organic" as const,
            estPrice: "₹120 (500 g)",
            link: "https://www.iffcobazar.in/en/product/iffco-trichoderma-viride",
            storeName: "IFFCO Bazar (Govt)",
            image: "/products/prod_trichoderma.jpg",
          }
        ],
        steps: isEn ? [
          "Sanitation: Pluck heavily infected lower leaves and bury them outside field boundaries.",
          "Foliar Spray: Mix 30ml Hexaconazole in 15L water pump; ensure uniform misting on leaf undersides.",
          "Repeat Interval: If humidity stays >70%, repeat second spray after 12-14 days.",
        ] : [
          "सफाई: अत्यधिक प्रभावित पत्तियों को तोड़कर खेत से दूर जमीन में दबाएं।",
          "घोल व स्प्रे: 15 लीटर पंप की टंकी में 30 मिली दवा घोलें; पत्तियों के निचले भाग पर भी अच्छी तरह फुहार करें।",
          "छिड़काव चक्र: यदि नमी व बादल बने रहें तो 12-14 दिन बाद दूसरा सुरक्षात्मक छिड़काव करें।",
        ],
        organicTip: isEn 
          ? "Dissolve 5ml Neem Oil (1500 ppm) with 2g baking soda per liter of water as a biological antifungal shield."
          : "5 मिली नीम का तेल (1500 ppm) + 2 ग्राम बेकिंग सोडा प्रति लीटर पानी में मिलाकर 7 दिन के अंतराल पर छिड़कें।",
        sprayNotice: isEn 
          ? "Rain Warning: Do not spray if rainfall is forecasted in next 24 hours — rain washes away chemical."
          : "मौसम सावधानी: यदि अगले 24 घंटों में बारिश का अनुमान है तो छिड़काव टालें — बारिश में दवा धुलने से नुकसान होगा।",
      };
    }

    // 2. Blight (Early Blight, Late Blight, Northern Leaf Blight)
    if (key.includes("blight")) {
      return {
        category: isEn ? "Foliar Blight (Alternaria / Phytophthora)" : "झुलसा रोग (अगेती / पछेती लीफ ब्लाइट)",
        symptoms: isEn 
          ? "Concentric dark brown target spots surrounded by yellow margins, rapidly burning foliage."
          : "पत्तियों पर छल्लेदार गोल भूरे-काले धब्बे और पीला घेरा, जिससे पूरी पत्ती झुलसकर सूख जाती है।",
        products: [
          {
            name: "UPL Saaf Fungicide",
            brand: "UPL Ltd",
            chemical: "Carbendazim 12% + Mancozeb 63% WP",
            dosage: isEn ? "2 g / liter water (30 g per pump)" : "2 ग्राम प्रति लीटर पानी (30 g प्रति पंप)",
            type: "chemical" as const,
            estPrice: "₹210 (250 g)",
            link: "https://www.bighaat.com/search?q=saaf+fungicide",
            storeName: "BigHaat Online",
            image: "/products/prod_saaf.jpg",
          },
          {
            name: "Syngenta Ridomil Gold",
            brand: "Syngenta",
            chemical: "Metalaxyl-M 4% + Mancozeb 64% WP",
            dosage: isEn ? "2.5 g / liter water" : "2.5 ग्राम प्रति लीटर पानी",
            type: "chemical" as const,
            estPrice: "₹390 (250 g)",
            link: "https://www.bighaat.com/search?q=ridomil+gold",
            storeName: "BigHaat Official",
            image: "/products/prod_mancozeb.jpg",
          },
          {
            name: "Tata Blitox 50",
            brand: "Tata Rallis",
            chemical: "Copper Oxychloride 50% WP",
            dosage: isEn ? "3 g / liter water" : "3 ग्राम प्रति लीटर पानी",
            type: "chemical" as const,
            estPrice: "₹230 (500 g)",
            link: "https://agribegri.com/search.php?search=blitox",
            storeName: "AgriBegri",
            image: "/products/prod_contaf.jpg",
          }
        ],
        steps: isEn ? [
          "Avoid overhead sprinkler watering to keep foliage dry.",
          "Spray systemic fungicide (Saaf or Ridomil) covering both upper and lower canopy.",
          "Do not mix with alkaline fertilizers or weedicides.",
        ] : [
          "पत्तियों को सूखा रखने के लिए फव्वारा (स्प्रिंकलर) सिंचाई तुरंत रोकें।",
          "साफ (Saaf) या रिडोमिल गोल्ड का पौधों के ऊपरी और निचले दोनों भागों पर पूरा छिड़काव करें।",
          "कीटनाशक को किसी खरपतवारनाशी (weedicide) के साथ मिलाकर न डालें।",
        ],
        organicTip: isEn
          ? "Spray 10% sour buttermilk mixed with 1g copper sulphate per 10L as traditional antifungal remedy."
          : "10 लीटर पानी में 1 लीटर खट्टी छाछ (तांबे के बर्तन में रखी) मिलाकर छिड़कने से झुलसा रोग में तुरंत लाभ मिलता है।",
        sprayNotice: isEn
          ? "Avoid spraying during peak noon heat — spray in cool morning or late afternoon hours."
          : "दोपहर की तेज धूप में छिड़काव न करें — सुबह 10 बजे से पहले या शाम को करें।",
      };
    }

    // 3. Powdery Mildew / Leaf Mold / Scab
    if (key.includes("mildew") || key.includes("mold") || key.includes("scab")) {
      return {
        category: isEn ? "Fungal Mildew & Scab Infection" : "चूर्णिल फफूंद व मोल्ड (सफेद पाउडरी फंगस)",
        symptoms: isEn 
          ? "White powdery talc-like patches covering leaf surface, curling leaves and stunting growth."
          : "पत्तियों पर सफेद पाउडर या राख जैसा चूर्ण जमना, पत्तियां मुड़ना और विकास रुक जाना।",
        products: [
          {
            name: "Bayer Nativo",
            brand: "Bayer CropScience",
            chemical: "Tebuconazole 50% + Trifloxystrobin 25% WG",
            dosage: isEn ? "0.8 g / liter water (High Efficacy)" : "0.8 ग्राम प्रति लीटर पानी (अत्यधिक प्रभावी)",
            type: "chemical" as const,
            estPrice: "₹490 (100 g)",
            link: "https://www.bighaat.com/search?q=nativo",
            storeName: "BigHaat Online",
            image: "/products/prod_nativo.jpg",
          },
          {
            name: "Sulfex Gold WDG",
            brand: "Excel Crop Care",
            chemical: "Wettable Sulphur 80% WDG",
            dosage: isEn ? "3 g / liter water (Sulphur Nutrition + Fungicide)" : "3 ग्राम प्रति लीटर पानी (सल्फर पोषण + फफूंदनाशक)",
            type: "chemical" as const,
            estPrice: "₹140 (1 kg)",
            link: "https://www.iffcobazar.in/en/product/sulphur-80-wdg",
            storeName: "IFFCO Bazar",
            image: "/products/prod_mancozeb.jpg",
          },
          {
            name: "IFFCO Neem Oil 1500 ppm",
            brand: "IFFCO",
            chemical: "Cold Pressed Azadirachtin 0.15% EC",
            dosage: isEn ? "5 ml / liter water" : "5 मिली प्रति लीटर पानी",
            type: "organic" as const,
            estPrice: "₹175 (250 ml)",
            link: "https://www.iffcobazar.in/en/product/iffco-neem-oil",
            storeName: "IFFCO Bazar",
            image: "/products/prod_neemoil.jpg",
          }
        ],
        steps: isEn ? [
          "Ensure adequate row-to-row spacing for sunlight penetration.",
          "Spray Wettable Sulphur or Nativo covering inner foliage.",
          "Repeat after 10-12 days if white powder reappears.",
        ] : [
          "खेत में धूप और हवा के संचार के लिए क्यारियों की छंटाई करें।",
          "सल्फर 80% या नैटिवो का पत्तियों के भीतरी हिस्सों तक गहरा छिड़काव करें।",
          "सफेद पाउडर दोबारा दिखे तो 10-12 दिन बाद दूसरा स्प्रे दोहराएं।",
        ],
        organicTip: isEn
          ? "Spray 5ml organic Neem Oil + 1g washing soda per liter water every 7 days."
          : "5 मिली नीम तेल + 1 चुटकी कपड़े धोने का सोडा प्रति लीटर पानी में मिलाकर हर 7 दिन में स्प्रे करें।",
        sprayNotice: isEn
          ? "Do not use Sulphur if temperature exceeds 36°C to avoid leaf burn."
          : "यदि तापमान 36°C से अधिक हो तो सल्फर का प्रयोग न करें, पत्तियां जल सकती हैं।",
      };
    }

    // 4. Viral / Leaf Curl / Mites
    if (key.includes("virus") || key.includes("curl") || key.includes("mite")) {
      return {
        category: isEn ? "Viral & Vector Pest Complex" : "लीफ कर्ल वायरस व रस चूसक कीट",
        symptoms: isEn 
          ? "Upward/downward leaf curling, thick brittle leaves caused by whitefly & thrips vectors."
          : "पत्तियों का ऊपर या नीचे की तरफ मुड़ना (मरोड़िया रोग), जो सफेद मक्खी व थ्रिप्स कीटों से फैलता है।",
        products: [
          {
            name: "Bayer Confidor",
            brand: "Bayer CropScience",
            chemical: "Imidacloprid 17.8% SL",
            dosage: isEn ? "0.5 ml / liter water (7.5 ml per 15L pump)" : "0.5 मिली प्रति लीटर पानी (7.5 ml प्रति 15L पंप)",
            type: "chemical" as const,
            estPrice: "₹220 (100 ml)",
            link: "https://www.bighaat.com/search?q=confidor",
            storeName: "BigHaat Official",
            image: "/products/prod_confidor.jpg",
          },
          {
            name: "Omite Miticide",
            brand: "Dhanuka Agritech",
            chemical: "Propargite 57% EC",
            dosage: isEn ? "2 ml / liter water" : "2 मिली प्रति लीटर पानी",
            type: "chemical" as const,
            estPrice: "₹310 (250 ml)",
            link: "https://agribegri.com/search.php?search=omite",
            storeName: "AgriBegri",
            image: "/products/prod_contaf.jpg",
          },
          {
            name: "IFFCO Neem Oil 1500 ppm",
            brand: "IFFCO",
            chemical: "Cold Pressed Azadirachtin 0.15% EC",
            dosage: isEn ? "5 ml / liter water" : "5 मिली प्रति लीटर पानी",
            type: "organic" as const,
            estPrice: "₹175 (250 ml)",
            link: "https://www.iffcobazar.in/en/product/iffco-neem-oil",
            storeName: "IFFCO Bazar",
            image: "/products/prod_neemoil.jpg",
          }
        ],
        steps: isEn ? [
          "Install yellow sticky traps across the field to catch flying whiteflies.",
          "Spray systemic insecticide (Confidor) to eradicate virus-spreading vector insects.",
          "Uproot and destroy severely dwarfed plants to save remaining crop.",
        ] : [
          "सफेद मक्खी और कीटों को पकड़ने के लिए खेत में पीले चिपचिपे ट्रैप (Yellow Sticky Traps) लगाएं।",
          "वायरस फैलाने वाले रस-चूसक कीटों को मारने के लिए कॉन्फिडोर का छिड़काव करें।",
          "गंभीर रूप से मुड़े हुए पौधों को उखाड़कर नष्ट करें ताकि बाकी फसल सुरक्षित रहे।",
        ],
        organicTip: isEn
          ? "Spray 5% Neem seed kernel extract (NSKE) as eco-friendly repellent against sucking pests."
          : "नीम की निंबोली का काढ़ा (NSKE 5%) बनाकर छिड़कने से रस चूसक कीट तुरंत दूर भागते हैं।",
        sprayNotice: isEn
          ? "Control the vector early — virus cannot be cured once plant tissues are deformed."
          : "कीटों को शुरुआती अवस्था में ही रोकें — एक बार पौधा मुड़ जाने पर वायरस ठीक नहीं होता।",
      };
    }

    // 5. Healthy Crop Foliage
    if (key.includes("healthy")) {
      return {
        category: isEn ? "Optimal Plant Foliage (Healthy)" : "स्वस्थ व रोगमुक्त फसल (Optimal Health)",
        symptoms: isEn 
          ? "Vibrant green chlorophyll density, robust leaf turgor and zero pathogenic lesions detected."
          : "पत्तियों में गहरा हरा रंग, भरपूर क्लोरोफिल और किसी भी रोग या कीट का कोई लक्षण नहीं।",
        products: [
          {
            name: isEn ? "IFFCO Nano Urea (Liquid)" : "IFFCO नैनो यूरिया (तरल)",
            brand: "IFFCO",
            chemical: "4% Nano Nitrogen (Liquid Fertilizer)",
            dosage: isEn ? "4 ml / liter water (Foliar Nutrition Boost)" : "4 मिली प्रति लीटर पानी (पत्तियों के लिए टॉनिक)",
            type: "organic" as const,
            estPrice: "₹225 (500 ml)",
            link: "https://www.iffcobazar.in/en/product/nano-urea-liquid",
            storeName: "IFFCO Bazar",
            image: "/products/prod_nanourea.jpg",
          },
          {
            name: isEn ? "IFFCO Bio-Fungicide (Trichoderma)" : "IFFCO बायो-फंगिसाइड (ट्राइकोडर्मा)",
            brand: "IFFCO",
            chemical: "Trichoderma Viride 1% WP (Preventive Soil Guard)",
            dosage: isEn ? "5 g / liter water" : "5 ग्राम प्रति लीटर पानी",
            type: "organic" as const,
            estPrice: "₹120 (500 g)",
            link: "https://www.iffcobazar.in/en/product/iffco-trichoderma-viride",
            storeName: "IFFCO Bazar",
            image: "/products/prod_trichoderma.jpg",
          }
        ],
        steps: isEn ? [
          "Continue planned irrigation according to DRISHTI's soil moisture schedule.",
          "Apply light foliar nutrition (Nano Urea/Sagarika) during active tillering/growth stage.",
          "Keep farm bunds clean to prevent weed host plants.",
        ] : [
          "DRISHTI के सुझाव के अनुसार निर्धारित समय पर ही संतुलित सिंचाई जारी रखें।",
          "कल्ले फूटने की अवस्था में नैनो यूरिया या सागरिका का हल्का स्प्रे करें।",
          "मेड़ों को खरपतवार मुक्त रखें ताकि बाहर से कीट न आ सकें।",
        ],
        organicTip: isEn
          ? "Foliar spray of Panchagavya (3%) or Jeevamrit strengthens natural immunity against pathogens."
          : "जीवामृत या पंचगव्य का 3% घोल बनाकर छिड़कने से पौधे की रोग प्रतिरोधक क्षमता 2 गुना बढ़ जाती है।",
        sprayNotice: isEn
          ? "No chemical fungicide required — save money and protect soil biology."
          : "किसी भी रासायनिक फफूंदनाशी की आवश्यकता नहीं है — पैसा बचाएं और जैविक संतुलन बनाए रखें।",
      };
    }

    // 6. Default Fallback
    return {
      category: isEn ? "Crop Foliage Diagnosis" : "फसल पत्ती रोग पहचान",
      symptoms: isEn 
        ? "Pathology detected on foliar surface requiring preventive fungicidal & pest safeguard."
        : "पत्ती की सतह पर असामान्य धब्बे या विकार के लक्षण दर्ज, जिसके लिए सुरक्षात्मक दवा आवश्यक है।",
      products: [
        {
          name: "Tata Rallis Contaf Plus",
          brand: "Tata Rallis",
          chemical: "Hexaconazole 5% SC",
          dosage: isEn ? "2 ml / liter water" : "2 मिली प्रति लीटर पानी",
          type: "chemical" as const,
          estPrice: "₹240 (250 ml)",
          link: "https://www.bighaat.com/search?q=hexaconazole",
          storeName: "BigHaat Official",
          image: "/products/prod_contaf.jpg",
        },
        {
          name: "Indofil M-45 (Mancozeb 75% WP)",
          brand: "Indofil Industries",
          chemical: "Mancozeb 75% WP (Broad Spectrum)",
          dosage: isEn ? "2.5 g / liter water" : "2.5 ग्राम प्रति लीटर पानी",
          type: "chemical" as const,
          estPrice: "₹195 (500 g)",
          link: "https://www.bighaat.com/search?q=mancozeb",
          storeName: "BigHaat / IFFCO",
          image: "/products/prod_mancozeb.jpg",
        },
        {
          name: "IFFCO Neem Oil 1500 ppm",
          brand: "IFFCO",
          chemical: "Azadirachtin 0.15% EC",
          dosage: isEn ? "5 ml / liter water" : "5 मिली प्रति लीटर पानी",
          type: "organic" as const,
          estPrice: "₹175 (250 ml)",
          link: "https://www.iffcobazar.in/en/product/iffco-neem-oil",
          storeName: "IFFCO Bazar",
          image: "/products/prod_neemoil.jpg",
        }
      ],
      steps: isEn ? [
        "Isolate heavily affected foliage.",
        "Spray broad-spectrum protective fungicide (Mancozeb).",
        "Consult local KVK agronomist for certified field verification.",
      ] : [
        "प्रभावित पत्तियों को अलग करें।",
        "सुरक्षात्मक रूप से मैंकोजेब (Mancozeb) का संतुलित छिड़काव करें।",
        "नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करके पुष्टि करें।",
      ],
      organicTip: isEn
        ? "Use organic neem-based spray to naturally suppress spores and sucking insects."
        : "नीम तेल और देशी गाय के मट्ठे का सुरक्षात्मक छिड़काव करें।",
      sprayNotice: isEn
        ? "Always spray during low wind and cool morning or late afternoon hours."
        : "हमेशा शांत हवा में और सुबह या शाम के समय ही स्प्रे करें।",
    };
  };

  const displayPrediction = result 
    ? (isEn ? (result.prediction_en || result.prediction) : (result.prediction_hi || result.prediction))
    : "";

  const displayTreatment = result 
    ? (isEn ? (result.treatment_en || result.treatment_suggestion) : (result.treatment_hi || result.treatment_suggestion))
    : "";

  const displayNote = result 
    ? (isEn ? (result.note_en || result.note) : (result.note_hi || result.note))
    : "";

  const remedy = result ? getDiseaseRemedyInfo(result.prediction, isEn) : null;

  const suggestedActions = displayTreatment
    ? displayTreatment.split(/\n+/).filter((s) => s.trim().length > 0)
    : [];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Mobile Screen Frame */}
      <div 
        className="w-full max-w-md h-full sm:h-[92vh] sm:max-h-[880px] bg-black sm:rounded-[36px] sm:border sm:border-white/20 sm:shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
        <button onClick={handleClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="font-bold text-white text-base">
          {result 
            ? (isEn ? "Detection Result" : "रोग जांच रिपोर्ट (Detection Result)") 
            : (isEn ? "Detect Crop Disease" : "फसल रोग पहचान स्कैनर")}
        </h1>
        <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <X className="w-5 h-5 text-white/70" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* STATE 1: Live Camera */}
        {!result && !isAnalyzing && (
          <div className="flex flex-col h-full">
            {/* Viewfinder */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden" style={{ minHeight: "52vh" }}>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />

              {/* Corner brackets + scan line */}
              {cameraActive && (
                <>
                  <div className="absolute top-8 left-8 w-14 h-14 border-t-4 border-l-4 border-white/90 rounded-tl-xl z-10 pointer-events-none" />
                  <div className="absolute top-8 right-8 w-14 h-14 border-t-4 border-r-4 border-white/90 rounded-tr-xl z-10 pointer-events-none" />
                  <div className="absolute bottom-8 left-8 w-14 h-14 border-b-4 border-l-4 border-white/90 rounded-bl-xl z-10 pointer-events-none" />
                  <div className="absolute bottom-8 right-8 w-14 h-14 border-b-4 border-r-4 border-white/90 rounded-br-xl z-10 pointer-events-none" />
                  <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-[#1B7A3D] to-transparent z-10 pointer-events-none" style={{ animation: "scanLine 2.5s ease-in-out infinite" }} />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                    <span className="px-4 py-1.5 rounded-full bg-black/60 text-white/90 text-xs font-semibold">
                      {isEn ? "🌿 Keep leaf centered in frame" : "🌿 पत्ते को फ्रेम में रखें"}
                    </span>
                  </div>
                </>
              )}

              {/* Camera loading */}
              {!cameraActive && !cameraError && (
                <div className="flex flex-col items-center gap-4 text-white/60">
                  <Loader2 className="w-10 h-10 animate-spin text-[#1B7A3D]" />
                  <p className="text-sm font-medium">{isEn ? "Starting camera..." : "कैमरा शुरू हो रहा है..."}</p>
                </div>
              )}

              {/* Camera error */}
              {cameraError && (
                <div className="flex flex-col items-center gap-5 px-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-white/70 text-sm font-medium leading-relaxed max-w-[260px]">{cameraError}</p>
                  
                  {/* Prominent Gallery Upload when camera fails */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-xs py-4 rounded-2xl bg-[#1B7A3D] text-white font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#1B7A3D]/40 hover:bg-[#166533] active:scale-[0.98] transition cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5" />
                    {isEn ? "Choose Photo from Gallery" : "गैलरी से फ़ोटो चुनें"}
                  </button>
                  <button
                    onClick={() => startCamera(facingMode)}
                    className="px-5 py-2 rounded-full border border-white/20 text-white/70 text-xs font-semibold flex items-center gap-2 hover:bg-white/10 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> {isEn ? "Retry Camera" : "कैमरा पुनः शुरू करें"}
                  </button>
                </div>
              )}

              {/* Flip button top-right */}
              {cameraActive && (
                <button
                  onClick={handleFlipCamera}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white cursor-pointer"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-red-100 border border-red-200 text-red-600 text-sm font-medium text-center">
                {errorMsg}
              </div>
            )}

            {/* Bottom camera controls */}
            <div className="bg-black px-6 py-6 flex items-center justify-center gap-8">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <ImageIcon className="w-6 h-6 text-white/80" />
                </div>
                <span className="text-[11px] font-semibold text-white/60">{isEn ? "Gallery" : "गैलरी"}</span>
              </button>

              {/* Shutter button */}
              <button
                onClick={handleCaptureSnap}
                disabled={!cameraActive}
                className="w-20 h-20 rounded-full bg-white border-4 border-[#1B7A3D] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-[#1B7A3D] flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                </div>
              </button>

              <button
                onClick={handleFlipCamera}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <RefreshCw className="w-6 h-6 text-white/80" />
                </div>
                <span className="text-[11px] font-semibold text-white/60">{isEn ? "Flip" : "पलटें"}</span>
              </button>
            </div>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
        )}

        {/* STATE 2: Analyzing */}
        {isAnalyzing && (
          <div className="h-full flex flex-col items-center justify-center py-20 px-4 bg-[#F4F7F5]">
            <div className="relative w-48 h-48 rounded-3xl overflow-hidden mb-8 shadow-2xl border-4 border-white">
              {previewUrl && <img src={previewUrl} alt="Analyzing" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1B7A3D]/0 via-[#1B7A3D]/30 to-[#1B7A3D]/0" style={{ animation: "scan 2s ease-in-out infinite", transform: "translateY(-100%)" }} />
            </div>
            <Loader2 className="w-10 h-10 text-[#1B7A3D] animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900 text-center">
              {isEn ? "Analyzing Leaf Pathology..." : "पत्ते की जांच हो रही है..."}
            </h2>
            <p className="text-sm text-gray-500 text-center mt-2 max-w-[250px]">
              {isEn ? "AI is diagnosing symptoms and treatment..." : "AI पत्ते की बीमारी और उपचार पहचान रहा है..."}
            </p>
          </div>
        )}

        {/* STATE 3: Result */}
        {result && !isAnalyzing && remedy && (
            <div className="bg-[#F4F7F5] p-4 space-y-4 animate-in fade-in duration-300 min-h-full pb-20">
              
              {/* Card 1: Diagnostic Overview */}
              <div className="bg-white rounded-3xl p-4 shadow-xs border border-gray-100 flex gap-4">
                <div 
                  onClick={() => previewUrl && setZoomedImage({
                    url: previewUrl,
                    title: displayPrediction,
                    subtitle: isEn ? "Scanned Leaf Sample • Tap to Zoom" : "स्कैन किया गया पत्ता • ज़ूम करके देखें"
                  })}
                  className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-inner border border-gray-100 bg-black/5 relative group cursor-zoom-in"
                  title={isEn ? "Click to view full image" : "फ़ोटो बड़ी देखने के लिए क्लिक करें"}
                >
                  {previewUrl && (
                    <>
                      <img src={previewUrl} alt="Scanned Leaf" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1 text-[9px] text-white/90 flex items-center gap-0.5">
                        <ZoomIn className="w-2.5 h-2.5" /> Zoom
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {isEn ? "Diagnosed Foliar Pathology" : "संभावित रोग / विकार पहचान"}
                  </p>
                  <h2 className="text-lg font-black text-gray-900 leading-tight mb-1.5">
                    {displayPrediction}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${getBadgeColor(result.confidence)}`}>
                      ✦ {getSeverityText(result.confidence)} ({(result.confidence * 100).toFixed(0)}%)
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {remedy.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Symptoms & Pathology Impact */}
              <div className="bg-white rounded-3xl p-4.5 shadow-xs border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-gray-800">
                  <Leaf className="w-4 h-4 text-[#1B7A3D]" />
                  <h3 className="font-bold text-sm">
                    {isEn ? "Visual Symptoms & Crop Impact" : "रोग के लक्षण व फसल पर असर"}
                  </h3>
                </div>
                <p className="text-[13px] text-gray-600 font-medium leading-relaxed bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/60">
                  {remedy.symptoms}
                </p>
              </div>

              {/* Card 3: Spraying Steps & Proper Application (Guide before Medicine) */}
              <div className="bg-white rounded-3xl p-4.5 shadow-xs border border-gray-100 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1B7A3D]" />
                  <span>{isEn ? "Application & Spraying Protocol" : "छिड़काव का सही तरीका (3-स्टेप गाइड)"}</span>
                </h3>
                <div className="space-y-2">
                  {remedy.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 text-[13px] text-gray-800 font-medium">
                      <span className="w-5 h-5 rounded-full bg-[#1B7A3D] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                {/* Weather Warning Safeguard */}
                <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-[12px] text-amber-900 font-semibold leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{remedy.sprayNotice}</span>
                </div>
              </div>

              {/* Card 4: Desi & Organic Alternative Tip */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-3xl p-4 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-[#1B7A3D]" />
                  <span>{isEn ? "Natural / Desi Home Remedy" : "देशी व प्राकृतिक जैविक नुस्खा"}</span>
                </div>
                <p className="text-[12px] text-emerald-950 font-medium leading-relaxed">
                  {remedy.organicTip}
                </p>
              </div>

              {/* Card 5: Certified Agricultural Products & Medicines with Buy Links */}
              <div className="bg-white rounded-3xl p-4.5 shadow-xs border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900">
                    <ShoppingBag className="w-4 h-4 text-[#1B7A3D]" />
                    <h3 className="font-bold text-sm">
                      {isEn ? "Certified Treatment Products (Govt & KVK Approved)" : "प्रमाणित दवाइयां व उत्पाद (सटीक मात्रा सहित)"}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {isEn ? "Verified" : "प्रमाणित"}
                  </span>
                </div>

                <div className="space-y-3">
                  {remedy.products.map((prod, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-2xl border border-gray-200/90 bg-white hover:border-[#1B7A3D] transition shadow-xs space-y-3"
                    >
                      <div className="flex gap-3.5 items-start">
                        {/* Product Image Thumbnail - Clickable Zoom */}
                        <div 
                          onClick={() => prod.image && setZoomedImage({
                            url: prod.image,
                            title: prod.name,
                            subtitle: `${prod.brand} • ${prod.chemical} • ${prod.estPrice}`
                          })}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-200 flex items-center justify-center p-1.5 relative shadow-2xs group cursor-zoom-in"
                          title={isEn ? "Click to zoom product image" : "दवा की फ़ोटो बड़ी देखने के लिए क्लिक करें"}
                        >
                          {prod.image ? (
                            <>
                              <img 
                                src={prod.image} 
                                alt={prod.name} 
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" 
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                              </div>
                            </>
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                          )}
                          <span className={`absolute bottom-1 right-1 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs ${
                            prod.type === "organic" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
                          }`}>
                            {prod.type === "organic" ? "BIO" : "RX"}
                          </span>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide truncate">
                              {prod.brand}
                            </span>
                            <span className="text-[13px] font-extrabold text-[#1B7A3D] shrink-0">
                              {prod.estPrice}
                            </span>
                          </div>

                          <h4 className="font-bold text-gray-900 text-[14px] leading-snug">
                            {prod.name}
                          </h4>
                          
                          <p className="text-[11px] font-medium text-gray-500 line-clamp-1 mt-0.5">
                            {isEn ? "Formula:" : "तकनीकी घटक:"} {prod.chemical}
                          </p>

                          {/* Dosage Pill */}
                          <div className="mt-2 bg-amber-50/90 border border-amber-200/70 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] text-amber-900 font-semibold">
                            <Droplets className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{isEn ? "Dosage:" : "मात्रा:"} {prod.dosage}</span>
                          </div>
                        </div>
                      </div>

                      {/* Buy / View Link Button */}
                      <a 
                        href={prod.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-[#1B7A3D] hover:text-white text-gray-800 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-gray-200 hover:border-[#1B7A3D] cursor-pointer shadow-2xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isEn ? `View & Buy on ${prod.storeName}` : `दवा देखें / ऑनलाइन ऑर्डर करें (${prod.storeName})`}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 6: Kisan Call Center Helpline Button */}
              <div className="bg-white rounded-3xl p-4 border border-gray-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">
                      {isEn ? "Kisan Call Center (Toll-Free)" : "किसान कॉल सेंटर (मुफ्त सरकारी सहायता)"}
                    </h4>
                    <p className="text-[11px] font-medium text-gray-500">
                      1800-180-1551 (सुबह 6 से रात 10)
                    </p>
                  </div>
                </div>
                <a 
                  href="tel:18001801551"
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{isEn ? "Call Expert" : "कॉल करें"}</span>
                </a>
              </div>

              {/* Prototype Note */}
              {displayNote && (
                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-blue-900/80 font-medium leading-relaxed">{displayNote}</p>
                </div>
              )}

              {/* Sticky Action Button */}
              <button
                onClick={handleRetry}
                className="w-full py-4 rounded-2xl bg-[#1B7A3D] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#166533] transition-colors active:scale-[0.99] shadow-lg shadow-[#1B7A3D]/25 cursor-pointer text-sm"
              >
                <Camera className="w-5 h-5" />
                <span>{isEn ? "Take Another Photo / Scan New Leaf" : "दूसरी फ़ोटो लें / नया पत्ता स्कैन करें"}</span>
              </button>
            </div>
        )}
      </div>

      {/* Fullscreen Image Zoom Lightbox Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200"
          onClick={() => {
            setZoomedImage(null);
            setIsMagnified(false);
          }}
        >
          {/* Top bar */}
          <div 
            className="w-full max-w-xl flex items-center justify-between py-2 text-white border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 pr-4">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                {zoomedImage.title}
              </h3>
              {zoomedImage.subtitle && (
                <p className="text-xs text-white/70 truncate mt-0.5">{zoomedImage.subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsMagnified(!isMagnified)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title={isMagnified ? "Zoom Out" : "Zoom In (2x)"}
              >
                {isMagnified ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                <span className="hidden sm:inline">{isMagnified ? "1x" : "2x"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomedImage(null);
                  setIsMagnified(false);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div 
            className="relative flex-1 w-full max-w-xl flex items-center justify-center overflow-auto my-3 p-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsMagnified(!isMagnified);
            }}
          >
            <img 
              src={zoomedImage.url} 
              alt={zoomedImage.title} 
              className={`max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-transform duration-200 select-none ${
                isMagnified ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
              }`} 
            />
          </div>

          {/* Bottom Hint */}
          <div className="text-center py-2">
            <span className="text-xs font-semibold text-white/80 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
              {isEn ? "Tap photo to toggle 2x zoom • Click outside to close" : "ज़ूम बदलने के लिए फ़ोटो पर टैप करें • बंद करने के लिए बाहर क्लिक करें"}
            </span>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scan {
            0% { transform: translateY(-100%); }
            50% { transform: translateY(100%); }
            100% { transform: translateY(-100%); }
          }
          @keyframes scanLine {
            0% { top: 12%; }
            50% { top: 82%; }
            100% { top: 12%; }
          }
        `,
      }} />
      </div>
    </div>
  );
};

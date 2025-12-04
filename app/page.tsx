"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
    Scan, Upload, Shield, AlertTriangle, CheckCircle,
    FileText, ChevronRight, BarChart3, Lock, Zap, Menu, X,
    Activity, Globe, Hash, ChevronDown
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from "recharts";

// --- Types & Languages ---
type Language = 'en' | 'hi' | 'kn';
type ScanStatus = "idle" | "scanning" | "analyzing" | "complete";
type BanStatus = "safe" | "warning" | "danger";

interface AuditResult {
    rightsScore: number;
    banStatus: BanStatus;
    userEarnings: number;
    peerAverage: number;
    discrepancy: number;
    flags: string[];
}

// --- Translations ---
const TRANSLATIONS = {
    en: {
        brand: "GigGuard",
        nav: {
            audit: "Audit",
            rights: "My Rights",
            community: "Community"
        },
        hero: {
            badge: "AI-Powered Algorithmic Auditor",
            title1: "The Algorithm is",
            title2: "Not Your Boss.",
            desc: "Gig platforms hide their rules. We reverse-engineer them. Upload your screenshot to detect shadow bans, wage theft, and unfair penalties instantly.",
            cta: "Start Free Audit"
        },
        scanner: {
            title: "Scan Evidence",
            desc: "Upload screenshot. We parse it locally.",
            uploadTitle: "Upload Evidence",
            uploadSub: "Supports Uber, Swiggy, Zomato",
            privacy: "Privacy First: Analysis happens on-device",
            statusExtracting: "EXTRACTING",
            statusDecoding: "DECODING"
        },
        dashboard: {
            alertTitle: "Critical Anomaly Detected",
            alertDesc: (prob: string) => <>Causal analysis indicates a <span className="font-bold text-white">{prob} probability</span> of an algorithmic Shadow Ban. Your assignment rate deviates significantly from the local cluster.</>,
            rightsId: "GigGuard ID",
            rightsScore: "Rights Score",
            verified: "VERIFIED",
            risk: "AT RISK",
            earningsTitle: "Earnings Discrepancy",
            earningsSub: "Compared to anonymized peer cluster (n=5,420)",
            legendAvg: "AVG",
            legendYou: "YOU",
            violationsTitle: "Detected Violations",
            claimTitle: "Claim Your Rights",
            claimDesc: "Generate a Zero-Knowledge Proof. Submit verifiably authentic evidence to your union or legal aid without exposing your identity to the platform.",
            claimBtn: "Mint Evidence NFT"
        },
        ticker: [
            "Rohan (Bangalore) detected ₹120 underpayment",
            "Sarah (Mumbai) generated Dispute Pack #8821",
            "Shadow Ban Algorithm detected in Indiranagar Zone",
            "New Surge Rule reversed in Delhi NCR",
            "Verified Audit: Uber Ride #9921"
        ],
        flags: [
            "Unexplained Penalty (-₹70)",
            "Shadow Ban Detected (Low Assignment Rate)",
            "Missing Surge Bonus"
        ]
    },
    hi: {
        brand: "गिगगार्ड",
        nav: {
            audit: "ऑडिट",
            rights: "मेरे अधिकार",
            community: "समुदाय"
        },
        hero: {
            badge: "एआई-संचालित एल्गोरिथम ऑडिटर",
            title1: "एल्गोरिदम आपका",
            title2: "बॉस नहीं है।",
            desc: "गिग प्लेटफॉर्म अपने नियम छिपाते हैं। हम उन्हें उजागर करते हैं। शैडो बैन, वेतन चोरी और अनुचित दंड का तुरंत पता लगाने के लिए अपना स्क्रीनशॉट अपलोड करें।",
            cta: "मुफ्त ऑडिट शुरू करें"
        },
        scanner: {
            title: "सबूत स्कैन करें",
            desc: "स्क्रीनशॉट अपलोड करें। हम इसका स्थानीय रूप से विश्लेषण करते हैं।",
            uploadTitle: "सबूत अपलोड करें",
            uploadSub: "Uber, Swiggy, Zomato का समर्थन करता है",
            privacy: "गोपनीयता पहले: विश्लेषण डिवाइस पर होता है",
            statusExtracting: "निकाला जा रहा है",
            statusDecoding: "डिकोडिंग"
        },
        dashboard: {
            alertTitle: "गंभीर विसंगति का पता चला",
            alertDesc: (prob: string) => <>कारणात्मक विश्लेषण <span className="font-bold text-white">{prob} संभावना</span> इंगित करता है कि यह एक एल्गोरिथम शैडो बैन है। आपकी असाइनमेंट दर स्थानीय समूह से काफी अलग है।</>,
            rightsId: "गिगगार्ड आईडी",
            rightsScore: "अधिकार स्कोर",
            verified: "सत्यापित",
            risk: "जोखिम में",
            earningsTitle: "कमाई में अंतर",
            earningsSub: "अनाम सहकर्मी समूह की तुलना में (n=5,420)",
            legendAvg: "औसत",
            legendYou: "आप",
            violationsTitle: "पता चला उल्लंघन",
            claimTitle: "अपने अधिकारों का दावा करें",
            claimDesc: "जीरो-नॉलेज प्रूफ उत्पन्न करें। प्लेटफॉर्म पर अपनी पहचान उजागर किए बिना अपने यूनियन या कानूनी सहायता को सत्यापित प्रमाण जमा करें।",
            claimBtn: "एविडेंस NFT मिंट करें"
        },
        ticker: [
            "रोहन (बैंगलोर) ने ₹120 कम भुगतान का पता लगाया",
            "सारा (मुंबई) ने डिस्प्यूट पैक #8821 बनाया",
            "इंदिरानगर क्षेत्र में शैडो बैन एल्गोरिथम का पता चला",
            "दिल्ली एनसीआर में नया सर्ज नियम उलट दिया गया",
            "सत्यापित ऑडिट: Uber राइड #9921"
        ],
        flags: [
            "अस्पष्ट दंड (-₹70)",
            "शैडो बैन का पता चला (कम असाइनमेंट दर)",
            "सर्ज बोनस गायब है"
        ]
    },
    kn: {
        brand: "ಗಿಗ್‌ಗಾರ್ಡ್",
        nav: {
            audit: "ಆಡಿಟ್",
            rights: "ನನ್ನ ಹಕ್ಕುಗಳು",
            community: "ಸಮುದಾಯ"
        },
        hero: {
            badge: "AI-ಚಾಲಿತ ಅಲ್ಗಾರಿದಮಿಕ್ ಆಡಿಟರ್",
            title1: "ಅಲ್ಗಾರಿದಮ್ ನಿಮ್ಮ",
            title2: "ಬಾಸ್ ಅಲ್ಲ.",
            desc: "ಗಿಗ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗಳು ತಮ್ಮ ನಿಯಮಗಳನ್ನು ಮರೆಮಾಡುತ್ತವೆ. ನಾವು ಅವುಗಳನ್ನು ಡಿಕೋಡ್ ಮಾಡುತ್ತೇವೆ. ಶ್ಯಾಡೋ ಬ್ಯಾನ್‌ಗಳು, ವೇತನ ಕಡಿತ ಮತ್ತು ಅನ್ಯಾಯದ ದಂಡಗಳನ್ನು ತಕ್ಷಣವೇ ಪತ್ತೆಹಚ್ಚಲು ನಿಮ್ಮ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
            cta: "ಉಚಿತ ಆಡಿಟ್ ಪ್ರಾರಂಭಿಸಿ"
        },
        scanner: {
            title: "ಸಾಕ್ಷ್ಯವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
            desc: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ನಾವು ಅದನ್ನು ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ವಿಶ್ಲೇಷಿಸುತ್ತೇವೆ.",
            uploadTitle: "ಸಾಕ್ಷ್ಯ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
            uploadSub: "Uber, Swiggy, Zomato ಅನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ",
            privacy: "ಗೌಪ್ಯತೆ ಮೊದಲು: ವಿಶ್ಲೇಷಣೆ ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ನಡೆಯುತ್ತದೆ",
            statusExtracting: "ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ",
            statusDecoding: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ"
        },
        dashboard: {
            alertTitle: "ಗಂಭೀರವಾದ ಅಸಂಗತತೆ ಕಂಡುಬಂದಿದೆ",
            alertDesc: (prob: string) => <>ಕಾರಣಾತ್ಮಕ ವಿಶ್ಲೇಷಣೆಯು <span className="font-bold text-white">{prob} ಸಂಭವನೀಯತೆಯ</span> ಅಲ್ಗಾರಿದಮಿಕ್ ಶ್ಯಾಡೋ ಬ್ಯಾನ್ ಅನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನಿಮ್ಮ ಕೆಲಸದ ನಿಯೋಜನೆ ದರವು ಸ್ಥಳೀಯ ಸರಾಸರಿಗಿಂತ ಗಮನಾರ್ಹವಾಗಿ ಕಡಿಮೆಯಾಗಿದೆ.</>,
            rightsId: "ಗಿಗ್‌ಗಾರ್ಡ್ ಐಡಿ",
            rightsScore: "ಹಕ್ಕುಗಳ ಸ್ಕೋರ್",
            verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
            risk: "ಅಪಾಯದಲ್ಲಿದೆ",
            earningsTitle: "ಗಳಿಕೆಯಲ್ಲಿ ವ್ಯತ್ಯಾಸ",
            earningsSub: "ಅನಾಮಧೇಯ ಸಹವರ್ತಿ ಗುಂಪಿಗೆ ಹೋಲಿಸಿದರೆ (n=5,420)",
            legendAvg: "ಸರಾಸರಿ",
            legendYou: "ನೀವು",
            violationsTitle: "ಪತ್ತೆಯಾದ ಉಲ್ಲಂಘನೆಗಳು",
            claimTitle: "ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ಪಡೆಯಿರಿ",
            claimDesc: "ಜೀರೋ-ನಾಲೆಡ್ಜ್ ಪ್ರೂಫ್ ರಚಿಸಿ. ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ನಿಮ್ಮ ಗುರುತನ್ನು ಬಹಿರಂಗಪಡಿಸದೆ ನಿಮ್ಮ ಯೂನಿಯನ್ ಅಥವಾ ಕಾನೂನು ಸಹಾಯಕ್ಕೆ ದೃಢೀಕೃತ ಸಾಕ್ಷ್ಯವನ್ನು ಸಲ್ಲಿಸಿ.",
            claimBtn: "ಎವಿಡೆನ್ಸ್ NFT ಮಿಂಟ್ ಮಾಡಿ"
        },
        ticker: [
            "ರೋಹನ್ (ಬೆಂಗಳೂರು) ₹120 ಕಡಿಮೆ ಪಾವತಿಯನ್ನು ಪತ್ತೆಹಚ್ಚಿದ್ದಾರೆ",
            "ಸಾರಾ (ಮುಂಬೈ) ವಿವಾದ ಪ್ಯಾಕ್ #8821 ಅನ್ನು ರಚಿಸಿದ್ದಾರೆ",
            "ಇಂದಿರಾನಗರ ವಲಯದಲ್ಲಿ ಶ್ಯಾಡೋ ಬ್ಯಾನ್ ಅಲ್ಗಾರಿದಮ್ ಪತ್ತೆಯಾಗಿದೆ",
            "ದೆಹಲಿ ಎನ್‌ಸಿಆರ್‌ನಲ್ಲಿ ಹೊಸ ಸರ್ಜ್ ನಿಯಮವನ್ನು ಹಿಂತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ",
            "ಪರಿಶೀಲಿಸಿದ ಆಡಿಟ್: Uber ರೈಡ್ #9921"
        ],
        flags: [
            "ವಿವರಿಸದ ದಂಡ (-₹70)",
            "ಶ್ಯಾಡೋ ಬ್ಯಾನ್ ಪತ್ತೆಯಾಗಿದೆ (ಕಡಿಮೆ ಕೆಲಸದ ನಿಯೋಜನೆ)",
            "ಸರ್ಜ್ ಬೋನಸ್ ಕಾಣೆಯಾಗಿದೆ"
        ]
    }
};

const MOCK_DATA: AuditResult = {
    rightsScore: 42,
    banStatus: "danger",
    userEarnings: 620,
    peerAverage: 940,
    discrepancy: 34,
    flags: []
};

const CHART_DATA = [
    { name: "Mon", user: 400, peer: 450 },
    { name: "Tue", user: 300, peer: 480 },
    { name: "Wed", user: 200, peer: 500 },
    { name: "Thu", user: 620, peer: 940 },
    { name: "Fri", user: 0, peer: 0 },
];

// --- Components ---

const LanguageSwitcher = ({ current, onChange }: { current: Language, onChange: (l: Language) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const langs: { code: Language, label: string }[] = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी' },
        { code: 'kn', label: 'ಕನ್ನಡ' }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm text-gray-200"
            >
                <Globe size={14} />
                <span className="uppercase">{current}</span>
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 w-32 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl z-50"
                >
                    {langs.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => { onChange(l.code); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-900/50 transition-colors ${current === l.code ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}
                        >
                            {l.label}
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

const Navbar = ({ lang, setLang }: { lang: Language, setLang: (l: Language) => void }) => {
    const t = TRANSLATIONS[lang];
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <Shield size={18} className="text-black fill-current" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                    {lang === 'en' ? 'Gig' : ''}<span className={lang === 'en' ? "text-emerald-400" : "text-white"}>{t.brand}</span>
                </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                <a href="#" className="hover:text-emerald-400 transition-colors">{t.nav.audit}</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">{t.nav.rights}</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">{t.nav.community}</a>
                <div className="w-px h-4 bg-gray-700 mx-2" />
                <LanguageSwitcher current={lang} onChange={setLang} />
            </div>
            <div className="flex items-center gap-4 md:hidden">
                <LanguageSwitcher current={lang} onChange={setLang} />
                <button className="p-2 text-white">
                    <Menu size={24} />
                </button>
            </div>
        </nav>
    );
};

const LiveTicker = ({ lang }: { lang: Language }) => {
    const items = TRANSLATIONS[lang].ticker;
    return (
        <div className="w-full bg-emerald-900/20 border-y border-emerald-500/20 overflow-hidden py-2 flex relative z-40">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />
            <motion.div
                className="flex gap-12 whitespace-nowrap text-emerald-400/80 text-xs font-mono tracking-wide"
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
                {[...items, ...items, ...items].map((item, i) => (
                    <span key={i} className="flex items-center gap-2">
                        <Activity size={10} className="animate-pulse" /> {item}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

const BackgroundGrid = () => (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        {/* Grid Floor */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
    </div>
);

const HeroHook = ({ onStart, lang }: { onStart: () => void, lang: Language }) => {
    const t = TRANSLATIONS[lang];
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Zap size={12} className="fill-current" />
                    {t.hero.badge}
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-tight tracking-tight">
                    {t.hero.title1} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-300% animate-gradient">
                        {t.hero.title2}
                    </span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                    {t.hero.desc}
                </p>

                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px -10px rgba(16,185,129,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStart}
                    className="group relative px-10 py-5 bg-white text-black font-black text-lg rounded-full transition-all overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {t.hero.cta}
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </motion.button>
            </motion.div>
        </div>
    );
};

const Scanner = ({ onScanComplete, lang }: { onScanComplete: () => void, lang: Language }) => {
    const t = TRANSLATIONS[lang];
    const [status, setStatus] = useState<ScanStatus>("idle");
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            startScan();
        }
    };

    const startScan = () => {
        setStatus("scanning");
        // Simulate OCR Process
        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setStatus("analyzing");
                setTimeout(() => {
                    setStatus("complete");
                    onScanComplete();
                }, 800);
            }
        }, 30);
    };

    return (
        <div className="w-full max-w-md mx-auto relative perspective-1000">
            <AnimatePresence mode="wait">
                {status === "idle" && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotateX: -20 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="border-2 border-dashed border-gray-700 hover:border-emerald-500 hover:bg-emerald-950/20 bg-gray-900/50 backdrop-blur-sm rounded-3xl p-12 text-center cursor-pointer transition-all group shadow-2xl"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFile}
                        />
                        <div className="w-24 h-24 mx-auto mb-8 bg-gray-800 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-900 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                            <Upload className="text-gray-400 group-hover:text-emerald-400 transition-colors" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{t.scanner.uploadTitle}</h3>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300">{t.scanner.uploadSub}</p>
                        <div className="mt-8 text-xs text-gray-600 font-mono bg-black/40 rounded-full px-3 py-1 inline-block border border-white/5">
                            <Lock size={10} className="inline mr-1" /> {t.scanner.privacy}
                        </div>
                    </motion.div>
                )}

                {(status === "scanning" || status === "analyzing") && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative overflow-hidden bg-black rounded-3xl aspect-[3/4] border border-emerald-500/30 flex flex-col items-center justify-center shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]"
                    >
                        {/* Matrix Background Effect */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                        {/* Scanning Line */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] z-10"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />

                        <div className="z-20 text-center relative">
                            <div className="w-24 h-24 mb-6 mx-auto border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Scan className="text-emerald-400 animate-pulse" size={32} />
                            </div>
                            <h3 className="text-2xl font-mono font-bold text-white mb-2 tracking-wider">
                                {status === "scanning" ? t.scanner.statusExtracting : t.scanner.statusDecoding}
                            </h3>
                            <p className="text-emerald-500 font-mono text-xl">{progress}%</p>
                        </div>

                        {/* Simulated Code Overlay - Typing Effect */}
                        <div className="absolute inset-0 p-6 font-mono text-[10px] text-emerald-900/60 pointer-events-none overflow-hidden leading-tight flex flex-col justify-end">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {`> analyzing_layer_${i}_v2.py --detect_shadow_ban=true`}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- New 3D Holographic Card Component ---
const DigitalPassport = ({ score, lang }: { score: number, lang: Language }) => {
    const t = TRANSLATIONS[lang];
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 200);
        y.set(yPct * 200);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full aspect-[1.6/1] rounded-3xl bg-black border border-gray-800 overflow-hidden shadow-2xl group cursor-default"
        >
            {/* Holographic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />

            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <Globe size={16} className="text-emerald-500" />
                        <span className="text-xs font-mono text-emerald-500 tracking-widest uppercase">{t.dashboard.rightsId}</span>
                    </div>
                    <Shield size={24} className="text-gray-600" />
                </div>

                <div className="text-center">
                    <span className="text-sm text-gray-400 uppercase tracking-widest block mb-1">{t.dashboard.rightsScore}</span>
                    <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter">
                        {score}
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div className="text-[10px] text-gray-500 font-mono">
                        <div>HASH: 0x7F...9A2</div>
                        <div>{t.dashboard.verified}: {new Date().toLocaleDateString()}</div>
                    </div>
                    <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs font-bold">
                        {t.dashboard.risk}
                    </div>
                </div>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:animate-shimmer pointer-events-none" />
        </motion.div>
    );
};

const Dashboard = ({ result, lang }: { result: AuditResult, lang: Language }) => {
    const t = TRANSLATIONS[lang];
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto"
        >
            {/* Top Warning Banner */}
            <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-6 mb-8 flex items-center gap-6 shadow-[0_0_30px_-5px_rgba(239,68,68,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
                <div className="p-3 bg-red-500/20 rounded-full shrink-0 relative z-10">
                    <AlertTriangle className="text-red-500" size={32} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-red-400 font-bold text-xl mb-1">{t.dashboard.alertTitle}</h3>
                    <p className="text-red-200/80">
                        {t.dashboard.alertDesc("98%")}
                    </p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">

                {/* Holographic Score Card (Takes 4 cols) */}
                <div className="md:col-span-4 perspective-1000">
                    <DigitalPassport score={result.rightsScore} lang={lang} />
                </div>

                {/* Comparison Chart (Takes 8 cols) */}
                <div className="md:col-span-8 bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-3xl p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-white font-bold text-lg">{t.dashboard.earningsTitle}</h3>
                            <p className="text-gray-500 text-sm">{t.dashboard.earningsSub}</p>
                        </div>
                        <div className="flex gap-4 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div> {t.dashboard.legendAvg}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-600"></div> {t.dashboard.legendYou}
                            </div>
                        </div>
                    </div>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CHART_DATA} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#ccc', fontSize: '12px', fontFamily: 'monospace' }}
                                />
                                <Bar dataKey="peer" fill="#10b981" radius={[4, 4, 4, 4]} animationDuration={1500} />
                                <Bar dataKey="user" fill="#4b5563" radius={[4, 4, 4, 4]} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Flags & Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <FileText size={20} className="text-emerald-500" />
                        {t.dashboard.violationsTitle}
                    </h3>
                    <div className="space-y-4">
                        {t.flags.map((flag, idx) => (
                            <div key={idx} className="group flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-colors">
                                <div className="mt-1 p-1 bg-red-500/20 rounded text-red-400">
                                    <AlertTriangle size={14} />
                                </div>
                                <div>
                                    <span className="text-gray-200 text-sm font-medium block mb-1">{flag}</span>
                                    <span className="text-xs text-gray-500 font-mono">Confidence: 99.8% • Ref: Rule #442</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 to-black border border-emerald-500/30 rounded-3xl p-8 flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-colors" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                            <Lock size={24} />
                        </div>
                        <h3 className="text-white font-bold text-2xl mb-2">{t.dashboard.claimTitle}</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            {t.dashboard.claimDesc}
                        </p>
                    </div>

                    <button className="relative z-10 w-full py-4 bg-white hover:bg-emerald-50 text-black font-black text-lg rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-emerald-900/20">
                        <Hash size={20} className="text-emerald-600" />
                        {t.dashboard.claimBtn}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Page Component ---

export default function GigGuardApp() {
    const [view, setView] = useState<"hero" | "scanner" | "dashboard">("hero");
    const [lang, setLang] = useState<Language>('en');

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            <Navbar lang={lang} setLang={setLang} />
            <BackgroundGrid />

            {/* Live Ticker (Only visible on dashboard or hero) */}
            <div className="pt-20">
                <LiveTicker lang={lang} />
            </div>

            <main className="pt-12 pb-24 px-6 relative z-10">
                <AnimatePresence mode="wait">
                    {view === "hero" && (
                        <motion.div
                            key="hero"
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <HeroHook onStart={() => setView("scanner")} lang={lang} />
                        </motion.div>
                    )}

                    {view === "scanner" && (
                        <motion.div
                            key="scanner"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center min-h-[60vh]"
                        >
                            <div className="mb-8 text-center">
                                <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">{TRANSLATIONS[lang].scanner.title}</h2>
                                <p className="text-gray-400 text-lg">{TRANSLATIONS[lang].scanner.desc}</p>
                            </div>
                            <Scanner onScanComplete={() => setView("dashboard")} lang={lang} />
                        </motion.div>
                    )}

                    {view === "dashboard" && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Dashboard result={MOCK_DATA} lang={lang} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

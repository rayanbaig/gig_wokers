"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
    Scan, Upload, Shield, AlertTriangle, CheckCircle,
    FileText, ChevronRight, BarChart3, Lock, Zap, Menu, X,
    Activity, Globe, Hash, ChevronDown, Unlock, Database, Cpu, Clock, Eye, EyeOff, Plus, Server, Hexagon, BadgeCheck
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from "recharts";
import VoiceRecorder from '@/components/VoiceRecorder';

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
        brand: "à¤—à¤¿à¤—à¤—à¤¾à¤°à¥à¤¡",
        nav: {
            audit: "à¤‘à¤¡à¤¿à¤Ÿ",
            rights: "à¤®à¥‡à¤°à¥‡ à¤…à¤§à¤¿à¤•à¤¾à¤°",
            community: "à¤¸à¤®à¥à¤¦à¤¾à¤¯"
        },
        hero: {
            badge: "à¤à¤†à¤ˆ-à¤¸à¤‚à¤šà¤¾à¤²à¤¿à¤¤ à¤à¤²à¥à¤—à¥‹à¤°à¤¿à¤¥à¤® à¤‘à¤¡à¤¿à¤Ÿà¤°",
            title1: "à¤à¤²à¥à¤—à¥‹à¤°à¤¿à¤¦à¤® à¤†à¤ªà¤•à¤¾",
            title2: "à¤¬à¥‰à¤¸ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
            desc: "à¤—à¤¿à¤— à¤ªà¥à¤²à¥‡à¤Ÿà¤«à¥‰à¤°à¥à¤® à¤…à¤ªà¤¨à¥‡ à¤¨à¤¿à¤¯à¤® à¤›à¤¿à¤ªà¤¾à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤¹à¤® à¤‰à¤¨à¥à¤¹à¥‡à¤‚ à¤‰à¤œà¤¾à¤—à¤° à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤¶à¥ˆà¤¡à¥‹ à¤¬à¥ˆà¤¨, à¤µà¥‡à¤¤à¤¨ à¤šà¥‹à¤°à¥€ à¤”à¤° à¤…à¤¨à¥à¤šà¤¿à¤¤ à¤¦à¤‚à¤¡ à¤•à¤¾ à¤¤à¥à¤°à¤‚à¤¤ à¤ªà¤¤à¤¾ à¤²à¤—à¤¾à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤…à¤ªà¤¨à¤¾ à¤¸à¥à¤•à¥à¤°à¥€à¤¨à¤¶à¥‰à¤Ÿ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚à¥¤",
            cta: "à¤®à¥à¤«à¥à¤¤ à¤‘à¤¡à¤¿à¤Ÿ à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚"
        },
        scanner: {
            title: "à¤¸à¤¬à¥‚à¤¤ à¤¸à¥à¤•à¥ˆà¤¨ à¤•à¤°à¥‡à¤‚",
            desc: "à¤¸à¥à¤•à¥à¤°à¥€à¤¨à¤¶à¥‰à¤Ÿ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚à¥¤ à¤¹à¤® à¤‡à¤¸à¤•à¤¾ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¥‚à¤ª à¤¸à¥‡ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤",
            uploadTitle: "à¤¸à¤¬à¥‚à¤¤ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚",
            uploadSub: "Uber, Swiggy, Zomato à¤•à¤¾ à¤¸à¤®à¤°à¥à¤¥à¤¨ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ",
            privacy: "à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾ à¤ªà¤¹à¤²à¥‡: à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¡à¤¿à¤µà¤¾à¤‡à¤¸ à¤ªà¤° à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆ",
            statusExtracting: "à¤¨à¤¿à¤•à¤¾à¤²à¤¾ à¤œà¤¾ à¤°à¤¹à¤¾ à¤¹à¥ˆ",
            statusDecoding: "à¤¡à¤¿à¤•à¥‹à¤¡à¤¿à¤‚à¤—"
        },
        dashboard: {
            alertTitle: "à¤—à¤‚à¤­à¥€à¤° à¤µà¤¿à¤¸à¤‚à¤—à¤¤à¤¿ à¤•à¤¾ à¤ªà¤¤à¤¾ à¤šà¤²à¤¾",
            alertDesc: (prob: string) => <>à¤•à¤¾à¤°à¤£à¤¾à¤¤à¥à¤®à¤• à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ <span className="font-bold text-white">{prob} à¤¸à¤‚à¤­à¤¾à¤µà¤¨à¤¾</span> à¤‡à¤‚à¤—à¤¿à¤¤ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ à¤•à¤¿ à¤¯à¤¹ à¤à¤• à¤à¤²à¥à¤—à¥‹à¤°à¤¿à¤¥à¤® à¤¶à¥ˆà¤¡à¥‹ à¤¬à¥ˆà¤¨ à¤¹à¥ˆà¥¤ à¤†à¤ªà¤•à¥€ à¤…à¤¸à¤¾à¤‡à¤¨à¤®à¥‡à¤‚à¤Ÿ à¤¦à¤° à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¤®à¥‚à¤¹ à¤¸à¥‡ à¤•à¤¾à¤«à¥€ à¤…à¤²à¤— à¤¹à¥ˆà¥¤</>,
            rightsId: "à¤—à¤¿à¤—à¤—à¤¾à¤°à¥à¤¡ à¤†à¤ˆà¤¡à¥€",
            rightsScore: "à¤…à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤•à¥‹à¤°",
            verified: "à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤",
            risk: "à¤œà¥‹à¤–à¤¿à¤® à¤®à¥‡à¤‚",
            earningsTitle: "à¤•à¤®à¤¾à¤ˆ à¤®à¥‡à¤‚ à¤…à¤‚à¤¤à¤°",
            earningsSub: "à¤…à¤¨à¤¾à¤® à¤¸à¤¹à¤•à¤°à¥à¤®à¥€ à¤¸à¤®à¥‚à¤¹ à¤•à¥€ à¤¤à¥à¤²à¤¨à¤¾ à¤®à¥‡à¤‚ (n=5,420)",
            legendAvg: "à¤”à¤¸à¤¤",
            legendYou: "à¤†à¤ª",
            violationsTitle: "à¤ªà¤¤à¤¾ à¤šà¤²à¤¾ à¤‰à¤²à¥à¤²à¤‚à¤˜à¤¨",
            claimTitle: "à¤…à¤ªà¤¨à¥‡ à¤…à¤§à¤¿à¤•à¤¾à¤°à¥‹à¤‚ à¤•à¤¾ à¤¦à¤¾à¤µà¤¾ à¤•à¤°à¥‡à¤‚",
            claimDesc: "à¤œà¥€à¤°à¥‹-à¤¨à¥‰à¤²à¥‡à¤œ à¤ªà¥à¤°à¥‚à¤« à¤‰à¤¤à¥à¤ªà¤¨à¥à¤¨ à¤•à¤°à¥‡à¤‚à¥¤ à¤ªà¥à¤²à¥‡à¤Ÿà¤«à¥‰à¤°à¥à¤® à¤ªà¤° à¤…à¤ªà¤¨à¥€ à¤ªà¤¹à¤šà¤¾à¤¨ à¤‰à¤œà¤¾à¤—à¤° à¤•à¤¿à¤ à¤¬à¤¿à¤¨à¤¾ à¤…à¤ªà¤¨à¥‡ à¤¯à¥‚à¤¨à¤¿à¤¯à¤¨ à¤¯à¤¾ à¤•à¤¾à¤¨à¥‚à¤¨à¥€ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤•à¥‹ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤œà¤®à¤¾ à¤•à¤°à¥‡à¤‚à¥¤",
            claimBtn: "à¤à¤µà¤¿à¤¡à¥‡à¤‚à¤¸ NFT à¤®à¤¿à¤‚à¤Ÿ à¤•à¤°à¥‡à¤‚"
        },
        ticker: [
            "à¤°à¥‹à¤¹à¤¨ (à¤¬à¥ˆà¤‚à¤—à¤²à¥‹à¤°) à¤¨à¥‡ â‚¹120 à¤•à¤® à¤­à¥à¤—à¤¤à¤¾à¤¨ à¤•à¤¾ à¤ªà¤¤à¤¾ à¤²à¤—à¤¾à¤¯à¤¾",
            "à¤¸à¤¾à¤°à¤¾ (à¤®à¥à¤‚à¤¬à¤ˆ) à¤¨à¥‡ à¤¡à¤¿à¤¸à¥à¤ªà¥à¤¯à¥‚à¤Ÿ à¤ªà¥ˆà¤• #8821 à¤¬à¤¨à¤¾à¤¯à¤¾",
            "à¤‡à¤‚à¤¦à¤¿à¤°à¤¾à¤¨à¤—à¤° à¤•à¥à¤·à¥‡à¤¤à¥à¤° à¤®à¥‡à¤‚ à¤¶à¥ˆà¤¡à¥‹ à¤¬à¥ˆà¤¨ à¤à¤²à¥à¤—à¥‹à¤°à¤¿à¤¥à¤® à¤•à¤¾ à¤ªà¤¤à¤¾ à¤šà¤²à¤¾",
            "à¤¦à¤¿à¤²à¥à¤²à¥€ à¤à¤¨à¤¸à¥€à¤†à¤° à¤®à¥‡à¤‚ à¤¨à¤¯à¤¾ à¤¸à¤°à¥à¤œ à¤¨à¤¿à¤¯à¤® à¤‰à¤²à¤Ÿ à¤¦à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾",
            "à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤‘à¤¡à¤¿à¤Ÿ: Uber à¤°à¤¾à¤‡à¤¡ #9921"
        ],
        flags: [
            "à¤…à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤¦à¤‚à¤¡ (-â‚¹70)",
            "à¤¶à¥ˆà¤¡à¥‹ à¤¬à¥ˆà¤¨ à¤•à¤¾ à¤ªà¤¤à¤¾ à¤šà¤²à¤¾ (à¤•à¤® à¤…à¤¸à¤¾à¤‡à¤¨à¤®à¥‡à¤‚à¤Ÿ à¤¦à¤°)",
            "à¤¸à¤°à¥à¤œ à¤¬à¥‹à¤¨à¤¸ à¤—à¤¾à¤¯à¤¬ à¤¹à¥ˆ"
        ]
    },
    kn: {
        brand: "à²—à²¿à²—à³â€Œà²—à²¾à²°à³à²¡à³",
        nav: {
            audit: "à²†à²¡à²¿à²Ÿà³",
            rights: "à²¨à²¨à³à²¨ à²¹à²•à³à²•à³à²—à²³à³",
            community: "à²¸à²®à³à²¦à²¾à²¯"
        },
        hero: {
            badge: "AI-à²šà²¾à²²à²¿à²¤ à²…à²²à³à²—à²¾à²°à²¿à²¦à²®à²¿à²•à³ à²†à²¡à²¿à²Ÿà²°à³",
            title1: "à²…à²²à³à²—à²¾à²°à²¿à²¦à²®à³ à²¨à²¿à²®à³à²®",
            title2: "à²¬à²¾à²¸à³ à²…à²²à³à²².",
            desc: "à²—à²¿à²—à³ à²ªà³à²²à²¾à²Ÿà³â€Œà²«à²¾à²°à³à²®à³â€Œà²—à²³à³ à²¤à²®à³à²® à²¨à²¿à²¯à²®à²—à²³à²¨à³à²¨à³ à²®à²°à³†à²®à²¾à²¡à³à²¤à³à²¤à²µà³†. à²¨à²¾à²µà³ à²…à²µà³à²—à²³à²¨à³à²¨à³ à²¡à²¿à²•à³‹à²¡à³ à²®à²¾à²¡à³à²¤à³à²¤à³‡à²µà³†. à²¶à³à²¯à²¾à²¡à³‹ à²¬à³à²¯à²¾à²¨à³â€Œà²—à²³à³, à²µà³‡à²¤à²¨ à²•à²¡à²¿à²¤ à²®à²¤à³à²¤à³ à²…à²¨à³à²¯à²¾à²¯à²¦ à²¦à²‚à²¡à²—à²³à²¨à³à²¨à³ à²¤à²•à³à²·à²£à²µà³‡ à²ªà²¤à³à²¤à³†à²¹à²šà³à²šà²²à³ à²¨à²¿à²®à³à²® à²¸à³à²•à³à²°à³€à²¨à³â€Œà²¶à²¾à²Ÿà³ à²…à²¨à³à²¨à³ à²…à²ªà³â€Œà²²à³‹à²¡à³ à²®à²¾à²¡à²¿.",
            cta: "à²‰à²šà²¿à²¤ à²†à²¡à²¿à²Ÿà³ à²ªà³à²°à²¾à²°à²‚à²­à²¿à²¸à²¿"
        },
        scanner: {
            title: "à²¸à²¾à²•à³à²·à³à²¯à²µà²¨à³à²¨à³ à²¸à³à²•à³à²¯à²¾à²¨à³ à²®à²¾à²¡à²¿",
            desc: "à²¸à³à²•à³à²°à³€à²¨à³â€Œà²¶à²¾à²Ÿà³ à²…à²ªà³â€Œà²²à³‹à²¡à³ à²®à²¾à²¡à²¿. à²¨à²¾à²µà³ à²…à²¦à²¨à³à²¨à³ à²¨à²¿à²®à³à²® à²¸à²¾à²§à²¨à²¦à²²à³à²²à³‡ à²µà²¿à²¶à³à²²à³‡à²·à²¿à²¸à³à²¤à³à²¤à³‡à²µà³†.",
            uploadTitle: "à²¸à²¾à²•à³à²·à³à²¯ à²…à²ªà³â€Œà²²à³‹à²¡à³ à²®à²¾à²¡à²¿",
            uploadSub: "Uber, Swiggy, Zomato à²…à²¨à³à²¨à³ à²¬à³†à²‚à²¬à²²à²¿à²¸à³à²¤à³à²¤à²¦à³†",
            privacy: "à²—à³Œà²ªà³à²¯à²¤à³† à²®à³Šà²¦à²²à³: à²µà²¿à²¶à³à²²à³‡à²·à²£à³† à²¨à²¿à²®à³à²® à²¸à²¾à²§à²¨à²¦à²²à³à²²à³‡ à²¨à²¡à³†à²¯à³à²¤à³à²¤à²¦à³†",
            statusExtracting: "à²®à²¾à²¹à²¿à²¤à²¿ à²ªà²¡à³†à²¯à²²à²¾à²—à³à²¤à³à²¤à²¿à²¦à³†",
            statusDecoding: "à²µà²¿à²¶à³à²²à³‡à²·à²¿à²¸à²²à²¾à²—à³à²¤à³à²¤à²¿à²¦à³†"
        },
        dashboard: {
            alertTitle: "à²—à²‚à²­à³€à²°à²µà²¾à²¦ à²…à²¸à²‚à²—à²¤à²¤à³† à²•à²‚à²¡à³à²¬à²‚à²¦à²¿à²¦à³†",
            alertDesc: (prob: string) => <>à²•à²¾à²°à²£à²¾à²¤à³à²®à²• à²µà²¿à²¶à³à²²à³‡à²·à²£à³†à²¯à³ <span className="font-bold text-white">{prob} à²¸à²‚à²­à²µà²¨à³€à²¯à²¤à³†à²¯</span> à²…à²²à³à²—à²¾à²°à²¿à²¦à²®à²¿à²•à³ à²¶à³à²¯à²¾à²¡à³‹ à²¬à³à²¯à²¾à²¨à³ à²…à²¨à³à²¨à³ à²¸à³‚à²šà²¿à²¸à³à²¤à³à²¤à²¦à³†. à²¨à²¿à²®à³à²® à²•à³†à²²à²¸à²¦ à²¨à²¿à²¯à³‹à²œà²¨à³† à²¦à²°à²µà³ à²¸à³à²¥à²³à³€à²¯ à²¸à²°à²¾à²¸à²°à²¿à²—à²¿à²‚à²¤ à²—à²®à²¨à²¾à²°à³à²¹à²µà²¾à²—à²¿ à²•à²¡à²¿à²®à³†à²¯à²¾à²—à²¿à²¦à³†.</>,
            rightsId: "à²—à²¿à²—à³â€Œà²—à²¾à²°à³à²¡à³ à²à²¡à²¿",
            rightsScore: "à²¹à²•à³à²•à³à²—à²³ à²¸à³à²•à³‹à²°à³",
            verified: "à²ªà²°à²¿à²¶à³€à²²à²¿à²¸à²²à²¾à²—à²¿à²¦à³†",
            risk: "à²…à²ªà²¾à²¯à²¦à²²à³à²²à²¿à²¦à³†",
            earningsTitle: "à²—à²³à²¿à²•à³†à²¯à²²à³à²²à²¿ à²µà³à²¯à²¤à³à²¯à²¾à²¸",
            earningsSub: "à²…à²¨à²¾à²®à²§à³‡à²¯ à²¸à²¹à²µà²°à³à²¤à²¿ à²—à³à²‚à²ªà²¿à²—à³† à²¹à³‹à²²à²¿à²¸à²¿à²¦à²°à³† (n=5,420)",
            legendAvg: "à²¸à²°à²¾à²¸à²°à²¿",
            legendYou: "à²¨à³€à²µà³",
            violationsTitle: "à²ªà²¤à³à²¤à³†à²¯à²¾à²¦ à²‰à²²à³à²²à²‚à²˜à²¨à³†à²—à²³à³",
            claimTitle: "à²¨à²¿à²®à³à²® à²¹à²•à³à²•à³à²—à²³à²¨à³à²¨à³ à²ªà²¡à³†à²¯à²¿à²°à²¿",
            claimDesc: "à²œà³€à²°à³‹-à²¨à²¾à²²à³†à²¡à³à²œà³ à²ªà³à²°à³‚à²«à³ à²°à²šà²¿à²¸à²¿. à²ªà³à²²à²¾à²Ÿà³â€Œà²«à²¾à²°à³à²®à³â€Œà²—à³† à²¨à²¿à²®à³à²® à²—à³à²°à³à²¤à²¨à³à²¨à³ à²¬à²¹à²¿à²°à²‚à²—à²ªà²¡à²¿à²¸à²¦à³† à²¨à²¿à²®à³à²® à²¯à³‚à²¨à²¿à²¯à²¨à³ à²…à²¥à²µà²¾ à²•à²¾à²¨à³‚à²¨à³ à²¸à²¹à²¾à²¯à²•à³à²•à³† à²¦à³ƒà²¢à³€à²•à³ƒà²¤ à²¸à²¾à²•à³à²·à³à²¯à²µà²¨à³à²¨à³ à²¸à²²à³à²²à²¿à²¸à²¿.",
            claimBtn: "à²Žà²µà²¿à²¡à³†à²¨à³à²¸à³ NFT à²®à²¿à²‚à²Ÿà³ à²®à²¾à²¡à²¿"
        },
        ticker: [
            "à²°à³‹à²¹à²¨à³ (à²¬à³†à²‚à²—à²³à³‚à²°à³) â‚¹120 à²•à²¡à²¿à²®à³† à²ªà²¾à²µà²¤à²¿à²¯à²¨à³à²¨à³ à²ªà²¤à³à²¤à³†à²¹à²šà³à²šà²¿à²¦à³à²¦à²¾à²°à³†",
            "à²¸à²¾à²°à²¾ (à²®à³à²‚à²¬à³ˆ) à²µà²¿à²µà²¾à²¦ à²ªà³à²¯à²¾à²•à³ #8821 à²…à²¨à³à²¨à³ à²°à²šà²¿à²¸à²¿à²¦à³à²¦à²¾à²°à³†",
            "à²‡à²‚à²¦à²¿à²°à²¾à²¨à²—à²° à²µà²²à²¯à²¦à²²à³à²²à²¿ à²¶à³à²¯à²¾à²¡à³‹ à²¬à³à²¯à²¾à²¨à³ à²…à²²à³à²—à²¾à²°à²¿à²¦à²®à³ à²ªà²¤à³à²¤à³†à²¯à²¾à²—à²¿à²¦à³†",
            "à²¦à³†à²¹à²²à²¿ à²Žà²¨à³â€Œà²¸à²¿à²†à²°à³â€Œà²¨à²²à³à²²à²¿ à²¹à³Šà²¸ à²¸à²°à³à²œà³ à²¨à²¿à²¯à²®à²µà²¨à³à²¨à³ à²¹à²¿à²‚à²¤à³†à²—à³†à²¦à³à²•à³Šà²³à³à²³à²²à²¾à²—à²¿à²¦à³†",
            "à²ªà²°à²¿à²¶à³€à²²à²¿à²¸à²¿à²¦ à²†à²¡à²¿à²Ÿà³: Uber à²°à³ˆà²¡à³ #9921"
        ],
        flags: [
            "à²µà²¿à²µà²°à²¿à²¸à²¦ à²¦à²‚à²¡ (-â‚¹70)",
            "à²¶à³à²¯à²¾à²¡à³‹ à²¬à³à²¯à²¾à²¨à³ à²ªà²¤à³à²¤à³†à²¯à²¾à²—à²¿à²¦à³† (à²•à²¡à²¿à²®à³† à²•à³†à²²à²¸à²¦ à²¨à²¿à²¯à³‹à²œà²¨à³†)",
            "à²¸à²°à³à²œà³ à²¬à³‹à²¨à²¸à³ à²•à²¾à²£à³†à²¯à²¾à²—à²¿à²¦à³†"
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
        { code: 'hi', label: 'à¤¹à¤¿à¤‚à¤¦à¥€' },
        { code: 'kn', label: 'à²•à²¨à³à²¨à²¡' }
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
                    {lang === 'en' ? (
                        <>Gig<span className="text-emerald-400">Guard</span></>
                    ) : (
                        <span className="text-white">{t.brand}</span>
                    )}
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

const HeroHook = ({ onStart, onTrustLayer, lang }: { onStart: () => void, onTrustLayer: () => void, lang: Language }) => {
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

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onTrustLayer}
                        className="px-10 py-5 bg-transparent border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all flex items-center gap-2 justify-center"
                    >
                        <Shield size={20} className="text-emerald-400" />
                        Trust Layer
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

const Scanner = ({ onScanComplete, lang, audioData, setAudioData }: {
    onScanComplete: () => void,
    lang: Language,
    audioData: Blob | File | null,
    setAudioData: (data: Blob | File | null) => void
}) => {
    const t = TRANSLATIONS[lang];
    const [status, setStatus] = useState<ScanStatus>("idle");
    const [progress, setProgress] = useState(0);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFileName(e.target.files[0].name);
            startScan();
        }
    };

    const removeUploadedImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setUploadedFileName(null);
        setStatus("idle");
    };

    const removeAudioData = () => {
        setAudioData(null);
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

    const handleGenerateReport = async () => {
        if (!fileInputRef.current?.files?.[0]) {
            alert("Please upload a screenshot first!");
            return;
        }

        const formData = new FormData();

        // 1. Append the Screenshot
        formData.append('file', fileInputRef.current.files[0]);

        // 2. Append Audio (If it exists)
        if (audioData) {
            // If it's a recorded Blob, it needs a filename. If it's a File, it already has one.
            const filename = (audioData as File).name || "voice_testimony.wav";
            formData.append('audio', audioData, filename);
        }

        try {
            // USE THE NGROK URL HERE
            const response = await fetch('https://YOUR-NGROK-URL.ngrok-free.app/generate-report', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Analysis failed");

            // 3. Download the PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Evidence_Pack_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
            alert("Error generating report. Check console.");
        }
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

                        {/* Uploaded Image Info */}
                        {uploadedFileName && (
                            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-400" />
                                    <span className="text-sm text-emerald-400 font-medium">{uploadedFileName}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeUploadedImage();
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300 underline"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        {/* --- AUDIO EVIDENCE SECTION --- */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    🎤 Verbal Testimony <span className="text-slate-500 font-normal">(Optional)</span>
                                </label>

                                {/* Status Indicator */}
                                {audioData && (
                                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                                        ✅ Audio Attached
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">

                                {/* OPTION A: Live Recorder */}
                                <VoiceRecorder onAudioReady={(blob) => setAudioData(blob)} />

                                <div className="flex items-center text-slate-500 text-xs font-mono uppercase justify-center">
                                    - OR -
                                </div>

                                {/* OPTION B: File Upload Button */}
                                <label className="flex-1 cursor-pointer group">
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setAudioData(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:bg-slate-700/50 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        <span className="text-sm">Upload Recording</span>
                                    </div>
                                </label>
                            </div>

                            {/* Audio File Info with Remove Button */}
                            {audioData && (
                                <div className="mt-3 p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                                    <span className="text-xs text-emerald-400">
                                        {'name' in audioData ? `File: ${audioData.name}` : 'Voice recording saved'}
                                    </span>
                                    <button
                                        onClick={removeAudioData}
                                        className="text-xs text-red-400 hover:text-red-300 underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Generate Report Button */}
                        <button
                            onClick={handleGenerateReport}
                            className="mt-6 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/50"
                        >
                            Generate Evidence Report
                        </button>

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
        </motion.div>
    );
};

const Dashboard = ({ result, lang, audioData }: { result: AuditResult, lang: Language, audioData: Blob | File | null }) => {
    const t = TRANSLATIONS[lang];
    const [isMinting, setIsMinting] = useState(false);
    const [isMinted, setIsMinted] = useState(false);

    const handleMint = () => {
        setIsMinting(true);

        // Simulate Blockchain Transaction
        setTimeout(() => {
            setIsMinting(false);
            setIsMinted(true);

            // Audio Evidence Details
            let audioDetails = "None provided";
            if (audioData) {
                const type = 'name' in audioData ? "Uploaded File" : "Live Recording";
                const name = 'name' in audioData ? audioData.name : "voice_testimony.wav";
                const size = (audioData.size / 1024).toFixed(2) + " KB";
                audioDetails = `Type: ${type}\n  Filename: ${name}\n  Size: ${size}\n  Hash: ${Math.random().toString(36).substring(7)} (Simulated)`;
            }

            // Generate and Download Certificate (Mock PDF)
            const certificateContent = `
GIGGUARD DIGITAL RIGHTS CERTIFICATE
-----------------------------------
Date: ${new Date().toLocaleString()}
Rights Score: ${result.rightsScore}/100
Status: ${result.banStatus.toUpperCase()}

DETECTED VIOLATIONS
-------------------
${t.flags.map((flag: string) => `- ${flag}`).join('\n')}

AUDIO EVIDENCE
--------------
${audioDetails}

BLOCKCHAIN PROOF
----------------
Network: Polygon Mainnet
Transaction Hash: 0x71C...9A2
Block Height: 44,021,992
Smart Contract: 0xGig...Guard

EVIDENCE SUMMARY
----------------
This document certifies that the algorithmic audit evidence 
has been cryptographically secured and timestamped.
            `;

            const blob = new Blob([certificateContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Smart_Contract_Proof_${Date.now()}.txt`; // .txt for demo (PDF requires backend)
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, 2500);
    };

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

                    <button
                        onClick={handleMint}
                        disabled={isMinting || isMinted}
                        className={`relative z-10 w-full py-4 font-black text-lg rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg ${isMinted
                            ? "bg-emerald-500 text-white cursor-default"
                            : isMinting
                                ? "bg-gray-700 text-gray-300 cursor-wait"
                                : "bg-white hover:bg-emerald-50 text-black shadow-emerald-900/20"
                            }`}
                    >
                        {isMinting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Minting Proof...
                            </>
                        ) : isMinted ? (
                            <>
                                <CheckCircle size={20} />
                                Proof Downloaded
                            </>
                        ) : (
                            <>
                                <Hash size={20} className="text-emerald-600" />
                                {t.dashboard.claimBtn}
                            </>
                        )}
                    </button>

                    {isMinted && (
                        <p className="relative z-10 text-center text-xs text-emerald-500 mt-3 animate-fade-in">
                            Certificate downloaded to your device
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- Trust Layer Logic & Component ---

/**
 * SIMULATED CRYPTOGRAPHY & BLOCKCHAIN LOGIC
 * In a real app, this would be backend logic using SHA-256 and Elliptic Curve Cryptography.
 */

const generateHash = (data: any) => {
    // A simple hashing function for demonstration purposes to create unique signatures
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
};

class Block {
    timestamp: number;
    transactions: any[];
    previousHash: string;
    nonce: number;
    hash: string;

    constructor(timestamp: number, transactions: any[], previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return generateHash(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        );
    }

    mineBlock(difficulty: number) {
        // Simple Proof of Work simulation
        const target = Array(difficulty + 1).join("0");
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

class Blockchain {
    chain: Block[];
    difficulty: number;
    pendingTransactions: any[];
    miningReward: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1; // Low difficulty for instant UI feedback
        this.pendingTransactions = [];
        this.miningReward = 10; // Points for validating
    }

    createGenesisBlock() {
        return new Block(Date.now(), [{ type: 'GENESIS', from: 'SYSTEM', to: 'NETWORK', points: 0, data: 'Genesis Block' }], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress: string) {
        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        // In reality, miners pick transactions. Here we take all.
        this.chain.push(block);
        this.pendingTransactions = [];

        // Add point calculation logic here or just return the block
        return block;
    }

    addTransaction(transaction: any) {
        // Basic validation
        if (!transaction.from || !transaction.to) {
            throw new Error('Transaction must include from and to address');
        }
        // Verify signature (simulated)
        this.pendingTransactions.push(transaction);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) return false;
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }

    // Calculate Trust Score (Points) by traversing the ledger
    getBalanceOfAddress(address: string) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.to === address) {
                    balance += trans.points;
                }
                if (trans.from === address) {
                    balance -= trans.points;
                }
            }
        }
        return balance;
    }
}

// Initialize the simulated singleton blockchain
const gigCoin = new Blockchain();

const GigGuardTrustLayer = () => {
    const [chain, setChain] = useState(gigCoin.chain);
    const [pending, setPending] = useState(gigCoin.pendingTransactions);
    const [userPoints, setUserPoints] = useState(0);
    const [isMining, setIsMining] = useState(false);
    const [viewMode, setViewMode] = useState('encrypted'); // 'encrypted' or 'decrypted'
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [mintedNFTs, setMintedNFTs] = useState(new Set()); // Track minted transactions

    const currentUser = "DRIVER_WALLET_0x123";

    useEffect(() => {
        // Initial calculation
        updateUI();
    }, []);

    const updateUI = () => {
        setChain([...gigCoin.chain]);
        setPending([...gigCoin.pendingTransactions]);
        setUserPoints(gigCoin.getBalanceOfAddress(currentUser));
    };

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreateGig = () => {
        const newTx = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'GIG_ACCEPT',
            from: 'NETWORK',
            to: currentUser,
            points: 5, // Acceptance points
            data: {
                client: "Alice Corp",
                location: "550 Market St",
                rate: "$50.00",
                details: "Urgent package delivery"
            },
            timestamp: Date.now()
        };

        gigCoin.addTransaction(newTx);
        updateUI();
        showNotification("Gig Accepted! Transaction added to Mempool.");
    };

    const handleCompleteGig = () => {
        const newTx = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'GIG_COMPLETE',
            from: 'NETWORK',
            to: currentUser,
            points: 20, // Completion points (Big Reward)
            data: {
                client: "Alice Corp",
                rating: 5,
                feedback: "Excellent service!",
                completionTime: "45 mins"
            },
            timestamp: Date.now()
        };

        gigCoin.addTransaction(newTx);
        updateUI();
        showNotification("Gig Completed! Verification pending.");
    };

    const handleMine = () => {
        if (gigCoin.pendingTransactions.length === 0) {
            showNotification("No transactions to verify.");
            return;
        }

        setIsMining(true);
        setTimeout(() => {
            gigCoin.minePendingTransactions(currentUser);
            setIsMining(false);
            updateUI();
            showNotification("Block Mined & Verified! Points updated.");
        }, 1500); // Artificial delay for effect
    };

    const handleMintNFT = (txId: string) => {
        if (mintedNFTs.has(txId)) return;

        showNotification("Minting Evidence NFT to Wallet...");
        setTimeout(() => {
            setMintedNFTs(prev => new Set(prev).add(txId));
            showNotification("Success! NFT Credential Minted.");
        }, 2000);
    };

    const verifyIntegrity = () => {
        const valid = gigCoin.isChainValid();
        showNotification(valid ? "System Integrity: 100% Secure" : "WARNING: Chain Integrity Compromised");
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-emerald-500 selection:text-white pt-20">
            {/* Top Navigation / Status Bar */}
            <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-6 h-6 text-emerald-500" />
                        <span className="font-bold text-lg tracking-tight">GigGuard <span className="text-emerald-500">Trust Layer</span></span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${pending.length > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            <span className="text-slate-400">Network Status: <span className="text-slate-200">Active</span></span>
                        </div>
                        <div className="hidden md:flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            <Cpu className="w-4 h-4 text-emerald-400" />
                            <span>Node ID: <span className="font-mono text-emerald-400">0x8A...2F</span></span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Controls & Wallet */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Identity Card */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield className="w-32 h-32" />
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Driver Identity</h3>
                        <div className="flex items-end space-x-2 mb-1">
                            <span className="text-4xl font-bold text-white">{userPoints}</span>
                            <span className="text-emerald-400 font-medium mb-1">Trust Points</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mb-6">Wallet: {currentUser}</p>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm border-b border-slate-700 pb-2">
                                <span className="text-slate-400">Reputation Tier</span>
                                <span className={userPoints > 50 ? "text-yellow-400 font-bold" : "text-slate-200"}>
                                    {userPoints > 100 ? "Gold 🌟" : userPoints > 50 ? "Silver 🛡️" : "Bronze 🥉"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Verified Gigs</span>
                                <span className="text-slate-200">
                                    {chain.reduce((acc, block) => acc + block.transactions.filter(t => t.to === currentUser && t.type === 'GIG_COMPLETE').length, 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm pt-2">
                                <span className="text-slate-400">Evidence NFTs</span>
                                <span className="text-purple-400 font-bold">
                                    {mintedNFTs.size}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Console */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl" >
                        <h3 className="text-slate-200 font-bold mb-4 flex items-center">
                            <Server className="w-5 h-5 mr-2 text-blue-400" />
                            Gig Simulation Console
                        </h3>

                        <div className="space-y-3">
                            <button
                                onClick={handleCreateGig}
                                className="w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center">
                                    <Plus className="w-5 h-5 mr-3 text-blue-400" />
                                    <span className="font-medium">Accept New Gig</span>
                                </div>
                                <span className="text-xs bg-slate-900 px-2 py-1 rounded text-blue-300 group-hover:bg-blue-900">+5 pts</span>
                            </button>

                            <button
                                onClick={handleCompleteGig}
                                className="w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-3 text-emerald-400" />
                                    <span className="font-medium">Complete Current Gig</span>
                                </div>
                                <span className="text-xs bg-slate-900 px-2 py-1 rounded text-emerald-300 group-hover:bg-emerald-900">+20 pts</span>
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-slate-400">Mempool (Pending)</h4>
                                <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-yellow-400">{pending.length} Txs</span>
                            </div>

                            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto custom-scrollbar">
                                {pending.length === 0 ? (
                                    <p className="text-xs text-slate-600 italic text-center py-2">Mempool is empty</p>
                                ) : (
                                    pending.map((tx) => (
                                        <div key={tx.id} className="text-xs bg-slate-900/50 p-2 rounded border border-slate-700/50 flex justify-between items-center">
                                            <span className="text-slate-300">{tx.type}</span>
                                            <span className="font-mono text-slate-500">{tx.id}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={handleMine}
                                disabled={isMining || pending.length === 0}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all ${isMining || pending.length === 0
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                                    }`}
                            >
                                {isMining ? (
                                    <>
                                        <Cpu className="w-5 h-5 mr-2 animate-spin" />
                                        Validating Blocks...
                                    </>
                                ) : (
                                    <>
                                        <Database className="w-5 h-5 mr-2" />
                                        Mine & Verify Block
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-400">
                            <Eye className="w-4 h-4 mr-2" />
                            <span>Privacy Mode</span>
                        </div>
                        <button
                            onClick={() => setViewMode(prev => prev === 'encrypted' ? 'decrypted' : 'encrypted')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${viewMode === 'decrypted' ? 'bg-emerald-600' : 'bg-slate-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${viewMode === 'decrypted' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                </div>

                {/* RIGHT COLUMN: The Blockchain Visualizer */}
                <div className="lg:col-span-8 space-y-6" >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center">
                            <Hash className="w-6 h-6 mr-2 text-slate-400" />
                            Immutable Ledger
                        </h2>
                        <button onClick={verifyIntegrity} className="text-xs text-slate-400 hover:text-white underline">
                            Verify Chain Integrity
                        </button>
                    </div>

                    <div className="space-y-4">
                        {chain.slice().reverse().map((block, index) => {
                            const realIndex = chain.length - 1 - index;
                            const isGenesis = realIndex === 0;
                            return (
                                <div key={block.hash} className="relative pl-8">
                                    {/* Timeline Line */}
                                    {index !== chain.length - 1 && (
                                        <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-700"></div>
                                    )}

                                    {/* Timeline Dot */}
                                    <div className={`absolute left-0 top-6 w-6 h-6 rounded-full border-4 border-slate-900 ${isGenesis ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>

                                    <div className={`bg-slate-800 rounded-xl border ${selectedBlock === block.hash ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-700'} overflow-hidden hover:border-slate-600 transition-colors`}>

                                        {/* Block Header */}
                                        <div
                                            className="p-4 bg-slate-800/50 cursor-pointer flex flex-wrap gap-4 items-center justify-between"
                                            onClick={() => setSelectedBlock(selectedBlock === block.hash ? null : block.hash)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-2 rounded-lg ${isGenesis ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-slate-200">Block #{realIndex}</span>
                                                        <span className="text-xs text-slate-500 font-mono">{new Date(block.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                    <div className="text-xs font-mono text-slate-500 truncate w-32 md:w-64">
                                                        Hash: {block.hash}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-xs text-slate-400">Transactions</div>
                                                    <div className="font-bold text-slate-200">{block.transactions.length}</div>
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded ${isGenesis ? 'bg-blue-900 text-blue-300' : 'bg-emerald-900 text-emerald-300'}`}>
                                                    {isGenesis ? 'GENESIS' : 'VERIFIED'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Block Details (Expandable) */}
                                        {(selectedBlock === block.hash || (!selectedBlock && index === 0)) && (
                                            <div className="p-4 border-t border-slate-700 bg-slate-900/30 text-sm">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                        <span className="text-xs text-slate-500 block mb-1">Previous Hash</span>
                                                        <span className="font-mono text-xs break-all text-slate-300">{block.previousHash}</span>
                                                    </div>
                                                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                        <span className="text-xs text-slate-500 block mb-1">Nonce (PoW)</span>
                                                        <span className="font-mono text-xs text-slate-300">{block.nonce}</span>
                                                    </div>
                                                </div>

                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transactions</h4>
                                                <div className="space-y-2">
                                                    {block.transactions.map((tx, idx) => (
                                                        <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded relative overflow-hidden group">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${tx.type === 'GIG_COMPLETE' ? 'bg-emerald-900/50 text-emerald-400' :
                                                                    tx.type === 'GIG_ACCEPT' ? 'bg-blue-900/50 text-blue-400' :
                                                                        'bg-slate-700 text-slate-300'
                                                                    }`}>
                                                                    {tx.type}
                                                                </span>
                                                                <span className="text-xs font-mono text-slate-500">{tx.id || 'SYS'}</span>
                                                            </div>

                                                            {/* PRIVACY LAYER VISUALIZATION */}
                                                            <div className="font-mono text-xs mt-2 bg-black/20 p-2 rounded">
                                                                {viewMode === 'decrypted' || tx.type === 'GENESIS' ? (
                                                                    // DECRYPTED VIEW
                                                                    <div className="text-emerald-400 animate-in fade-in duration-300">
                                                                        <div className="flex items-center mb-1 text-slate-500">
                                                                            <Unlock className="w-3 h-3 mr-1" />
                                                                            <span>Decrypted Data:</span>
                                                                        </div>
                                                                        <pre className="whitespace-pre-wrap font-sans text-slate-300">
                                                                            {JSON.stringify(tx.data, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                ) : (
                                                                    // ENCRYPTED VIEW
                                                                    <div className="text-slate-500 select-none">
                                                                        <div className="flex items-center mb-1 text-slate-600">
                                                                            <Lock className="w-3 h-3 mr-1" />
                                                                            <span>Encrypted Data (Public View):</span>
                                                                        </div>
                                                                        <div className="break-all opacity-50 blur-[1px] hover:blur-0 transition-all cursor-not-allowed">
                                                                            {generateHash(JSON.stringify(tx.data))}...[ENCRYPTED_PAYLOAD]...{generateHash(tx.id)}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* NFT MINTING ACTION (Only for Completed Gigs) */}
                                                            {tx.type === 'GIG_COMPLETE' && (
                                                                <div className="mt-3 flex justify-end border-t border-slate-800 pt-2">
                                                                    {mintedNFTs.has(tx.id) ? (
                                                                        <button disabled className="flex items-center space-x-1 text-xs bg-purple-900/50 text-purple-300 px-3 py-1.5 rounded cursor-default border border-purple-500/30">
                                                                            <BadgeCheck className="w-4 h-4" />
                                                                            <span>Evidence Minted</span>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleMintNFT(tx.id); }}
                                                                            className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-purple-700 text-purple-400 hover:text-white px-3 py-1.5 rounded transition-all border border-purple-500/30 hover:border-purple-400"
                                                                        >
                                                                            <Hexagon className="w-4 h-4" />
                                                                            <span>Mint Evidence NFT</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}

                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Notifications */}
            {
                notification && (
                    <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl animate-bounce flex items-center z-50">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {notification}
                    </div>
                )
            }
        </div>
    );
}

// --- Main Page Component ---

export default function GigGuardApp() {
    const [view, setView] = useState<"hero" | "scanner" | "dashboard" | "trust-layer">("hero");
    const [lang, setLang] = useState<Language>('en');
    const [audioData, setAudioData] = useState<Blob | File | null>(null);

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
                            <HeroHook
                                onStart={() => setView("scanner")}
                                onTrustLayer={() => setView("trust-layer")}
                                lang={lang}
                            />
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
                            <Scanner
                                onScanComplete={() => setView("dashboard")}
                                lang={lang}
                                audioData={audioData}
                                setAudioData={setAudioData}
                            />
                        </motion.div>
                    )}

                    {view === "dashboard" && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Dashboard result={MOCK_DATA} lang={lang} audioData={audioData} />
                        </motion.div>
                    )}

                    {view === "trust-layer" && (
                        <motion.div
                            key="trust-layer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <GigGuardTrustLayer />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

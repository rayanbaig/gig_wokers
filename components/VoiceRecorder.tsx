"use client";

import { useState, useRef } from 'react';
import { Mic, Square, CheckCircle } from 'lucide-react';

interface VoiceRecorderProps {
    onAudioReady: (audioBlob: Blob) => void;
}

export default function VoiceRecorder({ onAudioReady }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                onAudioReady(audioBlob); // Send blob up to parent
                setIsSaved(true);
                chunksRef.current = []; // Reset
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setIsSaved(false);
        } catch (err) {
            alert("Microphone permission denied!");
            console.error(err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {!isRecording && !isSaved && (
                <button
                    onClick={startRecording}
                    type="button" // Prevent form submit
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-200 transition-all border border-slate-600"
                >
                    <Mic size={18} /> <span>Record Testimony</span>
                </button>
            )}

            {isRecording && (
                <button
                    onClick={stopRecording}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500 rounded-full animate-pulse"
                >
                    <Square size={18} fill="currentColor" /> <span>Stop Recording...</span>
                </button>
            )}

            {isSaved && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle size={16} /> <span>Voice Evidence Saved</span>
                    <button onClick={() => setIsSaved(false)} className="text-xs underline ml-2 text-slate-400">Redo</button>
                </div>
            )}
        </div>
    );
}

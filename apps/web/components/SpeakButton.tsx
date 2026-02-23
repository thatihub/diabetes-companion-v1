"use client";

import { useEffect, useMemo, useState } from "react";

type SpeakButtonProps = {
  text: string;
  className?: string;
};

export default function SpeakButton({ text, className }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const label = useMemo(() => (isSpeaking ? "Stop Audio" : "Read Aloud"), [isSpeaking]);

  const handleToggleSpeak = () => {
    if (!supported) return;
    if (!text?.trim()) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleToggleSpeak}
      disabled={!supported || !text?.trim()}
      className={`app-btn text-[10px] ${className || ""}`}
      aria-label={label}
      title={label}
      type="button"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19 5a8 8 0 0 1 0 14"></path>
        <path d="M15.5 8.5a4 4 0 0 1 0 7"></path>
      </svg>
      {label}
    </button>
  );
}

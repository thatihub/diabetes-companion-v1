"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SpeakButtonProps = {
  text: string;
  className?: string;
};

export default function SpeakButton({ text, className }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const label = useMemo(() => (isSpeaking ? "Stop Audio" : "Read Aloud"), [isSpeaking]);

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (supported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setLoadingAi(false);
  };

  const speak = (spokenText: string, preferredName?: string) => {
    if (!supported) return;
    if (!spokenText?.trim()) return;

    if (isSpeaking) {
      stopAll();
      if (!preferredName) return;
    }

    stopAll();
    const utterance = new SpeechSynthesisUtterance(spokenText);
    if (preferredName) {
      const voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.name.toLowerCase().includes(preferredName.toLowerCase()));
      if (voice) utterance.voice = voice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const speakWithOpenAI = async (spokenText: string, openAiVoice: "nova" | "shimmer") => {
    if (!spokenText?.trim()) return;

    if (isSpeaking || loadingAi) {
      stopAll();
      return;
    }

    try {
      setLoadingAi(true);
      const response = await fetch("/api/insights/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: spokenText, voice: openAiVoice }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        audioRef.current = null;
        setIsSpeaking(false);
        setLoadingAi(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        audioRef.current = null;
        setIsSpeaking(false);
        setLoadingAi(false);
      };

      setIsSpeaking(true);
      setLoadingAi(false);
      await audio.play();
    } catch (err) {
      console.error("OpenAI TTS failed, falling back to local speech:", err);
      setLoadingAi(false);
      speak(spokenText);
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking || loadingAi) {
      stopAll();
      return;
    }
    speakWithOpenAI(text, "nova");
  };

  return (
    <div className={`${className || ""}`}>
      <button
        onClick={handleToggleSpeak}
        disabled={!supported || !text?.trim()}
        className="app-btn text-[10px]"
        aria-label={label}
        title={label}
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19 5a8 8 0 0 1 0 14"></path>
          <path d="M15.5 8.5a4 4 0 0 1 0 7"></path>
        </svg>
        {loadingAi ? "Loading Voice..." : label}
      </button>
    </div>
  );
}

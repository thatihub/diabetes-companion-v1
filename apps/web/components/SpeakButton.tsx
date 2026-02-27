"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SpeakButtonProps = {
  text: string;
  className?: string;
};

export default function SpeakButton({ text, className }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map()); // key -> object URL
  const localUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    const primeVoices = () => {
      window.speechSynthesis.getVoices();
      setVoicesReady(true);
    };
    primeVoices();
    window.speechSynthesis.onvoiceschanged = primeVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (localUtteranceRef.current) {
        window.speechSynthesis.cancel();
        localUtteranceRef.current = null;
      }
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
    if (localUtteranceRef.current) {
      window.speechSynthesis.cancel();
      localUtteranceRef.current = null;
    }
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

    localUtteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const playAudioUrl = (url: string) => {
    stopAll();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      audioRef.current = null;
      setIsSpeaking(false);
    };
    audio.onerror = () => {
      audioRef.current = null;
      setIsSpeaking(false);
    };
    setIsSpeaking(true);
    audio.play();
  };

  const speakWithOpenAI = async (spokenText: string, openAiVoice: "nova" | "shimmer") => {
    if (!spokenText?.trim()) return;

    if (isSpeaking || loadingAi) {
      stopAll();
      return;
    }

    try {
      setLoadingAi(true);
      const cacheKey = `${openAiVoice}:${spokenText}`;
      const cachedUrl = cacheRef.current.get(cacheKey);
      if (cachedUrl) {
        setLoadingAi(false);
        playAudioUrl(cachedUrl);
        return;
      }

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
      cacheRef.current.set(cacheKey, objectUrl);

      setLoadingAi(false);
      playAudioUrl(objectUrl);
    } catch (err) {
      console.error("OpenAI TTS failed, falling back to local speech:", err);
      setLoadingAi(false);
      speak(spokenText);
    }
  };

  const handleToggleSpeak = () => {
    if (!text?.trim()) return;

    // If already speaking, stop.
    if (isSpeaking) {
      stopAll();
      return;
    }

    // Instant local voice for zero-lag.
    if (supported) {
      speak(text);
    }

    // Kick off high-quality TTS; cached if already fetched.
    speakWithOpenAI(text, "nova");
  };

  return (
    <div className={`${className || ""}`}>
      <button
        onClick={handleToggleSpeak}
        disabled={!text?.trim() || loadingAi}
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

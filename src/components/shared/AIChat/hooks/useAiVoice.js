import { useCallback, useRef, useState } from "react";
import { SERVER_URL } from "../constants/aiChatConstants.js";

/**
 * Speech recognition (PTT) and text-to-speech for the AI chat widget.
 */
export function useAiVoice({ assistantMode, voice, sendMessageRef }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const isVoiceModeRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const pendingListenRef = useRef(false);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const lastAIPlainTextRef = useRef("");
  const justFinishedSpeakingRef = useRef(false);
  const onSpeakEndRef = useRef(null);

  const beginListening = useCallback(() => {
    if (!isVoiceModeRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setIsListening(false);
      if (transcript && sendMessageRef.current) sendMessageRef.current(transcript);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {
      // browser may reject rapid restart
    }
  }, [sendMessageRef]);

  const beginListeningRef = useRef(beginListening);
  beginListeningRef.current = beginListening;

  const startPushToTalk = useCallback(() => {
    if (!isVoiceModeRef.current) return;
    if (isSpeakingRef.current) {
      pendingListenRef.current = true;
      return;
    }
    beginListeningRef.current();
  }, []);

  const stopListening = useCallback(() => {
    pendingListenRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  }, []);

  const speakFallback = useCallback((plain) => {
    if (!window.speechSynthesis) {
      onSpeakEndRef.current?.();
      onSpeakEndRef.current = null;
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1.05;
    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
    };
    utterance.onend = () => {
      justFinishedSpeakingRef.current = true;
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      onSpeakEndRef.current?.();
      onSpeakEndRef.current = null;
      if (pendingListenRef.current) {
        pendingListenRef.current = false;
        beginListeningRef.current();
      }
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    async (text) => {
      stopSpeaking();
      const plain = text
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/#+\s/g, "")
        .replace(/`(.+?)`/g, "$1")
        .trim();

      lastAIPlainTextRef.current = plain;

      const ttsEndpoint =
        assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-tts` : `${SERVER_URL}/api/ai/tts`;
      try {
        const res = await fetch(ttsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: plain, voice }),
        });
        if (!res.ok) throw new Error("TTS unavailable");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onplay = () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
        };
        const onDone = () => {
          justFinishedSpeakingRef.current = true;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          URL.revokeObjectURL(url);
          audioRef.current = null;
          onSpeakEndRef.current?.();
          onSpeakEndRef.current = null;
          if (pendingListenRef.current) {
            pendingListenRef.current = false;
            beginListeningRef.current();
          }
        };
        audio.onended = onDone;
        audio.onerror = onDone;
        await audio.play();
      } catch {
        speakFallback(plain);
      }
    },
    [assistantMode, voice, stopSpeaking, speakFallback],
  );

  const toggleVoiceMode = useCallback(() => {
    setIsVoiceMode((prev) => {
      const next = !prev;
      isVoiceModeRef.current = next;
      if (!next) {
        stopListening();
        stopSpeaking();
        pendingListenRef.current = false;
      }
      return next;
    });
  }, [stopListening, stopSpeaking]);

  return {
    isListening,
    isSpeaking,
    isVoiceMode,
    isVoiceModeRef,
    isSpeakingRef,
    pendingListenRef,
    lastAIPlainTextRef,
    justFinishedSpeakingRef,
    onSpeakEndRef,
    beginListening,
    startPushToTalk,
    stopListening,
    stopSpeaking,
    speak,
    toggleVoiceMode,
    setIsVoiceMode,
    setIsListening,
    setIsSpeaking,
  };
}

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { BRANDING_VOICE_SAMPLE_TEXT } from "@/modules/branding/utils/branding.constants";
import getEnv from "@/utils/env";

// plays a short text-to-speech sample of the chosen ai voice
const useBrandingVoiceSample = (voice) => {
  const [isSamplePlaying, setIsSamplePlaying] = useState(false);
  const sampleAudioRef = useRef(null);

  const stopSample = () => {
    if (!sampleAudioRef.current) return false;
    sampleAudioRef.current.pause();
    sampleAudioRef.current = null;
    setIsSamplePlaying(false);
    return true;
  };

  const playSample = async () => {
    if (stopSample()) return;
    setIsSamplePlaying(true);
    try {
      const res = await fetch(`${getEnv("SERVER_URL")}/api/ai/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: BRANDING_VOICE_SAMPLE_TEXT, voice }),
      });
      if (!res.ok) throw new Error("TTS unavailable");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      sampleAudioRef.current = audio;
      audio.onended = () => {
        setIsSamplePlaying(false);
        sampleAudioRef.current = null;
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsSamplePlaying(false);
        sampleAudioRef.current = null;
      };
      audio.play();
    } catch {
      setIsSamplePlaying(false);
      toast.error("Could not play voice sample. Please try again.");
    }
  };

  return { isSamplePlaying, playSample, stopSample };
};

export default useBrandingVoiceSample;

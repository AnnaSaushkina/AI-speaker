import { useState, useEffect, useCallback } from "react";
import type {
  IWindow,
  SpeechRecognitionEvent,
  SpeechState,
} from "../types/speech";

export function useSpeech(setInputText: (text: string) => void) {
  const [speechState, setSpeechState] = useState<SpeechState>("idle");
  const [isListening, setIsListening] = useState(false);

  // Распознавание речи
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition =
      win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const speechToText = event.results[0][0].transcript;
      setInputText(speechToText);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }
  }, [isListening, setInputText]);

  // Озвучка текста
  const toggleSpeech = useCallback(
    (text?: string) => {
      if (!("speechSynthesis" in window)) return;

      if (speechState === "speaking") {
        window.speechSynthesis.pause();
        setSpeechState("paused");
        return;
      }

      if (speechState === "paused") {
        window.speechSynthesis.resume();
        setSpeechState("speaking");
        return;
      }

      if (!text) return;
      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/[*#_`~[\]()]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "ru-RU";
      utterance.rate = 1.0;

      utterance.onstart = () => setSpeechState("speaking");
      utterance.onend = () => setSpeechState("idle");
      utterance.onerror = () => setSpeechState("idle");

      window.speechSynthesis.speak(utterance);
    },
    [speechState],
  );

  const cancelSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeechState("idle");
    }
  };

  return {
    speechState,
    isListening,
    setIsListening,
    toggleSpeech,
    cancelSpeech,
  };
}

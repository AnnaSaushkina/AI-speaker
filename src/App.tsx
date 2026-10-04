import "./App.css";
import React, { useState } from "react";
import { Header } from "./components/Header";
import { ChatInput } from "./components/ChatInput";
import { ResponseBox } from "./components/ResponseBox";
import { useSpeech } from "./hooks/useSpeech";
import { fetchGroqCompletion } from "./services/groq";

// Настройки лимитов
const COOLDOWN_MS = 50000; // 50 секунд между запросами
const MAX_REQUESTS_PER_MINUTE = 1; // макс. 1 запросов в минуту

export default function App() {
  const [inputText, setInputText] = useState("");
  const [responseMarkdown, setResponseMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [requestHistory, setRequestHistory] = useState<number[]>([]);

  const {
    speechState,
    isListening,
    setIsListening,
    toggleSpeech,
    cancelSpeech,
  } = useSpeech(setInputText);

  const handleProcessAndSpeak = async () => {
    if (!inputText.trim()) return;

    const now = Date.now();

    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < COOLDOWN_MS) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - timeSinceLast) / 1000);
      setResponseMarkdown(
        `**Ограничение:** Пожалуйста, подождите ${secondsLeft} сек. перед следующим запросом.`,
      );
      return;
    }

    const recentRequests = requestHistory.filter(
      (timestamp) => now - timestamp < 60000,
    );

    if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
      const oldestInMinute = recentRequests[0];
      const waitTimeSeconds = Math.ceil(
        (60000 - (now - oldestInMinute)) / 1000,
      );
      setResponseMarkdown(
        `**Превышен лимит:** Достигнуто максимум ${MAX_REQUESTS_PER_MINUTE} запросов в минуту. Попробуйте через ${waitTimeSeconds} сек.`,
      );
      return;
    }

    setLastRequestTime(now);
    setRequestHistory([...recentRequests, now]);

    setIsLoading(true);
    setResponseMarkdown("");
    cancelSpeech();

    try {
      const aiText = await fetchGroqCompletion(inputText);
      setResponseMarkdown(aiText);
      toggleSpeech(aiText);
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      setResponseMarkdown(`**Ошибка:** ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-start py-10 px-4 font-sans">
      <div className="w-full max-w-2xl bg-[#111827] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
        <Header isListening={isListening} setIsListening={setIsListening} />
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          isListening={isListening}
          setIsListening={setIsListening}
          isLoading={isLoading}
          onSubmit={handleProcessAndSpeak}
        />
        <ResponseBox
          responseMarkdown={responseMarkdown}
          speechState={speechState}
          onToggleSpeech={() => toggleSpeech(responseMarkdown)}
        />
      </div>
    </div>
  );
}

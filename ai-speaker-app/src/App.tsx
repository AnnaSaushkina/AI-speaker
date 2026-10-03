import React, { useState, useEffect } from "react";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [responseMarkdown, setResponseMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speechState, setSpeechState] = useState<
    "idle" | "speaking" | "paused"
  >("idle");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
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
  }, [isListening]);

  // Управление озвучкой (Воспроизведение / Пауза / Продолжить)
  const toggleSpeech = (text?: string) => {
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

    const cleanText = text.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ru-RU";
    utterance.rate = 1.0;

    utterance.onstart = () => setSpeechState("speaking");
    utterance.onend = () => setSpeechState("idle");
    utterance.onerror = () => setSpeechState("idle");

    window.speechSynthesis.speak(utterance);
  };

  // Запрос к Groq API с токеном из переменной окружения (.env)
  const handleProcessAndSpeak = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResponseMarkdown("");

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeechState("idle");
    }

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      setResponseMarkdown(
        "**Ошибка:** Не найден `VITE_GROQ_API_KEY` в переменных окружения (.env)."
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [{ role: "user", content: inputText }],
          }),
        }
      );

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        const aiText = data.choices[0].message.content;
        setResponseMarkdown(aiText);
        toggleSpeech(aiText);
      } else if (data.error) {
        setResponseMarkdown(
          `**Ошибка API:** ${data.error.message || JSON.stringify(data.error)}`
        );
      } else {
        setResponseMarkdown("Пустой ответ от сервера.");
      }
    } catch (error) {
      console.error(error);
      setResponseMarkdown("**Ошибка соединения с Groq API.**");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("### ")) {
        return (
          <h3
            key={index}
            className="text-base font-bold text-indigo-300 mt-3 mb-1"
          >
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-lg font-bold text-indigo-300 mt-4 mb-2"
          >
            {line.replace("## ", "")}
          </h2>
        );
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={index} className="ml-4 list-disc text-slate-300 my-0.5">
            {line.substring(2)}
          </li>
        );
      }

      if (line.startsWith("```")) {
        return (
          <div
            key={index}
            className="font-mono text-xs bg-slate-900 p-2 rounded-lg text-emerald-400 my-1 overflow-x-auto"
          >
            {line}
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={index} className="h-2"></div>;
      }

      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="text-sm text-slate-300 leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={i} className="text-white font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-[#111827] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
        {/* Шапка */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm font-semibold text-white tracking-tight">
                Задай вопрос по коду
              </h1>
            </div>
          </div>
        </div>

        {/* Инпут с микрофоном внутри */}
        <div className="relative flex flex-col gap-3">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? "Слушаю вас..."
                  : "Введите запрос или нажмите микрофон..."
              }
              rows={3}
              className={`w-full bg-[#0b0f19] border rounded-2xl p-4 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all resize-none shadow-inner ${
                isListening
                  ? "border-rose-500 ring-1 ring-rose-500/50"
                  : "border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              }`}
            />
          </div>

          <button
            onClick={() => setIsListening(!isListening)}
            title="Голосовой ввод"
            className={`absolute right-3 top-3.5 p-2 rounded-xl transition-all cursor-pointer ${
              isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            }`}
          >
            Диктовать
          </button>

          <button
            onClick={handleProcessAndSpeak}
            disabled={isLoading || !inputText.trim()}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/25 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8a 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Генерация...</span>
              </>
            ) : (
              <span>Спросить</span>
            )}
          </button>
        </div>

        {/* Блок ответа с чистым Markdown-рендером и кнопкой Паузы/Воспроизведения */}
        {responseMarkdown && (
          <div className="flex flex-col gap-3 p-5 bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <span>Ответ</span>
                {speechState === "speaking" && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                {speechState === "paused" && (
                  <span className="text-[10px] text-amber-400 font-normal lowercase">
                    (на паузе)
                  </span>
                )}
              </span>

              {!responseMarkdown.startsWith("**Ошибка") && (
                <button
                  onClick={() => toggleSpeech(responseMarkdown)}
                  className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors border border-slate-700/60 flex items-center gap-1.5 cursor-pointer"
                >
                  {speechState === "speaking"
                    ? "⏸️ Пауза голоса"
                    : speechState === "paused"
                    ? "▶️ Продолжить"
                    : "🔊 Озвучить снова"}
                </button>
              )}
            </div>

            {/* Рендеринг красивого текста */}
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
              {renderMarkdown(responseMarkdown)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

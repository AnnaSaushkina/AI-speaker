import React from "react";
import "./Header.css";

interface HeaderProps {
  isListening: boolean;
  setIsListening: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isListening,
  setIsListening,
}) => {
  return (
    <div className="header flex items-center justify-between pb-4 border-b border-slate-800/60">
      <h3 className="text-lg font-bold text-white tracking-tight">
        Задай вопрос по коду:
      </h3>

      <button
        type="button"
        onClick={() => setIsListening(!isListening)}
        title="Голосовой ввод"
        className={`voice-btn ${isListening ? "listening" : ""}`}
      >
        Диктовать
      </button>
    </div>
  );
};

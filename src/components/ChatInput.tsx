import React from "react";
import "./ChatInput.css";
interface ChatInputProps {
  inputText: string;
  setInputText: (val: string) => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  isListening,
  // setIsListening,
  isLoading,
  onSubmit,
}) => {
  return (
    <div className=" flex flex-col gap-3">
      <div className="relative flex items-center">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? "Слушаю вас..."
              : "Введите запрос или нажмите Диктовать..."
          }
          rows={3}
          className={`chat-textarea ${isListening ? "listening" : ""}`}
        />
      </div>
      <div className="wrapper">
        <button
          onClick={onSubmit}
          disabled={isLoading || !inputText.trim()}
          className="submit-btn"
        >
          {isLoading ? (
            <>
              <svg className="spinner" fill="none" viewBox="0 0 24 24">
                <circle
                  style={{ opacity: 0.25 }}
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  style={{ opacity: 0.75 }}
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Генерация...</span>
            </>
          ) : (
            <span>Спросить</span>
          )}
        </button>
      </div>
    </div>
  );
};

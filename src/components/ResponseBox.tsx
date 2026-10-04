import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SpeechState } from "../types/speech";
import "./ResponseBox.css";

interface ResponseBoxProps {
  responseMarkdown: string;
  speechState: SpeechState;
  onToggleSpeech: () => void;
}

interface ComponentWithChildrenProps {
  children?: React.ReactNode;
}

interface CodeComponentProps extends ComponentWithChildrenProps {
  className?: string;
  node?: unknown;
}

const markdownComponents: Components = {
  h1: ({ children }: ComponentWithChildrenProps) => (
    <h1 className="text-base font-bold text-white mt-3 mb-2">{children}</h1>
  ),
  h2: ({ children }: ComponentWithChildrenProps) => (
    <h2 className="text-sm font-bold text-indigo-300 mt-3 mb-1.5 border-b border-slate-800/60 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }: ComponentWithChildrenProps) => (
    <h3 className="text-xs font-semibold text-indigo-400 mt-2 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }: ComponentWithChildrenProps) => (
    <p className="text-xs text-slate-300 leading-relaxed mb-2 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }: ComponentWithChildrenProps) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  ul: ({ children }: ComponentWithChildrenProps) => (
    <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1 my-2">
      {children}
    </ul>
  ),
  ol: ({ children }: ComponentWithChildrenProps) => (
    <ol className="list-decimal pl-4 text-xs text-slate-300 space-y-1 my-2">
      {children}
    </ol>
  ),
  li: ({ children }: ComponentWithChildrenProps) => <li>{children}</li>,
  code({ className, children }: CodeComponentProps) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children ?? "").replace(/\n$/, "");

    if (match) {
      return (
        <div className="my-2 rounded-xl overflow-hidden border border-slate-800 bg-[#05070d] p-3">
          <pre className="text-[11px] font-mono text-indigo-200 overflow-x-auto whitespace-pre">
            <code>{codeString}</code>
          </pre>
        </div>
      );
    }

    return (
      <code className="bg-slate-900 text-indigo-300 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-800">
        {children}
      </code>
    );
  },
  table: ({ children }: ComponentWithChildrenProps) => (
    <div className="overflow-x-auto my-3 border border-slate-800 rounded-xl shadow-inner">
      <table className="w-full text-left text-xs text-slate-300 border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: ComponentWithChildrenProps) => (
    <thead className="bg-[#0a0e19] text-slate-200 border-b border-slate-800">
      {children}
    </thead>
  ),
  th: ({ children }: ComponentWithChildrenProps) => (
    <th className="p-2.5 font-semibold border-r border-slate-800/60 last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }: ComponentWithChildrenProps) => {
    const renderCleanContent = (nodes: React.ReactNode): React.ReactNode => {
      if (typeof nodes === "string") {
        return nodes.replace(/<br\s*\/?>/gi, " ");
      }
      if (
        React.isValidElement<ComponentWithChildrenProps>(nodes) &&
        nodes.props &&
        nodes.props.children
      ) {
        return React.cloneElement(nodes, {
          children: React.Children.map(
            nodes.props.children,
            renderCleanContent,
          ),
        });
      }
      return nodes;
    };

    return (
      <td className="p-2.5 border-t border-r border-slate-800/60 last:border-r-0 leading-relaxed">
        {React.Children.map(children, renderCleanContent)}
      </td>
    );
  },
};

export const ResponseBox: React.FC<ResponseBoxProps> = ({
  responseMarkdown,
  speechState,
  onToggleSpeech,
}) => {
  if (!responseMarkdown) return null;

  return (
    <div className="answer">
      <div className="answer-header">
        <span className="answer-title">
          <span>Ответ</span>
          {speechState === "speaking" && (
            <span className="status-indicator">
              <span className="status-indicator-ping"></span>
              <span className="status-indicator-dot"></span>
            </span>
          )}
          {speechState === "paused" && (
            <span className="status-paused">(на паузе)</span>
          )}
        </span>

        {!responseMarkdown.startsWith("**Ошибка") && (
          <button onClick={onToggleSpeech} className="speech-button">
            {speechState === "speaking"
              ? "⏸️️ Пауза"
              : speechState === "paused"
                ? "▶️ Продолжить озвучивание"
                : "🔊 Озвучить снова"}
          </button>
        )}
      </div>

      <div className="answer-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {responseMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

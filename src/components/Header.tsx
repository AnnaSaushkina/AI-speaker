import React from "react";

export const Header: React.FC = () => {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
      <h3 className="text-lg font-bold text-white tracking-tight">
        Задай вопрос по коду:
      </h3>
    </div>
  );
};

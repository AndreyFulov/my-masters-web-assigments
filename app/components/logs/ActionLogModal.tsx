"use client";

import React from "react";

interface ActionLogModalProps {
  payload: Record<string, any> | null;
  onClose: () => void;
}

export const ActionLogModal: React.FC<ActionLogModalProps> = ({ payload, onClose }) => {
  if (!payload) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-black p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Параметры действия (Payload)
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <pre className="mt-4 max-h-80 overflow-y-auto rounded-xl bg-gray-50 dark:bg-zinc-900/80 p-4 font-mono text-xs text-marine dark:text-custard border border-gray-100 dark:border-white/5">
          {JSON.stringify(payload, null, 2)}
        </pre>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-marine px-4 py-2 text-xs font-semibold text-white transition hover:bg-marine-600"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
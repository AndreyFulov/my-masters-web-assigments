"use client";

import React, { useState, useMemo } from "react";
import { UserActionLog } from "@/app/utils/api";
import { ActionBadge } from "./ActionBadge";

interface ActionLogsTableProps {
  logs: UserActionLog[];
  isLoading: boolean;
  itemsPerPage?: number;
  onViewPayload: (payload: Record<string, any>) => void;
}

export const ActionLogsTable: React.FC<ActionLogsTableProps> = ({
  logs,
  isLoading,
  itemsPerPage = 12,
  onViewPayload,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1;

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return logs.slice(startIndex, startIndex + itemsPerPage);
  }, [logs, currentPage, itemsPerPage]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-4">Время</th>
              <th scope="col" className="px-6 py-4">Действие</th>
              <th scope="col" className="px-6 py-4">IP адрес</th>
              <th scope="col" className="px-6 py-4">Данные</th>
              <th scope="col" className="px-6 py-4 text-right">Детали</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <div className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-marine" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Загрузка журнала...
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  Записей не найдено
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, idx) => (
                <tr key={idx} className="transition hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString("ru-RU")}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <ActionBadge action={log.action} />
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-500">
                    {log.user_ip || "—"}
                  </td>

                  <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">
                    {log.payload?.product_name && (
                      <span>
                        Товар: <strong className="text-gray-900 dark:text-white">{log.payload.product_name}</strong>
                      </span>
                    )}
                    {log.payload?.order_id && (
                      <span>
                        Заказ: <strong className="text-gray-900 dark:text-white">#{log.payload.order_id}</strong>
                        {log.payload.total_amount && ` (${log.payload.total_amount} ₽)`}
                      </span>
                    )}
                    {log.payload?.quantity && (
                      <span className="ml-2 text-gray-400">({log.payload.quantity} шт.)</span>
                    )}
                    {!log.payload?.product_name && !log.payload?.order_id && (
                      <span className="text-gray-400 font-mono text-[11px]">
                        {Object.keys(log.payload || {}).length > 0 ? "Свойства доступны" : "Пусто"}
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => onViewPayload(log.payload)}
                      disabled={!log.payload || Object.keys(log.payload).length === 0}
                      className="rounded-lg border border-gray-200 dark:border-white/10 px-2.5 py-1 font-mono text-xs text-marine transition hover:bg-marine/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      JSON
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && logs.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 px-6 py-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Страница <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> из{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 transition hover:bg-gray-100 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Назад
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 transition hover:bg-gray-100 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
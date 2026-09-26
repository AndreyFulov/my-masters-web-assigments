"use client";

import React, { useEffect, useState, useMemo } from "react";
import { UserActionLog, actionApi } from "@/app/utils/api";
import { ActionLogsTable } from "./ActionLogsTable";
import { ActionLogModal } from "./ActionLogModal";

export const ActionLogsManager: React.FC = () => {
  const [logs, setLogs] = useState<UserActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayload, setSelectedPayload] = useState<Record<string, any> | null>(null);

  const fetchLogs = () => {
    setIsLoading(true);
    actionApi
      .getLogs(200)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = filterAction === "all" || log.action === filterAction;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.user_ip?.includes(q) ||
        JSON.stringify(log.payload).toLowerCase().includes(q);

      return matchesAction && matchesQuery;
    });
  }, [logs, filterAction, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Журнал действий
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Записей: {filteredLogs.length} из {logs.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Поиск по IP, действию, данным..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-marine focus:outline-none"
          />

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:border-marine focus:outline-none"
          >
            <option value="all">Все действия</option>
            <option value="add_to_cart">Добавления в корзину</option>
            <option value="remove_from_cart">Удаления из корзины</option>
            <option value="place_order">Заказы</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            Обновить
          </button>
        </div>
      </div>

      {/* Decoupled Table Component */}
      <ActionLogsTable
        logs={filteredLogs}
        isLoading={isLoading}
        onViewPayload={setSelectedPayload}
      />

      {/* Decoupled Detail Modal Component */}
      <ActionLogModal
        payload={selectedPayload}
        onClose={() => setSelectedPayload(null)}
      />
    </div>
  );
};
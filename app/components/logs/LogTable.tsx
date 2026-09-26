"use client";

import React, { useState, useMemo } from "react";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  bulkActions?: (selectedIds: (string | number)[], clearSelection: () => void) => React.ReactNode;
  defaultPageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = "Поиск...",
  searchFilter,
  bulkActions,
  defaultPageSize = 10,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // 1. Search Filtering
  const filteredData = useMemo(() => {
    if (!query.trim() || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, query.trim().toLowerCase()));
  }, [data, query, searchFilter]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortOrder]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Sort toggle handler
  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allKeys = new Set(paginatedData.map(keyExtractor));
      setSelectedKeys(allKeys);
    } else {
      setSelectedKeys(new Set());
    }
  };

  const handleSelectRow = (key: string | number) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearSelection = () => setSelectedKeys(new Set());

  const isAllCurrentPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedKeys.has(keyExtractor(item)));

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Search + Bulk Actions + Per-Page Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {searchFilter && (
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3.5 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-marine focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {selectedKeys.size > 0 && bulkActions && (
            <div className="flex items-center gap-2 rounded-xl border border-marine/20 bg-marine/5 px-3 py-1.5 text-xs text-marine dark:text-marine-400">
              <span className="font-semibold">Выбрано: {selectedKeys.size}</span>
              {bulkActions(Array.from(selectedKeys), clearSelection)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-gray-500 dark:text-gray-400">
          <span>Показывать:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-200 dark:border-white/10 bg-transparent px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size} className="bg-white dark:bg-zinc-900">
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                {bulkActions && (
                  <th scope="col" className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 accent-marine"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`px-6 py-3.5 ${
                      col.sortable ? "cursor-pointer select-none hover:text-gray-900 dark:hover:text-white" : ""
                    } ${col.className || ""}`}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-[10px] text-gray-400">
                          {sortKey === col.key ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/10 text-gray-700 dark:text-gray-300">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (bulkActions ? 1 : 0)}
                    className="px-6 py-12 text-center text-sm text-gray-400"
                  >
                    Записей не найдено
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const key = keyExtractor(item);
                  const isSelected = selectedKeys.has(key);

                  return (
                    <tr
                      key={key}
                      className={`transition hover:bg-gray-50 dark:hover:bg-white/5 ${
                        isSelected ? "bg-marine/5 dark:bg-marine/10" : ""
                      }`}
                    >
                      {bulkActions && (
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(key)}
                            className="h-4 w-4 rounded border-gray-300 accent-marine"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className={`px-6 py-4 ${col.className || ""}`}>
                          {col.accessor ? col.accessor(item) : (item as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Controls */}
        <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Показано {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, sortedData.length)} из {sortedData.length} записей
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Назад
            </button>

            <span className="px-3 text-xs font-medium text-gray-900 dark:text-white">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Вперед
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
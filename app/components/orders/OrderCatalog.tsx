"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Order, orderApi } from "@/app/utils/api";

const ITEMS_PER_PAGE = 8;

export default function OrderCatalog() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    orderApi
      .getAll()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []); // Added dependency array to prevent infinite loop

  // Pagination calculation
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE) || 1;

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [orders, currentPage]);

  const renderStatusBadge = (status: Order["status"] | string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
            Выполнен
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-full bg-tomato/15 px-2.5 py-0.5 text-xs font-semibold text-tomato">
            Отменён
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-custard/20 px-2.5 py-0.5 text-xs font-semibold text-amber-500 dark:text-custard">
            В обработке
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Заказы
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Всего заказов: {orders.length}
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-4">ID</th>
                <th scope="col" className="px-6 py-4">Клиент</th>
                <th scope="col" className="px-6 py-4">Контакты</th>
                <th scope="col" className="px-6 py-4">Сумма</th>
                <th scope="col" className="px-6 py-4">Статус</th>
                <th scope="col" className="px-6 py-4 text-right">Детали</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-marine" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Загрузка списка заказов...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Заказов пока нет
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.ID}
                    className="transition hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-medium text-gray-500">
                      #{order.ID}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {order.customer_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      <div>{order.customer_phone}</div>
                      {order.customer_email && <div>{order.customer_email}</div>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {order.total_amount?.toFixed(2) ?? "0.00"} ₽
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {renderStatusBadge(order.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`/orders/${order.ID}`}
                        className="inline-flex items-center rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 transition hover:bg-gray-100 dark:hover:bg-white/10 hover:text-marine"
                      >
                        Подробнее →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && orders.length > 0 && (
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

              <div className="hidden sm:flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded-md text-xs font-medium transition ${
                      currentPage === page
                        ? "bg-marine text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

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
    </div>
  );
}
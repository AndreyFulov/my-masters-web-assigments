"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Order, orderApi } from "@/app/utils/api";
import { OrderTable } from "./OrderCatalog";

type FilterStatus = "all" | Order["status"];

export const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = () => {
    setIsLoading(true);
    orderApi
      .getAll()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        order.customer_name.toLowerCase().includes(q) ||
        order.customer_phone.includes(q) ||
        String(order.ID).includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Заказы
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Найдено: {filteredOrders.length} из {orders.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Поиск по имени, телефону, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-marine focus:outline-none"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:border-marine focus:outline-none"
          >
            <option value="all">Все статусы</option>
            <option value="pending">В обработке</option>
            <option value="completed">Выполненные</option>
            <option value="cancelled">Отменённые</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            Обновить
          </button>
        </div>
      </div>

      {/* Render Decoupled Table */}
      <OrderTable orders={filteredOrders} isLoading={isLoading} />
    </div>
  );
};
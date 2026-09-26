"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Order, orderApi, productApi, ApiError } from "@/app/utils/api";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params?.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      setError("Некорректный номер заказа");
      setIsLoading(false);
      return;
    }

    orderApi
      .getById(orderId)
      .then((data) => {
        setOrder(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setError("Заказ не найден");
        } else {
          setError("Не удалось загрузить данные заказа");
        }
      })
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleStatusChange = async (newStatus: Order["status"]) => {
    if (!order || order.status === newStatus) return;

    try {
      setIsUpdatingStatus(true);
      const updated = await orderApi.updateStatus(order.ID, newStatus);
      setOrder(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось обновить статус";
      alert(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
            Выполнен
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-full bg-tomato/15 px-3 py-1 text-xs font-semibold text-tomato">
            Отменён
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-custard/20 px-3 py-1 text-xs font-semibold text-amber-500 dark:text-custard">
            В обработке
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="h-5 w-5 animate-spin text-marine" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Загрузка заказа...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {error || "Заказ не найден"}
        </h2>
        <Link
          href="/orders"
          className="mt-4 rounded-lg bg-marine px-4 py-2 text-xs font-semibold text-white transition hover:bg-marine-600"
        >
          Вернуться к заказам
        </Link>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/orders" className="transition hover:text-marine">
          Заказы
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-white">
          Заказ #{order.ID}
        </span>
      </nav>

      {/* Header Banner */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Заказ #{order.ID}
            </h1>
            {renderStatusBadge(order.status)}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Оформлен {new Date().toLocaleDateString("ru-RU")}
          </p>
        </div>

        {/* Status Switcher Controls */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Статус:</label>
          <select
            value={order.status}
            disabled={isUpdatingStatus}
            onChange={(e) => handleStatusChange(e.target.value as Order["status"])}
            className="rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white focus:border-marine focus:outline-none disabled:opacity-50"
          >
            <option value="pending" className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              В обработке
            </option>
            <option value="completed" className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              Выполнен
            </option>
            <option value="cancelled" className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              Отменён
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Order Items (2 cols) */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-sm">
            <div className="border-b border-gray-100 dark:border-white/10 px-6 py-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Состав заказа ({items.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {items.map((item) => {
                const product = item.product;
                const image = product?.images?.[0];
                const subtotal = item.price * item.quantity;

                return (
                  <div key={item.ID} className="flex items-center gap-4 p-6">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                      {image ? (
                        <img
                          src={productApi.getImageUrl(image.url)}
                          alt={product?.name || "Товар"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                          Нет фото
                        </div>
                      )}
                    </div>

                    {/* Product Name & Unit Price */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="truncate text-sm font-semibold text-gray-900 dark:text-white hover:text-marine transition"
                      >
                        {product?.name || `Товар #${item.product_id}`}
                      </Link>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {item.price.toFixed(2)} ₽ × {item.quantity} шт.
                      </p>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {subtotal.toFixed(2)} ₽
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Financial Summary */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Данные покупателя
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400">Имя:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.customer_name}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-400">Телефон:</span>
                <p className="font-mono text-gray-900 dark:text-white">
                  {order.customer_phone}
                </p>
              </div>

              {order.customer_email && (
                <div>
                  <span className="text-xs text-gray-400">Email:</span>
                  <p className="text-gray-900 dark:text-white">
                    {order.customer_email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary Card */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Итог заказа
            </h3>

            <div className="mt-4 space-y-2 border-b border-gray-100 dark:border-white/10 pb-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Количество позиций:</span>
                <span className="font-medium text-gray-900 dark:text-white">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Всего товаров:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {items.reduce((acc, cur) => acc + cur.quantity, 0)} шт.
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between text-base font-bold text-gray-900 dark:text-white">
              <span>К оплате:</span>
              <span className="text-2xl font-extrabold text-marine">
                {order.total_amount?.toFixed(2) ?? "0.00"} ₽
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
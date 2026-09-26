import React from "react";
import { Order } from "@/app/utils/api";

interface OrderStatusBadgeProps {
  status: Order["status"] | string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
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
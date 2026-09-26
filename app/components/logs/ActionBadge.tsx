import React from "react";

interface ActionBadgeProps {
  action: string;
}

export const ActionBadge: React.FC<ActionBadgeProps> = ({ action }) => {
  switch (action) {
    case "place_order":
      return (
        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
          Оформление заказа
        </span>
      );
    case "add_to_cart":
      return (
        <span className="inline-flex items-center rounded-full bg-marine/15 px-2.5 py-0.5 text-xs font-semibold text-marine">
          Добавление в корзину
        </span>
      );
    case "remove_from_cart":
      return (
        <span className="inline-flex items-center rounded-full bg-tomato/15 px-2.5 py-0.5 text-xs font-semibold text-tomato">
          Удаление из корзины
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-semibold text-gray-400">
          {action}
        </span>
      );
  }
};
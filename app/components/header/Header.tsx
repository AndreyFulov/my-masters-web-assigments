'use client'
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useState } from "react";
import { CartDrawer } from "../Cart/CartDrawer";

export default function Header() {
  const {totalItems, totalPrice} = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <>
    <header className="bg-marine dark:bg-marine-600 text-white w-full md:w-[70%] mx-auto px-4 md:px-0 md:rounded-2xl">
      <div className="flex items-center h-16 px-5">
        <h1 className="text-xl font-bold shrink-0"><Link href="/">Egoshin Shop</Link></h1>
        <nav className="w-[70%] flex items-center justify-start gap-6 pl-8">
          <button className="hover:text-gray-200 transition-colors">
            <Link href="/">
            Главная
            </Link>
          </button>
          <button className="hover:text-gray-200 transition-colors">
            <Link href="/products">
            Каталог
            </Link>
          </button>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/5 active:scale-95"
            aria-label="Открыть корзину"
          >
            {/* Shopping Cart Icon */}
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z"
              />
            </svg>

            <span className="hidden sm:inline">Корзина</span>

            {/* Total Price preview */}
            {totalPrice > 0 && (
              <span className="hidden text-xs text-gray-400 sm:inline">
                ({totalPrice.toFixed(0)}₽)
              </span>
            )}

            {/* Item Counter Badge */}
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-marine px-1.5 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
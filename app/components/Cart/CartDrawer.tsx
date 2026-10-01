"use client";

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { orderApi, productApi, ApiError } from '../../utils/api';
import { trackAction } from '@/app/utils/tracker';
import AddToCartAlert from '../alers/AddToCartAlert';

// --- Phone Masking & Validation Helpers ---
const normalizePhone = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }
  return digits;
};

const isValidRussianPhone = (value: string): boolean => {
  const digits = normalizePhone(value);
  return /^79\d{9}$/.test(digits);
};

const formatRussianPhone = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('8') || digits.startsWith('7')) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 10);

  let formatted = '+7';
  if (digits.length > 0) {
    formatted += ' (' + digits.slice(0, 3);
  }
  if (digits.length >= 4) {
    formatted += ') ' + digits.slice(3, 6);
  }
  if (digits.length >= 7) {
    formatted += '-' + digits.slice(6, 8);
  }
  if (digits.length >= 9) {
    formatted += '-' + digits.slice(8, 10);
  }

  return formatted;
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertVisible, setAlertVision] = useState(false);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRussianPhone(e.target.value);
    setCustomerPhone(formatted);

    // Auto-clear error when user completes valid number
    if (phoneError && isValidRussianPhone(formatted)) {
      setPhoneError(null);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) return;

    if (!isValidRussianPhone(customerPhone)) {
      setPhoneError('Введите номер в формате +7 (9XX) XXX-XX-XX');
      return;
    }
    setPhoneError(null);


    try {
      setIsSubmitting(true);
      const normalizedPhone = '+' + normalizePhone(customerPhone);

      const newOrder = await orderApi.create({
        customer_name: customerName,
        customer_phone: normalizedPhone,
        customer_email: customerEmail,
        items: cart.map((item) => ({
          product_id: item.product.ID,
          quantity: item.quantity,
        })),
      });

      trackAction('place_order', {
    order_id: newOrder.ID,
    total_amount: newOrder.total_amount,
    item_count: cart.length,
    phone: normalizedPhone,
  });
      setOrderSuccessId(newOrder.ID);
      clearCart();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ошибка при оформлении заказа');
      }
    } finally {
      setIsSubmitting(false);
    }
    setAlertVision(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end backdrop-blur-sm">
      <div className="flex h-[80%] w-full max-w-md flex-col bg-white dark:bg-black p-6 shadow-2xl my-10 mr-20 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Корзина</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {orderSuccessId ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-green-500/20 p-4 text-green-500 mb-4">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Заказ #{orderSuccessId} принят!</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Мы свяжемся с вами по указанному телефону.</p>
            <button
              onClick={() => {
                setOrderSuccessId(null);
                onClose();
              }}
              className="mt-6 rounded-lg bg-marine px-6 py-2 text-sm font-semibold text-white hover:bg-marine-600 transition"
            >
              Продолжить покупки
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
            <p>Корзина пуста</p>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map(({ product, quantity }) => (
                <div key={product.ID} className="flex gap-3 border-b border-gray-100 dark:border-white/10 pb-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                    {product.images?.[0] ? (
                      <img
                        src={productApi.getImageUrl(product.images[0].url)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Нет фото</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h4>
                    <p className="text-sm text-marine font-bold">{product.price.toFixed(2)}₽</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.ID, quantity - 1)}
                        className="h-6 w-6 rounded bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.ID, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="h-6 w-6 rounded bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-30 transition"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(product.ID)}
                        className="ml-auto text-xs text-tomato hover:underline"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Checkout Form */}
            <form onSubmit={handleCheckout} className="border-t border-gray-200 dark:border-white/10 pt-4 space-y-3">
              {error && <div className="rounded bg-tomato/20 p-2 text-xs text-tomato">{error}</div>}

              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                <span>Итого:</span>
                <span>{totalPrice.toFixed(2)}₽</span>
              </div>

              <input
                type="text"
                required
                placeholder="Ваше имя *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-white/20 bg-transparent px-3 py-2 text-sm text-black dark:text-white placeholder-gray-500 focus:border-marine focus:outline-none"
              />

              <div>
                <input
                  type="tel"
                  required
                  placeholder="+7 (999) 000-00-00 *"
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-black dark:text-white placeholder-gray-500 focus:outline-none transition ${
                    phoneError
                      ? 'border-tomato text-tomato focus:border-tomato'
                      : 'border-gray-300 dark:border-white/20 focus:border-marine'
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-tomato">{phoneError}</p>
                )}
              </div>

              <input
                type="email"
                placeholder="Email (необязательно)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-white/20 bg-transparent px-3 py-2 text-sm text-black dark:text-white placeholder-gray-500 focus:border-marine focus:outline-none"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-marine py-3 text-sm font-semibold text-white transition hover:bg-marine-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Оформляем...' : 'Оформить заказ'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
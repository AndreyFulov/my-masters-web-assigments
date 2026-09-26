"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, productApi, ApiError } from '../../utils/api';
import { useCart } from '@/app/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {addToCart} = useCart();
  const productId = Number(params?.id);

  // Fetch product data
  useEffect(() => {
    if (!productId || isNaN(productId)) {
      setError('Некорректный ID товара');
      setIsLoading(false);
      return;
    }

    productApi
      .getById(productId)
      .then((data) => {
        setProduct(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setError('Товар не найден');
        } else {
          setError('Не удалось загрузить информацию о товаре');
        }
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  // Handle direct file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    try {
      setIsUploading(true);
      const newImage = await productApi.uploadImage(product.ID, file);

      setProduct((prev) => {
        if (!prev) return prev;
        const updatedImages = [...(prev.images || []), newImage];
        setSelectedImageIndex(updatedImages.length - 1);
        return { ...prev, images: updatedImages };
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      alert(`Ошибка загрузки изображения: ${message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`Вы уверены, что хотите удалить "${product.name}"?`)) return;

    try {
      setIsDeleting(true);
      await productApi.delete(product.ID);
      router.push('/products');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      alert(`Ошибка при удалении: ${message}`);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <svg className="h-6 w-6 animate-spin text-marine" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Загрузка данных...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{error || 'Товар не найден'}</h2>
        <Link
          href="/products"
          className="mt-4 rounded-lg bg-marine px-4 py-2 text-xs font-semibold text-white transition hover:bg-marine-600 dark:hover:bg-marine-700"
        >
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImageIndex];
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/products" className="transition hover:text-marine">
          Каталог
        </Link>
        <span>/</span>
        <span className="truncate font-medium text-gray-900 dark:text-white">
          {product.name}
        </span>
      </nav>

      {/* Main Container */}
      <div className="grid grid-cols-1 gap-8 rounded-2xl bg-background p-6 shadow-sm sm:p-8 lg:grid-cols-2 lg:gap-12">
        {/* Left Column: Image Showcase */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
            {currentImage ? (
              <img
                src={productApi.getImageUrl(currentImage.url)}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-gray-400 dark:text-gray-400">
                <svg
                  className="h-16 w-16 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <span className="mt-2 text-sm font-medium">Нет фото</span>
              </div>
            )}

            {/* Stock Badge */}
            <div className="absolute left-3 top-3">
              {isOutOfStock ? (
                <span className="rounded-full bg-tomato-900/20 px-3 py-1 text-xs font-semibold text-tomato">
                  Нет в наличии
                </span>
              ) : isLowStock ? (
                <span className="rounded-full bg-custard-900/20 px-3 py-1 text-xs font-semibold text-custard">
                  Осталось {product.stock} шт.
                </span>
              ) : (
                <span className="rounded-full bg-green-900/20 px-3 py-1 text-xs font-semibold text-green-500">
                  В наличии
                </span>
              )}
            </div>

            {/* Add/Upload Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Загрузите изображение"
              className="absolute right-3 top-3 rounded-full bg-white/10 p-2.5 text-gray-200 shadow-sm backdrop-blur transition hover:bg-white/20 focus:outline-none disabled:opacity-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              {isUploading ? (
                <svg className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.ID}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${
                    selectedImageIndex === idx
                      ? 'border-marine dark:border-marine-500'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={productApi.getImageUrl(img.url)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Content & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                {product.name}
              </h1>

              {/* Delete Product Button */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg border border-white/20 p-2.5 text-gray-400 transition hover:border-red-400 hover:bg-red-500/20 hover:text-red-400 dark:border-white/10 dark:hover:bg-red-500/30 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50"
                title="Удалить товар"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Price & Stock Stats */}
            <div className="mt-4 flex items-baseline justify-between border-b border-white/10 pb-4 dark:border-white/10">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {product.price.toFixed(2)}₽
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-400">
                На складе: {product.stock}
              </span>
            </div>

            {/* Description Block */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                Описание
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-line">
                {product.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-8 pt-4">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addToCart(product)}
              className="w-full rounded-lg bg-marine px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-marine-600 dark:hover:bg-marine-700 disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400"
            >
              В корзину
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
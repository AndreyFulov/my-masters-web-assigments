"use client";
import React, { useState, useRef } from 'react';
import { Product, productApi } from '../../utils/api';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';

interface ProductCardProps {
  product: Product;
  onProductUpdated?: (updatedProduct: Product) => void;
  onAddToCart?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductUpdated,
  onAddToCart,
  onDelete,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {addToCart} = useCart();
  const [alertVisible, setAlertVisible] = useState(false);
  const images = product.images || [];
  const currentImage = images[selectedImageIndex];

  // Handle direct file upload from card
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const newImage = await productApi.uploadImage(product.ID, file);
      
      const updatedProduct: Product = {
        ...product,
        images: [...images, newImage],
      };

      if (onProductUpdated) {
        onProductUpdated(updatedProduct);
      }
      // Focus on the newly uploaded image
      setSelectedImageIndex(images.length);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      alert(`Image upload failed: ${message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl shadow-sm transition hover:shadow-md bg-background">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Image Display */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Link href={`/products/${product.ID}`} className="absolute inset-0 z-10">
        {currentImage ? (
          <img
            src={productApi.getImageUrl(currentImage.url)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400 dark:text-gray-400">
            <svg
              className="h-12 w-12 stroke-current"
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
            <span className="mt-1 text-xs font-medium">Нет фото</span>
          </div>
        )}
        </Link>

        {/* Stock Badge */}
        <div className="absolute left-3 top-3">
          {isOutOfStock ? (
            <span className="rounded-full bg-tomato-900/20 px-2.5 py-0.5 text-xs font-semibold text-tomato">
              Нет в наличии
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-custard-900/20 px-2.5 py-0.5 text-xs font-semibold text-custard">
              Осталось {product.stock} шт.
            </span>
          ) : (
            <span className="rounded-full bg-green-900/20 px-2.5 py-0.5 text-xs font-semibold text-green-500">
              В наличии
            </span>
          )}
        </div>

        {/* Upload Overlay Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Загрузите изображение"
          className={`rounded-full bg-white/10 p-2 text-gray-200 shadow-sm backdrop-blur transition hover:bg-white/20 focus:outline-none disabled:opacity-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10`}
        >
          {isUploading ? (
            <svg className="h-4 w-4 animate-spin text-gray-400 dark:text-gray-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto border-b border-white/10 p-2 dark:border-white/10">
          {images.map((img, idx) => (
            <button
              key={img.ID}
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${
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

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-gray-900 dark:text-white" title={product.name}>
          {product.name}
        </h3>
        
        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {product.description || 'No description provided.'}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {product.price.toFixed(2)}₽
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-400">
              На складе: {product.stock}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addToCart(product)}
              className="flex-1 rounded-lg bg-marine px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-marine-600 dark:hover:bg-marine-700 disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400"
            >
              В корзину
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(product.ID)}
                className="rounded-lg border border-white/20 p-2 text-gray-400 transition hover:border-red-400 hover:bg-red-500/20 hover:text-red-400 dark:border-white/10 dark:hover:bg-red-500/30 dark:text-gray-400 dark:hover:text-red-400"
                title="Удалить"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
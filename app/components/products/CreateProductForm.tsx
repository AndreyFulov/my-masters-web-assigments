'use client';
import React, { useState, useRef } from 'react';
import { productApi, Product, ApiError } from '../../utils/api';

interface CreateProductFormProps {
  onSuccess?: (createdProduct: Product) => void;
  onCancel?: () => void;
}

export const CreateProductForm: React.FC<CreateProductFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  // Form values
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  // Selected images state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle image selection and create object URL previews
  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, and WebP images are supported.');
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setError(null);
  };

  // Remove previewed image before upload
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]); // Free memory
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (!name.trim()) {
      setError('Имя продукта не может быть пустым.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Введите корректную цену.');
      return;
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      setError('Напишите корректное количество на складе.');
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage('Creating product...');

      // 1. Create Product record
      const createdProduct = await productApi.create({
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        stock: parsedStock,
      });

      // 2. Upload all selected images sequentially
      if (selectedFiles.length > 0) {
        createdProduct.images = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          setStatusMessage(`Uploading image ${i + 1} of ${selectedFiles.length}...`);
          const uploadedImg = await productApi.uploadImage(createdProduct.ID, selectedFiles[i]);
          createdProduct.images.push(uploadedImg);
        }
      }

      setStatusMessage('Товар успешно создан!');

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setSelectedFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);

      if (onSuccess) {
        onSuccess(createdProduct);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(`[${err.status}] ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла неизвестная ошибка при создании продукта.');
      }
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Добавить новый товар</h2>
        <p className="text-sm text-gray-500">Заполните данные о продукте</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Имя товара *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="например: Красная футболка"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Описание
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание товара..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Price & Stock Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Цена (₽) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Количество на складе *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Image Drag and Drop Zone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Изображения товара
          </label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 transition hover:border-gray-400 hover:bg-gray-50"
          >
            <svg
              className="h-10 w-10 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-xs font-medium text-gray-700">
              Нажмите для выбора или перетащите изображения
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, or WebP</p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Previews Grid */}
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {previews.map((previewUrl, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  <img
                    src={previewUrl}
                    alt={`Preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white shadow transition hover:bg-black"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Отмена
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-marine px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-marine focus:outline-none disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isLoading && (
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isLoading ? (statusMessage || 'Сохранение...') : 'Создать товар'}
          </button>
        </div>
      </form>
    </div>
  );
};
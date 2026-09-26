'use client';
import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { Product, productApi } from "../../utils/api";
import { CreateProductForm } from './CreateProductForm';

export default function AdminProductsCatalog() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productApi.getAllAndInvisible().then(setProducts).catch(console.error);
  }, []);

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.ID === updatedProduct.ID ? updatedProduct : p))
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await productApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.ID !== id));
    } catch (err) {
      alert('Не удалось удалить товар. Пожалуйста, попробуйте снова.');
    }
  };
const [showModal, setShowModal] = useState(false);
    
      const handleProductCreated = (product: Product) => {
        alert(`Товар "${product.name}" создан с ${product.images?.length || 0} картинками!`);
        setShowModal(false);
      };
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-3">
      <h1 className="mb-6 text-2xl font-bold tracking-tight col-span-2">Каталог</h1>
      <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-marine px-4 py-2 text-sm font-semibold text-white hover:bg-marine-700 m-5"
            >
              + Добавить товар
            </button>
            </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.ID}
            product={product}
            onProductUpdated={handleProductUpdated}
            onDelete={handleDelete}
            onAddToCart={(p) => alert(`Товар ${p.name} добавлен в корзину!`)}
          />
        ))}
        {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl">
            <CreateProductForm
              onSuccess={handleProductCreated}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
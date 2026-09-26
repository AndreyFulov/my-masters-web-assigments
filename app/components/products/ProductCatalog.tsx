'use client';
import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { Product, productApi } from "../../utils/api";

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productApi.getAll().then(setProducts).catch(console.error);
  }, []);

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.ID === updatedProduct.ID ? updatedProduct : p))
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.ID !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Каталог</h1>
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
      </div>
    </div>
  );
}
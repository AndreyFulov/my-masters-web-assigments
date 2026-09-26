'use client'
import { useState } from "react";
import AdminProductsCatalog from "../components/products/AdminProductsCatalog";
import { Product } from "../utils/api";
import { CreateProductForm } from "../components/products/CreateProductForm";

export default function adminPage() {
    const [showModal, setShowModal] = useState(false);
    
      const handleProductCreated = (product: Product) => {
        alert(`Товар "${product.name}" создан с ${product.images?.length || 0} картинками!`);
        setShowModal(false);
      };
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Административная панель</h1>
            <AdminProductsCatalog/>
            <div className="p-8">
      <button
        onClick={() => setShowModal(true)}
        className="rounded-lg bg-marine px-4 py-2 text-sm font-semibold text-white hover:bg-marine-700"
      >
        + Добавить товар
      </button>

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
    )
}
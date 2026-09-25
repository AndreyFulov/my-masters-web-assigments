'use client';
import { useState } from "react";
import ProductCatalog from "./components/products/ProductCatalog";
import { Product } from "./utils/api";
import { CreateProductForm } from "./components/products/CreateProductForm";

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  const handleProductCreated = (product: Product) => {
    alert(`Product "${product.name}" created with ${product.images?.length || 0} image(s)!`);
    setShowModal(false);
  };
  return (
    <div>
      <ProductCatalog/>
      <div className="p-8">
      <button
        onClick={() => setShowModal(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        + Add Product
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
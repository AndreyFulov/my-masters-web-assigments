'use client'
import OrderCatalog from "../components/orders/OrderCatalog";
import AdminProductsCatalog from "../components/products/AdminProductsCatalog";

export default function adminPage() {
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Административная панель</h1>
            <AdminProductsCatalog/>
            <OrderCatalog/>
            <div className="p-8">
    </div>
        </div>
    )
}
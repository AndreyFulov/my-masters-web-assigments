'use client'
import { ActionLogsManager } from "../components/logs/ActionLogsManager";
import { OrdersManager } from "../components/orders/OrderManager";
import AdminProductsCatalog from "../components/products/AdminProductsCatalog";

export default function adminPage() {
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Административная панель</h1>
            <AdminProductsCatalog/>
            <OrdersManager/>
            <ActionLogsManager/>
    </div>
    )
}
import { Order } from "@/app/utils/api";

export default function OrderCard({ order }: { order: Order }) {
  return (
    <div>
      <h3>{order.customer_name}</h3>
      <p>{order.customer_email}</p>
      <p>{order.total_amount}</p>
      {order.items.map((item) => (
        <div key={item.ID}>
          <p>{item.product.name}</p>
          <p>{item.quantity}</p>
          <p>{item.price}</p>
        </div>
      ))}
      <p>{order.status}</p>
    </div>
  );
}

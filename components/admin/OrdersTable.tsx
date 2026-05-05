import Badge from "@/components/ui/Badge";
import type { Order } from "@/lib/types";
import { useRouter } from "next/navigation";

type OrdersTableProps = {
  orders: Order[];
  onStatusChange?: (orderId: string, newStatus: string) => void;
};

export default function OrdersTable({ orders, onStatusChange }: OrdersTableProps) {
  const router = useRouter();

  const statusSelectClass = (status: Order["status"]) => {
    const base =
      "text-sm rounded-lg border border-[#E2E8F0] px-2 py-1 focus:outline-none focus:border-[#F97316] cursor-pointer";
    const variants: Record<Order["status"], string> = {
      paid: "bg-green-100 text-green-700 border-green-200",
      completed: "bg-blue-100 text-blue-700 border-blue-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      failed: "bg-red-100 text-red-700 border-red-200",
    };
    return `${base} ${variants[status]}`;
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-medium text-gray-600">Order ID</th>
            <th className="px-6 py-4 font-medium text-gray-600">Customer Name</th>
            <th className="px-6 py-4 font-medium text-gray-600">Email</th>
            <th className="px-6 py-4 font-medium text-gray-600">Phone</th>
            <th className="px-6 py-4 font-medium text-gray-600">Item</th>
            <th className="px-6 py-4 font-medium text-gray-600">Booking Slot</th>
            <th className="px-6 py-4 font-medium text-gray-600 text-right">Amount</th>
            <th className="px-6 py-4 font-medium text-gray-600 text-center">Status</th>
            <th className="px-6 py-4 font-medium text-gray-600">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr 
                key={order._id} 
                className="cursor-pointer hover:bg-orange-50 transition-colors"
                onClick={() => router.push(`/admin/orders/${order._id}`)}
              >
                <td className="px-6 py-4 font-medium text-[#F97316]">
                  {order._id.slice(-8).toUpperCase()}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{order.userInfo?.name}</td>
                <td className="px-6 py-4 text-gray-500">{order.userInfo?.email}</td>
                <td className="px-6 py-4 text-gray-500">{order.userInfo?.phone}</td>
                <td className="px-6 py-4 text-gray-600">
                  {order.items?.map((item) => item.title).filter(Boolean).join(", ") || "-"}
                  <td className="px-6 py-4">
  {(order as any).bookingSlot?.date && (order as any).bookingSlot?.time ? (
    <div>
      <p className="text-xs font-semibold text-[#7C3AED]">
        {new Date((order as any).bookingSlot.date+"T00:00:00")
          .toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
      </p>
      <p className="text-xs font-bold text-[#D97706]">{(order as any).bookingSlot.time}</p>
    </div>
  ) : <span className="text-gray-400 text-xs">—</span>}
</td>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 text-right">₹{order.totalAmount}</td>
                <td className="px-6 py-4 text-center">
                  {onStatusChange ? (
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onStatusChange(order._id, e.target.value)}
                      className={statusSelectClass(order.status)}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  ) : (
                    <Badge status={order.status} />
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-gray-500 font-medium">
                No orders found for the selected filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

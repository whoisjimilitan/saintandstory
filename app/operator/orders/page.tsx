"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  prospectId?: string;
  prospectName: string;
  value: number;
  currency?: string;
  products?: string;
  status: "pending" | "active" | "completed" | "renewed";
  createdAt: string;
  renewalDate?: string;
  assignedOperator?: string;
  notes?: string;
}

interface OrdersState {
  loading: boolean;
  error: string | null;
  orders: Order[];
  filteredOrders: Order[];
  selectedStatus: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#F5F5F5] text-[#888888]",
  active: "bg-[#E8E8E8] text-[#0D0D0D]",
  completed: "bg-[#0D0D0D] text-white",
  renewed: "bg-[#DEDEDE] text-[#0D0D0D]",
};

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [state, setState] = useState<OrdersState>({
    loading: true,
    error: null,
    orders: [],
    filteredOrders: [],
    selectedStatus: null,
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        const res = await fetch("/api/b2b/standing-orders");
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch orders`);

        const data = await res.json();
        const orders = Array.isArray(data) ? data : data.orders || [];

        setState((s) => ({
          ...s,
          loading: false,
          orders: orders.sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
          filteredOrders: orders.sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
        }));

        // If orderId in URL, select that order
        if (orderId) {
          const order = orders.find((o: Order) => o.id === orderId);
          if (order) setSelectedOrder(order);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load orders";
        setState((s) => ({
          ...s,
          loading: false,
          error: message,
        }));
      }
    };

    fetchOrders();
  }, [orderId]);

  // Apply status filter
  useEffect(() => {
    if (statusFilter) {
      setState((s) => ({
        ...s,
        filteredOrders: s.orders.filter((o) => o.status === statusFilter),
      }));
    } else {
      setState((s) => ({
        ...s,
        filteredOrders: s.orders,
      }));
    }
  }, [statusFilter, state.orders]);

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdateError(null);
      setUpdateStatus(orderId);

      const res = await fetch("/api/b2b/standing-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      // Update local state
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o
        ),
        filteredOrders: s.filteredOrders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o
        ),
      }));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus as Order["status"],
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed";
      setUpdateError(message);
    } finally {
      setUpdateStatus(null);
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-white pt-32">
        <div className="px-4 md:px-12 py-10 max-w-6xl mx-auto">
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading orders...</p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-white pt-32">
        <div className="px-4 md:px-12 py-10 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#0D0D0D] mb-2">Orders</h1>
            <p className="text-sm text-[#888888]">Track conversions and manage customer orders</p>
          </div>

        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white text-center">
          <p className="text-sm text-[#666666] mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            Try Again
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32">
      <div className="px-4 md:px-12 py-10 max-w-6xl mx-auto">
        {/* Page Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0D0D0D] mb-2">Orders</h1>
          <p className="text-sm text-[#888888]">Track conversions and manage customer orders</p>
        </div>

        {/* Stats */}
        <div className="mb-12 pb-8 border-b border-[#E8E8E8]">
          <p className="text-sm font-semibold text-[#0D0D0D]">
            {state.orders.length} order{state.orders.length !== 1 ? "s" : ""} total
          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Orders List */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <label className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] block mb-3">
              Filter by Status
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter(null)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  !statusFilter
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
                }`}
              >
                All
              </button>
              {["active", "pending", "completed", "renewed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors capitalize ${
                    statusFilter === status
                      ? "bg-[#0D0D0D] text-white"
                      : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {state.filteredOrders.length === 0 ? (
            <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white text-center">
              <p className="text-sm text-[#888888]">No orders found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.filteredOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left border rounded-lg p-4 transition-all ${
                    selectedOrder?.id === order.id
                      ? "border-[#0D0D0D] bg-[#F5F5F5]"
                      : "border-[#E8E8E8] bg-white hover:border-[#0D0D0D]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-[#0D0D0D]">
                      {order.prospectName}
                    </p>
                    <span
                      className={`text-[9px] font-semibold px-2 py-1 rounded capitalize ${
                        STATUS_COLORS[order.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex gap-6 text-xs text-[#888888]">
                    <span>
                      £{order.value.toLocaleString()} {order.currency || "GBP"}
                    </span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Details */}
        <div>
          {selectedOrder ? (
            <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white sticky top-24">
              <h3 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] mb-6">
                Order Details
              </h3>

              <div className="space-y-6">
                {/* Prospect */}
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Customer
                  </p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {selectedOrder.prospectName}
                  </p>
                </div>

                {/* Value */}
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                    Value
                  </p>
                  <p className="text-lg font-black text-[#0D0D0D]">
                    £{selectedOrder.value.toLocaleString()}{" "}
                    <span className="text-xs font-normal">
                      {selectedOrder.currency || "GBP"}
                    </span>
                  </p>
                </div>

                {/* Products */}
                {selectedOrder.products && (
                  <div>
                    <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                      Products
                    </p>
                    <p className="text-sm text-[#0D0D0D]">
                      {selectedOrder.products}
                    </p>
                  </div>
                )}

                {/* Status Update */}
                <div className="border-t border-[#E8E8E8] pt-6">
                  <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] mb-3">
                    Update Status
                  </p>
                  <div className="space-y-2">
                    {["pending", "active", "completed", "renewed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                        disabled={
                          updateStatus === selectedOrder.id ||
                          selectedOrder.status === status
                        }
                        className={`w-full px-3 py-2 rounded text-xs font-semibold transition-colors capitalize ${
                          selectedOrder.status === status
                            ? "bg-[#F5F5F5] text-[#888888] cursor-default"
                            : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
                        }`}
                      >
                        {updateStatus === selectedOrder.id ? "Updating..." : status}
                      </button>
                    ))}
                  </div>
                  {updateError && (
                    <p className="text-xs text-[#DC2626] mt-2">{updateError}</p>
                  )}
                </div>

                {/* Dates */}
                <div className="border-t border-[#E8E8E8] pt-6 space-y-4">
                  <div>
                    <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                      Created
                    </p>
                    <p className="text-sm text-[#0D0D0D]">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedOrder.renewalDate && (
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-[0.1em] mb-1">
                        Renewal Date
                      </p>
                      <p className="text-sm text-[#0D0D0D]">
                        {new Date(selectedOrder.renewalDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white text-center sticky top-24">
              <p className="text-sm text-[#888888]">
                Select an order to view details
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

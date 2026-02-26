// Quản lý đơn hàng và thanh toán

import type { Order, OrderItem } from "~/types";
import { generateId } from "~/utils/seed-data";
import { usePosStorage } from "~/composables/usePosStorage";

export function useOrders() {
  const storage = usePosStorage();
  const orders = ref<Order[]>([]);
  const currentOrder = ref<OrderItem[]>([]);

  function load() {
    orders.value = storage.getOrders();
  }

  function addToOrder(item: Omit<OrderItem, "quantity" | "note">) {
    const existing = currentOrder.value.find(
      (i) => i.productId === item.productId,
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      currentOrder.value.push({ ...item, quantity: 1, note: "" });
    }
  }

  function removeFromOrder(productId: string) {
    currentOrder.value = currentOrder.value.filter(
      (i) => i.productId !== productId,
    );
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = currentOrder.value.find((i) => i.productId === productId);
    if (item) {
      if (quantity <= 0) {
        removeFromOrder(productId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  function updateNote(productId: string, note: string) {
    const item = currentOrder.value.find((i) => i.productId === productId);
    if (item) {
      item.note = note;
    }
  }

  const orderTotal = computed(() => {
    return currentOrder.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  });

  function completeOrder(data: {
    customerId: string | null;
    customerPhone: string;
    paymentMethod: "cash" | "qr";
    discount: number;
    employeeId: string;
    employeeName: string;
  }) {
    const order: Order = {
      id: generateId(),
      items: [...currentOrder.value],
      total: orderTotal.value,
      discount: data.discount,
      finalTotal: orderTotal.value - data.discount,
      customerId: data.customerId,
      customerPhone: data.customerPhone,
      paymentMethod: data.paymentMethod,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      status: "completed",
      createdAt: new Date().toISOString(),
    };
    orders.value.push(order);
    storage.saveOrders(orders.value);
    currentOrder.value = [];
    return order;
  }

  function clearOrder() {
    currentOrder.value = [];
  }

  const todayOrders = computed(() => {
    const today = new Date().toDateString();
    return orders.value.filter(
      (o) => new Date(o.createdAt).toDateString() === today,
    );
  });

  const todayRevenue = computed(() => {
    return todayOrders.value.reduce((sum, o) => sum + o.finalTotal, 0);
  });

  return {
    orders,
    currentOrder,
    orderTotal,
    todayOrders,
    todayRevenue,
    load,
    addToOrder,
    removeFromOrder,
    updateQuantity,
    updateNote,
    completeOrder,
    clearOrder,
  };
}

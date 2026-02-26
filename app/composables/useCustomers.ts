// Quản lý khách hàng và tích điểm

import type { Customer } from "~/types";
import { generateId } from "~/utils/seed-data";
import { usePosStorage } from "~/composables/usePosStorage";

export function useCustomers() {
  const storage = usePosStorage();
  const customers = ref<Customer[]>([]);

  function load() {
    customers.value = storage.getCustomers();
  }

  function findByPhone(phone: string): Customer | undefined {
    return customers.value.find((c) => c.phone === phone);
  }

  function addCustomer(data: { name: string; phone: string }) {
    const customer: Customer = {
      id: generateId(),
      name: data.name,
      phone: data.phone,
      points: 0,
      totalSpent: 0,
      visitCount: 0,
      createdAt: new Date().toISOString(),
    };
    customers.value.push(customer);
    storage.saveCustomers(customers.value);
    return customer;
  }

  function updateCustomer(id: string, updates: Partial<Customer>) {
    const index = customers.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      Object.assign(customers.value[index]!, updates);
      storage.saveCustomers(customers.value);
    }
  }

  function deleteCustomer(id: string) {
    customers.value = customers.value.filter((c) => c.id !== id);
    storage.saveCustomers(customers.value);
  }

  function addPoints(customerId: string, amount: number) {
    const index = customers.value.findIndex((c) => c.id === customerId);
    if (index !== -1) {
      const customer = customers.value[index]!;
      const pointsEarned = Math.floor(amount / 10000);
      customer.points += pointsEarned;
      customer.totalSpent += amount;
      customer.visitCount += 1;
      storage.saveCustomers(customers.value);
    }
  }

  return {
    customers,
    load,
    findByPhone,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addPoints,
  };
}

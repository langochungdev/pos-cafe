// Quản lý đồng bộ dữ liệu localStorage cho toàn bộ hệ thống

import {
  createSeedProducts,
  createSeedEmployees,
  createSeedCustomers,
  createSeedOrders,
} from "~/utils/seed-data";
import type { Product, Employee, Customer, Order } from "~/types";

const STORAGE_KEYS = {
  products: "pos_products",
  employees: "pos_employees",
  customers: "pos_customers",
  orders: "pos_orders",
  auth: "pos_auth",
};

function getFromStorage<T>(key: string, fallback: T): T {
  if (import.meta.server) return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (import.meta.server) return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function usePosStorage() {
  function initializeData() {
    if (import.meta.server) return;
    if (!localStorage.getItem(STORAGE_KEYS.products)) {
      saveToStorage(STORAGE_KEYS.products, createSeedProducts());
    }
    if (!localStorage.getItem(STORAGE_KEYS.employees)) {
      saveToStorage(STORAGE_KEYS.employees, createSeedEmployees());
    }
    if (!localStorage.getItem(STORAGE_KEYS.customers)) {
      saveToStorage(STORAGE_KEYS.customers, createSeedCustomers());
    }
    if (!localStorage.getItem(STORAGE_KEYS.orders)) {
      saveToStorage(STORAGE_KEYS.orders, createSeedOrders());
    }
  }

  function getProducts(): Product[] {
    return getFromStorage<Product[]>(STORAGE_KEYS.products, []);
  }

  function saveProducts(products: Product[]) {
    saveToStorage(STORAGE_KEYS.products, products);
  }

  function getEmployees(): Employee[] {
    return getFromStorage<Employee[]>(STORAGE_KEYS.employees, []);
  }

  function saveEmployees(employees: Employee[]) {
    saveToStorage(STORAGE_KEYS.employees, employees);
  }

  function getCustomers(): Customer[] {
    return getFromStorage<Customer[]>(STORAGE_KEYS.customers, []);
  }

  function saveCustomers(customers: Customer[]) {
    saveToStorage(STORAGE_KEYS.customers, customers);
  }

  function getOrders(): Order[] {
    return getFromStorage<Order[]>(STORAGE_KEYS.orders, []);
  }

  function saveOrders(orders: Order[]) {
    saveToStorage(STORAGE_KEYS.orders, orders);
  }

  function getAuth() {
    return getFromStorage<{
      id: string;
      name: string;
      role: string;
      phone: string;
    } | null>(STORAGE_KEYS.auth, null);
  }

  function saveAuth(
    auth: { id: string; name: string; role: string; phone: string } | null,
  ) {
    saveToStorage(STORAGE_KEYS.auth, auth);
  }

  function clearAuth() {
    if (import.meta.server) return;
    localStorage.removeItem(STORAGE_KEYS.auth);
  }

  return {
    initializeData,
    getProducts,
    saveProducts,
    getEmployees,
    saveEmployees,
    getCustomers,
    saveCustomers,
    getOrders,
    saveOrders,
    getAuth,
    saveAuth,
    clearAuth,
  };
}

// Định nghĩa các kiểu dữ liệu cho hệ thống POS Cafe

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: "admin" | "employee";
  schedule: ScheduleItem[];
  isActive: boolean;
  createdAt: string;
}

export interface ScheduleItem {
  day: string;
  shift: string;
  startTime: string;
  endTime: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
  visitCount: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  note: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  discount: number;
  finalTotal: number;
  customerId: string | null;
  customerPhone: string;
  paymentMethod: "cash" | "qr";
  employeeId: string;
  employeeName: string;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: "admin" | "employee";
  phone: string;
}

export type ProductCategory =
  | "Cà phê"
  | "Trà"
  | "Sinh tố"
  | "Nước ép"
  | "Bánh ngọt"
  | "Khác";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Cà phê",
  "Trà",
  "Sinh tố",
  "Nước ép",
  "Bánh ngọt",
  "Khác",
];

export const SHIFT_OPTIONS = [
  {
    label: "Sáng (6:00 - 14:00)",
    value: "morning",
    startTime: "06:00",
    endTime: "14:00",
  },
  {
    label: "Chiều (14:00 - 22:00)",
    value: "afternoon",
    startTime: "14:00",
    endTime: "22:00",
  },
  {
    label: "Cả ngày (6:00 - 22:00)",
    value: "fullday",
    startTime: "06:00",
    endTime: "22:00",
  },
];

export const DAYS_OF_WEEK = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

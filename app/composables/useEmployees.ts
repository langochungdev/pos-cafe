// Quản lý nhân viên và xếp lịch làm việc

import type { Employee, ScheduleItem } from "~/types";
import { generateId } from "~/utils/seed-data";
import { usePosStorage } from "~/composables/usePosStorage";

export function useEmployees() {
  const storage = usePosStorage();
  const employees = ref<Employee[]>([]);

  function load() {
    employees.value = storage.getEmployees();
  }

  function addEmployee(data: {
    name: string;
    phone: string;
    role: "admin" | "employee";
  }) {
    const emp: Employee = {
      id: generateId(),
      name: data.name,
      phone: data.phone,
      role: data.role,
      schedule: [],
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    employees.value.push(emp);
    storage.saveEmployees(employees.value);
  }

  function updateEmployee(id: string, updates: Partial<Employee>) {
    const index = employees.value.findIndex((e) => e.id === id);
    if (index !== -1) {
      Object.assign(employees.value[index]!, updates);
      storage.saveEmployees(employees.value);
    }
  }

  function deleteEmployee(id: string) {
    employees.value = employees.value.filter((e) => e.id !== id);
    storage.saveEmployees(employees.value);
  }

  function updateSchedule(employeeId: string, schedule: ScheduleItem[]) {
    const index = employees.value.findIndex((e) => e.id === employeeId);
    if (index !== -1) {
      employees.value[index]!.schedule = schedule;
      storage.saveEmployees(employees.value);
    }
  }

  return {
    employees,
    load,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateSchedule,
  };
}

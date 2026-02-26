// Trang quản lý nhân viên và xếp lịch làm việc

<template>
  <div class="admin-employees-wrapper">
    <div class="page-header">
      <h2 class="page-title">Quản lý nhân viên</h2>
      <button class="btn-add" @click="openModal()">+ Thêm nhân viên</button>
    </div>

    <div class="content-grid">
      <div class="employees-list">
        <div
          v-for="emp in employees"
          :key="emp.id"
          class="employee-card"
          :class="{ selected: selectedEmployee?.id === emp.id }"
          @click="selectEmployee(emp)"
        >
          <div class="emp-avatar">{{ emp.name.charAt(0) }}</div>
          <div class="emp-info">
            <div class="emp-name">{{ emp.name }}</div>
            <div class="emp-phone">{{ emp.phone }}</div>
          </div>
          <div class="emp-meta">
            <span class="role-badge" :class="emp.role">
              {{ emp.role === "admin" ? "Quản trị" : "Nhân viên" }}
            </span>
            <span
              class="status-dot"
              :class="emp.isActive ? 'active' : 'inactive'"
            />
          </div>
          <div class="emp-actions">
            <button class="btn-icon" @click.stop="openModal(emp)">✏️</button>
            <button class="btn-icon delete" @click.stop="handleDelete(emp.id)">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div class="schedule-panel">
        <h3>
          {{
            selectedEmployee
              ? `Lịch làm việc - ${selectedEmployee.name}`
              : "Chọn nhân viên để xem lịch"
          }}
        </h3>
        <div v-if="selectedEmployee" class="schedule-grid">
          <div v-for="day in DAYS_OF_WEEK" :key="day" class="schedule-day">
            <span class="day-label">{{ day }}</span>
            <select
              :value="getShiftForDay(day)"
              class="shift-select"
              @change="
                handleShiftChange(
                  day,
                  ($event.target as HTMLSelectElement).value,
                )
              "
            >
              <option value="">Nghỉ</option>
              <option
                v-for="shift in SHIFT_OPTIONS"
                :key="shift.value"
                :value="shift.value"
              >
                {{ shift.label }}
              </option>
            </select>
          </div>
          <button class="btn-save-schedule" @click="saveSchedule">
            Lưu lịch làm việc
          </button>
        </div>
        <div v-else class="empty-schedule">
          <span>📅</span>
          <p>
            Chọn nhân viên từ danh sách bên trái để xem và chỉnh sửa lịch làm
            việc
          </p>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>
          {{ editingEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên mới" }}
        </h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Họ tên</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input v-model="form.phone" type="tel" required />
          </div>
          <div class="form-group">
            <label>Vai trò</label>
            <select v-model="form.role" required>
              <option value="employee">Nhân viên</option>
              <option value="admin">Quản trị</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Hủy
            </button>
            <button type="submit" class="btn-submit">
              {{ editingEmployee ? "Cập nhật" : "Thêm mới" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Employee, ScheduleItem } from "~/types";
import { DAYS_OF_WEEK, SHIFT_OPTIONS } from "~/types";

const {
  employees,
  load,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  updateSchedule,
} = useEmployees();

const showModal = ref(false);
const editingEmployee = ref<Employee | null>(null);
const selectedEmployee = ref<Employee | null>(null);
const tempSchedule = ref<ScheduleItem[]>([]);

const form = reactive({
  name: "",
  phone: "",
  role: "employee" as "admin" | "employee",
});

onMounted(() => {
  load();
});

function selectEmployee(emp: Employee) {
  selectedEmployee.value = emp;
  tempSchedule.value = [...emp.schedule];
}

function getShiftForDay(day: string): string {
  const item = tempSchedule.value.find((s) => s.day === day);
  return item?.shift || "";
}

function handleShiftChange(day: string, shift: string) {
  const index = tempSchedule.value.findIndex((s) => s.day === day);
  if (!shift) {
    if (index !== -1) tempSchedule.value.splice(index, 1);
    return;
  }
  const shiftInfo = SHIFT_OPTIONS.find((s) => s.value === shift);
  if (!shiftInfo) return;
  const scheduleItem: ScheduleItem = {
    day,
    shift,
    startTime: shiftInfo.startTime,
    endTime: shiftInfo.endTime,
  };
  if (index !== -1) {
    tempSchedule.value[index] = scheduleItem;
  } else {
    tempSchedule.value.push(scheduleItem);
  }
}

function saveSchedule() {
  if (!selectedEmployee.value) return;
  updateSchedule(selectedEmployee.value.id, [...tempSchedule.value]);
  const updated = employees.value.find(
    (e) => e.id === selectedEmployee.value!.id,
  );
  if (updated) selectedEmployee.value = updated;
}

function openModal(emp?: Employee) {
  if (emp) {
    editingEmployee.value = emp;
    form.name = emp.name;
    form.phone = emp.phone;
    form.role = emp.role;
  } else {
    editingEmployee.value = null;
    form.name = "";
    form.phone = "";
    form.role = "employee";
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingEmployee.value = null;
}

function handleSubmit() {
  if (editingEmployee.value) {
    updateEmployee(editingEmployee.value.id, {
      name: form.name,
      phone: form.phone,
      role: form.role,
    });
  } else {
    addEmployee({ name: form.name, phone: form.phone, role: form.role });
  }
  closeModal();
}

function handleDelete(id: string) {
  if (confirm("Bạn có chắc muốn xóa nhân viên này?")) {
    deleteEmployee(id);
    if (selectedEmployee.value?.id === id) selectedEmployee.value = null;
  }
}
</script>

<style scoped>
.admin-employees-wrapper {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.employee-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.employee-card:hover {
  border-color: #667eea40;
}

.employee-card.selected {
  border-color: #667eea;
  background: #667eea08;
}

.emp-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.emp-info {
  flex: 1;
}

.emp-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
}

.emp-phone {
  font-size: 12px;
  color: #666;
}

.emp-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.role-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.role-badge.admin {
  background: #fef3c7;
  color: #d97706;
}
.role-badge.employee {
  background: #dbeafe;
  color: #2563eb;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.active {
  background: #22c55e;
}
.status-dot.inactive {
  background: #ef4444;
}

.emp-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon.delete:hover {
  background: #fee2e2;
}

.schedule-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.schedule-panel h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px;
}

.schedule-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-day {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
}

.day-label {
  width: 80px;
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

.shift-select {
  flex: 1;
  padding: 8px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: #fff;
}

.btn-save-schedule {
  margin-top: 12px;
  padding: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.empty-schedule {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-schedule span {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-schedule p {
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  width: 420px;
}

.modal h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
}

.btn-submit {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>

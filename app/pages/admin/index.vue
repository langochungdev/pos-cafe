// Trang báo cáo tổng quan doanh thu và thống kê

<template>
  <div class="admin-dashboard-wrapper">
    <h2 class="page-title">Báo cáo tổng quan</h2>

    <div class="stats-grid">
      <div class="stat-card revenue">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <span class="stat-value">{{ formatCurrency(todayRevenue) }}</span>
          <span class="stat-label">Doanh thu hôm nay</span>
        </div>
      </div>
      <div class="stat-card orders">
        <div class="stat-icon">🧾</div>
        <div class="stat-info">
          <span class="stat-value">{{ todayOrderCount }}</span>
          <span class="stat-label">Đơn hàng hôm nay</span>
        </div>
      </div>
      <div class="stat-card products">
        <div class="stat-icon">☕</div>
        <div class="stat-info">
          <span class="stat-value">{{ totalProducts }}</span>
          <span class="stat-label">Sản phẩm</span>
        </div>
      </div>
      <div class="stat-card customers">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <span class="stat-value">{{ totalCustomers }}</span>
          <span class="stat-label">Khách hàng</span>
        </div>
      </div>
    </div>

    <div class="report-grid">
      <div class="report-card">
        <h3>Đơn hàng gần đây</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Thời gian</th>
                <th>Số món</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td class="order-id">#{{ order.id.slice(-6) }}</td>
                <td>{{ formatDate(order.createdAt) }}</td>
                <td>{{ order.items.length }}</td>
                <td class="amount">{{ formatCurrency(order.finalTotal) }}</td>
                <td>
                  <span class="badge" :class="order.paymentMethod">
                    {{
                      order.paymentMethod === "cash" ? "Tiền mặt" : "QR Code"
                    }}
                  </span>
                </td>
                <td>
                  <span class="badge completed">Hoàn thành</span>
                </td>
              </tr>
              <tr v-if="recentOrders.length === 0">
                <td colspan="6" class="empty">Chưa có đơn hàng nào</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="report-card">
        <h3>Top sản phẩm bán chạy</h3>
        <div class="top-products">
          <div
            v-for="(item, index) in topProducts"
            :key="item.name"
            class="top-item"
          >
            <span class="top-rank">{{ index + 1 }}</span>
            <span class="top-name">{{ item.name }}</span>
            <span class="top-count">{{ item.count }} ly</span>
            <span class="top-revenue">{{ formatCurrency(item.revenue) }}</span>
          </div>
          <div v-if="topProducts.length === 0" class="empty-state">
            Chưa có dữ liệu
          </div>
        </div>
      </div>
    </div>

    <div class="report-grid">
      <div class="report-card">
        <h3>Doanh thu theo ngày (7 ngày gần nhất)</h3>
        <div class="chart-bars">
          <div v-for="day in last7Days" :key="day.date" class="chart-bar-item">
            <div class="bar-container">
              <div class="bar" :style="{ height: day.percent + '%' }" />
            </div>
            <span class="bar-label">{{ day.label }}</span>
            <span class="bar-value">{{ formatShort(day.revenue) }}</span>
          </div>
        </div>
      </div>

      <div class="report-card">
        <h3>Phương thức thanh toán</h3>
        <div class="payment-stats">
          <div class="payment-item">
            <div class="payment-visual">
              <div
                class="payment-bar cash-bar"
                :style="{ width: cashPercent + '%' }"
              />
            </div>
            <div class="payment-info">
              <span>💵 Tiền mặt</span>
              <span class="payment-value"
                >{{ cashCount }} đơn ({{ cashPercent }}%)</span
              >
            </div>
          </div>
          <div class="payment-item">
            <div class="payment-visual">
              <div
                class="payment-bar qr-bar"
                :style="{ width: qrPercent + '%' }"
              />
            </div>
            <div class="payment-info">
              <span>📱 QR Code</span>
              <span class="payment-value"
                >{{ qrCount }} đơn ({{ qrPercent }}%)</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { orders, load: loadOrders, todayRevenue } = useOrders();
const productStore = useProducts();
const customerStore = useCustomers();

onMounted(() => {
  loadOrders();
  productStore.load();
  customerStore.load();
});

const todayOrderCount = computed(() => {
  const today = new Date().toDateString();
  return orders.value.filter(
    (o) => new Date(o.createdAt).toDateString() === today,
  ).length;
});

const totalProducts = computed(() => productStore.products.value.length);
const totalCustomers = computed(() => customerStore.customers.value.length);

const recentOrders = computed(() => {
  return [...orders.value]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);
});

const topProducts = computed(() => {
  const map = new Map<
    string,
    { name: string; count: number; revenue: number }
  >();
  orders.value.forEach((order) => {
    order.items.forEach((item) => {
      const existing = map.get(item.productName) || {
        name: item.productName,
        count: 0,
        revenue: 0,
      };
      existing.count += item.quantity;
      existing.revenue += item.price * item.quantity;
      map.set(item.productName, existing);
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
});

const last7Days = computed(() => {
  const days = [];
  let maxRevenue = 0;
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const dayOrders = orders.value.filter(
      (o) => new Date(o.createdAt).toDateString() === dateStr,
    );
    const revenue = dayOrders.reduce((sum, o) => sum + o.finalTotal, 0);
    if (revenue > maxRevenue) maxRevenue = revenue;
    days.push({
      date: dateStr,
      label: date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
      }),
      revenue,
      percent: 0,
    });
  }
  days.forEach((d) => {
    d.percent = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
  });
  return days;
});

const cashCount = computed(
  () => orders.value.filter((o) => o.paymentMethod === "cash").length,
);
const qrCount = computed(
  () => orders.value.filter((o) => o.paymentMethod === "qr").length,
);
const cashPercent = computed(() => {
  const total = orders.value.length;
  return total > 0 ? Math.round((cashCount.value / total) * 100) : 0;
});
const qrPercent = computed(() => {
  const total = orders.value.length;
  return total > 0 ? Math.round((qrCount.value / total) * 100) : 0;
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatShort(value: number): string {
  if (value >= 1000000) return Math.round(value / 1000000) + "tr";
  if (value >= 1000) return Math.round(value / 1000) + "k";
  return value.toString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
.admin-dashboard-wrapper {
  max-width: 1200px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-card.revenue .stat-icon {
  background: #dcfce7;
}
.stat-card.orders .stat-icon {
  background: #dbeafe;
}
.stat-card.products .stat-icon {
  background: #fef3c7;
}
.stat-card.customers .stat-icon {
  background: #fce7f3;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.report-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.report-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.report-card h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px 12px;
  text-align: left;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}

th {
  font-weight: 600;
  color: #666;
  background: #fafafa;
}

.order-id {
  font-weight: 600;
  color: #667eea;
}

.amount {
  font-weight: 600;
  color: #16a34a;
}

.badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.badge.cash {
  background: #dcfce7;
  color: #16a34a;
}
.badge.qr {
  background: #dbeafe;
  color: #2563eb;
}
.badge.completed {
  background: #dcfce7;
  color: #16a34a;
}

.empty {
  text-align: center;
  color: #999;
  padding: 24px;
}

.top-products {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fafafa;
}

.top-rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.top-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}

.top-count {
  font-size: 12px;
  color: #666;
}

.top-revenue {
  font-size: 13px;
  font-weight: 600;
  color: #16a34a;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 24px;
  font-size: 14px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 180px;
  gap: 8px;
  padding-top: 20px;
}

.chart-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar-container {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 70%;
  min-height: 4px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 4px 4px 0 0;
  transition: height 0.5s;
}

.bar-label {
  font-size: 11px;
  color: #666;
}

.bar-value {
  font-size: 11px;
  font-weight: 600;
  color: #1a1a2e;
}

.payment-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 0;
}

.payment-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-visual {
  height: 24px;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.payment-bar {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s;
}

.cash-bar {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.qr-bar {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.payment-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.payment-value {
  font-weight: 600;
  color: #333;
}
</style>

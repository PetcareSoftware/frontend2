<script setup>
import { computed } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { formatMoney } from '@/lib/petcare';
import { evaluateProductAlertState } from '@/lib/inventory';
import { useAppStore } from '@/stores/useAppStore';
import { exportToExcel, exportToPDF } from '@/lib/export';

const appStore = useAppStore();
const inventory = computed(() => appStore.inventory);

const formatUnitCost = (value) =>
  formatMoney(value, { locale: 'en-US', currency: 'USD', maximumFractionDigits: 2 });


const getReportData = () => inventory.value.map(item => ({
    Nombre: item.name,
    Tipo: item.type,
    Cantidad: item.quantity,
    'Stock Mínimo': item.umbral,
    'Costo Unitario (USD)': item.unitCost
}));

const handleDownloadExcel = () => {
  exportToExcel(getReportData(), 'Inventario_Excel_2026');
};

const handleDownloadPDF = () => {
  exportToPDF(appStore.inventory, appStore.requisitions);
};

const alertByItemId = computed(() => {
  const map = new Map();
  inventory.value.forEach((item) => {
    map.set(item.id, evaluateProductAlertState(item));
  });
  return map;
});
</script>

<template>
  <div class="stack">
    <PageHeader
      title="Gestión de Insumos"
      subtitle="Catálogo maestro: existencias, umbrales y alertas de stock o vencimiento."
    />

    <DashboardCard title="Vista General del Inventario" icon="syringe">
      <div class="report-actions" style="margin-bottom: 20px; display: flex; gap: 10px;">
        <button class="btn btn--secondary" @click="handleDownloadExcel">
          Exportar a Excel
        </button>
        <button class="btn btn--primary" @click="handleDownloadPDF" type="button">
          Generar Reporte Formal (PDF)
        </button>
      </div>
      <section class="table-wrap inventory-table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre del insumo</th>
              <th>Cantidad disponible</th>
              <th>Stock mínimo</th>
              <th>Costo unitario</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in inventory"
              :key="item.id"
              class="table__row"
              :class="`inventory-row--${alertByItemId.get(item.id)?.alertClass ?? 'normal'}`"
            >
              <td class="inventory-table__name">
                {{ item.name }}
                <span
                  v-if="alertByItemId.get(item.id)?.messages?.length"
                  class="inventory-tooltip"
                  role="tooltip"
                >
                  <span
                    v-for="(line, index) in alertByItemId.get(item.id).messages"
                    :key="index"
                    class="inventory-tooltip__line"
                  >
                    {{ line }}
                  </span>
                </span>
              </td>
              <td>{{ item.quantity }} uds.</td>
              <td>
                <input
                  v-model.number="item.umbral"
                  type="number"
                  min="1"
                  class="input inventory-umbral-input"
                  title="Nivel mínimo de existencias"
                />
              </td>
              <td>{{ formatUnitCost(item.unitCost) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </DashboardCard>
  </div>
</template>

<style scoped>
.inventory-table-wrap {
  margin-top: 1.25rem;
}

.inventory-table__name {
  position: relative;
  font-weight: 500;
}

.inventory-umbral-input {
  width: 4.5rem;
  padding: 6px 8px;
}

.inventory-row--critical td {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
}

.inventory-row--warning td {
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
}

.inventory-row--critical .inventory-table__name,
.inventory-row--warning .inventory-table__name {
  cursor: help;
}

.inventory-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 12rem;
  max-width: 20rem;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-strong);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  white-space: normal;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  transition: opacity 0.2s ease, bottom 0.2s ease;
}

.inventory-tooltip__line {
  display: block;
}

.inventory-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 15px;
  border: 5px solid transparent;
  border-top-color: var(--bg);
}

.inventory-row--critical:hover .inventory-tooltip,
.inventory-row--warning:hover .inventory-tooltip {
  visibility: visible;
  opacity: 1;
}
</style>

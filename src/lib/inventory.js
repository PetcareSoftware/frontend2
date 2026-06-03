export const DEFAULT_INVENTORY_MIN_STOCK = 10;
const DEFAULT_WARNING_THRESHOLD_RATIO = 1.5;
const DEFAULT_WARNING_DAYS_REMAINING = 30;
const DEFAULT_CRITICAL_DAYS_REMAINING = 15;

export function getInventoryMinStock(item) {
  const raw = item?.minStock;
  if (raw != null && raw !== '' && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return 0;
}

export function normalizeInventoryItem(item) {
  if (!item.batches) {
    item.batches = [];
  }
  item.minStock = getInventoryMinStock(item);
  return item;
}

export function normalizeInventory(inventory) {
  if (!Array.isArray(inventory)) return;
  inventory.forEach(normalizeInventoryItem);
}

function daysUntilExpiration(expirationDate) {
  const today = new Date();
  const expiration = new Date(`${expirationDate}T00:00:00`);
  const diffMs = expiration - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/** Alertas de stock y vencimiento de lotes (no confundir con estado de solicitudes de compra). */
export function evaluateProductAlertState(product) {
  let alertClass = 'normal';
  const messages = [];

  const stock = product.quantity || 0;
  const minimum = getInventoryMinStock(product);
  const warningStockLimit = minimum * DEFAULT_WARNING_THRESHOLD_RATIO;

  if (stock <= minimum) {
    alertClass = 'critical';
    messages.push(`Stock crítico: quedan ${stock} uds. (mínimo: ${minimum})`);
  } else if (stock <= warningStockLimit) {
    alertClass = 'warning';
    messages.push(`Stock bajo: quedan ${stock} uds. (mínimo: ${minimum})`);
  }

  if (product.batches?.length) {
    product.batches.forEach((batch) => {
      const daysRemaining = daysUntilExpiration(batch.expirationDate);

      if (daysRemaining <= DEFAULT_CRITICAL_DAYS_REMAINING) {
        alertClass = 'critical';
        messages.push(`Lote #${batch.batch}: vence en ${daysRemaining} días (crítico)`);
      } else if (daysRemaining <= DEFAULT_WARNING_DAYS_REMAINING) {
        if (alertClass !== 'critical') alertClass = 'warning';
        messages.push(`Lote #${batch.batch}: vence en ${daysRemaining} días`);
      }
    });
  }

  return { alertClass, messages };
}

/** Cantidad sugerida para una solicitud de compra según stock actual y minStock. */
export function suggestReorderQuantity(product) {
  const minimum = getInventoryMinStock(product);
  const stock = product.quantity || 0;
  if (stock <= minimum) {
    return Math.max(minimum * 2 - stock, minimum);
  }
  const warningLimit = minimum * DEFAULT_WARNING_THRESHOLD_RATIO;
  if (stock <= warningLimit) {
    return Math.max(Math.ceil(warningLimit - stock), 1);
  }
  return minimum;
}

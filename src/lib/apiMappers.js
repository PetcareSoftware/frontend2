/** Normaliza respuestas paginadas de Django REST o arrays directos. */
export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export function mapBatchFromApi(batch) {
  return {
    batch: batch.lot_number ?? batch.batch ?? '',
    expirationDate: batch.expiry_date ?? batch.expiration_date ?? batch.expirationDate ?? '',
    quantity: Number(batch.quantity ?? batch.current_stock ?? 0),
  };
}

export function mapSupplyFromApi(supply) {
  const batches = supply.batches ?? supply.lots ?? [];
  return {
    id: supply.id,
    sku: supply.sku,
    name: supply.name,
    type: supply.category ?? supply.type ?? '',
    quantity: Number(supply.current_stock ?? supply.quantity ?? 0),
    unitCost: Number(supply.unit_cost ?? supply.unitCost ?? 0),
    minStock: Number(supply.min_stock ?? supply.minStock ?? supply.umbral ?? 10),
    batches: Array.isArray(batches) ? batches.map(mapBatchFromApi) : [],
  };
}

const PURCHASE_STATUS_TO_UI = {
  REQUESTED: 'Pendiente',
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  RECEIVED: 'Aprobada',
  CANCELLED: 'Rechazada',
};

const UI_STATUS_TO_API = {
  Pendiente: 'REQUESTED',
  Aprobada: 'APPROVED',
  Rechazada: 'CANCELLED',
};

export function mapPurchaseOrderToRequisition(order) {
  const items = order.items ?? order.lines ?? [];
  const cantidadProductos = items.reduce(
    (acc, item) => acc + Number(item.quantity_requested ?? item.quantity ?? 0),
    0
  );

  return {
    id: order.id,
    fecha: order.created_at
      ? new Date(order.created_at).toLocaleDateString()
      : order.fecha ?? '',
    estado: PURCHASE_STATUS_TO_UI[order.status] ?? order.estado ?? order.status,
    total: Number(order.total_cost ?? order.total ?? 0),
    cantidadProductos,
    items: items.map((item) => ({
      supplyId: item.supply_id ?? item.supplyId ?? item.supply,
      quantity: Number(item.quantity_requested ?? item.quantity ?? 0),
    })),
  };
}

export function mapRequisitionStatusToApi(estado) {
  return UI_STATUS_TO_API[estado] ?? estado;
}

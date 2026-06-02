export { default as api } from './api.js';
export {
  InventoryService,
  SUPPLIES_BASE,
  BATCHES_BASE,
  listSupplies,
  createBatch,
} from './inventoryService.js';
export {
  PurchaseService,
  PURCHASE_ORDERS_BASE,
  SUPPLIERS_BASE,
  listPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  listSuppliers,
} from './purchaseService.js';
export { ConsumptionService, CONSUME_BASE, consumeSupply } from './consumptionService.js';
export { AlertService, ALERTS_BASE, listCriticalAlerts } from './alertService.js';
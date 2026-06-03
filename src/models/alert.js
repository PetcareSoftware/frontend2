import { ValidationError } from './utils.js';


export class Alert {
  constructor({
    supplyId,
    supplyName,
    supplySku,
    alertType,
    severity,
    message,
    currentValue,
    thresholdValue,
    daysRemaining,
    batchId,
    lotNumber
  } = {}) {
    this.supplyId = supplyId ?? null;
    this.supplyName = supplyName || '';
    this.supplySku = supplySku || '';
    this.alertType = alertType || '';
    this.severity = severity || '';
    this.message = message || '';
    this.currentValue = currentValue ?? 0;
    this.thresholdValue = thresholdValue ?? 0;
    this.daysRemaining = daysRemaining ?? null;
    this.batchId = batchId ?? null;
    this.lotNumber = lotNumber || '';
  }

  validate() {
    if (!this.supplyId) {
      throw new ValidationError('Insumo inv�lido', 'supplyId');
    }

    return true;
  }

  toApi() {
    return {
      supply_id: this.supplyId,
      supply_name: this.supplyName,
      supply_sku: this.supplySku,
      alert_type: this.alertType,
      severity: this.severity,
      message: this.message,
      current_value: this.currentValue,
      threshold_value: this.thresholdValue,
      days_remaining: this.daysRemaining,
      batch_id: this.batchId,
      lot_number: this.lotNumber
    };
  }

  static fromApi(data) {
    return new Alert({
      supplyId: data.supply_id ?? null,
      supplyName: data.supply_name ?? '',
      supplySku: data.supply_sku ?? '',
      alertType: data.alert_type ?? '',
      severity: data.severity ?? '',
      message: data.message ?? '',
      currentValue: data.current_value ?? null,
      thresholdValue: data.threshold_value ?? null,
      daysRemaining: data.days_remaining ?? null,
      batchId: data.batch_id ?? null,
      lotNumber: data.lot_number ?? '',
    });
  }

  equals(other) {
    return this.supplyId === other?.supplyId && this.message === other?.message;
  }
}
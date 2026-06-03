import { ValidationError } from './utils.js';


export class Alert {
  supplyId = null;
  supplyName = '';
  supplySku = '';
  alertType = '';
  severity = '';
  message = '';
  currentValue = null;
  thresholdValue = null;
  daysRemaining = null;
  batchId = null;
  lotNumber = '';

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
    lotNumber,
  }) {
    this.supplyId = supplyId ?? this.supplyId;
    this.supplyName = supplyName || this.supplyName;
    this.supplySku = supplySku || this.supplySku;
    this.alertType = alertType || this.alertType;
    this.severity = severity || this.severity;
    this.message = message || this.message;
    this.currentValue = currentValue ?? this.currentValue;
    this.thresholdValue = thresholdValue ?? this.thresholdValue;
    this.daysRemaining = daysRemaining ?? this.daysRemaining;
    this.batchId = batchId ?? this.batchId;
    this.lotNumber = lotNumber || this.lotNumber;
  }

  validate() {
    if (!this.supplyId) {
      throw new ValidationError('Insumo inválido', 'supplyId');
    }

    return true;
  }

  toApi() {
    const data = {
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
      lot_number: this.lotNumber,
    };

    return data;
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

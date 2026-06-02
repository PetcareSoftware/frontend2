import { defineStore } from 'pinia';
import { appTemplate } from '@/config/appTemplate';
import { OwnerService } from '@/services/api/v1/ownerService';
import { vetService } from '@/services/api/v1/vetService';
import { appointmentService } from '@/services/api/v1/appointmentService';
import { notificationService } from '@/services/api/v1/notificationService';
import { medicalRecordService } from '@/services/api/v1/medicalRecordService';
import { normalizeInventory, normalizeInventoryItem } from '@/lib/inventory';
import {
  unwrapList,
  mapSupplyFromApi,
  mapPurchaseOrderToRequisition,
  mapRequisitionStatusToApi,
} from '@/lib/apiMappers';
import { listSupplies, createBatch } from '@/services/api/v1/inventoryService';
import {
  listPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
} from '@/services/api/v1/purchaseService';
import {
  cloneMock,
  vets as seedVets,
  owners as seedOwners,
  pets as seedPets,
  appointments as seedAppointments,
  consultations as seedConsultations,
  vaccines as seedVaccines,
  dewormings as seedDewormings,
  supplies as seedSupplies,
} from '@/data/mockData';

const USE_MOCK_DATA = true;

export const useAppStore = defineStore('app', {
  state: () => ({
    role: 'owner',
    currentUserId: 'o1',
    vets: USE_MOCK_DATA ? cloneMock(seedVets) : [],
    owners: USE_MOCK_DATA ? cloneMock(seedOwners) : [],
    pets: USE_MOCK_DATA ? cloneMock(seedPets) : [],
    appointments: USE_MOCK_DATA ? cloneMock(seedAppointments) : [],
    consultations: USE_MOCK_DATA ? cloneMock(seedConsultations) : [],
    vaccines: USE_MOCK_DATA ? cloneMock(seedVaccines) : [],
    dewormings: USE_MOCK_DATA ? cloneMock(seedDewormings) : [],
    inventory: USE_MOCK_DATA ? cloneMock(seedSupplies) : [],
    requisitions: [],
    notifications: [],
    status: {
      inventory: { loading: false },
      batch: { loading: false },
      requisition: { loading: false, submitting: false },
    },
    errors: {
      inventory: null,
    },
    purchaseOrderUpdatingId: null,
  }),
  getters: {
    currentOwner(state) {
      return state.owners.find((owner) => owner.id === state.currentUserId) || null;
    },
    roleInfo(state) {
      return appTemplate.roles[state.role];
    },
    roleNavigation(state) {
      return appTemplate.navigation[state.role];
    },
  },
  actions: {
    setRole(role, userId = undefined) {
      this.role = role;
      if (userId !== undefined) {
        this.currentUserId = userId;
      }
    },
    
    // Asynchronous API Actions (Non-Auth)
    async fetchProfile() {
      this.isLoading = true;
      try {
        const profile = await OwnerService.getMe();
        this.updateOwner(profile);
        if (profile.pets) {
          this.pets = profile.pets;
        }
      } catch (err) {
        this.error = err.response?.data?.detail || err.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchVetsCalendar(from, to) {
      this.isLoading = true;
      try {
        const response = await vetService.getCalendar(from, to);
        // Map the backend format to the expected state format
        // This is a placeholder; you'll need to adapt it to your components
        this.vets = response.data.vets || [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchAppointments() {
      this.isLoading = true;
      try {
        // Here we could fetch all appointments or just today depending on context.
        // Assuming we want today's for the dashboard
        const response = await appointmentService.getTodayAppointments({});
        this.appointments = response.data.results || response.data || [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async addAppointment(appointmentData) {
      this.isLoading = true;
      try {
        const response = await appointmentService.scheduleAppointment(appointmentData);
        this.appointments.push(response.data);
        return response.data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async cancelAppointmentAPI(id, cancelReason = '') {
      this.isLoading = true;
      try {
        await appointmentService.cancelAppointment(id, cancelReason);
        this.appointments = this.appointments.map((item) =>
          item.id === id ? { ...item, status: 'CANCELLED', cancellation_reason: cancelReason } : item
        );
        this.addNotification({
          title: 'Cita cancelada',
          description: `La cita ha sido cancelada${cancelReason ? ' (' + cancelReason + ')' : ''}.`,
          type: 'info',
          date: new Date().toISOString()
        });
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Fallback synchronous methods for state updates
    addOwner(owner) {
      this.owners.push(owner);
    },
    updateOwner(owner) {
      if (!this.owners.find(o => o.id === owner.id)) {
        this.owners.push(owner);
      } else {
        this.owners = this.owners.map((item) => (item.id === owner.id ? owner : item));
      }
    },
    addPet(pet) {
      this.pets.push(pet);
    },
    updatePet(pet) {
      this.pets = this.pets.map((item) => (item.id === pet.id ? pet : item));
    },
    updateAppointment(appointment) {
      this.appointments = this.appointments.map((item) =>
        item.id === appointment.id ? appointment : item
      );
    },
    cancelAppointment(id, cancelReason = '') {
      // Synchronous version kept for backwards compatibility during migration
      this.appointments = this.appointments.map((item) =>
        item.id === id ? { ...item, status: 'cancelled', cancelReason } : item
      );
    },
    addConsultation(consultation) {
      this.consultations.push(consultation);
    },
    addVaccine(vaccine) {
      this.vaccines.push(vaccine);
    },
    addDeworming(deworming) {
      this.dewormings.push(deworming);
    },
    addNotification(notification) {
      this.notifications.unshift({
        id: `n${Date.now()}`,
        read: false,
        ...notification
      });
    },
    markNotificationAsRead(id) {
      const notif = this.notifications.find(n => n.id === id);
      if (notif) notif.read = true;
    },
    normalizeInventory() {
      normalizeInventory(this.inventory);
    },
    async fetchInventory() {
      this.status.inventory.loading = true;
      this.errors.inventory = null;

      try {
        const data = await listSupplies();
        this.inventory = unwrapList(data).map(mapSupplyFromApi);
      } catch (error) {
        this.errors.inventory = error?.message ?? 'No se pudo cargar el inventario';
      } finally {
        this.status.inventory.loading = false;
      }
    },
    addSupply(supply) {
      const item = normalizeInventoryItem(supply);
      this.inventory.push(item);
      return item;
    },
    async submitBatch({ supplyId, batch, expirationDate, quantity, observations }) {
      this.status.batch.loading = true;
      try {
        await createBatch({
          supply_id: Number(supplyId),
          lot_number: batch,
          expiry_date: expirationDate,
          quantity: Number(quantity),
          observations: observations || undefined,
        });
        await this.fetchInventory();
        return true;
      } finally {
        this.status.batch.loading = false;
      }
    },
    addBatch(supplyId, { batch, expirationDate, quantity }) {
      const item = this.inventory.find((entry) => Number(entry.id) === Number(supplyId));
      if (!item) return false;

      const amount = Number(quantity);
      item.quantity += amount;
      item.batches.push({
        batch,
        expirationDate,
        quantity: amount,
      });
      return true;
    },
    async fetchRequisitions() {
      this.status.requisition.loading = true;
      try {
        const data = await listPurchaseOrders();
        this.requisitions = unwrapList(data).map(mapPurchaseOrderToRequisition);
      } catch {
        // Mantiene solicitudes locales si la API no está disponible
      } finally {
        this.status.requisition.loading = false;
      }
    },
    addRequisition(requisition) {
      this.requisitions.push(requisition);
    },
    _buildPurchaseOrderPayload(items) {
      const orderItems = items.map((item) => {
        const supply = this.inventory.find(
          (entry) => Number(entry.id) === Number(item.supplyId)
        );
        const unitCost = supply?.unitCost ?? 0;
        return {
          supply_id: Number(item.supplyId),
          quantity_requested: Number(item.quantity),
          unit_cost: unitCost,
        };
      });
      const total_cost = orderItems.reduce(
        (sum, line) => sum + line.quantity_requested * line.unit_cost,
        0
      );
      return {
        status: 'REQUESTED',
        total_cost,
        items: orderItems,
      };
    },
    async submitRequisition(items) {
      if (!items?.length) {
        throw new Error('La solicitud debe incluir al menos un insumo');
      }

      this.status.requisition.submitting = true;
      try {
        const created = await createPurchaseOrder(this._buildPurchaseOrderPayload(items));
        const mapped = mapPurchaseOrderToRequisition(created);
        const existing = this.requisitions.findIndex((r) => r.id === mapped.id);
        if (existing >= 0) {
          this.requisitions[existing] = mapped;
        } else {
          this.requisitions.push(mapped);
        }
        return mapped;
      } finally {
        this.status.requisition.submitting = false;
      }
    },
    async updateRequisitionStatus(orderId, estado) {
      this.status.requisition.submitting = orderId;
      try {
        await updatePurchaseOrderStatus(orderId, mapRequisitionStatusToApi(estado));
        const solicitud = this.requisitions.find((s) => s.id === orderId);
        if (solicitud) {
          solicitud.estado = estado;
        }
      } finally {
        this.status.requisition.submitting = false;
      }
    },
  },
});

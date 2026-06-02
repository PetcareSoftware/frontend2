import api from "./api";
import { Owner } from "@/models/owner";

export const OWNERS_BASE = 'owners/';
export const USERS_BASE = 'auth/';

export class OwnerService {
  static async list() {
    const response = await api.get(OWNERS_BASE);
    const data = response.data;
    return Array.isArray(data) ?
      data.map(owner => new Owner(owner)) :
      data;
  }

  static async get(id) {
    const response = await api.get(`${OWNERS_BASE}${id}/`);
    return Owner.fromApi(response.data);
  }

  static async create(owner) {
    const response = await api.post(`${USERS_BASE}`, owner);
    return response.data;
  }

  static async getMe() {
    const response = await api.get(`${OWNERS_BASE}me/`);
    return Owner.fromApi(response.data);
  }

  static async updateMe(owner) {
    const response = await api.patch(`${OWNERS_BASE}me/`, owner);
    return Owner.fromApi(response.data);
  }
}

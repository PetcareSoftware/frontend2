import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import Register from '@/views/auth/Register.vue';
import OwnerDashboard from '@/views/owner/OwnerDashboard.vue';
import OwnerAppointments from '@/views/owner/OwnerAppointments.vue';
import OwnerHistory from '@/views/owner/OwnerHistory.vue';
import OwnerPets from '@/views/owner/OwnerPets.vue';
import OwnerProfile from '@/views/owner/OwnerProfile.vue';
import ScheduleAppointment from '@/views/owner/ScheduleAppointment.vue';
import ReceptionDashboard from '@/views/receptionist/ReceptionDashboard.vue';
import AppointmentCalendar from '@/views/receptionist/AppointmentCalendar.vue';
import NewAppointment from '@/views/receptionist/NewAppointment.vue';
import CheckIn from '@/views/receptionist/CheckIn.vue';
import WaitList from '@/views/receptionist/WaitList.vue';
import OwnersSearch from '@/views/receptionist/OwnersSearch.vue';
import VetDashboard from '@/views/vet/VetDashboard.vue';
import VetPatients from '@/views/vet/VetPatients.vue';
import ClinicalRecords from '@/views/vet/ClinicalRecords.vue';
import RegisterConsultation from '@/views/vet/RegisterConsultation.vue';
import VaccineManager from '@/views/vet/VaccineManager.vue';
import DewormingManager from '@/views/vet/DewormingManager.vue';
import FormPage from '@/views/technician/form.vue';
import InventoryCatalog from '@/views/technician/InventoryCatalog.vue';
import RepositionStock from '@/views/technician/RepositionStock.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/portal/dashboard' },
    { path: '/register', component: Register },
    {
      path: '/portal',
      component: AppLayout,
      children: [
        { path: 'dashboard', component: OwnerDashboard },
        { path: 'appointments', component: OwnerAppointments },
        { path: 'schedule', component: ScheduleAppointment },
        { path: 'pets', component: OwnerPets },
        { path: 'history', component: OwnerHistory },
        { path: 'profile', component: OwnerProfile },
      ],
    },
    {
      path: '/reception',
      component: AppLayout,
      children: [
        { path: 'dashboard', component: ReceptionDashboard },
        { path: 'calendar', component: AppointmentCalendar },
        { path: 'new-appointment', component: NewAppointment },
        { path: 'checkin', component: CheckIn },
        { path: 'waitlist', component: WaitList },
        { path: 'owners', component: OwnersSearch },
      ],
    },
    {
      path: '/vet',
      component: AppLayout,
      children: [
        { path: 'dashboard', component: VetDashboard },
        { path: 'patients', component: VetPatients },
        { path: 'records', component: ClinicalRecords },
        { path: 'consultations', component: RegisterConsultation },
        { path: 'vaccines', component: VaccineManager },
        { path: 'dewormings', component: DewormingManager },
      ],
    },
    {
      path: '/technician',
      component: AppLayout,
      children: [
        { path: 'inventory', component: InventoryCatalog },
        { path: 'form', component: FormPage },
        { path: 'reposition', component: RepositionStock },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/portal/dashboard' },
  ],
});

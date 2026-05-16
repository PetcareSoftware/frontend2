<script setup>
import { ref } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { useAppStore } from '@/stores/useAppStore';
const open = ref(true)
const alerta = ref(null)
const form = ref({
  nombre: '',
  tipo: '',
  cantidad: '',
  umbral: '',        
  observaciones: ''
})


function handleSubmit() {
  alerta.value = '¡registrado con exito!'
  // Aquí podrías limpiar el formulario o hacer submit real
  setTimeout(() => (alerta.value = null), 2500)
  Object.assign(form.value, { nombre: '', tipo: '', cantidad: '', umbral: '', observaciones: '' });
}
</script>


<template>
   <div class="stack">
    <PageHeader 
        title="Formulario de insumos" 
        subtitle="formulario para el stock de insumos y medicamentos."
    />
  <DashboardCard title="Solicitud de insumos" icon="notebook-pen">
    <form v-show="open" class="stack" style="margin-top: 28px;" @submit.prevent="handleSubmit">
              <div class="field">
            <label for="nombre">Nombre*</label>
            <input class="input" id="nombre" v-model="form.nombre" required placeholder="Nombre del medicamento o insumo" />
          </div>
          <div class="field">
            <label for="tipo">Tipo*</label>
            <select class="select" id="tipo" v-model="form.tipo" required>
              <option value="" disabled>Seleccionar...</option>
              <option>Medicamento</option>
              <option>Insumo</option>
            </select>
          </div>
          <div class="field">
            <label for="cantidad">Cantidad*</label>
            <input class="input" id="cantidad" v-model="form.cantidad" type="number" min=1 required placeholder="Cantidad disponible"/>
          </div>
          <div class="field">
          <label for="umbral">Nivel mínimo de existencias*</label>
          <input
            class="input"
            id="umbral"
            v-model="form.umbral"
            type="number"
            min="0"
            required
            placeholder="Ejemplo: 10"
            />
          </div>
          <div class="field">
            <label for="observaciones">Observaciones</label>
            <textarea class="textarea" id="observaciones" v-model="form.observaciones" placeholder="Detalles, lote, caducidad, etc." />
          </div>
          <button class="btn btn--primary" type="submit">Registrar</button>
        </form>
        <p v-if="alerta" class="chip chip--success" style="margin-top: 18px; border-color: #c2a769; display:inline-block;">{{ alerta }}</p>
  </DashboardCard>
  </div>
</template>

<style>
label{
  padding: 12px 8px;
}

</style>

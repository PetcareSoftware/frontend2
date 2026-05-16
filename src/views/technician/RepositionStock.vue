<script setup>
import { ref, computed } from 'vue' 
import PageHeader from '@/components/shared/PageHeader.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { useAppStore } from '@/stores/useAppStore';

import { vaccines, dewormings, consultations } from '@/data/mockData'

const catalogoInsumos = computed(() => {
  // Extraemos nombres de vacunas
  const nombresVacunas = vaccines ? vaccines.map(v => v.name) : []
  // Extraemos productos de desparasitación
  const nombresDesparasitantes = dewormings ? dewormings.map(d => d.product) : []
  // Extraemos nombres de las prescripciones
  const nombresPrescripciones = consultations ? consultations.flatMap(c => 
    c.prescriptions ? c.prescriptions.map(p => p.split(' - ')[0]) : []
  ) : []

  // Unimos todo y quitamos duplicados
  const listaUnica = [...new Set([...nombresVacunas, ...nombresDesparasitantes, ...nombresPrescripciones])]
  return listaUnica.sort()
})

const today = new Date().toISOString().split('T')[0]
const open = ref(true)
const alerta = ref(null)
const form = ref({
  nombre: '',
  cantidad: 0,
  detalles: '',
  set: '',
  fechaVencimiento: '',
  observaciones: ''
})

function toggle() {
  open.value = !open.value
}

function handleSubmit() {
  // Validación de seguridad para el Criterio de Éxito
  if (form.value.cantidad <= 0) {
    alert("Por favor, ingrese una cantidad válida.");
    return;
  }

  console.log('REGISTRO EXITOSO:', JSON.parse(JSON.stringify(form.value)))
  alerta.value = '¡Reposición registrada en inventario!'

  setTimeout(() => (alerta.value = null), 2500)

  Object.assign(form.value, { 
    nombre: '', 
    cantidad: 0, 
    detalles: '', 
    set: '', 
    fechaVencimiento: '', 
    observaciones: '' 
  });
}
</script>

<template>
    <div class="stack">
    <PageHeader 
        title="Reposicion de stock" 
        subtitle="Registro de entrada de mercancia por lote."
    />
<DashboardCard title="Solicitud de insumos" icon="notebook-pen">
        <form v-show="open" class="stack" style="margin-top: 28px;" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="name">Insumo/Medicamento del Catálogo*</label>
            <select class="input" id="name" v-model="form.nombre" required>
              <option value="" disabled>Seleccione un producto del catálogo...</option>
              <option v-for="item in catalogoInsumos" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>
          <div class="field">
            <label for="cant">Cantidad Recibida*</label>
            <input class="input" id="cant" v-model="form.cantidad" type="number" min="0" required placeholder="0"/>
          </div>
          <div class="field">
            <label for="detail">Detalles Técnicos<*</label>
            <input class="input" id="detail" v-model="form.detalles" required placeholder="Descripción del insumo" />
          </div>
          <div class="field">
            <label for="set">Número de Lote*</label>
            <input class="input" id="set" v-model="form.set" required placeholder="Ej: LOT-2026-AF" />
          </div>
          <div class="field">
            <label for="caducidad">Fecha de Vencimiento*</label>
            <input class="input" id="caducidad" type="date" v-model="form.fechaVencimiento" :min="today" required />
          </div>
          <div class="field">
            <label for="observaciones">Observaciones de Control*</label>
            <textarea class="textarea" id="observaciones" v-model="form.observaciones" placeholder="Estado del empaque, temperatura, etc."/>
          </div>
          <button class="btn btn--primary" type="submit">Registrar Entrada</button>
        </form>
        <p v-if="alerta" class="chip chip--success" style="margin-top: 18px; display:inline-block;">{{ alerta }}</p>
</DashboardCard>
</div>
</template>
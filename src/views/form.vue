
<template>
  <div class="app-shell" style="display: flex; flex-direction: column; padding: 20px; margin-left: -20px; margin-top: -20px;">
    <header class="page-header card" style="max-width: auto; margin: 0 0 20px 0;" >
        <div>
          <div class="page-header__title-row">
            <span class="page-header__accent" style="background-color: rgb(194, 167, 105); "></span>
              <h1 class="page-header__title">Registrar Insumos y Medicamentos</h1>
          </div>
        <p class="page-header__subtitle">Registro de Insumos para el consultorio.</p>
      </div>
    </header>
    <main>
      <section class="card" style=" margin: 0 0 20px 0; ">
        <div class="section__div" @click="toggle" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
          <h2 class="section__title">Solicitudes</h2>
        </div>
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
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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

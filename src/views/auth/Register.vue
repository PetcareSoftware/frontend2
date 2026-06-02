<script setup>
  import { reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import Logo from '@/components/shared/Logo.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import { useToastStore } from '@/stores/useToastStore';
  import { getTodayShortDate } from '@/lib/petcare';

  const appStore = useAppStore();
  const toastStore = useToastStore();
  const router = useRouter();

  const form = reactive({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  function handleRegister() {
    if (!form.name || !form.email || !form.password) {
      toastStore.push({ title: 'Completa los campos requeridos', type: 'error' });
      return;
    }

    const newId = `o${Date.now()}`;

    appStore.addOwner({
      id: newId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      createdAt: getTodayShortDate(),
    });
    appStore.setRole('owner', newId);
    toastStore.push({
      title: `Bienvenido/a, ${form.name.split(' ')[0]}!`,
      description: 'Tu cuenta fue creada correctamente.',
      type: 'success',
    });
    router.push('/portal/dashboard');
  }
</script>

<template>
  <div class="auth-container card">
    <div class="auth-header">
      <div class="logo-mobile">
        <Logo size="md" />
      </div>
      <h1 class="auth-title">Crear cuenta</h1>
      <p class="auth-subtitle">Registrate como propietario y comenzá a gestionar turnos.</p>
    </div>

    <form class="auth-form" @submit.prevent="handleRegister">
      <label class="field field--required">
        <span class="field__label">Nombre completo</span>
        <input v-model="form.name" class="input input--auth" type="text" placeholder="Ana García" />
      </label>

      <div class="input-grid">
        <label class="field field--required">
          <span class="field__label">Correo electrónico</span>
          <input v-model="form.email" class="input input--auth" type="email" placeholder="ana@email.com" />
        </label>
        <label class="field field--required">
          <span class="field__label">Contraseña</span>
          <input v-model="form.password" class="input input--auth" type="password" placeholder="••••••••" />
        </label>
      </div>

      <div class="input-grid">
        <label class="field">
          <span class="field__label">Teléfono</span>
          <input v-model="form.phone" class="input input--auth" type="text" placeholder="555-0000" />
        </label>
        <label class="field">
          <span class="field__label">Dirección</span>
          <input v-model="form.address" class="input input--auth" type="text" placeholder="Av. Libertad 123" />
        </label>
      </div>

      <button class="btn btn--primary btn--block" type="submit">Crear cuenta</button>
    </form>

    <p class="terms muted">Al registrarte aceptas los términos y condiciones de PetCare.</p>

    <div class="auth-footer">
      <p class="muted">¿Ya tienes cuenta?
        <router-link to="/login" class="link">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>

.auth-container {
  width: 100%;
  max-width: 440px;
  padding: 2rem;
  border-radius: 24px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.auth-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.logo-mobile {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

@media (min-width: 1024px) {
  .logo-mobile {
    display: none;
  }
}

.auth-title {
  font-size: 1.8rem;
  font-weight: var(--weight-black);
  color: var(--text-strong);
  margin-bottom: 0.25rem;
}

.auth-subtitle {
  color: var(--text);
  opacity: 0.7;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input--auth {
  padding: 0.85rem 1rem;
  font-size: 1rem;
  border-radius: 14px;
  background: #fff;
  transition: all 0.2s ease;
}

.input--auth:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(194, 167, 105, 0.15);
}

.btn--block {
  width: 100%;
  justify-content: center;
  padding: 0.85rem;
  font-size: 1.05rem;
  margin-top: 0.5rem;
  border-radius: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 15px rgba(194, 167, 105, 0.3);
}

.btn--block:hover {
  box-shadow: 0 6px 20px rgba(194, 167, 105, 0.4);
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
}

.link {
  color: var(--brand-strong);
  font-weight: var(--weight-bold);
  text-decoration: none;
  transition: all 0.2s ease;
  margin-left: 0.25rem;
}

.link:hover {
  color: var(--brand);
  text-decoration: underline;
}

.terms {
  text-align: center;
  font-size: 0.8rem;
  margin-top: 1rem;
}
</style>

export const USE_MOCK_DATA = true;

/**
 * Devuelve el resultado de `getter(id)` cuando `id` no es `null`
 */
export function getSelectedById(id, getter) {
  return id != null ? getter(id) : undefined;
}

/**
 * Devuelve `true` cuando alguno de los elementos es `true` o cuando no hay elementos.
 * Es para ser usado en un `computed`.
 */
export function getLocked(lockStatus) {
  return !lockStatus || Object.values(lockStatus).some(status => status);
}

/**
 * Recibe un `ref` y devuelve una función para `watch`.
 * Asigna una `Promise` al `ref` cuando el valor observado es cierto
 * y la resuelve cuando es valor observado es falso.
 * Su uso es observar el estado general `locked` para permitir que otras funciones
 * esperen a su cambio a falso.
 */
export function getLockWatcher(lock) {
  let resolveLock = null;

  return (locked) => {
    if (locked) {
      if (!lock.value) {
        lock.value = new Promise(resolve => { resolveLock = resolve; });
      }
    } else {
      if (lock.value) {
        lock.value = null;
        resolveLock();
      }
    }
  }
}

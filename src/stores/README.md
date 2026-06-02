# Para el desarrollo

## Almacenes de datos

Los almacenes de datos deben definirse como el almacén en `useOwnerStore.js` como patrón.
Los almacenes deben ser con API de composición de Vue y deben definirse en el siguiente orden.

### Importaciones

- Pinia.
- Vue.
- Otros almacenes de dependencias.
- Servicios de API.
- Datos de prueba.
- Utilidades.
- Otros.

### Variables auxiliares y constantes

Las variables auxiliares y constantes que no tengan otro lugar pueden ir luego
de las importaciones.  Debe importarse la constante `USE_MOCK_DATA` para comprobar
si deberían usarse datos de prueba.

### Almacenes auxiliares

Dentro de la función de configuración, pueden importarse los almacenes de datos
de los que depende el que se está definiendo.  Deberían tener cuidado cuando de
definir referencias circulares.  `useAppStore` no puede depender de ningún otro
almacén.

### Estado

Luego, debe comenzar esta sección con el comentario `// State` para definir las
variables de estado reactivo de la aplicación.  Defínanse como `const` con `ref`.

#### status

Las variables de `status` son para indicar cuando una operación está en progreso.
`loading` y `sending` deben ser para carga y envío, respectivamente, de lotes de datos.
`loadingOne` y `sendingOne` son variantes para cuando se maneja un dato único.
Pueden definirse adicionales si el almacén maneja varios tipos de datos.

#### lock

Es una `ref` para almacenar una promesa cuando alguna de las variables de `status`
indica una operación en proceso, que se debería resolver cuando todas las operaciones
hayan finalizado.  Cuando no hay operación en progreso, se hace `null`.

### Getters

Sigue la definición de getters encabezada con el comentario `// Getters`.
Defínanse con `const` y `computed`.

#### locked

Es un getter que indica cuando alguna operación está en progreso según el `status`.

### Extra

Se pueden escribir definiciones extra _simples_ que trabajen con el estado, getters
o acciones.

#### Watch de bloqueo

Es un watch que se usa para actualizar `lock` en función de `locked`, gestionando
el estado de la variable y de la promesa almacenada en ella.

### Acciones

Finalmente se definen las acciones, encabezando la sección con un comentario
`// Actions`.  Las acciones tienen nombres estandarizados y deben definirse
con `function`.  Casi todas las acciones deben ser asíncronas, excepto las que
son específicas para manejar el almacén de datos.

Las acciones deben manejar el comportamiento para datos de prueba unicamente y
para uso de API unicamente, en función de la constante `USE_MOCK_DATA`.
Las acciones deben reemplazar elementos individuales completamente, modificando
las colecciones existentes (Array por ejemplo), o en su defecto reemplazar los
datos cuando se actualizan todos.

Defínanse en el siguiente orden relativo.  Es posible añadir algunas más pero debe
_evitarse_; estas adicionales pueden ubicarse en alguna posición conveniente,
pero si es de sólo almacén debe estar luego de las asíncronas.

- get: obtiene un elemento por su `id`.
- fetchOne: descarga un elemento desde la API y lo almacena.
- fetchAll: descarga todos los elementos desde la API y los almacena.
- add: añade un nuevo elemento.
- update: actualiza un elemento existente.
- getFromStore: obtiene un elemento por su `id` únicamente del almacén.
- saveToStore: guarda un elemento en el almacén, añadiéndolo o actualizándolo
  según corresponda.

### Retorno

Debe devolverse un objeto que contenga las definiciones en el orden por sección,
en una nueva línea por cada comienzo de sección.

## Notas

Reutilicen las funciones definidas en `./utils` y otros lugares en la medida de
lo razonable.  No modifiquen los almacenes ya definidos, tampoco el de `useAppStore`.
No modifiquen otros archivos sin permiso.

Dejen **dos** líneas vacías antes de los comentarios de encabezado de sección.

Cuando un almacén requiere hacer definiciones para varios tipos de datos,
deben hacerse todas las de un tipo de datos, y luego las del siguiente, sucesivamente,
dentro de las mismas secciones.  Ej:

```
// State

const supplies = ref([]);
const selectedSupplyId = ref(null);
const selectedBatchId = ref(null);

...

// Actions

function get(id) {
}

function fetchOne(id) {
}

...

function addBatch(supplyId, batch) {
}

# Para el desarrollo

## Servicios de API

Aquí deben definirse los servicios de API como una clase, tomando a `ownerService.js`
como ejemplo.  Deben definirse en el siguiente orden.

### Importaciones

- Cliente de API.
- Modelos.
- Utilidades (opcional).
- Otros.

### Constante de rutas base

Luego siguen las constantes de ruta base definidas con `const`.

### Métodos

Defínanse en el siguiente orden relativo.  Es posible añadir algunas más,
las cuales deben ubicarse luego de las generales.  No se tienen que definir
todos los métodos si no existen en la API.

Todas deben tomar la respuesta de la API en una variable `response` primero
y devolver un modelo en la medida de lo razonable.  Todos deben ser asíncronos
y estáticos.

- list: enumera todos los elementos. Hágase como en el ejemplo en la medida de lo
  razonable.
- get: obtiene un elemento por su `id`.
- create: crea un nuevo elemento.
- update: actualiza un elemento existente.
- delete: elimina un elemento.
- Variantes: con nombre prefijado del tipo de operación más una frase única
  representativa.

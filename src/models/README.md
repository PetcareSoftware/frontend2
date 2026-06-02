# Para el desarrollo

## Modelos de datos

Aquí se definen los objetos de modelos de datos de la aplicación, tomando como
ejemplo a `owner.js` y `pet.js`.  Los otros están definidos en su mayoría
pero les faltan métodos.  Debe hacerse como una clase en el siguiente orden.

### Importaciones

- Utilidades de modelos.
- Otros modelos (opcional).
- Otras utilidades (opcional).
- Otros.

### Atributos

Se enumeran los atributos en orden, uno por línea, inicializándolos con un valor
nulo del tipo que les corresponde.

### Constructor

Obtiene los argumentos por desestructuración.  Primero llama el constructor de la
clase base si la hay.  Luego asigna los parámetros a los atributos.

Debe asignar con `||` el valor ya presente en el atributo definido antes cuando
el atributo es requerido, y solo con el parámetro cuando no es requerido.

### validate

Debe primero usar el método de la clase base si la hay.  Luego realizar las
validaciones atributo por atributo, considerando si este es opcional.
En la medida de lo razonable debe ser como ya está hecho.
No hace falta comprobaciones exhaustivas porque eso es trabajo de backend.

### toApi

Debe tranformar el modelo del frontend al modelo de datos de la API,
**con todos sus atributos** según esté definido en el backend.

### fromApi

Debe transformar los datos de la API en el modelo del frontend y devolverlo
como un objeto de la clase.  El método debe ser estático.

### Variantes de Api

Son variantes que adaptan los datos producidos por los métodos anteriores para
que la API los acepte para algunas operaciones.

### equals

Compara dos objetos de la clase para determinar si son semejantes, y deberían
considerarse equivalentes o iguales (ej. usuario ya existente).

## Notas

Dejen una línea vacía antes del `return`.

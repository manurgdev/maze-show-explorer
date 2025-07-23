# Movie Explorer App

## Objetivo

Construir una pequeña aplicación web en React que consuma una API y permita explorar una lista de películas. Queremos que trates este mini proyecto como si lo fueses a poner en producción.

## Requisitos

El único requisito es el siguiente: de usarse alguna librería para gestión de estado, cosa totalmente opcional, por favor usar `@preact/signals-react`

## Instrucciones

Listado de películas:

- Muestra el título, imagen y resumen de cada show.
- Paginación o scroll infinito (mínimo 20 elementos visibles).

Detalle:

- Al hacer clic en una película, muestra una vista de detalle con más información.

Favoritos:

- El usuario puede marcar películas como favoritas (almacenado en localStorage).

Usa esta API pública de ejemplo `GET https://api.tvmaze.com/shows`.

Incluye un README explicando brevemente qué harías diferente con más tiempo.

## Entrega

Sube tu código a un repo de GitHub. Si es privado trendrás que darnos acceso (usuario ograu)

## Estructura del proyecto

```bash
correcto-fe-assingment/
├── src/
│   ├── components/
│   ├── config/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
```

Por el tipo de aplicación, he realizado una estructura de carpetas que me permite organizar el código de forma clara y sencilla, sin caer en sobreingeniería, separando algunos componentes en carpetas específicas, como por ejemplo los componentes de iconos, o los componentes de layout.

Por otro lado, he creado un directorio config para almacenar las constantes de la aplicación, como por ejemplo el número de elementos por página, o el umbral de scroll para cargar más elementos.

En el directorio de hooks he incorporado los 2 hooks que he utilizado en la aplicación. Generalmente cuando el proyecto crece suelo crear un directorio hooks por dominio, pero en este caso no lo vi necesario debido a la simplicidad de la aplicación.

En services va el fichero relativo a las peticiones externas, en este caso a la API de TV Maze. Aquí se añadirían otros servicios externos en caso de que la aplicación crezca.

En store se almacenan los estados de la aplicación, en este caso se ha utilizado `@preact/signals-react` para gestionar el estado de la aplicación.

Los tests se han almacenado en el directorio más cercano a los componentes que testean, para que sea más fácil de encontrar y entender, dentro de un directorio __tests__ para facilitar la comprensión de la estructura del proyecto.

Por último, he elegido utilizar Tailwind CSS para el diseño de la aplicación, ya que es una librería que me resulta muy cómoda y fácil de usar, y que me permite crear un diseño responsive y adaptativo de forma sencilla.

La elección de tema oscuro es algo puramente personal. En el apartado de NEXT STEPS he comentado una futura iteración para añadir un tema claro.

## NEXT STEPS

Leer [NEXTSTEPS.md](./NEXTSTEPS.md) para ver las próximas mejoras que se pueden realizar.

## Como ejecutar el proyecto en desarrollo

```bash
npm install
npm run dev

```
Acceder a http://localhost:5173/

## Como ejecutar los tests

```bash
npm run test:prod # Para ejecutar los tests en modo producción
npm run test # Para ejecutar los tests en modo watch
npm run test:coverage # Para ejecutar los tests con cobertura
```

## Como ejecutar el proyecto en producción

He incluido el adaptador de Vercel en el fichero `vite.config.ts` para que se pueda ejecutar en su infraestructura.

Si se quiere ejecutar en local, se puede hacer con los siguientes comandos:
```bash
npm run build
npm run preview
```
Acceder a http://localhost:4173/

## Enlace público

Dejo el enlace público de la aplicación alojada en Vercel: [https://show-explorer.manurg.dev/](https://show-explorer.manurg.dev/)

### ¿Por qué Vercel?

He elegido Vercel porque es donde alojo la mayoría de mis proyectos personales. Tiene una configuración relativamente sencilla y para este caso, usando vite, no hacía falta más que añadir el adaptador. Para alojar la aplicación en otro proveedor, simplemente se tendría que obtener el directorio dist y ejecutarlo en un entorno node, usando por ejemplo `pm2`.
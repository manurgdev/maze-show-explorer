# Siguientes pasos

Se solicita escribir un documento explicando brevemente qué haría con más tiempo disponible para desarrollar la aplicación.

## 1. Mejorar la navegación

- Dotar de una ruta a cada detalle de la serie, de forma que el usuario pueda navegar directamente a esta.
- Dotar de paginación por url, de forma que el usuario pueda navegar directamente a una página específica.

## 2. Mejorar la experiencia de usuario

- Implementar un sistema de favoritos persistente, para que el usuario pueda marcar series como favoritas y verlas en un listado separado en cualquier dispositivo.
- Desarrollar sistema de búsqueda por nombre / género / año.
- Implementar light / dark mode (actualmente me centré en un tema más oscuro por pura preferencia personal).
- Que los géneros de las tarjetas de las series sean clickables y lleven a una página de búsqueda por género.
- Obtener mediante los otros endpoints de la API más información de las series, como el reparto, series relacionadas, etc.

## 3. Dockerizar la aplicación

- Crear un Dockerfile para la aplicación para poder desplegarla en un contenedor en cualquier equipo sin provocar posibles conflictos de dependencias.

## 4. Reducir complejidad

- Reducir la complejidad de la aplicación, componentizando mejor en componentes más pequeños y reutilizables.
- Mejorar uso de signals de preact.

## 5. Nuevas funcionalidades

- Añadir un sistema de comentarios para que los usuarios puedan comentar las series.
- Añadir un sistema de votos para que los usuarios puedan votar las series.
- Añadir un sistema de recomendaciones para que los usuarios puedan recomendar series a otros usuarios.
- Añadir un sistema de notificaciones para que los usuarios puedan recibir notificaciones cuando una serie se añada a favoritos, etc.
- Como una futura iteración, los resultados de la API podrían volcarse en una base de datos propia, pudiendo realizar tareas como traducción de los datos, añadir slug a las series, etc.

## 6. Mejorar la cobertura de tests

- Aunque he añadido algunos tests, no he llegado a cubrir todos los casos (por ejemplo en ShowListInfinite) así como no he añadido tests e2e para validar el funcionamiento en un entorno funcional, más allá de mocks.

## 7. Mejorar estructura del proyecto

- Añadir una estructura más sólida para componentes, hooks, etc.
- Mejorar arquitectura de la aplicación, para que sea más fácil de mantener y escalar.

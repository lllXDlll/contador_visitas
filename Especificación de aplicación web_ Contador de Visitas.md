# Contador de Visitas

## 1. Objetivo

Construir una aplicación web sencilla que registre y muestre el número de visitas recibidas.

La aplicación debe utilizar:

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: PostgreSQL
- Caché: Redis
- Frontend: preparado para desplegarse en Vercel
- Backend: preparado para desplegarse en Render

La aplicación debe mantener los datos de forma permanente en PostgreSQL.

Redis se utilizará como caché para reducir consultas repetitivas a PostgreSQL.

No implementar funcionalidades que no sean necesarias para cumplir este objetivo.

---

## 2. Arquitectura

```text
                    USUARIO
                       |
                       v
                +-------------+
                |   Vercel    |
                | React/Vite  |
                +------+------+
                       |
                       | HTTPS
                       v
                +-------------+
                |   Render    |
                | Node/Express|
                +------+------+
                       |
                 +-----+-----+
                 |           |
                 v           v
            +---------+  +-----------+
            |  Redis  |  | PostgreSQL|
            | Upstash |  | Supabase  |
            +---------+  +-----------+
```

La arquitectura debe permitir ejecutar varias instancias del backend sin perder ni dividir el contador.

El backend no debe almacenar el contador en memoria.

---

# 3. Funcionalidad

La aplicación tendrá una única página.

Debe mostrar:

```text
+----------------------------------+
|        CONTADOR DE VISITAS       |
|                                  |
|             15,428               |
|         visitas totales          |
|                                  |
|             HOY                  |
|             1,247                |
|                                  |
|       [ ACTUALIZAR ]             |
+----------------------------------+
```

Cuando un usuario carga la página, se debe registrar una visita.

Después de registrar la visita, la aplicación debe mostrar el contador actualizado.

El botón `ACTUALIZAR` debe solicitar nuevamente las estadísticas al backend.

No implementar:

- autenticación;
- usuarios;
- roles;
- panel administrativo;
- registro;
- login;
- pagos;
- funcionalidades sociales;
- sistema de administración;
- pruebas automatizadas;
- funcionalidades adicionales no solicitadas.

---

# 4. Persistencia

Utilizar PostgreSQL como almacenamiento permanente.

Crear una tabla `visits`:

```sql
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Cada visita debe generar un registro.

Ejemplo:

```text
visits
------------------------------
id    visited_at
------------------------------
1     2026-09-23 18:00:01
2     2026-09-23 18:00:05
3     2026-09-23 18:00:12
```

PostgreSQL es la fuente principal de verdad.

Si Redis deja de funcionar, los registros de visitas deben permanecer disponibles en PostgreSQL.

---

# 5. Redis

Utilizar Redis únicamente como caché.

La clave principal será:

```text
visits:total
```

Ejemplo:

```text
visits:total = 15428
```

Cuando se registra una visita:

1. Insertar el registro en PostgreSQL.
2. Incrementar el contador de Redis.

Si Redis no contiene el contador, obtener el total desde PostgreSQL y almacenarlo nuevamente en Redis.

Redis nunca debe ser la única fuente de los datos.

---

# 6. API

Crear únicamente estos endpoints.

## POST /api/visits

Registra una visita.

Proceso:

```text
POST /api/visits
       |
       v
PostgreSQL
INSERT visita
       |
       v
Redis
INCR visits:total
```

Respuesta:

```json
{
  "success": true
}
```

---

## GET /api/visits

Devuelve el número total de visitas.

Proceso:

```text
GET /api/visits
       |
       v
     Redis
       |
       +---- existe ----> devolver contador
       |
       +---- no existe
                 |
                 v
             PostgreSQL
                 |
                 v
            guardar Redis
                 |
                 v
             devolver
```

Respuesta:

```json
{
  "total": 15428
}
```

---

# 7. Backend

Utilizar:

- Node.js
- Express
- PostgreSQL
- Redis

Usar una estructura sencilla:

```text
backend/
├── src/
│   ├── server.js
│   ├── routes/
│   │   └── visits.js
│   ├── controllers/
│   │   └── visitsController.js
│   ├── services/
│   │   └── visitsService.js
│   └── db/
│       ├── postgres.js
│       └── redis.js
├── package.json
├── .env.example
└── Dockerfile
```

No crear capas adicionales si no son necesarias.

---

# 8. Base de datos

Utilizar el paquete `pg`.

La conexión debe utilizar variables de entorno.

Ejemplo:

```env
DATABASE_URL=postgresql://...
```

No colocar credenciales directamente en el código.

El backend debe ejecutar la consulta necesaria para crear la tabla `visits` si todavía no existe.

Puede utilizarse:

```sql
CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

# 9. Redis

Utilizar un cliente Redis compatible con Redis administrado.

El código debe obtener las credenciales mediante variables de entorno.

Ejemplo:

```env
REDIS_URL=...
```

La implementación debe permitir utilizar tanto un Redis local como un Redis administrado.

Para producción se utilizará Upstash Redis.

---

# 10. Manejo de Redis

Redis debe utilizarse como caché y no como almacenamiento permanente.

Si Redis está disponible:

```text
GET /api/visits
        |
        v
      Redis
        |
        v
     contador
```

Si Redis no contiene el valor:

```text
Redis
  |
  | MISS
  v
PostgreSQL
  |
  v
COUNT(*)
  |
  +----> Redis
  |
  +----> respuesta
```

Si Redis presenta un error, el backend debe poder obtener el contador desde PostgreSQL.

La aplicación no debe perder los datos porque Redis no esté disponible.

---

# 11. Frontend

Utilizar:

- React
- Vite

Crear una única página.

La interfaz debe contener:

```text
CONTADOR DE VISITAS

15,428

Visitas totales

[ Actualizar ]
```

Cuando la página se carga:

1. Enviar `POST /api/visits`.
2. Solicitar `GET /api/visits`.
3. Mostrar el resultado.

El botón `Actualizar` debe ejecutar:

```text
GET /api/visits
```

No registrar una nueva visita al pulsar el botón de actualización.

---

# 12. Comunicación frontend/backend

Utilizar una variable de entorno:

```env
VITE_API_URL=http://localhost:3000
```

Las solicitudes deben construirse utilizando esta variable.

En producción se cambiará por la URL pública de Render:

```env
VITE_API_URL=https://<backend-render>.onrender.com
```

No escribir la URL de producción directamente en el código.

---

# 13. CORS

El backend debe permitir las solicitudes del frontend.

Durante desarrollo:

```text
http://localhost:5173
```

En producción se configurará la URL de Vercel mediante una variable de entorno.

Ejemplo:

```env
FRONTEND_URL=http://localhost:5173
```

No utilizar `*` como configuración permanente.

---

# 14. Escalabilidad

El backend debe ser stateless.

No utilizar un contador almacenado en una variable de Node.js:

```javascript
let counter = 0;
```

El estado debe almacenarse externamente:

```text
PostgreSQL = persistencia
Redis = caché
```

Esto permitirá ejecutar varias instancias:

```text
              Render
                 |
        +--------+--------+
        |        |        |
        v        v        v
      API #1   API #2   API #3
        |        |        |
        +--------+--------+
                 |
          +------+------+
          |             |
          v             v
        Redis       PostgreSQL
```

Todas las instancias deben utilizar el mismo Redis y la misma base de datos.

---

# 15. Variables de entorno

Backend:

```env
PORT=3000
DATABASE_URL=
REDIS_URL=
FRONTEND_URL=
```

Frontend:

```env
VITE_API_URL=
```

Crear archivos `.env.example`.

No incluir credenciales reales en el repositorio.

---

# 16. Despliegue

## Frontend

Preparar el proyecto para Vercel.

Configuración:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Utilizar:

```env
VITE_API_URL=https://backend.onrender.com
```

---

## Backend

Preparar el proyecto para Render.

El servidor debe utilizar:

```javascript
const PORT = process.env.PORT || 3000;
```

y escuchar en:

```text
0.0.0.0
```

El backend debe poder iniciarse mediante:

```text
npm start
```

---

## PostgreSQL

La aplicación debe poder conectarse a una instancia PostgreSQL administrada.

En producción se utilizará Supabase.

La URL de conexión será proporcionada mediante:

```env
DATABASE_URL=
```

---

## Redis

En producción se utilizará Upstash Redis.

La conexión se configurará mediante:

```env
REDIS_URL=
```

---

# 17. Desarrollo local

La aplicación debe poder ejecutarse localmente:

```text
Frontend
localhost:5173

Backend
localhost:3000
```

Arquitectura local:

```text
React
  |
  v
Node/Express
  |
  +---- PostgreSQL
  |
  +---- Redis
```

PostgreSQL y Redis pueden ejecutarse mediante Docker Compose durante el desarrollo.

---

# 18. Docker

Crear un `Dockerfile` únicamente para el backend.

El contenedor debe:

1. Utilizar una imagen oficial de Node.js.
2. Instalar dependencias.
3. Copiar el código.
4. Exponer el puerto.
5. Ejecutar `npm start`.

No crear contenedores innecesarios para frontend, PostgreSQL o Redis si no son necesarios para el despliegue.

---

# 19. Requisitos finales

La aplicación terminada debe permitir:

- Registrar visitas.
- Persistir cada visita en PostgreSQL.
- Obtener el número total de visitas.
- Utilizar Redis como caché.
- Recuperar el contador desde PostgreSQL si Redis no tiene el valor.
- Ejecutarse sin estado local en el backend.
- Ejecutarse con múltiples instancias del backend.
- Desplegar el frontend en Vercel.
- Desplegar el backend en Render.
- Utilizar Supabase como PostgreSQL.
- Utilizar Upstash como Redis.

La implementación debe mantenerse deliberadamente sencilla.

No agregar funcionalidades, dependencias, servicios, endpoints o capas arquitectónicas que no sean necesarias para cumplir estos requisitos.
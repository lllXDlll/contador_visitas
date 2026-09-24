# Contador de Visitas 🚀

Aplicación web *Stateless* full-stack de alto rendimiento diseñada para registrar y mostrar el número de visitas en tiempo real. 

Utiliza **PostgreSQL** como almacenamiento persistente principal (Fuente de Verdad) y **Redis** como capa de caché de ultra-baja latencia.

---

## 📐 Arquitectura

```text
                       USUARIO
                          |
                          v
                 +-----------------+
                 |     Vercel      |
                 | (Frontend React)|
                 +--------+--------+
                          |
                          | HTTPS
                          v
                 +-----------------+
                 |     Render      |
                 | (Backend Node)  |
                 +--------+--------+
                          |
                  +-------+-------+
                  |               |
                  v               v
             +---------+    +------------+
             | Upstash |    |  Supabase  |
             |  Redis  |    | PostgreSQL |
             +---------+    +------------+
```

### Principios de Diseño
- **Stateless Backend**: El servidor backend no mantiene estado en memoria local, lo que permite escalar horizontalmente múltiples instancias de la API sin desincronizar el contador.
- **Fall-back Resiliente**: Si la memoria caché (Redis) se desconecta o falla, el backend continúa funcionando sin interrupciones consultando directamente a PostgreSQL.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Vite, Lucide Icons, CSS3 Moderno
- **Backend**: Node.js, Express, `pg` (PostgreSQL client), `ioredis`
- **Persistencia**: PostgreSQL (Supabase en Producción)
- **Caché**: Redis (Upstash Redis en Producción)
- **Contenedores y Despliegue**: Docker, Docker Compose, Render, Vercel

---

## ⚙️ Variables de Entorno

### Backend (`/backend/.env`)

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/visits_db
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
```

### Frontend (`/frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

---

## 💻 Desarrollo Local

### Prerrequisitos
- Node.js (v18+)
- Docker y Docker Compose

### 1. Iniciar Base de Datos y Caché con Docker Compose

```bash
docker-compose up -d
```

Esto iniciará una instancia de **PostgreSQL** en el puerto `5432` y **Redis** en el puerto `6379`.

### 2. Iniciar Backend

```bash
cd backend
npm install
npm run dev
```
El servidor backend se iniciará en `http://localhost:3000`.

### 3. Iniciar Frontend

```bash
cd frontend
npm install
npm run dev
```
La aplicación web estará disponible en `http://localhost:5173`.

---

## 🌐 Guía de Despliegue en Producción

### 1. Base de Datos PostgreSQL en **Supabase**
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve a **Project Settings > Database > Connection String (URI)**.
3. Copia tu URL de conexión:
   `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`

### 2. Caché Redis en **Upstash**
1. Crea una base de datos Redis en [Upstash](https://upstash.com).
2. Copia la URL de conexión SSL (`rediss://`):
   `rediss://default:[PASSWORD]@[HOST].upstash.io:6379`

### 3. Backend en **Render**
1. Crea un **Web Service** en [Render](https://render.com) conectado a tu repositorio.
2. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Agrega las Variables de Entorno:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `DATABASE_URL`: *(Tu URL de Supabase)*
   - `REDIS_URL`: *(Tu URL de Upstash)*
   - `FRONTEND_URL`: `https://tu-app-frontend.vercel.app`

### 4. Frontend en **Vercel**
1. Importa tu repositorio en [Vercel](https://vercel.com).
2. Configura:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
3. Agrega la Variable de Entorno:
   - `VITE_API_URL`: `https://tu-backend.onrender.com`
4. Despliega el proyecto.

---

## 📄 Licencia

MIT License.

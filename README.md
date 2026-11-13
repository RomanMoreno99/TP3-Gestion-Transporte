# Gestión de Transporte. 

Aplicación web para administrar una flota de transporte. Permite gestionar vehículos, conductores y viajes, consultar historiales y calcular kilómetros recorridos. Incluye registro e inicio de sesión de usuarios.

## Tecnologías

- **Frontend:** React 19 y Vite
- **Backend:** Node.js, Express y Passport JWT
- **Base de datos:** MySQL

## Funcionalidades

- Registro e inicio de sesión con autenticación JWT.
- Alta, consulta, edición y eliminación de vehículos.
- Alta, consulta, edición y eliminación de conductores.
- Registro de viajes asociando un vehículo y un conductor.
- Consulta del historial de viajes y cálculo de kilómetros por vehículo o conductor.

## Requisitos

- Node.js y npm.
- MySQL.
- Git, para clonar el repositorio.

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/RomanMoreno99/TP3-Gestion-Transporte.git
cd TP3-Gestion-Transporte
```

### 2. Crear la base de datos

Ejecutá el script `database/schema.sql` en MySQL. Por ejemplo, desde la raíz del proyecto:

```bash
mysql -u root -p < database/schema.sql
```

El script crea la base `gestion_transporte` y las tablas necesarias.

### 3. Configurar y ejecutar el backend

Creá el archivo `backend/.env` con tus datos de conexión a MySQL y una clave secreta para JWT:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_clave_de_mysql
DB_NAME=gestion_transporte
JWT_SECRET=una_clave_secreta_larga_y_privada
JWT_EXPIRES_IN=4h
```

No compartas ni subas el archivo `.env` al repositorio. Luego, en una terminal:

```bash
cd backend
npm install
npm run dev
```

El servidor queda disponible en `http://localhost:3000`. Para iniciarlo sin modo de desarrollo, usá `npm start`.

### 4. Configurar y ejecutar el frontend

En otra terminal, desde la raíz del repositorio:

```bash
cd frontend
npm install
```

El archivo `frontend/.env.example` contiene la configuración de ejemplo. Para usar la API local, creá `frontend/.env` con:

```env
VITE_API_URL=http://localhost:3000/api
```

Luego iniciá el frontend:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir en el navegador.

## Compilar y revisar el frontend

Desde `frontend/`:

```bash
npm run build
npm run lint
```

## API

La API tiene como prefijo `/api`. Las rutas de vehículos, conductores y viajes requieren autenticación mediante token JWT.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Registrar un usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET`, `POST` | `/api/vehiculos` | Listar o crear vehículos |
| `GET`, `PUT`, `DELETE` | `/api/vehiculos/:id` | Consultar, actualizar o eliminar un vehículo |
| `GET`, `POST` | `/api/conductores` | Listar o crear conductores |
| `GET`, `PUT`, `DELETE` | `/api/conductores/:id` | Consultar, actualizar o eliminar un conductor |
| `GET`, `POST` | `/api/viajes` | Listar o registrar viajes |
| `GET` | `/api/viajes/vehiculo/:id` | Consultar viajes por vehículo |
| `GET` | `/api/viajes/conductor/:id` | Consultar viajes por conductor |
| `GET` | `/api/viajes/total/vehiculo/:id` | Calcular kilómetros por vehículo |
| `GET` | `/api/viajes/total/conductor/:id` | Calcular kilómetros por conductor |

Para las rutas protegidas, enviá el token en el encabezado:

```http
Authorization: Bearer <token>
```

## Estructura del proyecto

```text
.
├── backend/       # API REST en Express
├── database/      # Esquema SQL de MySQL
└── frontend/      # Aplicación React con Vite
```

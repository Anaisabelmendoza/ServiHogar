# 🏠 ServiHogar - API Backend

Este repositorio contiene el backend de **ServiHogar**, una plataforma móvil de servicios para el hogar. El backend está construido utilizando **Laravel 11** y sirve como una API REST robusta para alimentar la aplicación móvil (desarrollada en Angular/Ionic).

La base de datos del entorno de producción está gestionada en la nube mediante **Aiven (PostgreSQL)**, y el hosting se realiza en **Render**, lo que permite una infraestructura escalable, segura y siempre disponible.

---

## 🚀 Tecnologías Principales

* **Framework:** [Laravel 11.x](https://laravel.com) (PHP 8.2+)
* **Base de Datos:** PostgreSQL / SQLite (según el entorno)
* **Autenticación:** Laravel Sanctum (Tokens seguros)
* **Despliegue y Cloud:** 
  * **Backend Hosting:** Render
  * **Base de Datos Gestionada:** Aiven (PostgreSQL Cloud)
  * **Acceso Seguro Externo:** Ngrok / túneles HTTP

---

## 🛠️ Requisitos del Sistema

Antes de iniciar la instalación, asegúrate de tener instalado:
* **PHP:** Versión `8.2` o superior.
* **Composer:** Gestor de dependencias de PHP.
* **Base de Datos:** SQLite localmente o credenciales para PostgreSQL.

---

## 📦 Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo localmente:

### 1. Clonar e Instalar Dependencias
Accede al directorio del backend y ejecuta el instalador de dependencias:
```bash
composer install
```

### 2. Configurar el Archivo de Entorno
Copia el archivo `.env.example` para crear tu configuración local `.env`:
```bash
cp .env.example .env
```

Abre el archivo `.env` recién creado y ajusta los valores de base de datos según tu preferencia local (por defecto usa `sqlite` para simplificar):
```env
DB_CONNECTION=sqlite
# Si deseas usar PostgreSQL local o la nube de Aiven, configúralo de este modo:
# DB_CONNECTION=pgsql
# DB_HOST=tu-host-de-aiven.aivencloud.com
# DB_PORT=25244
# DB_DATABASE=servihogar
# DB_USERNAME=avnadmin
# DB_PASSWORD=tu_contraseña_aiven
```

### 3. Generar la Clave de Aplicación
Crea la clave única de encriptación de Laravel:
```bash
php artisan key:generate
```

### 4. Ejecutar las Migraciones y Seeders
Crea la estructura de tablas inicial:
```bash
php artisan migrate
```

Si deseas cargar datos de prueba para realizar simulaciones:
```bash
php artisan db:seed
```

### 5. Iniciar el Servidor de Desarrollo
Levanta el servidor local de Laravel:
```bash
php artisan serve
```
El backend estará disponible localmente en `http://127.0.0.1:8000`.

---

## 📡 Documentación de Rutas de la API

Todas las llamadas a la API deben usar el prefijo `/api` (ej. `http://127.0.0.1:8000/api/login`).

### 🔓 Rutas Públicas (Autenticación y Registro)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Registro de nuevos usuarios (Clientes / Profesionales) |
| `POST` | `/api/login` | Inicio de sesión (Retorna el token Sanctum de acceso) |
| `POST` | `/api/forgot-password` | Envío de correo electrónico para recuperación de contraseña |
| `POST` | `/api/reset-password` | Restablecimiento de contraseña utilizando el token de verificación |

### 🔒 Rutas Protegidas (Requieren encabezado `Authorization: Bearer <token>`)

#### 👤 Gestión de Usuario y Perfil
* `GET /api/user` — Obtiene los datos del usuario autenticado.
* `POST /api/user/profile` — Actualiza la información del perfil del usuario.

#### 💼 Rutas de Citas y Servicios (Clientes y Trabajadores)
* `GET /api/workers` — Busca y filtra trabajadores por profesión seleccionada.
* `POST /api/service-requests` — Crea una nueva solicitud de servicio (Cita).
* `GET /api/worker/requests` — Obtiene las solicitudes activas de un profesional.
* `POST /api/worker/requests/{id}/status` — Actualiza el estado de una solicitud (Ej. aceptada, en camino, finalizada).
* `GET /api/worker/history` — Historial de citas realizadas por el profesional.
* `GET /api/client/history` — Historial de citas solicitadas por el cliente.
* `POST /api/service-requests/{id}/invoice` — Carga y actualiza los datos de la factura/presupuesto del servicio.
* `POST /api/service-requests/{id}/review` — Envía una valoración/reseña para el servicio finalizado.
* `POST /api/worker/toggle-active` — Cambia el estado de disponibilidad del profesional (Activo/Inactivo).
* `POST /api/worker/location` — Actualiza las coordenadas geográficas de ubicación en tiempo real del profesional.
* `GET /api/service-requests/{id}/tracking` — Retorna los datos de rastreo geográfico para un servicio en curso.

#### ⚠️ Gestión de Incidentes
* `POST /api/incidents` — Reporta un problema o incidente relacionado con un servicio específico.

---

## 🐳 Despliegue en Render y Docker

El proyecto incluye un `Dockerfile` optimizado para entornos de producción. Al desplegar en **Render**:
1. Conecta este repositorio.
2. Render detectará automáticamente el archivo de configuración `Dockerfile` y compilará la imagen.
3. Asegúrate de añadir las variables de entorno en Render (`DATABASE_URL`, `APP_KEY`, etc.).

---

## 📄 Licencia

Este software es propiedad privada para el proyecto **ServiHogar** y está bajo licencia propietaria. Todos los derechos reservados.

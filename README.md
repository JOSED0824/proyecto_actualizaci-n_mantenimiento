# PeluCan Spa

Sistema de gestión para clínica veterinaria/spa canino. Permite administrar dueños, mascotas, citas y historial clínico con control de acceso por roles.

![Node.js](https://img.shields.io/badge/Node.js-18-green)
![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7)
![CI/CD](https://github.com/JOSED0824/proyecto_actualizaci-n_mantenimiento/actions/workflows/ci.yml/badge.svg)

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 18 |
| Framework | Express 5 |
| Vistas | EJS + express-ejs-layouts |
| Base de datos | SQLite3 (archivo persistente) |
| Sesiones | express-session |
| Logging | Morgan |
| Despliegue | Render |

---

## Instalación local

```bash
git clone https://github.com/JOSED0824/proyecto_actualizaci-n_mantenimiento.git
cd proyecto_actualizaci-n_mantenimiento
npm install
node index.js
```

La app queda disponible en `http://localhost:3000`.

Opcionalmente, copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

---

## CI/CD

El pipeline está definido en `.github/workflows/ci.yml` y consta de dos stages:

| Stage | Trigger | Descripción |
|-------|---------|-------------|
| **test** | push y pull_request a `main` | Instala dependencias y ejecuta `npm test` |
| **deploy** | push a `main` (solo si test pasa) | Dispara el deploy hook de Render via `curl` |

El secret `RENDER_DEPLOY_HOOK_URL` debe configurarse en **Settings → Secrets → Actions** del repositorio de GitHub.

---

## Despliegue

[Ver app en producción](https://proyecto-actualizaci-n-mantenimiento.onrender.com)

La configuración de Render está en `render.yaml`. La base de datos SQLite se persiste en un disco montado en `/opt/render/project/src/data`.

---

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Veterinario |
| `recepcion` | `recep123` | Recepcionista |

---

## Resumen de Sprints

| Sprint | Historia de Usuario | Descripción |
|--------|---------------------|-------------|
| 1 | HU-01 | Reingeniería de BD normalizada (Owners, Pets, Appointments) |
| 2 | HU-02 | Desacoplamiento MVC, constantes vitales y tema oscuro |
| 3 | HU-03 | Autenticación, roles y rutas protegidas |
| 4 | HU-04 | Módulo de historial clínico con timeline por mascota |
| 5 | HU-05 | Despliegue e integración continua en Render |

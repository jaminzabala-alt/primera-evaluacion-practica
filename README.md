# Primera Evaluación Práctica — API Gateway y Microservicios

Solución evaluable: **NestJS + TypeScript + PostgreSQL + Docker**.

El código Express de la raíz (`server.js`, `src/`, `package.json` raíz) es **legado**. No forma parte de la solución evaluable de este examen.

## Descripción del dominio de negocio

El dominio es la **gestión de órdenes de venta**. El sistema permite crear, consultar, actualizar y eliminar órdenes con cliente, producto, cantidad, precio unitario y estado.

El acceso externo no llega directo al microservicio ni a la base de datos de aplicación: el cliente habla solo con el **API Gateway**, que reenvía las peticiones al **Orders Service**, y este persiste en **PostgreSQL**.

## Objetivo

Exponer un único punto de entrada HTTP (API Gateway) que:

- Aplique CORS, logging centralizado y rate limiting.
- Haga de proxy inverso hacia el microservicio de órdenes.
- Deje el backend NestJS interno en la red Docker.
- Persista un CRUD completo de órdenes en PostgreSQL.
- Se orqueste con Docker Compose (Gateway + Backend + PostgreSQL).

## Arquitectura general

```text
Cliente
   │
   ▼
API Gateway (NestJS, puerto 3000)
   │  proxy inverso  /api/orders  →  /orders
   │  proxy de Swagger            →  /api/docs
   ▼
Orders Service (NestJS, puerto interno 3001)
   │
   ▼
PostgreSQL (puerto interno 5432)
```

Flujo: **Cliente → API Gateway → Orders Service → PostgreSQL**.

El backend **no publica puerto al host**. Solo el Gateway expone HTTP de la API en `localhost:3000`. PostgreSQL publica `5432` para administración local; las peticiones de negocio no van a Postgres ni al Orders Service desde fuera de Docker.

## Tecnologías utilizadas

- NestJS 10 + TypeScript
- API Gateway independiente (`api-gateway`)
- Microservicio de órdenes (`orders-service`)
- TypeORM + `pg` + PostgreSQL 16
- DTOs con `class-validator` / `class-transformer`
- Swagger (`@nestjs/swagger`)
- Rate limiting (`@nestjs/throttler`)
- CORS nativo de NestJS
- Logging en el Gateway (middleware + interceptor)
- Docker + Docker Compose (red `bridge`)
- Colección Postman y `requests.http`

## API Gateway

`api-gateway` es una aplicación NestJS independiente. Es el único punto de entrada HTTP de la API.

Responsabilidades:

- Recibir tráfico en el puerto `3000`.
- CORS.
- Rate limiting global.
- Logging centralizado de cada petición.
- Health check propio (`GET /health`).
- Reenviar CRUD de órdenes a `orders-service`.
- Exponer Swagger del backend en `http://localhost:3000/api/docs`.

No persiste órdenes. No se conecta a PostgreSQL.

## Proxy inverso

El Gateway actúa como **proxy inverso**:

- Las rutas `/api/orders` y `/api/orders/:id` se reescriben a `/orders` y `/orders/:id` en el microservicio (`ORDERS_SERVICE_URL`).
- Se reenvían método HTTP, cuerpo y cabecera `content-type`.
- Swagger (`/api/docs` y `/api/docs-json`) se proxifica hacia el backend.

El cliente nunca necesita conocer el host interno `orders-service:3001`.

## CORS

CORS está habilitado con `app.enableCors()` en el Gateway (y también en el backend, por si se prueba de forma local). El navegador u otras origins pueden llamar al Gateway sin bloqueo de origen cruzado en esta práctica.

## Logging

El logging está **centralizado en el Gateway**:

- Middleware `RequestLoggingMiddleware` para todas las rutas.
- Interceptor global `LoggingInterceptor`.

Cada petición registra método, URL, código HTTP y duración en milisegundos. Para verlo en Docker:

```bash
docker compose logs gateway
```

## Rate Limiting

El Gateway usa `@nestjs/throttler` con un guard global (`ThrottlerGuard`):

- Ventana: 60 segundos (`ttl: 60000`)
- Límite: 30 peticiones por ventana

Si se supera el límite, NestJS responde **429 Too Many Requests**.

## Microservicio NestJS (Orders Service)

`orders-service` es el backend de negocio:

- CRUD de la entidad `Order`.
- PostgreSQL mediante TypeORM.
- DTOs de creación y actualización.
- Capa de repositorio.
- Inyección de dependencias.
- Swagger en `/api/docs`.
- Health check en `/health`.
- Filtro global de excepciones.

En Docker escucha en `3001` **solo dentro de la red** `exam-network`.

## DTO, Repository y Dependency Injection

**DTOs.** `CreateOrderDto` valida `customerName`, `product`, `quantity`, `unitPrice` y `status` opcional. `UpdateOrderDto` es un `PartialType` del DTO de creación. El `ValidationPipe` global aplica `whitelist`, `forbidNonWhitelisted` y `transform`.

**Repository.** `OrdersRepository` encapsula TypeORM (`Repository<Order>`): create, save, findAll, findById, merge y remove. El servicio no habla con la base de datos en crudo.

**Dependency Injection.** NestJS inyecta `OrdersRepository` en `OrdersService`, `OrdersService` en `OrdersController`, y en el Gateway inyecta `ProxyService`, `HttpService` y `ConfigService`.

## PostgreSQL

- Imagen: `postgres:16-alpine`
- Base: `orders_db` (configurable)
- TypeORM con `synchronize: true` crea/actualiza la tabla `orders` al arrancar el microservicio
- Entidad: UUID, cliente, producto, cantidad, precio, estado, `createdAt`, `updatedAt`
- Healthcheck: `pg_isready`

El microservicio espera a que Postgres esté **healthy** (`depends_on` + `condition: service_healthy`).

## Docker

`docker-compose.yml` orquesta tres servicios:

| Servicio | Contenedor | Rol |
| --- | --- | --- |
| `gateway` | `exam-gateway` | Único HTTP público de la API (`3000`) |
| `orders-service` | `exam-orders-service` | Backend interno (`3001` con `expose`) |
| `postgres` | `exam-postgres` | Base de datos |

- Red `exam-network` con driver **bridge**
- `depends_on` con condición de salud
- `healthcheck` en los tres servicios
- Dockerfiles multi-stage en `api-gateway/` y `orders-service/`

## Estructura del proyecto

```text
.
├── api-gateway/                 # Solución evaluable: API Gateway NestJS
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── health.controller.ts
│       ├── proxy/
│       └── common/
├── orders-service/              # Solución evaluable: microservicio NestJS
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── health.controller.ts
│       └── orders/
│           ├── dto/
│           ├── entities/
│           ├── orders.controller.ts
│           ├── orders.service.ts
│           └── orders.repository.ts
├── docker-compose.yml
├── .env.example
├── README.md
├── postman_collection.json
├── requests.http
│
├── server.js                    # Legado Express (no evaluable)
├── src/                         # Legado Express (no evaluable)
└── package.json                 # Legado Express (no evaluable)
```

## Requisitos previos

- Git
- Docker Desktop (o Docker Engine + Compose v2)
- Node.js 20+ (solo si se ejecuta fuera de Docker)
- Opcional: Postman, o la extensión REST Client en Cursor/VS Code

## Instrucciones para clonar

```bash
git clone <url-del-repositorio>
cd primera-evaluacion-practica
```

Rama de trabajo recomendada: `develop`. La rama estable es `main`.

## Configuración del `.env`

Copia el ejemplo y ajusta valores locales si hace falta:

```bash
cp .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Variables relevantes:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_DB=orders_db
POSTGRES_PORT=5432
BACKEND_PORT=3001
GATEWAY_PORT=3000
ORDERS_SERVICE_URL=http://localhost:3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

En Docker Compose, el Gateway usa `http://orders-service:3001` y el backend usa `DATABASE_HOST=postgres`. No subas `.env` a GitHub (está en `.gitignore`).

## Cómo levantar el proyecto

Desde la raíz del repositorio:

```bash
docker compose up --build
```

En segundo plano:

```bash
docker compose up --build -d
```

Detener y quitar contenedores:

```bash
docker compose down
```

Para borrar también el volumen de Postgres:

```bash
docker compose down -v
```

## URLs disponibles

| Recurso | URL |
| --- | --- |
| Gateway | http://localhost:3000 |
| Health del Gateway | http://localhost:3000/health |
| Swagger a través del Gateway | http://localhost:3000/api/docs |
| CRUD de órdenes (vía Gateway) | http://localhost:3000/api/orders |

El health del backend existe en `/health` **dentro** de la red Docker (`orders-service:3001`). No está publicado en el host.

## Endpoints (siempre a través del Gateway)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | Estado del API Gateway |
| GET | `/api/docs` | Swagger UI del microservicio (proxificado) |
| POST | `/api/orders` | Crear una orden |
| GET | `/api/orders` | Listar órdenes |
| GET | `/api/orders/:id` | Obtener una orden por UUID |
| PATCH | `/api/orders/:id` | Actualizar una orden |
| DELETE | `/api/orders/:id` | Eliminar una orden |

## Ejemplos JSON

**Crear (`POST /api/orders`):**

```json
{
  "customerName": "Cliente Prueba",
  "product": "Laptop",
  "quantity": 2,
  "unitPrice": 3500,
  "status": "pending"
}
```

**Actualizar (`PATCH /api/orders/:id`):**

```json
{
  "status": "completed"
}
```

Respuesta de health:

```json
{
  "status": "ok",
  "service": "api-gateway"
}
```

## Ejemplos cURL

```bash
curl http://localhost:3000/health
```

```bash
curl -X POST http://localhost:3000/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"customerName\":\"Cliente Prueba\",\"product\":\"Laptop\",\"quantity\":2,\"unitPrice\":3500,\"status\":\"pending\"}"
```

En bash/macOS/Linux:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Cliente Prueba","product":"Laptop","quantity":2,"unitPrice":3500,"status":"pending"}'
```

```bash
curl http://localhost:3000/api/orders
curl http://localhost:3000/api/orders/<UUID>
```

```bash
curl -X PATCH http://localhost:3000/api/orders/<UUID> \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

```bash
curl -X DELETE http://localhost:3000/api/orders/<UUID>
```

## Healthchecks

Compose define `healthcheck` en:

- **postgres:** `pg_isready`
- **orders-service:** `GET http://localhost:3001/health`
- **gateway:** `GET http://localhost:3000/health`

El Gateway espera a que el microservicio esté healthy; el microservicio espera a que Postgres esté healthy.

## Logs

```bash
docker compose logs gateway
docker compose logs orders-service
docker compose logs postgres
```

Seguir en vivo:

```bash
docker compose logs -f gateway
```

## Único punto de entrada HTTP de la API

- El servicio `gateway` publica `3000:3000`.
- `orders-service` usa `expose: "3001"` (red interna, sin puerto en el host).
- Toda la API de órdenes se consume como `http://localhost:3000/api/orders`.
- Swagger se abre en `http://localhost:3000/api/docs`, no en el puerto 3001.

## Git Flow

Ramas:

| Rama | Uso |
| --- | --- |
| `main` | Producción / entrega estable |
| `develop` | Integración del trabajo en curso |
| `feature/*` | Una funcionalidad por rama |

Flujo:

1. Trabajar desde `develop`.
2. Crear `feature/nombre-corto` para cada cambio.
3. Fusionar la feature en `develop`.
4. Cuando la entrega esté lista, fusionar `develop` en `main`.

Ejemplo:

```bash
git checkout develop
git checkout -b feature/actualizar-documentacion
# ... cambios ...
git add .
git commit -m "docs: update README and API documentation"
git checkout develop
git merge feature/actualizar-documentacion
git checkout main
git merge develop
```

No se hace `push` en estas instrucciones de práctica local hasta que el docente o el autor lo indiquen.

## Cómo probar con Postman

1. Importa `postman_collection.json`.
2. Variable de colección `baseUrl` = `http://localhost:3000`.
3. Ejecuta en este orden:
   - `GET /health`
   - `POST /api/orders` (el test script guarda `orderId`)
   - `GET /api/orders`
   - `GET /api/orders/:id`
   - `PATCH /api/orders/:id`
   - `DELETE /api/orders/:id`

Levanta primero el stack con `docker compose up --build`.

## Swagger

El microservicio genera OpenAPI con `@nestjs/swagger` en `/api/docs`.

A través del Gateway (forma correcta de probarlo):

**http://localhost:3000/api/docs**

Ahí puedes ejecutar el CRUD de `/orders` contra el backend. Recuerda que, desde fuera de Docker, el cliente real del examen es el Gateway (`/api/orders`).

## Nota sobre el código Express legado

La raíz todavía contiene una API **Express + Northwind** (`server.js`, `src/controllers`, `src/routes`, etc.). Se conserva como referencia histórica de otra cuenta/trabajo.

**No es la solución evaluable.** No uses `npm start` de la raíz para este examen. La entrega es NestJS + Docker: `api-gateway`, `orders-service` y `docker-compose.yml`.

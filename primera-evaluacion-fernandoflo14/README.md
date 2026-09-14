# API REST Northwind - Generación de Órdenes

API REST desarrollada con Express.js y PostgreSQL para consultar datos de Northwind y generar órdenes de venta de manera validada y transaccional.

## Tecnologías

- Node.js
- Express.js
- PostgreSQL
- pg
- dotenv
- cors
- helmet
- nodemon
- REST Client

## Requisitos

- Node.js
- npm
- PostgreSQL
- Base de datos Northwind restaurada

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/FernandoFlo14/primera-evaluacion-practica.git
```

Entrar al proyecto:

```bash
cd primera-evaluacion-practica
```

Instalar dependencias:

```bash
npm install
```

## Configuración

Crear un archivo `.env` basado en `.env.example`.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=NorthWind
```

El archivo `.env` contiene credenciales locales y no debe subirse a GitHub.

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Servidor:

```text
http://localhost:3000
```

## Estructura

```text
src/
├── config/
│   └── database.js
├── controllers/
│   ├── customer.controller.js
│   ├── employee.controller.js
│   ├── order.controller.js
│   └── product.controller.js
├── middlewares/
│   └── error.middleware.js
├── routes/
│   ├── customer.routes.js
│   ├── employee.routes.js
│   ├── order.routes.js
│   └── product.routes.js
├── services/
│   ├── customer.service.js
│   ├── employee.service.js
│   ├── order-validation.service.js
│   ├── order.service.js
│   └── product.service.js
├── app.js
└── server.js
```

## Endpoints

### Clientes

```http
GET /customers
```

Filtro opcional:

```http
GET /customers?search=alfred
```

### Empleados

```http
GET /employees
```

### Productos

```http
GET /products
```

Solo productos con stock:

```http
GET /products?available=true
```

### Consultar una orden

```http
GET /orders/:id
```

Ejemplo:

```http
GET /orders/11078
```

### Crear una orden

```http
POST /orders
Content-Type: application/json
```

Ejemplo:

```json
{
  "customer_id": "ALFKI",
  "employee_id": 1,
  "order_date": "2026-09-13",
  "required_date": "2026-09-20",
  "products": [
    {
      "product_id": 3,
      "quantity": 1,
      "discount": 0
    },
    {
      "product_id": 40,
      "quantity": 1,
      "discount": 0.1
    }
  ]
}
```

Una creación correcta responde:

```text
201 Created
```

## Validaciones

La API valida:

- existencia del cliente;
- existencia del empleado;
- existencia de los productos;
- cantidades mayores a cero;
- productos no descontinuados;
- inventario suficiente;
- descuentos entre 0 y 1;
- fechas válidas;
- lista de productos no vacía;
- productos no duplicados.

## Transacciones

La creación de órdenes se realiza dentro de una transacción PostgreSQL:

```text
BEGIN
  ├── Validar cliente
  ├── Validar empleado
  ├── Bloquear y validar productos
  ├── Generar order_id
  ├── INSERT orders
  ├── INSERT order_details
  ├── Actualizar inventario
COMMIT
```

Ante cualquier error:

```text
ROLLBACK
```

Esto impide que exista una cabecera sin detalles o una orden parcialmente registrada.

## Seguridad y manejo de errores

El proyecto utiliza:

- consultas SQL parametrizadas;
- Helmet;
- CORS;
- variables de entorno;
- middleware centralizado de errores;
- respuestas JSON uniformes;
- protección de detalles internos de PostgreSQL.

Códigos HTTP principales:

| Código | Uso                        |
| ------ | -------------------------- |
| 200    | Consulta exitosa           |
| 201    | Orden creada correctamente |
| 400    | Solicitud inválida         |
| 404    | Recurso no encontrado      |
| 500    | Error interno              |

## Pruebas

Las solicitudes se encuentran en:

```text
tests/northwind-api.http
```

Se pueden ejecutar desde VS Code utilizando la extensión **REST Client**.

El archivo incluye pruebas para:

- consultar clientes;
- consultar empleados;
- consultar productos disponibles;
- consultar una orden creada;
- crear una orden;
- cliente inexistente;
- cantidad inválida;
- orden inexistente;
- ID inválido;
- ruta inexistente.

## Evidencia

Las evidencias de funcionamiento se encuentran en:

```text
docs/evidence/
```

La orden principal creada durante las pruebas es:

```text
order_id: 11078
customer_id: ALFKI
employee_id: 1
```

La orden fue registrada en `orders` junto con múltiples registros en `order_details`.

## Autor

Fernando SC

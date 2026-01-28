
# Objetivo del mini-proyecto

Construir un **sistema web sencillo de administración** (usuarios / ventas / compras) con:

* **Backend:** Node.js + Express
* **Base de datos:** MongoDB (local o Atlas)
* **Frontend:** HTML + CSS + JS (opcional React)
* **Logs:** Winston + Morgan
* **Patrones creacionales aplicados correctamente:**

  * **Singleton** → conexión a MongoDB + Logger
  * **Builder** → creación de entidades (User, Venta, Compra)

---

# Patrones creacionales que vamos a usar

| Patrón        | Para qué lo usamos                                                       |
| ------------- | ------------------------------------------------------------------------ |
| **Singleton** | Garantizar una sola conexión a MongoDB y un solo logger                  |
| **Builder**   | Construcción flexible y clara de objetos complejos (User, Venta, Compra) |

> No usamos aún Factory, Prototype, Adapter, Observer, etc.

---

# Boceto general del sistema (arquitectura)

```
┌────────────┐       HTTP        ┌──────────────┐
│  Frontend  │  ─────────────▶  │   Express    │
│ HTML / JS  │                  │   API REST   │
└────────────┘                  └──────┬───────┘
                                        │
                                        │
                               ┌────────▼─────────┐
                               │   Controllers     │
                               └────────┬─────────┘
                                        │
                              ┌─────────▼─────────┐
                              │   Services         │
                              └─────────┬─────────┘
                                        │
               ┌──────────────┐   ┌──────▼────────┐
               │ MongoDB      │◀──│ Repositories  │
               │ (Singleton)  │   └──────────────┘
               └──────────────┘
                        ▲
                        │
                 ┌──────┴──────┐
                 │ Logger      │
                 │ (Singleton) │
                 └─────────────┘
```

---

# Organización de carpetas (MUY IMPORTANTE)

```bash
src/
│
├── config/
│   ├── database.js        # Singleton MongoDB
│   ├── logger.js          # Singleton Winston
│
├── builders/
│   ├── UserBuilder.js
│   ├── SaleBuilder.js
│   └── PurchaseBuilder.js
│
├── models/
│   ├── User.js
│   ├── Sale.js
│   └── Purchase.js
│
├── repositories/
│   ├── userRepository.js
│   ├── saleRepository.js
│
├── controllers/
│   ├── userController.js
│   └── saleController.js
│
├── routes/
│   ├── userRoutes.js
│   └── saleRoutes.js
│
├── middlewares/
│   ├── errorHandler.js
│
├── logs/
│
├── public/               # Frontend vanilla
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── app.js
└── server.js
```

---

# Instalación de dependencias

```bash
npm init -y

npm install express mongoose dotenv
npm install winston morgan
npm install cors
npm install nodemon --save-dev
```

---

# PATRÓN SINGLETON

## Conexión a MongoDB (database.js)

```js
// src/config/database.js
import mongoose from "mongoose";

class Database {
  static instance;

  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.connect();
    Database.instance = this;
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB conectado");
    } catch (error) {
      console.error("Error MongoDB", error);
    }
  }
}

export default new Database();
```

👉 **¿Qué patrón aplica?**
✔ Singleton → **una sola conexión en toda la app**

---

## Logger Singleton (Winston)

```js
// src/config/logger.js
import winston from "winston";

class Logger {
  static instance;

  constructor() {
    if (Logger.instance) return Logger.instance;

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" })
      ]
    });

    Logger.instance = this;
  }

  info(msg) {
    this.logger.info(msg);
  }

  error(msg) {
    this.logger.error(msg);
  }
}

export default new Logger();
```

✔ **Un solo logger global**
✔ Reutilizable desde cualquier módulo

---

# PATRÓN BUILDER

## Ejemplo: Construcción de Usuario

### Modelo base

```js
// src/models/User.js
export default class User {
  constructor({ name, email, role, active }) {
    this.name = name;
    this.email = email;
    this.role = role;
    this.active = active;
  }
}
```

---

### Builder

```js
// src/builders/UserBuilder.js
import User from "../models/User.js";

export default class UserBuilder {
  constructor() {
    this.user = {};
  }

  setName(name) {
    this.user.name = name;
    return this;
  }

  setEmail(email) {
    this.user.email = email;
    return this;
  }

  setRole(role) {
    this.user.role = role;
    return this;
  }

  setActive(active) {
    this.user.active = active;
    return this;
  }

  build() {
    return new User(this.user);
  }
}
```

---

### Uso real del Builder en el controlador

```js
// src/controllers/userController.js
import UserBuilder from "../builders/UserBuilder.js";
import logger from "../config/logger.js";

export const createUser = async (req, res) => {
  const user = new UserBuilder()
    .setName(req.body.name)
    .setEmail(req.body.email)
    .setRole("admin")
    .setActive(true)
    .build();

  logger.info("Usuario creado");

  res.status(201).json(user);
};
```

✔ Separación clara
✔ Evita constructores gigantes
✔ Ideal para objetos complejos

---

# Express + Morgan

```js
// src/app.js
import express from "express";
import morgan from "morgan";
import "./config/database.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

export default app;
```

---

# Frontend (HTML + JS simple)

```html
<!-- public/index.html -->
<button id="createUser">Crear Usuario</button>

<script src="app.js"></script>
```

```js
// public/app.js
document.getElementById("createUser").addEventListener("click", async () => {
  await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Juan",
      email: "juan@email.com"
    })
  });
});
```

---

# Diagrama de clases (texto)

```
+------------------+
| Database         |   <<Singleton>>
|------------------|
| - instance       |
| + connect()      |
+------------------+

+------------------+
| Logger           |   <<Singleton>>
|------------------|
| + info()         |
| + error()        |
+------------------+

+------------------+
| UserBuilder      |   <<Builder>>
|------------------|
| setName()        |
| setEmail()       |
| setRole()        |
| build()          |
+------------------+

+------------------+
| User             |
+------------------+
```

---

# Lista de EJERCICIOS PROPUESTOS

### Nivel 1 – Básico

1. Implementar Singleton para MongoDB
2. Implementar Singleton para Logger
3. Crear UserBuilder

### Nivel 2 – Intermedio

4. Crear SaleBuilder (venta con productos, total, fecha)
5. Crear PurchaseBuilder
6. Agregar logs automáticos en cada endpoint

### Nivel 3 – Aplicación real

7. CRUD completo de usuarios
8. Dashboard frontend básico
9. Cambiar Mongo local → Atlas sin tocar lógica (gracias al Singleton)

---

# ¿Por qué esto está bien aplicado?

✔ Singleton → **recursos compartidos**
✔ Builder → **objetos complejos**
✔ Código desacoplado
✔ Fácil de testear
✔ Escalable para meter luego:

* Factory
* Strategy
* Observer
* MVC más estricto


---

# Alternativas de aplicaciones web

# MISMA TEORÍA, DISTINTAS APLICACIONES

> Todas comparten:

* Singleton → DB + Logger
* Builder → Entidades principales
* Backend REST
* Frontend web
* Logs + Morgan
* MongoDB local o Atlas

---

## 1. Sistema de gestión de usuarios (Admin Panel)

**Clásico y perfecto para empezar**

**Funcionalidad**

* Crear, listar, editar y desactivar usuarios
* Roles: admin, editor, visitante

**Builder**

* `UserBuilder`

  * name
  * email
  * role
  * active
  * createdAt

**Singleton**

* Conexión MongoDB
* Logger global

**Frontend**

* Formulario de creación
* Tabla de usuarios
* Botón activar/desactivar

Ideal para: **introducción a patrones**

---

## 2. Sistema de ventas (POS simplificado)

**Funcionalidad**

* Registrar ventas
* Calcular totales
* Historial de ventas

**Builder**

* `SaleBuilder`

  * productos[]
  * subtotal
  * impuestos
  * total
  * fecha

**Singleton**

* DB
* Logger (registro de cada venta)

**Frontend**

* Formulario de venta
* Lista de productos
* Total automático

Ideal para: **objetos complejos**

---

## 3. Sistema de compras a proveedores

**Funcionalidad**

* Registrar compras
* Asociar proveedor
* Controlar costos

**Builder**

* `PurchaseBuilder`

  * proveedor
  * productos[]
  * total
  * estado

**Singleton**

* DB
* Logger

**Frontend**

* Registro de compra
* Historial

Ideal para: **uso combinado de builders**

---

## 4. Sistema de inventario

**Funcionalidad**

* Control de stock
* Entrada y salida de productos
* Alertas de stock bajo

**Builder**

* `ProductBuilder`

  * name
  * price
  * stock
  * minStock
  * category

**Singleton**

* DB
* Logger (movimientos)

**Frontend**

* Tabla de inventario
* Indicadores visuales

Ideal para: **atributos opcionales**

---

## 5. Plataforma de cursos (mini LMS)

**Funcionalidad**

* Crear cursos
* Registrar estudiantes
* Inscripciones

**Builder**

* `CourseBuilder`

  * title
  * description
  * duration
  * modules[]

**Singleton**

* DB
* Logger (inscripciones)

**Frontend**

* Lista de cursos
* Inscribirse

Ideal para: **builders con arrays**

---

## 6. Sistema de reservas (citas / turnos)

**Funcionalidad**

* Reservar citas
* Controlar disponibilidad
* Cancelaciones

**Builder**

* `AppointmentBuilder`

  * client
  * date
  * time
  * service
  * status

**Singleton**

* DB
* Logger

**Frontend**

* Calendario simple
* Reservar turno

Ideal para: **datos dependientes**

---

## 7. Sistema de tickets de soporte

**Funcionalidad**

* Crear tickets
* Cambiar estados
* Prioridades

**Builder**

* `TicketBuilder`

  * title
  * description
  * priority
  * status
  * createdBy

**Singleton**

* DB
* Logger (cambios de estado)

**Frontend**

* Lista de tickets
* Detalle

Ideal para: **flujos de negocio**

---

## 8. Sistema de facturación

**Funcionalidad**

* Generar facturas
* Asociar cliente
* Calcular impuestos

**Builder**

* `InvoiceBuilder`

  * client
  * items[]
  * subtotal
  * tax
  * total

**Singleton**

* DB
* Logger

**Frontend**

* Generar factura
* Visualizar PDF (opcional)

Ideal para: **builders encadenados**

---

## 9. Sistema de control de asistencia

**Funcionalidad**

* Registrar entradas/salidas
* Reportes diarios

**Builder**

* `AttendanceBuilder`

  * user
  * date
  * checkIn
  * checkOut

**Singleton**

* DB
* Logger

**Frontend**

* Botón marcar asistencia
* Historial

Ideal para: **objetos temporales**

---

## 10. Sistema de gestión de proyectos

**Funcionalidad**

* Crear proyectos
* Asignar tareas
* Cambiar estados

**Builder**

* `ProjectBuilder`
* `TaskBuilder`

**Singleton**

* DB
* Logger

**Frontend**

* Kanban básico
* Estado visual

Ideal para: **builders múltiples**

---

## 11. Blog administrativo

**Funcionalidad**

* Crear posts
* Publicar / despublicar

**Builder**

* `PostBuilder`

  * title
  * content
  * author
  * published

**Singleton**

* DB
* Logger

**Frontend**

* Editor simple
* Lista de posts

Ideal para: **contenido dinámico**

---

## 12. Sistema de encuestas

**Funcionalidad**

* Crear encuestas
* Registrar respuestas

**Builder**

* `SurveyBuilder`

  * title
  * questions[]
  * active

**Singleton**

* DB
* Logger

**Frontend**

* Responder encuesta
* Resultados

Ideal para: **estructuras anidadas**

---

## 13. Sistema de control de gastos personales

**Funcionalidad**

* Registrar gastos
* Categorías
* Resumen mensual

**Builder**

* `ExpenseBuilder`

  * amount
  * category
  * date
  * description

**Singleton**

* DB
* Logger

Ideal para: **educación financiera**

---

## 14. Sistema de monitoreo IoT (muy alineado contigo)

**Funcionalidad**

* Recibir datos de sensores
* Guardar históricos

**Builder**

* `SensorDataBuilder`

  * sensorId
  * value
  * timestamp

**Singleton**

* DB
* Logger

Ideal para: **conectar hardware**

---

## 15. Sistema de control de accesos

**Funcionalidad**

* Registrar accesos
* Permisos por rol

**Builder**

* `AccessLogBuilder`

**Singleton**

* DB
* Logger

Ideal para: **seguridad básica**

---

# Conclusión didáctica


**La arquitectura NO cambia**
**Los patrones NO cambian**
**Solo cambia el dominio**

Esto es clave para que los estudiantes entiendan que:

> **Los patrones no dependen del negocio, dependen del problema de diseño.**




## 1) Amazon RDS (Relational Database Service)

### Qué es

Servicio administrado de bases de datos **relacionales**. Tú eliges el motor (por ejemplo **MySQL, PostgreSQL, MariaDB, SQL Server, Oracle**) y AWS se encarga de:

* aprovisionamiento
* parches
* backups automáticos
* replicación (Multi-AZ)
* monitoreo básico

### Cuándo usarlo

Cuando tu sistema necesita:

* **SQL** (consultas complejas, joins, reportes)
* **transacciones ACID** (pagos, inventarios, órdenes)
* integridad con **constraints**, relaciones fuertes

### Ventajas

* **Modelo relacional claro** (tablas, relaciones)
* **Transacciones** fuertes (ACID)
* **Backups automáticos**, snapshots
* **Alta disponibilidad** con Multi-AZ
* Escalado vertical sencillo; lectura con réplicas (según motor)

### Desventajas

* Escala horizontal “real” es más limitada (comparado con NoSQL)
* Si tu app crece muchísimo, puedes terminar haciendo sharding o re-diseño
* Costos pueden subir por: almacenamiento, IOPS, Multi-AZ, réplicas

### Casos de uso típicos

* E-commerce (órdenes, pagos, stock)
* Sistemas académicos (matrículas, notas, historial)
* ERP/CRM
* APIs con lógica de negocio transaccional

### Integración con tu EC2 (Node + NGINX + PM2)

**Arquitectura típica:**

* EC2 (Node.js) se conecta a RDS por **endpoint privado**
* RDS en la **misma VPC**
* Security Groups: permitir tráfico **solo** desde el SG de tu EC2 al puerto de DB (3306 MySQL / 5432 Postgres)

**Checklist de implementación**

* RDS: *Public access* normalmente **NO**
* Subnets: preferible **private subnets** para RDS
* SG de RDS: inbound desde SG-EC2 al puerto
* En Node: usar driver (`pg`, `mysql2`, Sequelize/Prisma)
* Variables de entorno (PM2): `DB_HOST`, `DB_USER`, `DB_PASS`, etc.

---

## 2) Amazon DocumentDB (compatible con MongoDB)

### Qué es

Base de datos administrada estilo **documentos JSON**, diseñada para ser **compatible con APIs de MongoDB** (no es Mongo “tal cual”, pero se usa parecido).

### Cuándo usarlo

Cuando tu dominio encaja bien en documentos:

* datos con **estructura flexible** (cambia con el tiempo)
* “entidades” grandes tipo JSON (perfiles, catálogos, logs enriquecidos)
* menos necesidad de joins fuertes

### Ventajas

* Modelo flexible (documentos)
* Administrado (backups, alta disponibilidad)
* Ideal para datos semi-estructurados
* Escala lectura con réplicas (según configuración)

### Desventajas (importantes)

* **Costo** suele ser más alto que alternativas (y más aún que DynamoDB en algunos escenarios bien diseñados)
* No todo lo de MongoDB existe igual; algunas funcionalidades/comportamientos difieren
* No suele ser la opción más “simple” si solo quieres Mongo barato

### Casos de uso

* Catálogos con atributos variables
* Perfiles de usuario (con campos dinámicos)
* Sistemas de contenido (CMS)
* Event data “en documentos”

### Integración con tu EC2

Similar a RDS:

* DocumentDB en VPC
* SG del cluster permite inbound desde SG de EC2 en puerto 27017
* Node: driver MongoDB / Mongoose

**Notas prácticas**

* Usa TLS (DocumentDB lo requiere en configuraciones típicas)
* Maneja bien índices: si no indexas bien, se vuelve lento y caro

---

## 3) Amazon DynamoDB (NoSQL key-value / documento)

### Qué es

Base NoSQL administrada, **serverless**, extremadamente escalable, con latencia baja. El diseño se basa en:

* **tabla**
* **partition key** (obligatoria)
* **sort key** (opcional)
* índices secundarios (GSI/LSI)

### Cuándo usarlo

Cuando necesitas:

* muchísimas operaciones por segundo
* escalado automático
* esquema simple y consultas predecibles
* “casi real time” y alta disponibilidad por diseño

### Ventajas

* Escala brutal sin administrar servidores
* Alta disponibilidad multi-AZ por defecto
* Puedes elegir modo **On-demand** (paga por uso) o **Provisioned**
* Integración excelente con AWS (Lambda, API Gateway, IAM)

### Desventajas

* Si tu acceso a datos no está bien modelado, **sufres** (Dynamo obliga a diseñar por patrones de consulta)
* Joins no existen como tal
* Consultas ad-hoc complejas no son su fuerte (aunque hay PartiQL)
* Costos pueden dispararse si haces lecturas/escaneos mal

### Casos de uso

* Sesiones y tokens
* Carritos de compra
* Leaderboards
* IoT / telemetría
* “Single-table design” para microservicios

### Integración con tu EC2

Muy directa:

* Node usa AWS SDK (`@aws-sdk/client-dynamodb` o `lib-dynamodb`)
* Autenticación preferida: **IAM Role** en tu EC2 (no poner keys en el servidor)

**Arquitectura típica**

* EC2 con role IAM que permite `dynamodb:GetItem/PutItem/Query...`
* DynamoDB no está “en tu VPC” como una instancia, pero se accede por endpoints AWS (y puedes usar VPC endpoints si quieres que no salga a internet)

---

## 4) Amazon MemoryDB (Redis compatible, durable)

### Qué es

Base de datos **en memoria** compatible con Redis, pero pensada como “Redis + durabilidad”. Es decir:

* latencia bajísima (in-memory)
* pero con mecanismos para **persistencia y recuperación**
* administrada (clusters, monitoreo, failover)

> Si lo tuyo es *cache puro* o *redis simple*, a veces **ElastiCache for Redis** es suficiente. MemoryDB se usa cuando necesitas Redis como **base primaria** ultra rápida con persistencia fuerte.

### Cuándo usarlo

Cuando necesitas:

* velocidad extrema
* estructuras Redis (listas, sets, sorted sets)
* y además **durabilidad** (no solo cache)
* alta disponibilidad

### Ventajas

* Rendimiento altísimo
* Durable comparado con Redis “solo cache”
* Útil para “real-time”: contadores, colas ligeras, ranking, sesiones rápidas

### Desventajas

* Más caro que usar cache simple
* No reemplaza bien una relacional si necesitas SQL/joins/reportes
* Si tu caso es solo cache, puede ser “overkill”

### Casos de uso

* Leaderboards / rankings en tiempo real
* Contadores (likes, vistas)
* Session store de alto rendimiento
* Colas ligeras (aunque para colas “serias” a veces SQS/Kafka es mejor)
* Rate limiting

### Integración con tu EC2

* MemoryDB en VPC, SG permite inbound desde SG-EC2 en puerto 6379
* Node usa `ioredis` o `redis` client
* Recomendado: parámetros por env y conexión con TLS si aplica

---

# Comparación rápida (para decidir)

* **RDS** → “Necesito SQL y transacciones fuertes”
* **DocumentDB** → “Quiero documentos tipo Mongo administrado”
* **DynamoDB** → “Quiero serverless, escala enorme y acceso por clave”
* **MemoryDB** → “Quiero Redis ultra rápido pero también durable”

---

## Cómo se integra todo con tu stack (EC2 + Node + NGINX + PM2)

### Flujo típico

* **NGINX**: reverse proxy (80/443) → manda a Node (localhost:3000)
* **Node (PM2)**: corre API y se conecta al/los servicios de datos
* **Base de datos**: idealmente en **subred privada**, acceso solo por SG

### Seguridad mínima recomendada

* No exponer DB al público si no es estrictamente necesario
* Usar **Security Groups**:

  * EC2 SG: inbound 80/443 (y 22 solo desde tu IP)
  * DB SG: inbound solo desde **EC2 SG**
* Credenciales:

  * Para DynamoDB: **IAM Role** (sin keys)
  * Para RDS/DocumentDB/MemoryDB: Secrets Manager o variables PM2 (si es pequeño), ideal Secrets Manager

---

## Ejemplos de escenarios reales (muy prácticos)

### Escenario A: API de negocio “normal” (usuarios, productos, órdenes)

* **RDS (Postgres/MySQL)** como base principal
* **MemoryDB/Redis** para cache (o rate limiting)
* **DynamoDB** opcional para sesiones/tokens si quieres serverless

### Escenario B: App con datos muy variables en JSON (catálogo dinámico)

* **DocumentDB** como base principal
* Redis/MemoryDB para cache
* RDS solo si necesitas reportes SQL pesados

### Escenario C: Muchísimo tráfico y consultas simples por key

* **DynamoDB** como base principal
* Redis/MemoryDB para contadores/rankings
* RDS solo para contabilidad/reportes (si aplica)


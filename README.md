# Platomico KDS - Kitchen Display System

Sistema de gestión de órdenes en tiempo real para operaciones de tienda con integración de repartidores.

## Descripcion de la Solucion

Este proyecto implementa un **Kitchen Display System (KDS)** completo que permite:

- Recibir y visualizar pedidos en un tablero Kanban de 3 columnas
- Actualizar estados de órdenes en tiempo real via WebSocket
- Gestionar la entrega a repartidores (riders)
- Simular pedidos de Glovo para pruebas
- Crear y editar órdenes manualmente

### Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 14, React, TypeScript, SCSS Modules |
| Backend | NestJS 11, TypeORM, SQLite |
| Tiempo Real | Socket.IO |
| Testing | Jest (11 tests unitarios) |

---

## Requisitos Previos

- **Node.js** v18 o superior
- **pnpm** (gestor de paquetes)

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm
```

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/michael23499/kds-product-challenge-resolved-platomico.git
cd kds-product-challenge-resolved-platomico
```

### 2. Instalar dependencias

**Opcion rapida (recomendada):**

```bash
pnpm install:all
```

Este script instala automaticamente las dependencias del frontend y backend.

# Instalar dependencias del Frontend
pnpm install # Desde la raiz del proyect ../kds-product-challenge-resolved-platomico

# Instalar dependencias del Backend
cd backend
pnpm install
cd ..
```

---

## Ejecucion

### Opcion 1: Ejecutar todo junto (Recomendado)

```bash
pnpm dev:all
```

Esto inicia:
- Frontend en http://localhost:3000
- Backend en http://localhost:3001

### Opcion 2: Ejecutar por separado

```bash
# Terminal 1 - Backend
cd backend
pnpm start:dev

# Terminal 2 - Frontend
pnpm dev
```

### Verificar que funciona

1. Abre http://localhost:3000 en tu navegador
2. Activa el "Simulador Glovo" para ver ordenes automaticas
3. Haz click en las tarjetas para cambiar estados
4. Los riders apareceran automaticamente

---

## Guia de Tests

### Ejecutar Tests

```bash
# Entra a la carpeta del backend
cd backend

# Ejecutar todos los tests una vez:
pnpm test

# Resultado esperado:
# PASS src/modules/orders/orders.service.spec.ts
# OrdersService
#   create
#     ✓ should create an order with items
#   findAll
#     ✓ should return orders excluding DELIVERED
#   ... (11 tests en total)
# Tests: 11 passed
```

### Comandos de Test Disponibles

```bash
# Desde la carpeta backend/

# 1. Ejecutar tests una vez y terminar
pnpm test
# Uso: Verificar que todo funciona antes de hacer commit

# 2. Ejecutar tests con reporte de cobertura
pnpm test:cov
# Uso: Ver que porcentaje del codigo esta siendo testeado
# Genera un reporte mostrando:
# - % de lineas cubiertas
# - % de funciones cubiertas
# - % de ramas (if/else) cubiertas

# 3. Ejecutar tests en modo watch (continuo)
pnpm test:watch
# Uso: Mientras desarrollas, los tests se re-ejecutan
#      automaticamente cada vez que guardas un archivo
# Para salir: presiona 'q'
```

### Tests Implementados

| Funcion | Test | Que Verifica |
|---------|------|--------------|
| create() | should create an order with items | Crear orden correctamente |
| findAll() | should return orders excluding DELIVERED | Listar solo ordenes activas |
| findOne() | should return an order by id | Buscar orden existente |
| findOne() | should throw NotFoundException | Error si orden no existe |
| updateState() | should update order state | Cambiar estado correctamente |
| updateState() | should throw NotFoundException | Error si orden no existe |
| pickup() | should mark order as DELIVERED | Entregar orden a rider |
| recover() | should recover DELIVERED to PENDING | Recuperar orden entregada |
| recover() | should throw BadRequestException | Error si orden no es DELIVERED |
| update() | should update order items | Editar items de orden |
| update() | should throw BadRequestException | Error si orden es READY |

---

## Funcionalidades Implementadas

### Funcionalidades Core (Requeridas por el Challenge)

#### 1. Recepcion de Pedidos
```
- API REST POST /orders para crear ordenes
- Simulador de Glovo integrado (genera pedidos aleatorios)
- Creacion manual de ordenes via modal
```

#### 2. Visualizacion Kanban
```
- Tres columnas: Pendiente | En Preparacion | Listo
- Contador de ordenes por columna
- Click en tarjeta avanza al siguiente estado
- Timer muestra tiempo transcurrido desde creacion
```

#### 3. Actualizacion de Estados
```
- Flujo: PENDING -> IN_PROGRESS -> READY -> DELIVERED
- Validacion de transiciones (no se puede saltar estados)
- Sincronizacion en tiempo real via WebSocket
- Todos los clientes ven los cambios instantaneamente
```

#### 4. Gestion de Repartidores
```
- Riders aparecen automaticamente (4-10 seg despues de la orden)
- Click en rider intenta recoger la orden
- Si orden no esta READY: muestra modal informativo
- Si orden esta READY: se marca como DELIVERED
```

### Funcionalidades Extra (Implementadas Adicionalmente)

#### 5. Timer de Urgencia
```
- Verde:   < 3 minutos (normal)
- Naranja: 3-5 minutos (advertencia, parpadea lento)
- Rojo:    > 5 minutos (urgente, parpadea rapido)
```

#### 6. Sistema de Notificaciones
```
- Toast amarillo: Nueva orden recibida
- Toast naranja:  Rider esperando
- Toast verde:    Orden entregada exitosamente
- Toast naranja:  Orden recuperada del historial
```

#### 7. Sonido de Alerta
```
- Beep melodico al recibir nueva orden
- Usa Web Audio API (no requiere archivos de audio)
```

#### 8. Historial de Ordenes
```
- Panel lateral con ordenes entregadas
- Muestra ultimas 2 horas
- Boton "Recuperar" para devolver orden a PENDING
```

#### 9. Creacion/Edicion de Ordenes
```
- Modal para crear ordenes manualmente
- Modal para editar ordenes (solo PENDING/IN_PROGRESS)
- Agregar/eliminar items dinamicamente
- Calculo de total en tiempo real
```

#### 10. Diseno Responsive
```
- Desktop:  Layout completo con sidebar
- Tablet:   Sidebar debajo del kanban
- Mobile:   Columnas apiladas verticalmente
- Breakpoints: 1200px, 1024px, 768px, 480px
```

#### 11. Evidencia Fotografica (Opcional)
```
- Boton de camara en ordenes READY para capturar foto del pedido
- Usa MediaDevices API del navegador para acceder a la camara
- Foto se guarda en base64 asociada a la orden
- Indicador visual en historial si la orden tiene evidencia
- Click en el indicador muestra la foto en modal
- Totalmente opcional: no bloquea el flujo de entrega
- Proposito: Prevenir disputas con plataformas de delivery
```

---

## Decisiones Tecnicas

### 1. WebSocket vs Polling

**Elegido: WebSocket (Socket.IO)**

| Aspecto | Polling | WebSocket |
|---------|---------|-----------|
| Latencia | Alta (depende del intervalo) | Instantanea |
| Recursos | Desperdicia requests | Eficiente |
| Complejidad | Simple | Moderada |
| Escalabilidad | Pobre | Buena |

**Justificacion:** En un KDS(Kitchen Display System) las actualizaciones deben ser instantaneas. Un retraso de 5 segundos en mostrar que una orden esta lista puede causar confusion en la cocina.

### 2. SQLite vs PostgreSQL

**Elegido: SQLite**

| Aspecto | SQLite | PostgreSQL |
|---------|--------|------------|
| Instalacion | Ninguna | Requiere servidor |
| Configuracion | Cero | Base de datos, usuario, password |
| Rendimiento | Suficiente para demo | Mejor para produccion |
| Portabilidad | Archivo unico | Requiere conexion |

**Justificacion:** Para desarrollo y demostracion, SQLite permite ejecutar el proyecto sin instalar software adicional. En produccion se migraria a PostgreSQL.

### 3. React Context vs Redux

**Elegido: React Context**

| Aspecto | Context | Redux |
|---------|---------|-------|
| Complejidad | Baja | Alta |
| Boilerplate | Minimo | Mucho |
| Bundle size | 0kb extra | ~10kb |
| DevTools | Limitadas | Excelentes |

**Justificacion:** El proyecto tiene solo 2 entidades principales (ordenes y riders) con estado simple. Redux seria sobreingenieria para este alcance.

### 4. SCSS Modules vs CSS-in-JS

**Elegido: SCSS Modules**

| Aspecto | SCSS Modules | Styled-components |
|---------|--------------|-------------------|
| Rendimiento | Mejor (CSS estatico) | Menor (runtime) |
| Sintaxis | CSS estandar | Template literals |
| Scope | Automatico | Automatico |
| Variables | SCSS nativas | JS/Theme |

**Justificacion:** SCSS Modules ofrece mejor rendimiento y sintaxis familiar, suficiente para este proyecto.

---

## Estructura del Proyecto

```
kds-product-challenge/
│
├── backend/                      # ========== BACKEND (NestJS) ==========
│   ├── src/
│   │   ├── common/
│   │   │   └── enums/
│   │   │       └── order-state.enum.ts    # Estados: PENDING, IN_PROGRESS, READY, DELIVERED
│   │   │
│   │   ├── database/
│   │   │   └── database.config.ts         # Configuracion SQLite + TypeORM
│   │   │
│   │   ├── modules/
│   │   │   └── orders/
│   │   │       ├── dto/                   # Data Transfer Objects (validacion)
│   │   │       │   ├── create-order.dto.ts
│   │   │       │   ├── create-item.dto.ts
│   │   │       │   ├── update-order.dto.ts
│   │   │       │   └── update-order-state.dto.ts
│   │   │       │
│   │   │       ├── entities/              # Modelos de base de datos
│   │   │       │   ├── order.entity.ts    # Tabla: orders
│   │   │       │   └── item.entity.ts     # Tabla: items
│   │   │       │
│   │   │       ├── orders.controller.ts   # Endpoints REST
│   │   │       ├── orders.service.ts      # Logica de negocio
│   │   │       ├── orders.service.spec.ts # Tests unitarios
│   │   │       ├── orders.gateway.ts      # WebSocket events
│   │   │       └── orders.module.ts       # Configuracion del modulo
│   │   │
│   │   ├── app.module.ts                  # Modulo raiz
│   │   └── main.ts                        # Punto de entrada
│   │
│   ├── kds.db                             # Base de datos SQLite (se crea automaticamente)
│   └── package.json                       # Dependencias del backend
│
├── components/                   # ========== COMPONENTES REACT ==========
│   ├── Kanban/
│   │   ├── Kanban.tsx                     # Tablero principal con 3 columnas
│   │   └── Kanban.module.scss
│   │
│   ├── Column/
│   │   ├── Column.tsx                     # Columna individual del kanban
│   │   └── Column.module.scss
│   │
│   ├── Timer/
│   │   ├── Timer.tsx                      # Temporizador con colores
│   │   └── Timer.module.scss
│   │
│   ├── Riders/
│   │   ├── Riders.tsx                     # Panel de repartidores
│   │   └── Riders.module.scss
│   │
│   ├── History/
│   │   ├── History.tsx                    # Historial de ordenes
│   │   └── History.module.scss
│   │
│   ├── Toast/
│   │   ├── Toast.tsx                      # Notificacion individual
│   │   ├── ToastContainer.tsx             # Contenedor de notificaciones
│   │   └── *.module.scss
│   │
│   ├── Modal/
│   │   ├── Modal.tsx                      # Modal generico
│   │   └── Modal.module.scss
│   │
│   ├── CreateOrderModal/
│   │   ├── CreateOrderModal.tsx           # Modal para crear ordenes
│   │   └── CreateOrderModal.module.scss
│   │
│   ├── EditOrderModal/
│   │   └── EditOrderModal.tsx             # Modal para editar ordenes
│   │
│   ├── PhotoEvidenceModal/
│   │   ├── PhotoEvidenceModal.tsx         # Modal para capturar foto de evidencia
│   │   └── PhotoEvidenceModal.module.scss
│   │
│   └── OrderSimulator/
│       ├── OrderSimulator.tsx             # Simulador de pedidos Glovo
│       └── OrderSimulator.module.scss
│
├── contexts/                     # ========== ESTADO GLOBAL ==========
│   ├── Orders.context.tsx                 # Estado de ordenes + conexion WebSocket
│   ├── Riders.context.tsx                 # Estado de repartidores (simulados)
│   └── Toast.context.tsx                  # Sistema de notificaciones
│
├── services/                     # ========== SERVICIOS ==========
│   ├── api.ts                             # Cliente REST + WebSocket
│   └── errorHandler.ts                    # Manejo centralizado de errores
│
├── hooks/                        # ========== CUSTOM HOOKS ==========
│   ├── useElapsedTime.ts                  # Calcula tiempo transcurrido
│   ├── useNotificationSound.ts            # Genera sonido de alerta
│   └── useOrderForm.ts                    # Logica de formularios de orden
│
├── dtos/                         # ========== TIPOS TYPESCRIPT ==========
│   ├── Order.dto.ts                       # Tipo Order
│   └── Item.dto.ts                        # Tipo Item
│
├── layouts/                      # ========== LAYOUTS ==========
│   └── OrdersLayout/
│       ├── OrdersLayout.tsx               # Layout principal de la app
│       └── OrdersLayout.module.scss
│
├── bases/                        # ========== COMPONENTES BASE ==========
│   ├── Logo/
│   │   ├── Logo.tsx
│   │   └── Logo.module.scss
│   └── Rider/
│       ├── Rider.tsx                      # Componente visual del rider
│       ├── RiderSvg.tsx                   # SVG del rider
│       └── Rider.module.scss
│
├── pages/                        # ========== PAGINAS NEXT.JS ==========
│   ├── _app.tsx                           # Providers globales
│   ├── _document.tsx                      # Documento HTML base
│   └── index.tsx                          # Pagina principal
│
├── styles/                       # ========== ESTILOS GLOBALES ==========
│   ├── globals.scss                       # Estilos base
│   └── variables.scss                     # Variables SCSS (colores, etc.)
│
├── helpers/                      # ========== UTILIDADES ==========
│   └── utilities.ts                       # Funciones helper
│
├── package.json                           # Dependencias del frontend
├── INSTRUCTIONS.md                        # Instrucciones originales del challenge
└── README.md                              # Esta documentacion
```

---

## API Reference

### Endpoints REST

#### Crear Orden
```http
POST /orders
Content-Type: application/json

{
  "items": [
    {
      "name": "Hamburguesa",      // Nombre del producto (requerido)
      "priceAmount": 10.99,       // Precio (requerido, > 0)
      "priceCurrency": "EUR",     // Moneda (opcional, default: EUR)
      "quantity": 2               // Cantidad (opcional, default: 1)
    }
  ]
}

// Respuesta: 201 Created
{
  "id": "uuid-generado",
  "state": "PENDING",
  "riderId": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "items": [...]
}
```

#### Listar Ordenes Activas
```http
GET /orders

// Respuesta: 200 OK
// Retorna ordenes que NO estan en estado DELIVERED
// Ordenadas por fecha de creacion (mas antiguas primero)
[
  { "id": "...", "state": "PENDING", ... },
  { "id": "...", "state": "IN_PROGRESS", ... }
]
```

#### Obtener Historial
```http
GET /orders/history

// Respuesta: 200 OK
// Retorna ordenes DELIVERED de las ultimas 2 horas
// Ordenadas por fecha de actualizacion (mas recientes primero)
[
  { "id": "...", "state": "DELIVERED", "riderId": "rider-123", ... }
]
```

#### Actualizar Estado
```http
PATCH /orders/:id/state
Content-Type: application/json

{
  "state": "IN_PROGRESS"  // Valores: PENDING, IN_PROGRESS, READY, DELIVERED
}

// Respuesta: 200 OK
{ "id": "...", "state": "IN_PROGRESS", ... }
```

#### Editar Orden
```http
PATCH /orders/:id
Content-Type: application/json

{
  "items": [
    { "name": "Pizza", "priceAmount": 15.99, "quantity": 1 }
  ]
}

// Nota: Solo funciona si la orden esta en PENDING o IN_PROGRESS
// Respuesta: 200 OK o 400 Bad Request
```

#### Marcar como Entregada (Pickup)
```http
POST /orders/:id/pickup
Content-Type: application/json

{
  "riderId": "rider-123"  // ID del repartidor que recoge
}

// Cambia estado a DELIVERED y asigna riderId
// Respuesta: 200 OK
```

#### Recuperar Orden
```http
POST /orders/:id/recover

// Cambia orden DELIVERED de vuelta a PENDING
// Limpia riderId
// Solo funciona si la orden esta en DELIVERED
// Respuesta: 200 OK o 400 Bad Request
```

#### Agregar Evidencia Fotografica (Opcional)
```http
POST /orders/:id/photo-evidence
Content-Type: application/json

{
  "photoEvidence": "data:image/jpeg;base64,/9j/4AAQ..."  // Imagen en base64
}

// Solo funciona si la orden esta en READY
// Respuesta: 200 OK o 400 Bad Request
```

### Eventos WebSocket

```javascript
// Conexion
const socket = io('http://localhost:3001')

// Eventos que el servidor emite:

socket.on('order:new', (order) => {
  // Nueva orden creada
  // order: { id, state: 'PENDING', items, ... }
})

socket.on('order:updated', (order) => {
  // Orden actualizada (estado o items)
  // order: { id, state, items, ... }
})

socket.on('order:picked', (order) => {
  // Orden entregada a rider
  // order: { id, state: 'DELIVERED', riderId, ... }
})

socket.on('order:recovered', (order) => {
  // Orden recuperada del historial
  // order: { id, state: 'PENDING', riderId: null, ... }
})

socket.on('order:photo-added', (order) => {
  // Evidencia fotografica agregada
  // order: { id, state: 'READY', photoEvidence: 'data:image/jpeg;base64,...', ... }
})
```

---

## Mejoras

### Implementadas
- [x] Tests unitarios del OrdersService (11 tests)
- [x] Diseno responsive
- [x] Sistema de notificaciones
- [x] Historial de ordenes
- [x] Edicion de ordenes
- [x] Evidencia fotografica opcional (captura de camara)

### Pendientes - Corto Plazo
- [ ] Tests de integracion (E2E)
- [ ] Autenticacion JWT para personal
- [ ] Roles (cocina, caja, administrador)

### Pendientes - Largo Plazo
- [ ] Integracion real con API de Glovo
- [ ] Aplicacion movil para repartidores

---

## Comandos Utiles

```bash
# ===== DESARROLLO =====
pnpm dev:all              # Inicia frontend + backend
pnpm dev                  # Solo frontend
cd backend && pnpm start:dev   # Solo backend

# ===== TESTS =====
cd backend
pnpm test                 # Ejecutar tests
pnpm test:cov             # Tests + cobertura
pnpm test:watch           # Tests en modo watch

# ===== BUILD =====
pnpm build                # Build del frontend

# ===== UTILIDADES =====
rm backend/kds.db         # Borrar base de datos (reiniciar)
```

---

## Agradecido con el equipo de Platomico por la oportunidad.
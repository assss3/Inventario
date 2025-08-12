# Sistema de Inventario de Zapatillas

Sistema completo para gestionar inventario de zapatillas con Next.js, TypeScript, Prisma y PostgreSQL.

## Estructura de la Base de Datos

### Tablas principales:
- **marcas**: Gestión de marcas de zapatillas
- **modelos**: Modelos asociados a cada marca
- **ingresos**: Registro de ingresos de stock por fecha
- **pares**: Cada par individual con talle, depósito, estado de pago, etc.

## API Endpoints

### Marcas
- `GET /api/marcas` - Obtener todas las marcas
- `POST /api/marcas` - Crear nueva marca
  ```json
  { "nombre": "Nike" }
  ```

### Modelos
- `GET /api/modelos` - Obtener todos los modelos
- `POST /api/modelos` - Crear nuevo modelo
  ```json
  { "nombre": "Air Max", "marcaId": 1 }
  ```

### Ingresos
- `POST /api/ingresos` - Registrar nuevo ingreso
  ```json
  {
    "modeloId": 1,
    "pares": [
      { "talle": 42, "cantidad": 5 },
      { "talle": 43, "cantidad": 3 }
    ]
  }
  ```
- `GET /api/ingresos/[modeloId]` - Obtener ingresos por modelo

### Pares
- `PUT /api/pares/[id]` - Actualizar información de un par
  ```json
  {
    "deposito": "Sucursal Centro",
    "disponible": false,
    "pagado": "Completo",
    "comprador": "Juan Pérez",
    "montoPagado": 15000.00
  }
  ```

## Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar base de datos:**
   - Crear base de datos PostgreSQL
   - Actualizar `.env` con la URL de conexión
   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/inventario_zapatillas"
   ```

3. **Configurar Prisma:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## Funcionalidades

### Gestión de Marcas y Modelos
- Crear marcas de zapatillas
- Asociar modelos a marcas específicas
- Visualizar estructura jerárquica

### Registro de Ingresos
- Registrar múltiples talles en un solo ingreso
- Especificar cantidad por talle
- Fecha automática de ingreso

### Panel de Inventario
- Visualización por modelo con grilla interactiva
- Cada cuadrado representa un par individual
- Colores indican estado (disponible, vendido, pagado)
- Click para editar información del par

### Gestión Individual de Pares
- Cambiar depósito de ubicación
- Marcar como disponible/no disponible
- Registrar información de venta
- Control de pagos (completo/parcial)
- Datos del comprador

## Estructura del Proyecto

```
├── app/
│   ├── api/           # Endpoints de la API
│   ├── inventario/    # Páginas de inventario
│   ├── components/    # Componentes reutilizables
│   └── globals.css    # Estilos globales
├── lib/
│   └── prisma.ts      # Cliente de Prisma
├── prisma/
│   └── schema.prisma  # Esquema de base de datos
└── README.md
```

## Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL con Prisma ORM
- **Estilos**: Tailwind CSS con componentes personalizados
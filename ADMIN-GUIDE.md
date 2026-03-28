# 🔐 Panel Administrativo - Nómada Portal

Guía completa del sistema de administración para gestionar propiedades y movimientos.

## 🎯 ¿Qué es el Panel Admin?

El Panel Administrativo es una **interfaz escondida** diseñada para que el equipo de Nómada pueda:

1. **Cargar movimientos diarios** (ingresos y egresos operativos)
2. **Dar de alta propiedades nuevas** con wizard guiado de 3 pasos
3. **Ver todos los registros** del sistema

## 🔑 Acceso al Panel

### URL Secreta

```
https://tu-dominio.com/admin-nomada
```

**Nota**: Esta URL no aparece en ningún menú público. Solo el equipo autorizado la conoce.

### Autenticación

1. Accede a la URL del admin
2. Ingresa la contraseña configurada
3. La sesión se mantiene mientras tengas la pestaña abierta

**Contraseña por defecto**: `nomada2024`

**⚠️ IMPORTANTE**: Cambia la contraseña en tu archivo `.env`:

```env
VITE_ADMIN_PASSWORD=tu_password_segura_aqui
```

## 📋 Funcionalidades

### 1. Día a Día - Carga Operativa

**Propósito**: Registrar todos los movimientos diarios de dinero.

#### Tipos de Movimientos

**INGRESOS** (Entra plata):
- Alquiler
- Depósito
- Reintegro Servicios
- Otros Ingresos

**EGRESOS** (Sale plata):
- Mantenimiento
- Expensas
- ABL
- Servicios (Luz/Gas)
- Limpieza
- Honorarios
- Comisión
- Impuestos

#### Campos del Formulario

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| Tipo | ✅ | Ingreso o Egreso |
| Fecha | ✅ | Fecha del movimiento |
| Propiedad | ✅ | Seleccionar de lista |
| Categoría | ✅ | Según tipo seleccionado |
| Monto | ✅ | Valor numérico |
| Moneda | ✅ | USD o ARS |
| Descripción | ✅ | Detalle del movimiento |
| Proveedor | ❌ | Opcional (ej: Plomero Jorge) |
| Comprobante | ❌ | Opcional (foto/PDF) |

#### Flujo de Trabajo

```
1. Seleccionar INGRESO o EGRESO
   ↓
2. Completar fecha y propiedad
   ↓
3. Elegir categoría correspondiente
   ↓
4. Ingresar monto y moneda
   ↓
5. Describir el movimiento
   ↓
6. (Opcional) Agregar proveedor y comprobante
   ↓
7. Click "Registrar Movimiento"
   ↓
8. ✅ Se agrega automáticamente al Google Sheet
```

### 2. Back Office - Altas de Propiedades

**Propósito**: Dar de alta una propiedad completa con su propietario y contrato.

#### Wizard de 3 Pasos

##### PASO 1: Datos del Propietario

| Campo | Requerido | Ejemplo |
|-------|-----------|---------|
| Nombre Completo | ✅ | Juan Pérez |
| DNI / CUIT | ❌ | 20-12345678-9 |
| Email | ❌ | juan@email.com |
| Teléfono | ❌ | +54 9 11 1234-5678 |
| CBU / Alias | ❌ | juan.perez.mp |
| Banco | ❌ | Banco Galicia |

##### PASO 2: Datos del Inmueble

| Campo | Requerido | Ejemplo |
|-------|-----------|---------|
| Dirección | ✅ | Av. Libertador 1000 |
| Piso | ❌ | 4 |
| Unidad | ❌ | B |
| Barrio | ❌ | Belgrano |
| **Alias Interno** | ✅ | **Libertador 4B** |
| Tipo | ✅ | Departamento |
| Ambientes | ❌ | 3 |
| m² | ❌ | 85 |
| Link Drive | ❌ | URL de carpeta |

**💡 Tip**: El **Alias Interno** es el nombre corto que aparecerá en todos los formularios. Hazlo descriptivo y fácil de recordar.

##### PASO 3: Contrato de Alquiler

| Campo | Requerido | Ejemplo |
|-------|-----------|---------|
| Nombre Inquilino | ✅ | Roberto Martínez |
| Email Inquilino | ❌ | roberto@email.com |
| Fecha Inicio | ✅ | 2024-01-01 |
| Fecha Fin | ❌ | 2024-12-31 |
| Monto Mensual | ✅ | 1200 |
| Moneda | ✅ | USD |
| Link Contrato PDF | ❌ | URL de Drive |

#### Resultado del Alta

Después de completar el wizard:

1. ✅ **Propietario** creado en pestaña "Propietarios"
2. ✅ **Propiedad** creada en pestaña "Propiedades"
3. ✅ **Contrato** creado en pestaña "Contratos"
4. ✅ La propiedad **ya aparece disponible** en el formulario diario

### 3. Registros - Vista de Datos

**Propósito**: Ver todo lo que se ha cargado en el sistema.

#### Últimos Movimientos

Muestra los **últimos 20 movimientos** ordenados por fecha descendente:

- ID del movimiento
- Fecha
- Propiedad
- Tipo (Ingreso/Egreso)
- Categoría
- Descripción
- Monto

**Código de colores**:
- 🟢 Verde = Ingresos
- 🔴 Rojo = Egresos

#### Propiedades en el Sistema

Lista todas las propiedades activas con:

- Alias
- Dirección completa
- Ciudad y barrio
- Ambientes y m²
- ID de propiedad
- Estado (Activo/Inactivo)

## 🔄 Sincronización con Google Sheets

### Escritura Automática

Cuando registras algo desde el panel admin:

1. Se genera un ID único automático
2. Se envía via POST al Google Apps Script
3. El Apps Script escribe en la pestaña correspondiente
4. Los cambios son **inmediatos**

### IDs Generados

El sistema genera IDs automáticamente:

- **Movimientos**: `M-{timestamp}-{random}`
- **Propietarios**: `P-{timestamp}-{random}`
- **Propiedades**: `H-{timestamp}-{random}`
- **Contratos**: `C-{timestamp}-{random}`

**Ejemplo**: `M-1703091234567-123`

### Actualización de Datos

- **Botón Refresh**: Click para recargar datos del Sheet
- **Auto-refresh**: Después de crear registros, se actualiza solo
- **Cache**: 5 minutos de cache local para mejor performance

## 🎨 Características de UI

### Indicadores Visuales

- ✅ **Iconos de tipo**: TrendingUp (ingreso), TrendingDown (egreso)
- 🎨 **Colores por tipo**: Verde (ingreso), Rojo (egreso)
- 📊 **Badges de categoría**: Fondo coloreado según tipo
- ⏱️ **Loading states**: Spinners mientras se guarda
- 🎉 **Toasts de éxito**: Confirmación visual de acciones

### Navegación

Tres pestañas principales en el navbar:

1. **Día a Día** (azul) - Uso frecuente
2. **Back Office** (indigo) - Altas
3. **Registros** (verde) - Vista de datos

### Responsive

- ✅ Funciona en mobile
- ✅ Funciona en tablet
- ✅ Optimizado para desktop

## 🔐 Seguridad

### Niveles de Protección

1. **URL Escondida**: `/admin-nomada` no aparece en menús
2. **Password**: Configurada en `.env`
3. **Session Storage**: La sesión se pierde al cerrar tab
4. **No hay enlaces públicos**: Zero discovery

### Mejoras Sugeridas para Producción

Para mayor seguridad, considera:

- [ ] Autenticación con Google OAuth
- [ ] Rate limiting en Apps Script
- [ ] Logs de auditoría (quién modificó qué)
- [ ] Roles y permisos por usuario
- [ ] 2FA (autenticación de dos factores)

## 🐛 Troubleshooting

### "Error al guardar el movimiento"

**Causa**: Problema de conexión con Google Sheets

**Solución**:
1. Verifica que la URL de Apps Script en `.env` sea correcta
2. Chequea que el deployment de Apps Script esté activo
3. Revisa los logs en Apps Script Editor > Ejecuciones

### "Contraseña incorrecta"

**Causa**: La contraseña no coincide con la configurada

**Solución**:
1. Verifica el archivo `.env`
2. El valor debe estar en `VITE_ADMIN_PASSWORD`
3. Reinicia el servidor dev después de cambiar `.env`

### Los datos no se actualizan

**Causa**: Cache del navegador o de la app

**Solución**:
1. Click en el botón de Refresh (icono circular)
2. Recarga la página completa (F5)
3. Limpia el cache del navegador

### No aparece la propiedad nueva en el formulario

**Causa**: Datos no sincronizados

**Solución**:
1. Espera 10 segundos
2. Click en Refresh
3. Ve a pestaña "Registros" para verificar que se creó
4. Si no está, revisa los logs de Apps Script

## 📝 Best Practices

### Carga de Movimientos

- ✅ Carga movimientos **el mismo día** que ocurren
- ✅ Se **específico** en las descripciones
- ✅ Sube **comprobantes** siempre que sea posible
- ✅ Usa las **categorías correctas**
- ❌ No uses categoría "Otros" si hay una específica

### Alta de Propiedades

- ✅ Verifica que el **email del propietario sea correcto**
- ✅ El **alias interno** debe ser único y descriptivo
- ✅ Completa **todos los datos** aunque no sean obligatorios
- ✅ Sube **fotos de la propiedad** a Drive y linkea
- ❌ No uses alias genéricos como "Depto 1"

### Nombres de Alias Recomendados

Buenos ejemplos:
- ✅ "Libertador 4B"
- ✅ "Palermo Soho Studio"
- ✅ "Recoleta Luxury"
- ✅ "Belgrano 2 amb"

Malos ejemplos:
- ❌ "Depto"
- ❌ "Casa 1"
- ❌ "Propiedad A"

## 🚀 Shortcuts de Teclado

Cuando estés en un formulario:

- `Tab`: Navegar entre campos
- `Enter`: Submit del formulario (en último campo)
- `Esc`: Cerrar toasts de notificación

## 📊 Flujo Completo de Trabajo

### Escenario: Nueva Propiedad

```
1. ALTA DE PROPIEDAD
   Admin > Back Office > Completar wizard de 3 pasos
   ✅ Propietario, Propiedad y Contrato creados
   
2. PRIMER COBRO DE ALQUILER
   Admin > Día a Día
   - Tipo: INGRESO
   - Categoría: Alquiler
   - Propiedad: Seleccionar la nueva
   - Monto: Según contrato
   ✅ Movimiento registrado
   
3. GASTOS DEL MES
   Admin > Día a Día
   - Tipo: EGRESO
   - Categorías: Expensas, ABL, etc.
   ✅ Todos los egresos registrados
   
4. VERIFICACIÓN
   Admin > Registros
   ✅ Ver que todo se haya cargado correctamente
   
5. PORTAL DEL PROPIETARIO
   El propietario ya puede ingresar y ver su liquidación
   ✅ Sistema completo funcionando
```

## 🔄 Actualización de Datos Existentes

**⚠️ Importante**: El panel admin solo permite **CREAR** nuevos registros.

Para **modificar** o **eliminar** datos existentes:
1. Ve directamente al Google Sheet
2. Edita manualmente la celda
3. Los cambios se reflejan automáticamente en el portal

## 📞 Soporte

¿Problemas con el panel admin?

1. Revisa esta guía primero
2. Chequea los logs en Apps Script
3. Verifica la consola del navegador (F12)
4. Contacta al equipo técnico

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0

*Desarrollado con ❤️ para Nómada*

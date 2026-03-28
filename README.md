# 🏠 Nómada Portal - Sistema de Gestión de Propiedades Temporales

Portal web para que propietarios puedan acceder a la información de sus alquileres temporales gestionados por Nómada, incluyendo liquidaciones, gastos, expensas y configuración de cobros.

## 📋 Características

### Portal de Propietarios
- ✅ **Autenticación** por email de propietario
- 📊 **Dashboard** con resumen financiero mensual
- 💰 **Liquidaciones** detalladas por periodo
- 📝 **Movimientos** categorizados (ingresos y egresos)
- ⚙️ **Configuración** de método de cobro
- 📱 **Responsive** - funciona en desktop y mobile
- 🔄 **Actualización en tiempo real** desde Google Sheets

### Panel Administrativo
- 🔐 **Acceso protegido** con password (`/admin-nomada`)
- 📝 **Carga de movimientos** diarios (ingresos y egresos)
- 🏢 **Alta de propiedades** con wizard de 3 pasos (propietario, inmueble, contrato)
- 📊 **Vista de registros** completa de movimientos y propiedades
- ✍️ **Escritura en Google Sheets** en tiempo real
- 🔄 **Sincronización bidireccional** con la base de datos

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Backend**: Google Apps Script
- **Base de Datos**: Google Sheets

## 📦 Estructura del Proyecto

```
nomada-portal/
├── src/
│   ├── components/         # Componentes React
│   │   ├── LoginScreen.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MetricCard.jsx
│   │   ├── MovementsTable.jsx
│   │   ├── WithdrawalSettings.jsx
│   │   └── Toast.jsx
│   ├── contexts/          # React Context
│   │   └── DataContext.jsx
│   ├── hooks/             # Custom Hooks
│   │   └── useAuth.js
│   ├── services/          # Servicios API
│   │   └── apiService.js
│   ├── utils/             # Utilidades
│   │   └── formatters.js
│   ├── App.jsx            # Componente principal
│   ├── main.jsx          # Entry point
│   └── index.css         # Estilos globales
├── apps-script/          # Google Apps Script
│   └── Code.gs
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚀 Instalación y Configuración

### Paso 1: Clonar e Instalar Dependencias

```bash
# Navegar a la carpeta del proyecto
cd nomada-portal

# Instalar dependencias
npm install
```

### Paso 2: Configurar Google Sheets

Tu Google Sheet debe tener las siguientes pestañas con estos encabezados:

**Pestaña "Propietarios":**
```
id_propietario | nombre_completo | dni_cuit | email | telefono | cbu_alias | banco
```

**Pestaña "Propiedades":**
```
id_propiedad | alias | id_propietario | direccion | piso_unidad | ciudad | barrio | tipo | ambientes | m2 | estado
```

**Pestaña "Liquidaciones":**
```
id_liq | periodo | id_propiedad | total_ingresos | total_gastos | a_pagar_propietario | moneda_pago | estado | fecha_pago | link_pdf
```

**Pestaña "Movimientos":**
```
id_mov | fecha | id_propiedad | tipo | categoria | proveedor | monto | moneda | descripcion | comprobante_url
```

**Pestaña "Contratos"** (opcional):
```
id_contrato | id_propiedad | inquilino_nombre | inquilino_email | fecha_inicio | fecha_fin | monto_mensual | moneda | estado
```

### Paso 3: Configurar Google Apps Script

1. Abre tu Google Sheet
2. Ve a: **Extensiones > Apps Script**
3. Borra el código por defecto
4. Copia y pega el contenido de `apps-script/Code.gs`
5. Guarda el proyecto (Ctrl+S o Cmd+S)
6. Click en **"Implementar"** > **"Nueva implementación"**
7. Configuración:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo** (tu email)
   - Quién tiene acceso: **Cualquier persona**
8. Click **"Implementar"**
9. Autoriza los permisos necesarios
10. **Copia la URL** que te proporcionan

### Paso 4: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita `.env` y pega tu URL de Apps Script:
```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec
```

### Paso 5: Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`

## 🌐 Deployment (Producción)

### Opción 1: Vercel (Recomendado)

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
npm run build
vercel
```

3. Configura la variable de entorno `VITE_APPS_SCRIPT_URL` en Vercel Dashboard

### Opción 2: Netlify

1. Instala Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
npm run build
netlify deploy --prod
```

3. Configura la variable de entorno en Netlify Dashboard

### Opción 3: Build Manual

```bash
npm run build
```

Los archivos estarán en la carpeta `dist/` listos para subir a cualquier hosting.

## 🔒 Seguridad

### Modo Desarrollo vs Producción

- **Modo Desarrollo**: Si `VITE_APPS_SCRIPT_URL` no está configurada, usa datos mock
- **Modo Producción**: Siempre requiere la URL de Apps Script configurada

### Autenticación

- Actualmente usa verificación simple por email
- Para producción, considera implementar:
  - OAuth con Google
  - JWT tokens
  - Sistema de contraseñas

### Google Apps Script

- El script debe ejecutarse con permisos del owner del Sheet
- Solo expone lectura de datos (no escritura)
- Considera agregar rate limiting para producción

## 📝 Uso

### Login

1. Ingresa el email registrado en la hoja "Propietarios"
2. El sistema verificará que exista en la base de datos
3. Si es válido, te dará acceso al portal

### Navegación

- **Sidebar**: Selecciona propiedad y periodo a visualizar
- **Dashboard**: Ve el resumen financiero del mes
- **Tablas**: Detalle completo de ingresos y egresos
- **Configuración**: Elige método de cobro preferido

### Datos de Prueba (Modo Demo)

Email de prueba: `juan@email.com`

## 🧪 Testing

Para probar el Apps Script directamente:

1. Ve al editor de Apps Script
2. Selecciona la función `testGetData`
3. Click en "Ejecutar"
4. Ve los logs en "Ejecuciones"

## 🔄 Actualización de Datos

- Los datos se cachean por 5 minutos en el cliente
- Click en el botón de refresh para forzar actualización
- El cache se limpia al cerrar sesión

## 🎨 Personalización

### Colores y Branding

Edita `tailwind.config.js` para cambiar la paleta de colores:

```js
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...}
    }
  }
}
```

### Logo

Reemplaza el icono `Building` en los componentes con tu logo personalizado.

## 📱 Responsive

El diseño es completamente responsive:
- Mobile: Sidebar colapsable
- Tablet: Vista adaptada
- Desktop: Vista completa con sidebar fijo

## 🐛 Troubleshooting

### "Error al obtener datos"

1. Verifica que la URL de Apps Script esté correcta
2. Chequea que el deployment esté activo
3. Revisa los permisos del Apps Script

### "Email no registrado"

Verifica que el email exista en la pestaña "Propietarios" del Sheet

### Datos no se actualizan

1. Limpia el cache con el botón de refresh
2. Verifica que los datos en el Sheet estén correctos
3. Recarga la página completa

### Build errors

```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

## 📚 Recursos Adicionales

- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de React](https://react.dev/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/)
- [Google Apps Script](https://developers.google.com/apps-script)

## 🤝 Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para Nómada.

## 👨‍💻 Soporte

Para soporte o consultas:
- Email: soporte@nomada.com
- WhatsApp: +54 9 11 XXXX-XXXX

---

Desarrollado con ❤️ para Nómada
# nomada-portal

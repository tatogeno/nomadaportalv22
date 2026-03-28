# 🚀 Inicio Rápido - Nómada Portal

Esta guía te permite tener el proyecto corriendo en **5 minutos**.

## ⚡ Quick Start

### 1. Instalar Dependencias (1 min)

```bash
npm install
```

### 2. Modo Demo - Sin Google Sheets (Opcional)

Si quieres ver el proyecto funcionando inmediatamente SIN configurar Google Sheets:

```bash
# Solo ejecuta esto:
npm run dev
```

El proyecto arrancará en modo DEMO con datos de prueba.

Login de prueba:
- Email: `juan@email.com`

**✨ ¡Listo! Ya puedes explorar la aplicación.**

---

## 🔧 Configuración Completa con Google Sheets

### 3. Preparar Google Sheet (3 min)

1. Abre tu Google Sheet
2. Crea las pestañas según `DATOS-EJEMPLO.md`
3. Copia los datos de ejemplo

### 4. Configurar Apps Script (2 min)

1. En tu Google Sheet: **Extensiones > Apps Script**
2. Copia el código de `apps-script/Code.gs`
3. **Implementar > Nueva implementación**
4. Copia la URL que te dan

### 5. Variable de Entorno (30 seg)

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y pega tu URL
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_ID/exec
```

### 6. Ejecutar (10 seg)

```bash
npm run dev
```

**🎉 ¡Todo listo! Ahora está conectado a tu Google Sheet.**

---

## 📱 URLs Útiles

Después de `npm run dev`:

- **App**: http://localhost:3000
- **Vite Dashboard**: En la terminal verás opciones adicionales

---

## 🆘 Problemas Comunes

### "No se puede conectar a Google Sheets"

1. Verifica que la URL en `.env` sea correcta
2. Asegúrate que el Apps Script esté deployed
3. Prueba la URL directamente en el navegador

### "Error al instalar dependencias"

```bash
# Limpia e intenta de nuevo
rm -rf node_modules package-lock.json
npm install
```

### "Puerto 3000 ocupado"

Vite automáticamente usará el siguiente puerto disponible (3001, 3002, etc.)

---

## 📚 Próximos Pasos

1. ✅ Revisa `README.md` para documentación completa
2. ✅ Ve `DEPLOYMENT.md` para publicar en producción
3. ✅ Personaliza colores en `tailwind.config.js`
4. ✅ Modifica componentes en `src/components/`

---

## 🎯 Estructura del Proyecto

```
nomada-portal/
├── src/
│   ├── components/      ← Componentes React
│   ├── contexts/        ← Estado global
│   ├── hooks/          ← Hooks personalizados
│   ├── services/       ← API y servicios
│   └── utils/          ← Utilidades
├── apps-script/        ← Código Google Apps Script
└── docs/               ← Documentación
```

---

## 💡 Tips

- **Modo Demo**: Perfecto para mostrar a clientes sin datos reales
- **Hot Reload**: Los cambios se reflejan automáticamente
- **DevTools**: Usa React DevTools para debugging
- **Logs**: Abre la consola del navegador (F12) para ver logs

---

¿Necesitas ayuda? Revisa la documentación completa en README.md

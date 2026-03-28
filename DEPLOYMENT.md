# 🚀 Guía de Deployment - Nómada Portal

Guía paso a paso para publicar el portal en producción.

## Preparación Antes del Deploy

### 1. Verificar que Todo Funcione Localmente

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Probar login y navegación
```

### 2. Configurar Google Apps Script

Ver instrucciones detalladas en README.md, sección "Configurar Google Apps Script"

Asegúrate de tener la URL del deployment lista.

### 3. Preparar Variables de Entorno

Crea un archivo `.env` con:

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec
```

## Opción 1: Deploy en Vercel (Recomendado)

Vercel es gratis para proyectos personales y ofrece excelente performance.

### Paso a Paso

1. **Crear cuenta en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Sign up con tu cuenta de GitHub/GitLab/Bitbucket

2. **Subir código a GitHub** (si no está ya)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/nomada-portal.git
   git push -u origin main
   ```

3. **Import desde Vercel Dashboard**
   - Click "New Project"
   - Import tu repositorio
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Configurar Variables de Entorno**
   - En el dashboard de tu proyecto
   - Settings > Environment Variables
   - Agregar: `VITE_APPS_SCRIPT_URL` = tu URL de Apps Script

5. **Deploy**
   - Click "Deploy"
   - Espera 1-2 minutos
   - ¡Listo! Tu URL será: `https://tu-proyecto.vercel.app`

### Deploy Automático

Cada push a `main` deployará automáticamente. Para preview branches:

```bash
git checkout -b nueva-feature
# hacer cambios
git push origin nueva-feature
# Vercel creará un preview deployment automático
```

## Opción 2: Deploy en Netlify

### Paso a Paso

1. **Crear cuenta en Netlify**
   - Ve a [netlify.com](https://www.netlify.com)
   - Sign up

2. **Deploy desde GitHub**
   - Click "New site from Git"
   - Conecta con GitHub
   - Selecciona tu repositorio
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Configurar Variables de Entorno**
   - Site settings > Build & deploy > Environment
   - Add variable: `VITE_APPS_SCRIPT_URL`

4. **Deploy**
   - Click "Deploy site"
   - Tu URL será: `https://tu-proyecto.netlify.app`

### Custom Domain (Opcional)

En Site settings > Domain management, puedes agregar tu propio dominio.

## Opción 3: Deploy Manual (cualquier hosting)

### 1. Build para producción

```bash
npm run build
```

Esto crea la carpeta `dist/` con archivos estáticos.

### 2. Subir a tu hosting

Puedes usar cualquier hosting que sirva archivos estáticos:

**cPanel / FTP:**
- Sube el contenido de `dist/` a `public_html/`

**AWS S3:**
```bash
aws s3 sync dist/ s3://tu-bucket --acl public-read
```

**GitHub Pages:**
```bash
npm install -g gh-pages
gh-pages -d dist
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.production` antes del build:

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_ID/exec
```

Luego:
```bash
npm run build
```

## Configuración de Dominio Personalizado

### En Vercel

1. Project Settings > Domains
2. Add Domain
3. Ingresar tu dominio (ej: `portal.nomada.com`)
4. Configurar DNS:
   ```
   Type: CNAME
   Name: portal
   Value: cname.vercel-dns.com
   ```

### En Netlify

1. Domain settings > Add custom domain
2. Configurar DNS:
   ```
   Type: CNAME
   Name: portal
   Value: tu-proyecto.netlify.app
   ```

## HTTPS / SSL

Tanto Vercel como Netlify incluyen SSL automático y gratis.

Para hosting manual:
- Usa [Let's Encrypt](https://letsencrypt.org/)
- O el SSL de tu proveedor de hosting

## Monitoring y Analytics

### Google Analytics (Opcional)

1. Crea una propiedad en Google Analytics
2. Instala el paquete:
   ```bash
   npm install react-ga4
   ```

3. Agrega en `main.jsx`:
   ```javascript
   import ReactGA from 'react-ga4';
   ReactGA.initialize('G-XXXXXXXXXX');
   ```

### Vercel Analytics

Gratis en proyectos de Vercel. Se activa automáticamente.

## Performance Optimization

### 1. Comprimir Assets

Vercel y Netlify lo hacen automáticamente.

Para deployment manual, usar gzip:
```bash
npm install -D vite-plugin-compression
```

### 2. CDN

Usa la CDN que viene con tu hosting:
- Vercel Edge Network
- Netlify Edge
- Cloudflare (para hosting custom)

## Mantenimiento Post-Deploy

### Actualizar el Código

```bash
# Hacer cambios
git add .
git commit -m "Actualización XYZ"
git push

# El deploy es automático en Vercel/Netlify
```

### Actualizar Apps Script

Si modificas el Google Apps Script:

1. Edita el código en Apps Script Editor
2. **NO NECESITAS nuevo deployment** si no cambiaste la lógica fundamental
3. Si haces cambios grandes: Deploy > Manage deployments > Edit > Version: New version

### Rollback

En Vercel/Netlify:
1. Ve a Deployments
2. Encuentra el deployment anterior
3. Click "Promote to Production"

## Troubleshooting Deploy

### Error: "Build failed"

Verifica que `package.json` tenga:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

### Error: Variables de entorno no funcionan

Recuerda el prefijo `VITE_` para todas las variables.

### Error: 404 en rutas

Configura redirects para SPA:

**Vercel** - crear `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** - crear `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Seguridad en Producción

### 1. CORS en Apps Script

El Apps Script ya permite cualquier origen. Para producción, considera limitarlo:

```javascript
function doGet(e) {
  const allowedOrigins = [
    'https://tu-dominio.com',
    'https://www.tu-dominio.com'
  ];
  
  // Código aquí
}
```

### 2. Rate Limiting

Considera agregar rate limiting en Apps Script:

```javascript
function checkRateLimit() {
  const cache = CacheService.getScriptCache();
  const key = 'api_calls';
  const limit = 100; // 100 llamadas
  const window = 3600; // por hora
  
  // Implementar lógica
}
```

### 3. Autenticación Mejorada

Para producción real, implementa:
- OAuth 2.0
- JWT tokens
- Password hashing (bcrypt)

## Monitoreo

### Logs

**Vercel:**
- Deployments > View Function Logs

**Netlify:**
- Deploys > Deploy log

**Apps Script:**
- Apps Script Editor > Executions

### Uptime Monitoring

Usa servicios como:
- [UptimeRobot](https://uptimerobot.com) (gratis)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

## Costos

### Gratis (para proyectos pequeños)

- ✅ Vercel: 100GB bandwidth/mes
- ✅ Netlify: 100GB bandwidth/mes
- ✅ Google Apps Script: 20,000 llamadas/día
- ✅ GitHub Pages: Ilimitado

### Escalado

Si necesitas más:
- Vercel Pro: $20/mes
- Netlify Pro: $19/mes
- Apps Script: Aumenta límites con Google Workspace

## Checklist Pre-Deploy

- [ ] `npm run build` funciona sin errores
- [ ] Google Apps Script deployed y URL copiada
- [ ] Variables de entorno configuradas
- [ ] Datos de prueba en Google Sheets
- [ ] .gitignore incluye `.env`
- [ ] README actualizado con URL de producción
- [ ] DNS configurado (si usas dominio custom)
- [ ] SSL activo
- [ ] Analytics configurado (opcional)

## Soporte

¿Problemas con el deployment?
- Revisa los logs
- Verifica variables de entorno
- Testea el Apps Script directamente
- Contacta soporte de tu plataforma de hosting

---

¡Éxito con tu deployment! 🎉

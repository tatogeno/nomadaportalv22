# 📊 Datos de Ejemplo para Google Sheets

Copia y pega estos datos en tus respectivas pestañas de Google Sheets para testing.

## Pestaña: Propietarios

```
id_propietario | nombre_completo | dni_cuit | email | telefono | cbu_alias | banco
P-001 | Juan Pérez | 20-12345678-9 | juan@email.com | +54 9 11 1234-5678 | juan.perez.mp | Banco Galicia
P-002 | María González | 27-98765432-1 | maria@email.com | +54 9 11 9876-5432 | maria.gonzalez | Banco Santander
```

## Pestaña: Propiedades

```
id_propiedad | alias | id_propietario | direccion | piso_unidad | ciudad | barrio | tipo | ambientes | m2 | estado
H-001 | Libertador 4B | P-001 | Av. Libertador 1000 | 4B | CABA | Belgrano | Departamento | 3 | 85 | Activo
H-002 | Palermo Soho Studio | P-001 | Honduras 4500 | 2A | CABA | Palermo | Departamento | 2 | 45 | Activo
H-003 | Recoleta Luxury | P-002 | Av. Callao 1200 | 10C | CABA | Recoleta | Departamento | 4 | 120 | Activo
```

## Pestaña: Liquidaciones

```
id_liq | periodo | id_propiedad | total_ingresos | total_gastos | a_pagar_propietario | moneda_pago | estado | fecha_pago | link_pdf
L-2024-12-H001 | 2024-12-01 | H-001 | 1200 | 180 | 1020 | USD | Liquidado | 2024-12-05 | #
L-2024-11-H001 | 2024-11-01 | H-001 | 1200 | 95 | 1105 | USD | Liquidado | 2024-11-05 | #
L-2024-10-H001 | 2024-10-01 | H-001 | 1200 | 120 | 1080 | USD | Liquidado | 2024-10-05 | #
L-2024-12-H002 | 2024-12-01 | H-002 | 800 | 75 | 725 | USD | Pendiente | | #
L-2024-12-H003 | 2024-12-01 | H-003 | 1500 | 220 | 1280 | USD | Liquidado | 2024-12-05 | #
```

## Pestaña: Movimientos

### Diciembre 2024 - H-001
```
id_mov | fecha | id_propiedad | tipo | categoria | proveedor | monto | moneda | descripcion | comprobante_url
M-301 | 2024-12-01 | H-001 | Ingreso | Alquiler | Inquilino | 1200 | USD | Alquiler Diciembre 2024 | -
M-302 | 2024-12-08 | H-001 | Egreso | Expensas | Consorcio | 65000 | ARS | Expensas Diciembre | -
M-303 | 2024-12-10 | H-001 | Egreso | ABL | GCBA | 35000 | ARS | ABL Diciembre | -
M-304 | 2024-12-15 | H-001 | Egreso | Comisión | Nómada | 80 | USD | Comisión Admin 10% | -
```

### Noviembre 2024 - H-001
```
M-201 | 2024-11-01 | H-001 | Ingreso | Alquiler | Inquilino | 1200 | USD | Alquiler Noviembre 2024 | -
M-202 | 2024-11-05 | H-001 | Egreso | Mantenimiento | Electricista | 45000 | ARS | Reparación instalación eléctrica | -
M-203 | 2024-11-15 | H-001 | Egreso | Comisión | Nómada | 50 | USD | Comisión Admin | -
```

### Octubre 2024 - H-001
```
M-101 | 2024-10-01 | H-001 | Ingreso | Alquiler | Inquilino | 1200 | USD | Alquiler Octubre 2024 | -
M-102 | 2024-10-10 | H-001 | Egreso | Expensas | Consorcio | 55000 | ARS | Expensas Octubre | -
M-103 | 2024-10-15 | H-001 | Egreso | Comisión | Nómada | 60 | USD | Comisión Admin | -
M-104 | 2024-10-20 | H-001 | Egreso | ABL | GCBA | 30000 | ARS | ABL Octubre | -
```

### Diciembre 2024 - H-002
```
M-305 | 2024-12-01 | H-002 | Ingreso | Alquiler | Inquilino | 800 | USD | Alquiler Diciembre 2024 | -
M-306 | 2024-12-08 | H-002 | Egreso | Expensas | Consorcio | 45000 | ARS | Expensas Diciembre | -
M-307 | 2024-12-15 | H-002 | Egreso | Comisión | Nómada | 30 | USD | Comisión Admin | -
```

### Diciembre 2024 - H-003
```
M-308 | 2024-12-01 | H-003 | Ingreso | Alquiler | Inquilino | 1500 | USD | Alquiler Diciembre 2024 | -
M-309 | 2024-12-05 | H-003 | Egreso | Expensas | Consorcio | 95000 | ARS | Expensas Diciembre | -
M-310 | 2024-12-10 | H-003 | Egreso | ABL | GCBA | 55000 | ARS | ABL Diciembre | -
M-311 | 2024-12-15 | H-003 | Egreso | Comisión | Nómada | 70 | USD | Comisión Admin | -
```

## Pestaña: Contratos (Opcional)

```
id_contrato | id_propiedad | inquilino_nombre | inquilino_email | fecha_inicio | fecha_fin | monto_mensual | moneda | estado
C-001 | H-001 | Roberto Martínez | roberto@email.com | 2024-01-01 | 2024-12-31 | 1200 | USD | Activo
C-002 | H-002 | Laura Fernández | laura@email.com | 2024-06-01 | 2025-05-31 | 800 | USD | Activo
C-003 | H-003 | Carlos Rodríguez | carlos@email.com | 2024-03-01 | 2025-02-28 | 1500 | USD | Activo
```

## 💡 Notas Importantes

1. **Formato de Fechas**: Google Sheets automáticamente formateará las fechas. Asegúrate de usar formato DD/MM/YYYY o YYYY-MM-DD

2. **IDs**: Mantén la consistencia en los IDs:
   - Propietarios: P-XXX
   - Propiedades: H-XXX
   - Liquidaciones: L-YYYY-MM-HXXX
   - Movimientos: M-XXX
   - Contratos: C-XXX

3. **Relaciones**:
   - `id_propietario` en Propiedades debe coincidir con un `id_propietario` en Propietarios
   - `id_propiedad` en Liquidaciones, Movimientos y Contratos debe coincidir con un `id_propiedad` en Propiedades

4. **Monedas**: Usa USD o ARS según corresponda

5. **Estados**: 
   - Liquidaciones: "Liquidado" o "Pendiente"
   - Propiedades: "Activo" o "Inactivo"
   - Contratos: "Activo", "Finalizado" o "Cancelado"

6. **Tipos de Movimiento**: 
   - "Ingreso" o "Egreso"

7. **Categorías Comunes**:
   - Ingresos: Alquiler
   - Egresos: Expensas, ABL, Mantenimiento, Comisión, Servicios

## 🔧 Tips para Google Sheets

1. **Primera fila siempre headers**: No borres nunca la primera fila con los nombres de columnas

2. **Sin filas vacías**: Si una fila está completamente vacía, será ignorada

3. **Formato de números**: No uses símbolos de moneda en las columnas numéricas (monto, total_ingresos, etc.)

4. **Links de comprobantes**: Puedes usar links de Google Drive directos en `comprobante_url` y `link_pdf`

5. **Backup**: Haz una copia del Sheet antes de hacer cambios masivos

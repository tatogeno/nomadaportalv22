/**
 * GOOGLE APPS SCRIPT - Nómada Portal API
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 
 * 1. Abre tu Google Sheet
 * 2. Ve a: Extensiones > Apps Script
 * 3. Borra el código por defecto
 * 4. Copia y pega TODO este código
 * 5. Guarda el proyecto (Ctrl+S o Cmd+S)
 * 6. Click en "Implementar" > "Nueva implementación"
 * 7. Tipo: Aplicación web
 * 8. Configuración:
 *    - Ejecutar como: Yo (tu email)
 *    - Acceso: Cualquier persona
 * 9. Click "Implementar"
 * 10. Copia la URL que te dan
 * 11. Pégala en tu archivo .env en VITE_APPS_SCRIPT_URL
 */

// CONFIGURACIÓN: Nombres de las pestañas en tu Google Sheet
const CONFIG = {
  SHEET_NAMES: {
    PROPIETARIOS: 'Propietarios',
    PROPIEDADES: 'Propiedades',
    LIQUIDACIONES: 'Liquidaciones',
    MOVIMIENTOS: 'Movimientos',
    CONTRATOS: 'Contratos'
  }
};

/**
 * Función principal que maneja las peticiones HTTP GET
 */
function doGet(e) {
  try {
    // Obtener datos de todas las hojas
    const data = {
      propietarios: getDataFromSheet(CONFIG.SHEET_NAMES.PROPIETARIOS),
      propiedades: getDataFromSheet(CONFIG.SHEET_NAMES.PROPIEDADES),
      liquidaciones: getDataFromSheet(CONFIG.SHEET_NAMES.LIQUIDACIONES),
      movimientos: getDataFromSheet(CONFIG.SHEET_NAMES.MOVIMIENTOS),
      contratos: getDataFromSheet(CONFIG.SHEET_NAMES.CONTRATOS) || []
    };

    // Retornar como JSON
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Manejar errores
    const errorResponse = {
      error: true,
      message: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función que maneja las peticiones HTTP POST (escritura)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const data = postData.data;
    
    let result = {};
    
    switch (action) {
      case 'CREATE_MOVEMENT':
        result = createMovement(data);
        break;

      case 'CREATE_PROPIETARIO':
        result = createPropietario(data);
        break;

      case 'CREATE_PROPIEDAD':
        result = createPropiedad(data);
        break;

      case 'CREATE_CONTRATO':
        result = createContrato(data);
        break;

      case 'UPDATE_PROPIETARIO':
        result = updatePropietario(data);
        break;

      default:
        throw new Error('Acción no reconocida: ' + action);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, result: result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Lee datos de una hoja y los convierte a array de objetos
 */
function getDataFromSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`Advertencia: No se encontró la hoja "${sheetName}"`);
      return [];
    }

    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length === 0) {
      return [];
    }

    // Primera fila son los headers
    const headers = values[0];
    const data = [];

    // Procesar filas (saltear la primera que son headers)
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const obj = {};
      
      // Crear objeto con keys de los headers
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        let value = row[j];
        
        // Convertir fechas a formato ISO
        if (value instanceof Date) {
          value = value.toISOString().split('T')[0];
        }
        
        // Limpiar valores vacíos
        if (value === '' || value === null || value === undefined) {
          value = null;
        }
        
        obj[header] = value;
      }
      
      // Solo agregar si la fila tiene datos (no está completamente vacía)
      const hasData = Object.values(obj).some(val => val !== null && val !== '');
      if (hasData) {
        data.push(obj);
      }
    }

    return data;
    
  } catch (error) {
    Logger.log(`Error leyendo hoja "${sheetName}": ${error}`);
    return [];
  }
}

/**
 * Agrega una nueva fila a una hoja
 */
function appendToSheet(sheetName, rowData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`No se encontró la hoja: ${sheetName}`);
    }
    
    // Obtener headers para saber el orden de las columnas
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Crear array con los valores en el orden correcto
    const row = headers.map(header => rowData[header] || '');
    
    // Agregar la fila
    sheet.appendRow(row);
    
    return { success: true, sheetName: sheetName };
    
  } catch (error) {
    Logger.log(`Error agregando a hoja "${sheetName}": ${error}`);
    throw error;
  }
}

/**
 * Crea un nuevo movimiento
 */
function createMovement(data) {
  return appendToSheet(CONFIG.SHEET_NAMES.MOVIMIENTOS, data);
}

/**
 * Crea un nuevo propietario
 */
function createPropietario(data) {
  return appendToSheet(CONFIG.SHEET_NAMES.PROPIETARIOS, data);
}

/**
 * Crea una nueva propiedad
 */
function createPropiedad(data) {
  return appendToSheet(CONFIG.SHEET_NAMES.PROPIEDADES, data);
}

/**
 * Crea un nuevo contrato
 */
function createContrato(data) {
  return appendToSheet(CONFIG.SHEET_NAMES.CONTRATOS, data);
}

/**
 * Actualiza un propietario existente
 */
function updatePropietario(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PROPIETARIOS);

    if (!sheet) {
      throw new Error(`No se encontró la hoja: ${CONFIG.SHEET_NAMES.PROPIETARIOS}`);
    }

    // Obtener todos los datos
    const range = sheet.getDataRange();
    const values = range.getValues();
    const headers = values[0];

    // Encontrar la columna de id_propietario
    const idPropIndex = headers.indexOf('id_propietario');
    if (idPropIndex === -1) {
      throw new Error('No se encontró la columna id_propietario');
    }

    // Buscar la fila del propietario
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][idPropIndex] === data.id_propietario) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`No se encontró el propietario con id: ${data.id_propietario}`);
    }

    // Actualizar cada campo que venga en data
    Object.keys(data).forEach(key => {
      const colIndex = headers.indexOf(key);
      if (colIndex !== -1 && key !== 'id_propietario') {
        sheet.getRange(rowIndex + 1, colIndex + 1).setValue(data[key]);
      }
    });

    return {
      success: true,
      message: 'Propietario actualizado exitosamente',
      id_propietario: data.id_propietario
    };

  } catch (error) {
    Logger.log(`Error actualizando propietario: ${error}`);
    throw error;
  }
}

/**
 * Función para testing - puedes ejecutarla desde el editor
 */
function testGetData() {
  const result = doGet();
  const data = JSON.parse(result.getContent());
  Logger.log(JSON.stringify(data, null, 2));
}

/**
 * Función de testing para POST
 */
function testCreateMovement() {
  const testData = {
    action: 'CREATE_MOVEMENT',
    data: {
      id_mov: 'M-TEST-' + Date.now(),
      fecha: '2024-12-20',
      id_propiedad: 'H-001',
      tipo: 'Ingreso',
      categoria: 'Alquiler',
      proveedor: 'Inquilino',
      monto: 1000,
      moneda: 'USD',
      descripcion: 'Test desde Apps Script',
      comprobante_url: '-'
    }
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}

/**
 * DEBUG: Verificar estructura de Movimientos
 */
function debugMovimientos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Movimientos');

  if (!sheet) {
    Logger.log('❌ ERROR: No se encontró la pestaña "Movimientos"');
    return;
  }

  // Obtener headers (primera fila)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('📋 HEADERS encontrados en Movimientos:');
  Logger.log(headers);
  Logger.log('');

  // Verificar si existe la columna id_propiedad
  const idPropIndex = headers.indexOf('id_propiedad');
  if (idPropIndex === -1) {
    Logger.log('❌ ERROR: No se encontró la columna "id_propiedad" en los headers');
    Logger.log('💡 Verifica que la primera fila tenga exactamente el texto: id_propiedad');
    return;
  } else {
    Logger.log('✅ Columna "id_propiedad" encontrada en posición: ' + (idPropIndex + 1));
  }

  // Obtener primeros 5 movimientos
  const data = getDataFromSheet('Movimientos');
  Logger.log('');
  Logger.log('📊 Total de movimientos: ' + data.length);
  Logger.log('');
  Logger.log('🔍 Primeros 5 movimientos con sus id_propiedad:');

  data.slice(0, 5).forEach((mov, idx) => {
    Logger.log(`[${idx}] id_mov: ${mov.id_mov}, id_propiedad: "${mov.id_propiedad}" (tipo: ${typeof mov.id_propiedad})`);
  });

  // Obtener IDs únicos
  const uniqueIds = [...new Set(data.map(m => m.id_propiedad))];
  Logger.log('');
  Logger.log('🏠 IDs de propiedad únicos encontrados:');
  Logger.log(uniqueIds);

  Logger.log('');
  Logger.log('✅ Debug completado. Revisa los logs arriba para verificar la estructura.');
}

/**
 * DEBUG: Verificar estructura de Liquidaciones
 */
function debugLiquidaciones() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Liquidaciones');

  if (!sheet) {
    Logger.log('❌ ERROR: No se encontró la pestaña "Liquidaciones"');
    return;
  }

  // Obtener headers (primera fila)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('📋 HEADERS encontrados en Liquidaciones:');
  Logger.log(headers);
  Logger.log('');

  // Verificar si existe la columna id_propiedad
  const idPropIndex = headers.indexOf('id_propiedad');
  if (idPropIndex === -1) {
    Logger.log('❌ ERROR: No se encontró la columna "id_propiedad" en los headers');
    Logger.log('💡 Verifica que la primera fila tenga exactamente el texto: id_propiedad');
    return;
  } else {
    Logger.log('✅ Columna "id_propiedad" encontrada en posición: ' + (idPropIndex + 1));
  }

  // Obtener todas las liquidaciones
  const data = getDataFromSheet('Liquidaciones');
  Logger.log('');
  Logger.log('📊 Total de liquidaciones: ' + data.length);
  Logger.log('');
  Logger.log('🔍 Todas las liquidaciones:');

  data.forEach((liq, idx) => {
    Logger.log(`[${idx}] id_liq: ${liq.id_liq}, id_propiedad: "${liq.id_propiedad}", periodo: ${liq.periodo}, estado: ${liq.estado}`);
  });

  // Obtener IDs únicos
  const uniqueIds = [...new Set(data.map(l => l.id_propiedad))];
  Logger.log('');
  Logger.log('🏠 IDs de propiedad únicos en liquidaciones:');
  Logger.log(uniqueIds);

  // Contar liquidaciones por propiedad
  Logger.log('');
  Logger.log('📈 Liquidaciones por propiedad:');
  uniqueIds.forEach(propId => {
    const count = data.filter(l => l.id_propiedad === propId).length;
    Logger.log(`  - ${propId}: ${count} liquidaciones`);
  });

  Logger.log('');
  Logger.log('✅ Debug completado. Revisa los logs arriba para verificar la estructura.');
}

/**
 * DEBUG COMPLETO: Verificar todo el sistema
 */
function debugCompleto() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🔍 DEBUG COMPLETO - NÓMADA PORTAL');
  Logger.log('═══════════════════════════════════════════');
  Logger.log('');

  Logger.log('━━━ 1. PROPIEDADES ━━━');
  const propiedades = getDataFromSheet('Propiedades');
  Logger.log(`Total: ${propiedades.length}`);
  propiedades.forEach((p, idx) => {
    Logger.log(`[${idx}] id: "${p.id_propiedad}", alias: "${p.alias}", id_propietario: "${p.id_propietario}"`);
  });

  Logger.log('');
  Logger.log('━━━ 2. LIQUIDACIONES ━━━');
  debugLiquidaciones();

  Logger.log('');
  Logger.log('━━━ 3. MOVIMIENTOS ━━━');
  debugMovimientos();

  Logger.log('');
  Logger.log('═══════════════════════════════════════════');
  Logger.log('✅ DEBUG COMPLETO FINALIZADO');
  Logger.log('═══════════════════════════════════════════');
}

/**
 * REPARAR: Corregir IDs duplicados en Liquidaciones
 * Esta función genera IDs únicos automáticamente
 */
function repararLiquidaciones() {
  Logger.log('🔧 Iniciando reparación de IDs de liquidaciones...');
  Logger.log('');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Liquidaciones');

  if (!sheet) {
    Logger.log('❌ ERROR: No se encontró la pestaña "Liquidaciones"');
    return;
  }

  // Obtener todos los datos
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values[0];

  // Encontrar índice de columnas
  const idLiqIndex = headers.indexOf('id_liq');
  const idPropIndex = headers.indexOf('id_propiedad');
  const periodoIndex = headers.indexOf('periodo');

  if (idLiqIndex === -1 || idPropIndex === -1) {
    Logger.log('❌ ERROR: No se encontraron las columnas necesarias');
    return;
  }

  Logger.log(`📍 Columnas encontradas:`);
  Logger.log(`  - id_liq: columna ${idLiqIndex + 1}`);
  Logger.log(`  - id_propiedad: columna ${idPropIndex + 1}`);
  Logger.log(`  - periodo: columna ${periodoIndex + 1}`);
  Logger.log('');

  // Contar cambios
  let cambios = 0;

  // Recorrer todas las filas (saltando header)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const idProp = row[idPropIndex];
    const periodo = row[periodoIndex];
    const oldIdLiq = row[idLiqIndex];

    // Saltar filas vacías
    if (!idProp || !periodo) continue;

    // Generar nuevo ID único: L-{Mes}{Año}-{PropiedadID}
    let mes = '';
    let anio = '';

    if (periodo instanceof Date) {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      mes = meses[periodo.getMonth()];
      anio = periodo.getFullYear().toString().slice(-2);
    } else {
      // Si no es Date, intentar parsearlo
      const fecha = new Date(periodo);
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      mes = meses[fecha.getMonth()];
      anio = fecha.getFullYear().toString().slice(-2);
    }

    // Limpiar id_propiedad para el ID (quitar guiones)
    const propClean = idProp.toString().replace(/-/g, '');

    // Formato: L-Abr24-H001
    const newIdLiq = `L-${mes}${anio}-${propClean}`;

    // Solo actualizar si cambió
    if (oldIdLiq !== newIdLiq) {
      Logger.log(`✏️  Fila ${i + 1}: "${oldIdLiq}" → "${newIdLiq}"`);
      sheet.getRange(i + 1, idLiqIndex + 1).setValue(newIdLiq);
      cambios++;
    }
  }

  Logger.log('');
  Logger.log('═══════════════════════════════════════════');
  Logger.log(`✅ Reparación completada: ${cambios} IDs actualizados`);
  Logger.log('═══════════════════════════════════════════');
  Logger.log('');
  Logger.log('💡 Ahora refresca tu portal para ver los cambios');
}

/**
 * DEBUG: Verificar estructura de Propietarios
 */
function debugPropietarios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Propietarios');

  if (!sheet) {
    Logger.log('❌ ERROR: No se encontró la pestaña "Propietarios"');
    return;
  }

  // Obtener headers (primera fila)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('📋 HEADERS encontrados en Propietarios:');
  Logger.log(headers);
  Logger.log('');

  // Obtener todos los propietarios
  const data = getDataFromSheet('Propietarios');
  Logger.log('📊 Total de propietarios: ' + data.length);
  Logger.log('');
  Logger.log('👥 Todos los propietarios:');

  data.forEach((prop, idx) => {
    Logger.log(`[${idx}] id: "${prop.id_propietario}", nombre: "${prop.nombre_completo}", email: "${prop.email}"`);
    Logger.log(`      cbu_alias: "${prop.cbu_alias || 'NO DEFINIDO'}", direccion_entrega: "${prop.direccion_entrega || 'NO DEFINIDO'}"`);
  });

  Logger.log('');
  Logger.log('✅ Debug completado.');
}

/**
 * Servicio de API para conectar con Google Sheets via Apps Script
 * 
 * CONFIGURACIÓN:
 * 1. Reemplaza GOOGLE_APPS_SCRIPT_URL con tu URL de Apps Script
 * 2. El Apps Script debe devolver datos en formato JSON con esta estructura:
 *    {
 *      propietarios: [...],
 *      propiedades: [...],
 *      liquidaciones: [...],
 *      movimientos: [...],
 *      contratos: [...]
 *    }
 */

// URL de tu Google Apps Script (reemplazar con la real después del deploy)
const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'PENDIENTE_CONFIGURAR';

// Modo desarrollo: usar datos mock si la URL no está configurada
const USE_MOCK_DATA = GOOGLE_APPS_SCRIPT_URL === 'PENDIENTE_CONFIGURAR';

// Datos mock para desarrollo local
const MOCK_DATA = {
  propietarios: [
    {
      id_propietario: "P-001",
      nombre_completo: "Juan Pérez",
      dni_cuit: "20-12345678-9",
      email: "juan@email.com",
      telefono: "+54 9 11 1234-5678",
      cbu_alias: "juan.perez.mp",
      banco: "Banco Galicia",
      direccion_entrega: "Av. Libertador 1000, Piso 4B, CABA",
      password: "123456"
    },
    {
      id_propietario: "P-002",
      nombre_completo: "María González",
      dni_cuit: "27-98765432-1",
      email: "maria@email.com",
      telefono: "+54 9 11 9876-5432",
      cbu_alias: "maria.gonzalez",
      banco: "Banco Santander",
      direccion_entrega: null,
      password: "maria123"
    }
  ],
  propiedades: [
    { 
      id_propiedad: "H-001", 
      alias: "Libertador 4B", 
      id_propietario: "P-001", 
      direccion: "Av. Libertador 1000", 
      piso_unidad: "4B", 
      ciudad: "CABA",
      barrio: "Belgrano",
      tipo: "Departamento",
      ambientes: 3,
      m2: 85,
      estado: "Activo" 
    },
    { 
      id_propiedad: "H-002", 
      alias: "Palermo Soho Studio", 
      id_propietario: "P-001", 
      direccion: "Honduras 4500", 
      piso_unidad: "2A", 
      ciudad: "CABA",
      barrio: "Palermo",
      tipo: "Departamento",
      ambientes: 2,
      m2: 45,
      estado: "Activo" 
    },
    { 
      id_propiedad: "H-003", 
      alias: "Recoleta Luxury", 
      id_propietario: "P-002", 
      direccion: "Av. Callao 1200", 
      piso_unidad: "10C", 
      ciudad: "CABA",
      barrio: "Recoleta",
      tipo: "Departamento",
      ambientes: 4,
      m2: 120,
      estado: "Activo" 
    }
  ],
  liquidaciones: [
    { 
      id_liq: "L-2024-12-H001", 
      periodo: "2024-12-01", 
      id_propiedad: "H-001", 
      total_ingresos: 1200, 
      total_gastos: 180, 
      a_pagar_propietario: 1020, 
      moneda_pago: "USD", 
      estado: "Liquidado", 
      fecha_pago: "2024-12-05",
      link_pdf: "#" 
    },
    { 
      id_liq: "L-2024-11-H001", 
      periodo: "2024-11-01", 
      id_propiedad: "H-001", 
      total_ingresos: 1200, 
      total_gastos: 95, 
      a_pagar_propietario: 1105, 
      moneda_pago: "USD", 
      estado: "Liquidado", 
      fecha_pago: "2024-11-05",
      link_pdf: "#" 
    },
    { 
      id_liq: "L-2024-10-H001", 
      periodo: "2024-10-01", 
      id_propiedad: "H-001", 
      total_ingresos: 1200, 
      total_gastos: 120, 
      a_pagar_propietario: 1080, 
      moneda_pago: "USD", 
      estado: "Liquidado", 
      fecha_pago: "2024-10-05",
      link_pdf: "#" 
    },
    { 
      id_liq: "L-2024-12-H002", 
      periodo: "2024-12-01", 
      id_propiedad: "H-002", 
      total_ingresos: 800, 
      total_gastos: 75, 
      a_pagar_propietario: 725, 
      moneda_pago: "USD", 
      estado: "Pendiente", 
      link_pdf: "#" 
    },
    { 
      id_liq: "L-2024-12-H003", 
      periodo: "2024-12-01", 
      id_propiedad: "H-003", 
      total_ingresos: 1500, 
      total_gastos: 220, 
      a_pagar_propietario: 1280, 
      moneda_pago: "USD", 
      estado: "Liquidado", 
      fecha_pago: "2024-12-05",
      link_pdf: "#" 
    }
  ],
  movimientos: [
    // Diciembre 2024 - H-001
    { id_mov: "M-301", fecha: "2024-12-01", id_propiedad: "H-001", tipo: "Ingreso", categoria: "Alquiler", proveedor: "Inquilino", monto: 1200, moneda: "USD", descripcion: "Alquiler Diciembre 2024" },
    { id_mov: "M-302", fecha: "2024-12-08", id_propiedad: "H-001", tipo: "Egreso", categoria: "Expensas", proveedor: "Consorcio", monto: 65000, moneda: "ARS", descripcion: "Expensas Diciembre" },
    { id_mov: "M-303", fecha: "2024-12-10", id_propiedad: "H-001", tipo: "Egreso", categoria: "ABL", proveedor: "GCBA", monto: 35000, moneda: "ARS", descripcion: "ABL Diciembre" },
    { id_mov: "M-304", fecha: "2024-12-15", id_propiedad: "H-001", tipo: "Egreso", categoria: "Comisión", proveedor: "Nómada", monto: 80, moneda: "USD", descripcion: "Comisión Admin 10%" },
    
    // Noviembre 2024 - H-001
    { id_mov: "M-201", fecha: "2024-11-01", id_propiedad: "H-001", tipo: "Ingreso", categoria: "Alquiler", proveedor: "Inquilino", monto: 1200, moneda: "USD", descripcion: "Alquiler Noviembre 2024" },
    { id_mov: "M-202", fecha: "2024-11-05", id_propiedad: "H-001", tipo: "Egreso", categoria: "Mantenimiento", proveedor: "Electricista", monto: 45000, moneda: "ARS", descripcion: "Reparación instalación eléctrica" },
    { id_mov: "M-203", fecha: "2024-11-15", id_propiedad: "H-001", tipo: "Egreso", categoria: "Comisión", proveedor: "Nómada", monto: 50, moneda: "USD", descripcion: "Comisión Admin" },
    
    // Octubre 2024 - H-001
    { id_mov: "M-101", fecha: "2024-10-01", id_propiedad: "H-001", tipo: "Ingreso", categoria: "Alquiler", proveedor: "Inquilino", monto: 1200, moneda: "USD", descripcion: "Alquiler Octubre 2024" },
    { id_mov: "M-102", fecha: "2024-10-10", id_propiedad: "H-001", tipo: "Egreso", categoria: "Expensas", proveedor: "Consorcio", monto: 55000, moneda: "ARS", descripcion: "Expensas Octubre" },
    { id_mov: "M-103", fecha: "2024-10-15", id_propiedad: "H-001", tipo: "Egreso", categoria: "Comisión", proveedor: "Nómada", monto: 60, moneda: "USD", descripcion: "Comisión Admin" },
    { id_mov: "M-104", fecha: "2024-10-20", id_propiedad: "H-001", tipo: "Egreso", categoria: "ABL", proveedor: "GCBA", monto: 30000, moneda: "ARS", descripcion: "ABL Octubre" },
    
    // Diciembre 2024 - H-002
    { id_mov: "M-305", fecha: "2024-12-01", id_propiedad: "H-002", tipo: "Ingreso", categoria: "Alquiler", proveedor: "Inquilino", monto: 800, moneda: "USD", descripcion: "Alquiler Diciembre 2024" },
    { id_mov: "M-306", fecha: "2024-12-08", id_propiedad: "H-002", tipo: "Egreso", categoria: "Expensas", proveedor: "Consorcio", monto: 45000, moneda: "ARS", descripcion: "Expensas Diciembre" },
    { id_mov: "M-307", fecha: "2024-12-15", id_propiedad: "H-002", tipo: "Egreso", categoria: "Comisión", proveedor: "Nómada", monto: 30, moneda: "USD", descripcion: "Comisión Admin" },
    
    // Diciembre 2024 - H-003
    { id_mov: "M-308", fecha: "2024-12-01", id_propiedad: "H-003", tipo: "Ingreso", categoria: "Alquiler", proveedor: "Inquilino", monto: 1500, moneda: "USD", descripcion: "Alquiler Diciembre 2024" },
    { id_mov: "M-309", fecha: "2024-12-05", id_propiedad: "H-003", tipo: "Egreso", categoria: "Expensas", proveedor: "Consorcio", monto: 95000, moneda: "ARS", descripcion: "Expensas Diciembre" },
    { id_mov: "M-310", fecha: "2024-12-10", id_propiedad: "H-003", tipo: "Egreso", categoria: "ABL", proveedor: "GCBA", monto: 55000, moneda: "ARS", descripcion: "ABL Diciembre" },
    { id_mov: "M-311", fecha: "2024-12-15", id_propiedad: "H-003", tipo: "Egreso", categoria: "Comisión", proveedor: "Nómada", monto: 70, moneda: "USD", descripcion: "Comisión Admin" }
  ],
  contratos: [
    {
      id_contrato: "C-001",
      id_propiedad: "H-001",
      inquilino_nombre: "Roberto Martínez",
      inquilino_email: "roberto@email.com",
      fecha_inicio: "2024-01-01",
      fecha_fin: "2024-12-31",
      monto_mensual: 1200,
      moneda: "USD",
      estado: "Activo"
    },
    {
      id_contrato: "C-002",
      id_propiedad: "H-002",
      inquilino_nombre: "Laura Fernández",
      inquilino_email: "laura@email.com",
      fecha_inicio: "2024-06-01",
      fecha_fin: "2025-05-31",
      monto_mensual: 800,
      moneda: "USD",
      estado: "Activo"
    },
    {
      id_contrato: "C-003",
      id_propiedad: "H-003",
      inquilino_nombre: "Carlos Rodríguez",
      inquilino_email: "carlos@email.com",
      fecha_inicio: "2024-03-01",
      fecha_fin: "2025-02-28",
      monto_mensual: 1500,
      moneda: "USD",
      estado: "Activo"
    }
  ]
};

class ApiService {
  constructor() {
    this.cache = null;
    this.cacheTime = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obtiene todos los datos del sistema
   * @param {boolean} forceRefresh - Fuerza la actualización ignorando cache
   * @returns {Promise<Object>} Datos completos del sistema
   */
  async fetchAllData(forceRefresh = false) {
    // Verificar si hay cache válido
    if (!forceRefresh && this.cache && this.cacheTime && (Date.now() - this.cacheTime < this.CACHE_DURATION)) {
      console.log('📦 Usando datos desde cache');
      return this.cache;
    }

    console.log('🔄 Obteniendo datos frescos...');

    try {
      if (USE_MOCK_DATA) {
        console.log('⚠️ Modo desarrollo: usando datos mock');
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.cache = MOCK_DATA;
        this.cacheTime = Date.now();
        return MOCK_DATA;
      }

      // Llamada real a Google Apps Script
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Validar estructura de datos
      this.validateData(data);
      
      // Guardar en cache
      this.cache = data;
      this.cacheTime = Date.now();
      
      console.log('✅ Datos obtenidos correctamente');
      return data;

    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
      
      // Si hay cache antiguo, usarlo como fallback
      if (this.cache) {
        console.log('⚠️ Usando cache antiguo como fallback');
        return this.cache;
      }
      
      throw error;
    }
  }

  /**
   * Valida la estructura de los datos recibidos
   */
  validateData(data) {
    const requiredKeys = ['propietarios', 'propiedades', 'liquidaciones', 'movimientos'];
    const missingKeys = requiredKeys.filter(key => !data.hasOwnProperty(key));
    
    if (missingKeys.length > 0) {
      throw new Error(`Datos incompletos. Faltan: ${missingKeys.join(', ')}`);
    }
  }

  /**
   * Obtiene datos de un propietario específico por email
   */
  async getPropietarioByEmail(email) {
    const data = await this.fetchAllData();
    return data.propietarios.find(p => p.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Obtiene propiedades de un propietario
   */
  async getPropiedadesByPropietario(idPropietario) {
    const data = await this.fetchAllData();
    return data.propiedades.filter(p => p.id_propietario === idPropietario);
  }

  /**
   * Limpia el cache (útil para forzar actualización)
   */
  clearCache() {
    this.cache = null;
    this.cacheTime = null;
    console.log('🗑️ Cache limpiado');
  }

  /**
   * Retorna si está en modo mock
   */
  isMockMode() {
    return USE_MOCK_DATA;
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();

// Exportar también la clase por si se necesita crear instancias adicionales
export default ApiService;

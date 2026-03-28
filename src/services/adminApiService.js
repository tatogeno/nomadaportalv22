/**
 * Servicio de API para ESCRITURA en Google Sheets
 */

const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'PENDIENTE_CONFIGURAR';

class AdminApiService {
  
  // Función maestra interna para realizar los envíos
  async _sendToGoogleSheet(action, dataPayload) {
    try {
      const payload = {
        action: action,
        data: dataPayload
      };

      console.log(`🌐 Enviando a Google Sheets:`, payload);

      // Enviamos como texto plano (sin header JSON) para evitar problemas de CORS con Google
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log(`📡 Respuesta HTTP status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log(`📥 Respuesta de Google:`, result);

      // Verificamos si el Script de Google reportó un error lógico
      if (result.error || result.success === false) {
        throw new Error(result.error || result.message || 'Error en Google Script');
      }

      return result;

    } catch (error) {
      console.error(`❌ Error enviando ${action}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo movimiento
   */
  async createMovement(movementData) {
    return this._sendToGoogleSheet('CREATE_MOVEMENT', movementData);
  }

  /**
   * Crea un nuevo propietario
   */
  async createPropietario(propietarioData) {
    return this._sendToGoogleSheet('CREATE_PROPIETARIO', propietarioData);
  }

  /**
   * Crea una nueva propiedad
   */
  async createPropiedad(propiedadData) {
    return this._sendToGoogleSheet('CREATE_PROPIEDAD', propiedadData);
  }

  /**
   * Crea un nuevo contrato
   */
  async createContrato(contratoData) {
    return this._sendToGoogleSheet('CREATE_CONTRATO', contratoData);
  }

  /**
   * Actualiza un propietario existente
   */
  async updatePropietario(propietarioData) {
    return this._sendToGoogleSheet('UPDATE_PROPIETARIO', propietarioData);
  }

  /**
   * Genera IDs únicos
   */
  generateId(prefix) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Sube archivo (Mock por ahora)
   */
  async uploadFile(file) {
    console.log('Subiendo archivo:', file.name);
    return Promise.resolve({
      success: true,
      url: `https://drive.google.com/file/d/MOCK_FILE_ID_${Date.now()}/view`
    });
  }
}

export const adminApiService = new AdminApiService();
export default AdminApiService;
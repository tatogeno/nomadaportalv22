import React, { useState, useMemo } from 'react';
import {
  Calendar, Home, TrendingUp, TrendingDown, Upload,
  Save, CheckCircle, DollarSign, Search, Plus, X
} from 'lucide-react';
import { adminApiService } from '../../services/adminApiService';
import PropertyWizard from './PropertyWizard';

const DailyMovementForm = ({ properties, onSuccess }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    id_propiedad: '',
    tipo: 'Ingreso',
    categoria: '',
    monto: '',
    moneda: 'USD',
    descripcion: '',
    proveedor: '',
    comprobante_url: '',
    imputable_a: 'Propietario'
  });

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Categorías según tipo
  const categorias = {
    'Ingreso': ['Alquiler', 'Depósito', 'Reintegro Servicios', 'Otros Ingresos'],
    'Egreso': ['Mantenimiento', 'Expensas', 'ABL', 'Servicios', 'Limpieza', 'Honorarios', 'Comisión', 'Impuestos']
  };

  // Filtrar propiedades según término de búsqueda
  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return properties;

    const term = searchTerm.toLowerCase();
    return properties.filter(p => {
      const alias = (p.alias || '').toString().toLowerCase();
      const direccion = (p.direccion || '').toString().toLowerCase();
      const id = (p.id_propiedad || '').toString().toLowerCase();
      const piso = (p.piso_unidad || '').toString().toLowerCase();

      return alias.includes(term) ||
             direccion.includes(term) ||
             id.includes(term) ||
             piso.includes(term);
    });
  }, [properties, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_propiedad || !formData.monto || !formData.categoria) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      // Si hay archivo, subirlo primero
      let comprobanteUrl = '';
      if (file) {
        const uploadResult = await adminApiService.uploadFile(file);
        comprobanteUrl = uploadResult.url;
      }

      // Crear el movimiento
      const movementData = {
        id_mov: adminApiService.generateId('M'),
        fecha: formData.fecha,
        id_propiedad: formData.id_propiedad,
        tipo: formData.tipo,
        categoria: formData.categoria,
        proveedor: formData.proveedor || null,
        monto: parseFloat(formData.monto),
        moneda: formData.moneda,
        descripcion: formData.descripcion || null,
        comprobante_url: comprobanteUrl || null
      };

      await adminApiService.createMovement(movementData);

      // Reset form
      setFormData({
        ...formData,
        monto: '',
        descripcion: '',
        proveedor: '',
        categoria: ''
      });
      setFile(null);

      onSuccess && onSuccess(movementData);

    } catch (error) {
      alert('Error al guardar el movimiento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyCreated = () => {
    setShowPropertyModal(false);
    onSuccess && onSuccess(); // Trigger refresh
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <TrendingUp /> Carga Operativa Diaria
        </h2>
        <span className="text-xs bg-blue-700 px-2 py-1 rounded">Uso Frecuente</span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Tipo de Movimiento */}
        <div className="flex gap-4">
          <label className={`cursor-pointer flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
            formData.tipo === 'Ingreso' 
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
              : 'border-slate-200 text-slate-400 hover:bg-slate-50'
          }`}>
            <input 
              type="radio" 
              name="tipo" 
              value="Ingreso" 
              checked={formData.tipo === 'Ingreso'} 
              onChange={(e) => setFormData({...formData, tipo: e.target.value, categoria: ''})}
              className="hidden" 
            />
            <TrendingUp size={24} />
            <span className="font-bold">INGRESO</span>
          </label>
          
          <label className={`cursor-pointer flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
            formData.tipo === 'Egreso' 
              ? 'border-rose-500 bg-rose-50 text-rose-700' 
              : 'border-slate-200 text-slate-400 hover:bg-slate-50'
          }`}>
            <input 
              type="radio" 
              name="tipo" 
              value="Egreso" 
              checked={formData.tipo === 'Egreso'} 
              onChange={(e) => setFormData({...formData, tipo: e.target.value, categoria: ''})}
              className="hidden" 
            />
            <TrendingDown size={24} />
            <span className="font-bold">EGRESO</span>
          </label>
        </div>

        {/* Fecha y Propiedad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha *</label>
            <div className="relative">
              <input 
                type="date" 
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
              <Calendar className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Propiedad *</label>

            {/* Search Bar */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar propiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Property Selector */}
            <div className="relative">
              <select
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                value={formData.id_propiedad}
                onChange={(e) => setFormData({...formData, id_propiedad: e.target.value})}
              >
                <option value="">Seleccionar Propiedad...</option>
                {filteredProperties.map(p => (
                  <option key={p.id_propiedad} value={p.id_propiedad}>
                    {p.alias} - {p.direccion}
                  </option>
                ))}
              </select>
              <Home className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* Add New Property Button */}
            <button
              type="button"
              onClick={() => setShowPropertyModal(true)}
              className="mt-2 w-full p-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} />
              Agregar Nueva Propiedad
            </button>

            {/* Results count */}
            {searchTerm && (
              <p className="mt-1 text-xs text-slate-500">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              </p>
            )}
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Categoría *</label>
          <select 
            required
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.categoria}
            onChange={(e) => setFormData({...formData, categoria: e.target.value})}
          >
            <option value="">Seleccionar Categoría...</option>
            {categorias[formData.tipo].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Monto y Moneda */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monto *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-slate-500" size={16} />
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-10 p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Moneda</label>
              <select 
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.moneda}
                onChange={(e) => setFormData({...formData, moneda: e.target.value})}
              >
                <option value="USD">USD (Dólares)</option>
                <option value="ARS">ARS (Pesos)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Descripción *</label>
          <input 
            type="text" 
            required
            placeholder="Ej: Alquiler Diciembre 2024"
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          />
        </div>

        {/* Proveedor */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Proveedor (Opcional)</label>
          <input 
            type="text" 
            placeholder="Ej: Plomero Jorge"
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.proveedor}
            onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
          />
        </div>

        {/* Comprobante */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Comprobante (Opcional)</label>
          <label className="cursor-pointer flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
            <Upload size={18} />
            <span className="text-sm font-medium">
              {file ? file.name : 'Subir Foto/PDF'}
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files[0])} 
            />
          </label>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2 ${
            formData.tipo === 'Ingreso' 
              ? 'bg-emerald-600 hover:bg-emerald-700' 
              : 'bg-rose-600 hover:bg-rose-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save size={20} /> Registrar Movimiento
            </>
          )}
        </button>

      </form>

      {/* Property Creation Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Agregar Nueva Propiedad</h3>
              <button
                onClick={() => setShowPropertyModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <PropertyWizard onSuccess={handlePropertyCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMovementForm;

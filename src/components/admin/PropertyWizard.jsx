import React, { useState } from 'react';
import { Briefcase, CheckCircle, User, Home, FileText } from 'lucide-react';
import { adminApiService } from '../../services/adminApiService';

const PropertyWizard = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Propietario
    ownerName: '',
    ownerDni: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerCbu: '',
    ownerBanco: '',
    
    // Propiedad
    address: '',
    floor: '',
    unit: '',
    alias: '',
    city: 'CABA',
    barrio: '',
    tipo: 'Departamento',
    ambientes: '',
    m2: '',
    photosLink: '',
    
    // Contrato
    tenantName: '',
    tenantEmail: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    rentCurrency: 'USD',
    contractLink: ''
  });

  // Helper: Limpia valores vacíos para evitar enviar strings vacías a Google Sheets
  const cleanData = (obj) => {
    const cleaned = {};
    for (const key in obj) {
      const value = obj[key];
      // Si el valor es string vacía, lo convertimos a null
      // Si es undefined, lo saltamos
      if (value === '') {
        cleaned[key] = null;
      } else if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear Propietario
      const propietarioId = adminApiService.generateId('P');
      const pisoUnidad = formData.floor || formData.unit
        ? `${formData.floor}${formData.unit}`.trim()
        : null;

      const propietarioData = cleanData({
        id_propietario: propietarioId,
        nombre_completo: formData.ownerName,
        dni_cuit: formData.ownerDni || null,
        email: formData.ownerEmail || null,
        telefono: formData.ownerPhone || null,
        cbu_alias: formData.ownerCbu || null,
        banco: formData.ownerBanco || null,
        notas_internas: null // Campo de la hoja, por ahora vacío
      });

      console.log('📤 Enviando Propietario:', propietarioData);
      await adminApiService.createPropietario(propietarioData);
      console.log('✅ Propietario creado');

      // 2. Crear Propiedad
      const propiedadId = adminApiService.generateId('H');
      const propiedadData = cleanData({
        id_propiedad: propiedadId,
        alias: formData.alias,
        id_propietario: propietarioId,
        direccion: formData.address,
        piso_unidad: pisoUnidad,
        ciudad: formData.city,
        estado: 'Activo'
        // NOTA: barrio, tipo, ambientes, m2 NO existen en tu hoja actual
        // Si los necesitas, agrégalos manualmente a Google Sheets primero
      });

      console.log('📤 Enviando Propiedad:', propiedadData);
      await adminApiService.createPropiedad(propiedadData);
      console.log('✅ Propiedad creada');

      // 3. Crear Contrato
      if (formData.tenantName && formData.startDate) {
        const contratoId = adminApiService.generateId('C');
        const contratoData = cleanData({
          id_contrato: contratoId,
          id_propiedad: propiedadId,
          id_propietario: propietarioId,
          inquilino: formData.tenantName, // ✅ Cambiado de inquilino_nombre
          fecha_inicio: formData.startDate,
          fecha_final: formData.endDate || null, // ✅ Cambiado de fecha_fin
          monto_pactado: parseFloat(formData.rentAmount), // ✅ Cambiado de monto_mensual
          moneda: formData.rentCurrency,
          link_pdf: formData.contractLink || null // ✅ Agregado
        });

        console.log('📤 Enviando Contrato:', contratoData);
        await adminApiService.createContrato(contratoData);
        console.log('✅ Contrato creado');
      }

      // Reset form
      setFormData({
        ownerName: '', ownerDni: '', ownerEmail: '', ownerPhone: '', ownerCbu: '', ownerBanco: '',
        address: '', floor: '', unit: '', alias: '', city: 'CABA', barrio: '', 
        tipo: 'Departamento', ambientes: '', m2: '', photosLink: '',
        tenantName: '', tenantEmail: '', startDate: '', endDate: '', rentAmount: '', 
        rentCurrency: 'USD', contractLink: ''
      });
      setStep(1);

      alert('✅ Alta completada exitosamente! La propiedad ya está disponible en el sistema.');
      onSuccess && onSuccess();

    } catch (error) {
      alert('Error al completar el alta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = ({ num, title, active }) => (
    <div className={`flex items-center gap-2 ${active ? 'text-indigo-700 font-bold' : 'text-slate-400'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
        active ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'
      }`}>
        {num}
      </div>
      <span className="hidden md:inline text-sm">{title}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-indigo-700 p-6 text-white">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Briefcase /> Altas y Contratos
        </h2>
        <p className="text-indigo-200 text-sm mt-1">
          Wizard de configuración inicial para propiedades nuevas
        </p>
      </div>

      {/* Step Indicator */}
      <div className="p-6 border-b border-slate-100 flex justify-between px-10">
        <StepIndicator num="1" title="Datos Dueño" active={step >= 1} />
        <div className="h-[2px] bg-slate-200 flex-1 mx-4 mt-4"></div>
        <StepIndicator num="2" title="Propiedad" active={step >= 2} />
        <div className="h-[2px] bg-slate-200 flex-1 mx-4 mt-4"></div>
        <StepIndicator num="3" title="Contrato" active={step >= 3} />
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        
        {/* PASO 1: PROPIETARIO */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-3 flex items-center gap-2">
              <User size={20} /> A. Datos del Propietario
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput 
                label="Nombre Completo *" 
                value={formData.ownerName} 
                onChange={(v) => setFormData({...formData, ownerName: v})} 
                required 
              />
              <FormInput 
                label="DNI / CUIT" 
                value={formData.ownerDni} 
                onChange={(v) => setFormData({...formData, ownerDni: v})} 
              />
              <FormInput 
                label="Email" 
                type="email" 
                value={formData.ownerEmail} 
                onChange={(v) => setFormData({...formData, ownerEmail: v})} 
              />
              <FormInput 
                label="Teléfono" 
                type="tel" 
                value={formData.ownerPhone} 
                onChange={(v) => setFormData({...formData, ownerPhone: v})} 
              />
              <FormInput 
                label="CBU / Alias" 
                value={formData.ownerCbu} 
                onChange={(v) => setFormData({...formData, ownerCbu: v})} 
                placeholder="Para liquidaciones"
              />
              <FormInput 
                label="Banco" 
                value={formData.ownerBanco} 
                onChange={(v) => setFormData({...formData, ownerBanco: v})} 
                placeholder="Ej: Banco Galicia"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: PROPIEDAD */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-3 flex items-center gap-2">
              <Home size={20} /> B. Datos del Inmueble
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <FormInput 
                  label="Dirección Calle y Altura *" 
                  value={formData.address} 
                  onChange={(v) => setFormData({...formData, address: v})} 
                  required 
                  placeholder="Ej: Av. Libertador 1000"
                />
              </div>
              
              <FormInput 
                label="Piso" 
                value={formData.floor} 
                onChange={(v) => setFormData({...formData, floor: v})} 
                placeholder="4"
              />
              <FormInput 
                label="Unidad" 
                value={formData.unit} 
                onChange={(v) => setFormData({...formData, unit: v})} 
                placeholder="B"
              />
              <FormInput 
                label="Barrio" 
                value={formData.barrio} 
                onChange={(v) => setFormData({...formData, barrio: v})} 
                placeholder="Belgrano"
              />
              
              <div className="md:col-span-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <FormInput 
                  label="Alias Interno (Nombre corto) *" 
                  value={formData.alias} 
                  onChange={(v) => setFormData({...formData, alias: v})} 
                  placeholder="Ej: Libertador 4B" 
                  required 
                />
                <p className="text-xs text-yellow-700 mt-2">
                  * Este es el nombre que verás en los formularios y reportes
                </p>
              </div>
              
              <FormInput 
                label="Tipo" 
                value={formData.tipo} 
                onChange={(v) => setFormData({...formData, tipo: v})} 
                isSelect
                options={['Departamento', 'Casa', 'Local', 'Oficina']}
              />
              <FormInput 
                label="Ambientes" 
                type="number" 
                value={formData.ambientes} 
                onChange={(v) => setFormData({...formData, ambientes: v})} 
                placeholder="3"
              />
              <FormInput 
                label="m²" 
                type="number" 
                value={formData.m2} 
                onChange={(v) => setFormData({...formData, m2: v})} 
                placeholder="85"
              />
              
              <div className="md:col-span-3">
                <FormInput 
                  label="Link Carpeta Drive (Fotos/Inventario)" 
                  value={formData.photosLink} 
                  onChange={(v) => setFormData({...formData, photosLink: v})} 
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-slate-500 hover:text-indigo-600 font-medium transition"
              >
                ← Volver
              </button>
              <button 
                type="button" 
                onClick={() => setStep(3)} 
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: CONTRATO */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-3 flex items-center gap-2">
              <FileText size={20} /> C. Contrato de Alquiler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput 
                label="Nombre Inquilino *" 
                value={formData.tenantName} 
                onChange={(v) => setFormData({...formData, tenantName: v})} 
                required 
              />
              <FormInput 
                label="Email Inquilino" 
                type="email" 
                value={formData.tenantEmail} 
                onChange={(v) => setFormData({...formData, tenantEmail: v})} 
              />
              <FormInput 
                label="Fecha Inicio *" 
                type="date" 
                value={formData.startDate} 
                onChange={(v) => setFormData({...formData, startDate: v})} 
                required
              />
              <FormInput 
                label="Fecha Fin" 
                type="date" 
                value={formData.endDate} 
                onChange={(v) => setFormData({...formData, endDate: v})} 
              />
              <FormInput 
                label="Monto Mensual *" 
                type="number" 
                value={formData.rentAmount} 
                onChange={(v) => setFormData({...formData, rentAmount: v})} 
                placeholder="1200"
                required
              />
              <FormInput 
                label="Moneda" 
                value={formData.rentCurrency} 
                onChange={(v) => setFormData({...formData, rentCurrency: v})} 
                isSelect
                options={['USD', 'ARS']}
              />
              <div className="md:col-span-2">
                <FormInput 
                  label="Link al PDF Contrato" 
                  value={formData.contractLink} 
                  onChange={(v) => setFormData({...formData, contractLink: v})} 
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="text-slate-500 hover:text-indigo-600 font-medium transition"
              >
                ← Volver
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg hover:bg-emerald-700 font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18}/> Finalizar Alta
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

// Helper Component
const FormInput = ({ label, type = "text", value, onChange, placeholder, required, isSelect, options }) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
        {label}
      </label>
      {isSelect ? (
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          required={required}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50"
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          required={required}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50"
        />
      )}
    </div>
  );
};

export default PropertyWizard;

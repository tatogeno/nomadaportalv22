import React, { useState, useMemo } from 'react';
import { Building, Search, CheckCircle, XCircle, User } from 'lucide-react';

const PropiedadesPanel = ({ propiedades, contratos, propietarios }) => {
  const [activeSubTab, setActiveSubTab] = useState('buscar');
  const [searchTerm, setSearchTerm] = useState('');

  const getPropietarioNombre = (idPropietario) => {
    const p = propietarios.find(p => p.id_propietario === idPropietario);
    return p ? p.nombre_completo : idPropietario;
  };

  const tieneContratoActivo = (idPropiedad) => {
    return contratos.some(c => {
      if (c.id_propiedad !== idPropiedad) return false;
      if (!c.fecha_fin) return c.estado === 'Activo';
      return new Date(c.fecha_fin) >= new Date() && c.estado === 'Activo';
    });
  };

  const propiedadesEnAlquiler = useMemo(() =>
    propiedades.filter(p => tieneContratoActivo(p.id_propiedad)),
    [propiedades, contratos]
  );

  const propiedadesDisponibles = useMemo(() =>
    propiedades.filter(p => !tieneContratoActivo(p.id_propiedad)),
    [propiedades, contratos]
  );

  const propiedadesFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return propiedades;
    const term = searchTerm.toLowerCase();
    return propiedades.filter(p =>
      (p.alias || '').toLowerCase().includes(term) ||
      (p.direccion || '').toLowerCase().includes(term) ||
      (p.barrio || '').toLowerCase().includes(term) ||
      (p.ciudad || '').toLowerCase().includes(term) ||
      (p.id_propiedad || '').toLowerCase().includes(term)
    );
  }, [propiedades, searchTerm]);

  const propiedadesPorPropietario = useMemo(() => {
    const agrupado = {};
    propiedades.forEach(p => {
      const key = p.id_propietario;
      if (!agrupado[key]) agrupado[key] = [];
      agrupado[key].push(p);
    });
    return agrupado;
  }, [propiedades]);

  const PropiedadCard = ({ propiedad }) => {
    const activo = tieneContratoActivo(propiedad.id_propiedad);
    const contratoActual = contratos.find(c => c.id_propiedad === propiedad.id_propiedad && c.estado === 'Activo');
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold">{propiedad.alias}</p>
            <p className="text-sm text-slate-500">{propiedad.direccion}{propiedad.piso_unidad ? ` - ${propiedad.piso_unidad}` : ''}</p>
            <p className="text-xs text-slate-400">{propiedad.barrio && `${propiedad.barrio}, `}{propiedad.ciudad}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {activo ? 'En alquiler' : 'Disponible'}
          </span>
        </div>
        <div className="flex gap-3 text-xs text-slate-500 mt-2">
          {propiedad.tipo && <span>{propiedad.tipo}</span>}
          {propiedad.ambientes && <span>{propiedad.ambientes} amb.</span>}
          {propiedad.m2 && <span>{propiedad.m2} m²</span>}
        </div>
        {contratoActual && (
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            Inquilino: <span className="font-medium">{contratoActual.inquilino_nombre || '—'}</span>
            {contratoActual.fecha_fin && ` · Vence: ${contratoActual.fecha_fin}`}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-1 font-mono">{propiedad.id_propiedad}</p>
      </div>
    );
  };

  const subTabs = [
    { id: 'buscar', label: 'Buscar Propiedad' },
    { id: 'alquiler', label: `En Alquiler (${propiedadesEnAlquiler.length})` },
    { id: 'disponibles', label: `Disponibles (${propiedadesDisponibles.length})` },
    { id: 'propietario', label: 'Por Propietario' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-blue-600 p-4 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Building size={20} /> Propiedades
        </h2>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-slate-200 flex gap-1 px-4 pt-3 overflow-x-auto">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
              activeSubTab === tab.id
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Buscar */}
        {activeSubTab === 'buscar' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por nombre, dirección, barrio, ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            {searchTerm && (
              <p className="text-xs text-slate-500">{propiedadesFiltradas.length} resultado(s)</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {propiedadesFiltradas.map(p => <PropiedadCard key={p.id_propiedad} propiedad={p} />)}
              {propiedadesFiltradas.length === 0 && (
                <p className="text-slate-400 col-span-2 text-center py-8">Sin resultados</p>
              )}
            </div>
          </div>
        )}

        {/* En Alquiler */}
        {activeSubTab === 'alquiler' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {propiedadesEnAlquiler.length === 0 ? (
              <p className="text-slate-400 col-span-2 text-center py-8">No hay propiedades en alquiler</p>
            ) : propiedadesEnAlquiler.map(p => <PropiedadCard key={p.id_propiedad} propiedad={p} />)}
          </div>
        )}

        {/* Disponibles */}
        {activeSubTab === 'disponibles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {propiedadesDisponibles.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <CheckCircle className="mx-auto text-emerald-400 mb-2" size={36} />
                <p className="text-slate-500">Todas las propiedades están alquiladas</p>
              </div>
            ) : propiedadesDisponibles.map(p => <PropiedadCard key={p.id_propiedad} propiedad={p} />)}
          </div>
        )}

        {/* Por Propietario */}
        {activeSubTab === 'propietario' && (
          <div className="space-y-6">
            {Object.keys(propiedadesPorPropietario).length === 0 ? (
              <p className="text-slate-400 text-center py-8">No hay propiedades</p>
            ) : Object.entries(propiedadesPorPropietario).map(([idProp, props]) => (
              <div key={idProp}>
                <div className="flex items-center gap-2 mb-3">
                  <User size={16} className="text-slate-500" />
                  <h3 className="font-semibold text-slate-700">{getPropietarioNombre(idProp)}</h3>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {props.length} {props.length === 1 ? 'propiedad' : 'propiedades'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {props.map(p => <PropiedadCard key={p.id_propiedad} propiedad={p} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropiedadesPanel;

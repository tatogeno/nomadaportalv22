import React from 'react';
import { Building, User, Calendar, LogOut, RefreshCw, Database } from 'lucide-react';
import { formatMonthYear } from '../utils/formatters';

const Sidebar = ({ 
  currentUser, 
  properties, 
  selectedPropertyId, 
  onPropertyChange,
  liquidations,
  selectedLiquidationId,
  onLiquidationChange,
  onLogout,
  onRefresh,
  refreshing,
  isMockMode
}) => {
  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen md:sticky md:top-0 z-10 shadow-sm">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-md">
            <Building className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-800">Nómada</span>
        </div>
        
        {/* Indicador de modo mock */}
        {isMockMode && (
          <div className="bg-amber-100 px-2 py-1 rounded text-xs font-medium text-amber-700 flex items-center gap-1">
            <Database className="w-3 h-3" />
            Demo
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
        
        {/* Selector de Propiedad */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            Propiedad
          </p>
          <select 
            value={selectedPropertyId || ''} 
            onChange={(e) => onPropertyChange(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer hover:bg-slate-100"
          >
            {properties.length === 0 ? (
              <option value="">No hay propiedades</option>
            ) : (
              properties.map(p => (
                <option key={p.id_propiedad} value={p.id_propiedad}>
                  {p.alias}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Historial de Liquidaciones */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Historial
            </p>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-1 hover:bg-slate-100 rounded transition"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-1">
            {liquidations.length === 0 ? (
              <p className="text-sm text-slate-400 px-3 py-2">No hay liquidaciones</p>
            ) : (
              liquidations.map((liq) => (
                <button
                  key={liq.id_liq}
                  onClick={() => onLiquidationChange(liq.id_liq)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${
                    selectedLiquidationId === liq.id_liq 
                      ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4" />
                    <span className="capitalize">{formatMonthYear(liq.periodo)}</span>
                  </div>
                  {liq.estado !== 'Liquidado' && (
                    <span className="w-2 h-2 bg-amber-400 rounded-full shadow-sm"></span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3 p-2 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium truncate text-slate-800">
              {currentUser?.nombre_completo || 'Usuario'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {currentUser?.email || ''}
            </p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 text-red-600 text-sm hover:bg-red-50 py-2.5 rounded-lg transition font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

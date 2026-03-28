import React from 'react';
import { Home, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

const AdminDataView = ({ movimientos, propiedades }) => {
  // Últimos 20 movimientos
  const recentMovements = movimientos
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 20);

  return (
    <div className="space-y-6">
      
      {/* Movimientos Recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-emerald-700 p-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText /> Últimos Movimientos Cargados
          </h3>
          <span className="text-xs bg-emerald-800 px-2 py-1 rounded">
            {recentMovements.length} registros
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {recentMovements.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay movimientos cargados aún</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Propiedad</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Detalle</th>
                  <th className="p-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((m) => {
                  const propiedad = propiedades.find(p => p.id_propiedad === m.id_propiedad);
                  
                  return (
                    <tr key={m.id_mov} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-3 text-xs text-slate-400 font-mono">{m.id_mov}</td>
                      <td className="p-3 whitespace-nowrap">{formatDate(m.fecha)}</td>
                      <td className="p-3">
                        <div className="font-medium">{propiedad?.alias || m.id_propiedad}</div>
                        <div className="text-xs text-slate-500">{propiedad?.direccion}</div>
                      </td>
                      <td className="p-3">
                        {m.tipo === 'Ingreso' ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp size={14} />
                            <span className="text-xs font-medium">Ingreso</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-600">
                            <TrendingDown size={14} />
                            <span className="text-xs font-medium">Egreso</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          m.tipo === 'Ingreso' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {m.categoria}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{m.descripcion}</td>
                      <td className={`p-3 text-right font-bold whitespace-nowrap ${
                        m.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {m.tipo === 'Egreso' ? '-' : '+'} {formatCurrency(m.monto, m.moneda)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Propiedades Activas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-700 p-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Home /> Propiedades en el Sistema
          </h3>
          <span className="text-xs bg-indigo-800 px-2 py-1 rounded">
            {propiedades.length} activas
          </span>
        </div>
        
        {propiedades.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay propiedades cargadas aún</p>
          </div>
        ) : (
          <div className="p-6">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propiedades.map(p => (
                <li key={p.id_propiedad} className="border border-slate-200 p-4 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 flex-shrink-0">
                      <Home size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate">{p.alias}</div>
                      <div className="text-sm text-slate-600 truncate">
                        {p.direccion} {p.piso_unidad && `- ${p.piso_unidad}`}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{p.ciudad}</span>
                        {p.barrio && <span>• {p.barrio}</span>}
                        {p.ambientes && <span>• {p.ambientes} amb</span>}
                        {p.m2 && <span>• {p.m2} m²</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        ID: {p.id_propiedad}
                      </div>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        p.estado === 'Activo' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.estado}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataView;

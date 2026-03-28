import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const MovementsTable = ({ title, movements, type, accentColor = 'emerald' }) => {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      text: 'text-emerald-900',
      dot: 'bg-emerald-500',
      amount: 'text-emerald-600'
    },
    rose: {
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      text: 'text-rose-900',
      dot: 'bg-rose-500',
      amount: 'text-rose-600'
    }
  };

  const colors = colorClasses[accentColor] || colorClasses.emerald;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className={`${colors.bg} px-6 py-4 border-b ${colors.border} flex items-center justify-between`}>
        <h3 className={`font-semibold ${colors.text} flex items-center gap-2`}>
          <span className={`w-2 h-2 ${colors.dot} rounded-full`}></span> 
          {title}
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          {movements.length} {movements.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {movements.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay movimientos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Fecha</th>
                <th className="px-6 py-3 text-left font-semibold">Concepto</th>
                {type === 'Egreso' && (
                  <th className="px-6 py-3 text-left font-semibold">Proveedor</th>
                )}
                <th className="px-6 py-3 text-right font-semibold">Monto</th>
                <th className="px-6 py-3 text-center font-semibold">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((mov, index) => (
                <tr key={mov.id_mov || index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {formatDate(mov.fecha)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-800">{mov.categoria}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{mov.descripcion}</p>
                    </div>
                  </td>
                  {type === 'Egreso' && (
                    <td className="px-6 py-4 text-slate-600">
                      {mov.proveedor || '-'}
                    </td>
                  )}
                  <td className={`px-6 py-4 text-right font-semibold ${colors.amount} whitespace-nowrap`}>
                    {type === 'Egreso' && '- '}
                    {formatCurrency(mov.monto, mov.moneda)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {mov.comprobante_url && mov.comprobante_url !== '-' ? (
                      <a 
                        href={mov.comprobante_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MovementsTable;

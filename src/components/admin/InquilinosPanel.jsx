import React, { useState, useMemo } from 'react';
import { Users, AlertCircle, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';

const InquilinosPanel = ({ contratos, propiedades, liquidaciones, movimientos }) => {
  const [activeSubTab, setActiveSubTab] = useState('situacion');

  const getPropiedadAlias = (idPropiedad) => {
    const prop = propiedades.find(p => p.id_propiedad === idPropiedad);
    return prop ? `${prop.alias} - ${prop.direccion}` : idPropiedad;
  };

  const getEstadoContrato = (contrato) => {
    if (!contrato.fecha_fin) return 'Activo';
    const hoy = new Date();
    const fin = new Date(contrato.fecha_fin);
    const diffDays = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Vencido';
    if (diffDays <= 30) return 'Por vencer';
    return 'Activo';
  };

  // Sub-tab: Situación Inquilinos
  const SituacionTab = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100 text-slate-600 text-left">
            <th className="px-4 py-3 font-semibold">Inquilino</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Propiedad</th>
            <th className="px-4 py-3 font-semibold">Inicio</th>
            <th className="px-4 py-3 font-semibold">Vencimiento</th>
            <th className="px-4 py-3 font-semibold">Monto</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {contratos.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No hay contratos registrados</td></tr>
          ) : contratos.map((c) => {
            const estado = getEstadoContrato(c);
            return (
              <tr key={c.id_contrato} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium">{c.inquilino_nombre || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{c.inquilino_email || '—'}</td>
                <td className="px-4 py-3">{getPropiedadAlias(c.id_propiedad)}</td>
                <td className="px-4 py-3 text-slate-500">{c.fecha_inicio || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{c.fecha_fin || '—'}</td>
                <td className="px-4 py-3 font-medium">
                  {c.monto_mensual ? `${c.moneda || 'USD'} ${Number(c.monto_mensual).toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3">
                  {estado === 'Activo' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                      <CheckCircle size={12} /> Activo
                    </span>
                  )}
                  {estado === 'Por vencer' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                      <Clock size={12} /> Por vencer
                    </span>
                  )}
                  {estado === 'Vencido' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-rose-100 text-rose-700">
                      <XCircle size={12} /> Vencido
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Sub-tab: Conceptos Adeudados
  const ConceptosTab = () => {
    const pendientes = useMemo(() =>
      liquidaciones.filter(l => l.estado === 'Pendiente' || l.estado === 'pendiente'),
      [liquidaciones]
    );

    return (
      <div>
        {pendientes.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto text-emerald-400 mb-3" size={40} />
            <p className="text-slate-500 font-medium">No hay conceptos adeudados</p>
            <p className="text-slate-400 text-sm mt-1">Todas las liquidaciones están al día</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 px-1">{pendientes.length} liquidación(es) pendiente(s)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-rose-50 text-rose-700 text-left">
                    <th className="px-4 py-3 font-semibold">Propiedad</th>
                    <th className="px-4 py-3 font-semibold">Periodo</th>
                    <th className="px-4 py-3 font-semibold">Ingresos</th>
                    <th className="px-4 py-3 font-semibold">Gastos</th>
                    <th className="px-4 py-3 font-semibold">A Pagar</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendientes.map((l) => (
                    <tr key={l.id_liq} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{getPropiedadAlias(l.id_propiedad)}</td>
                      <td className="px-4 py-3 text-slate-500">{l.periodo || '—'}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">
                        {l.moneda_pago || 'USD'} {Number(l.total_ingresos || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-rose-600">
                        {l.moneda_pago || 'USD'} {Number(l.total_gastos || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {l.moneda_pago || 'USD'} {Number(l.a_pagar_propietario || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                          <AlertCircle size={12} /> Pendiente
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sub-tab: Pagos y Deuda por Inquilino
  const PagosDeudaTab = () => {
    const resumen = useMemo(() => {
      return contratos.map(contrato => {
        const pagosIngresados = movimientos.filter(m =>
          m.id_propiedad === contrato.id_propiedad &&
          m.tipo === 'Ingreso' &&
          m.categoria === 'Alquiler'
        );
        const totalPagado = pagosIngresados.reduce((sum, m) => sum + Number(m.monto || 0), 0);
        const moneda = pagosIngresados[0]?.moneda || contrato.moneda || 'USD';
        return { contrato, pagosIngresados, totalPagado, moneda };
      });
    }, [contratos, movimientos]);

    return (
      <div className="space-y-4">
        {resumen.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No hay contratos registrados</p>
        ) : resumen.map(({ contrato, pagosIngresados, totalPagado, moneda }) => (
          <div key={contrato.id_contrato} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 flex justify-between items-center">
              <div>
                <p className="font-semibold">{contrato.inquilino_nombre || '—'}</p>
                <p className="text-xs text-slate-500">{getPropiedadAlias(contrato.id_propiedad)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">{moneda} {totalPagado.toLocaleString()}</p>
                <p className="text-xs text-slate-400">total cobrado</p>
              </div>
            </div>
            {pagosIngresados.length > 0 && (
              <div className="divide-y divide-slate-100">
                {pagosIngresados.slice(0, 5).map(p => (
                  <div key={p.id_mov} className="px-4 py-2 flex justify-between text-sm">
                    <span className="text-slate-600">{p.fecha} — {p.descripcion || p.categoria}</span>
                    <span className="font-medium text-emerald-600">{p.moneda} {Number(p.monto).toLocaleString()}</span>
                  </div>
                ))}
                {pagosIngresados.length > 5 && (
                  <p className="px-4 py-2 text-xs text-slate-400">+{pagosIngresados.length - 5} pagos más</p>
                )}
              </div>
            )}
            {pagosIngresados.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-400">Sin pagos registrados</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const subTabs = [
    { id: 'situacion', label: 'Situación Inquilinos' },
    { id: 'conceptos', label: 'Conceptos Adeudados' },
    { id: 'pagos', label: 'Pagos y Deuda por Inquilino' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-violet-600 p-4 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Users size={20} /> Inquilinos
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
                ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeSubTab === 'situacion' && <SituacionTab />}
        {activeSubTab === 'conceptos' && <ConceptosTab />}
        {activeSubTab === 'pagos' && <PagosDeudaTab />}
      </div>
    </div>
  );
};

export default InquilinosPanel;

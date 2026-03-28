import React, { useMemo } from 'react';
import { BarChart2, TrendingUp, Home, FileText, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ReportesPanel = ({ movimientos, propiedades, liquidaciones, contratos }) => {

  // Últimos 6 meses de datos
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = date.toISOString().substring(0, 7);
      const label = date.toLocaleString('es-AR', { month: 'short', year: '2-digit' });

      const movsMes = movimientos.filter(m => (m.fecha || '').startsWith(key));
      const ingresos = movsMes.filter(m => m.tipo === 'Ingreso' && m.moneda === 'USD')
        .reduce((s, m) => s + Number(m.monto || 0), 0);
      const egresos = movsMes.filter(m => m.tipo === 'Egreso' && m.moneda === 'USD')
        .reduce((s, m) => s + Number(m.monto || 0), 0);

      months.push({ mes: label, Ingresos: ingresos, Egresos: egresos, Neto: ingresos - egresos });
    }
    return months;
  }, [movimientos]);

  // Top propiedades por ingresos
  const topPropiedades = useMemo(() => {
    return propiedades.map(prop => {
      const movsProp = movimientos.filter(m => m.id_propiedad === prop.id_propiedad);
      const ingresos = movsProp.filter(m => m.tipo === 'Ingreso' && m.moneda === 'USD')
        .reduce((s, m) => s + Number(m.monto || 0), 0);
      const egresos = movsProp.filter(m => m.tipo === 'Egreso' && m.moneda === 'USD')
        .reduce((s, m) => s + Number(m.monto || 0), 0);
      return { ...prop, ingresos, egresos, neto: ingresos - egresos };
    }).sort((a, b) => b.neto - a.neto).slice(0, 5);
  }, [propiedades, movimientos]);

  // Métricas generales
  const metricas = useMemo(() => {
    const totalPropiedades = propiedades.length;
    const contratosActivos = contratos.filter(c => {
      if (!c.fecha_fin) return c.estado === 'Activo';
      return new Date(c.fecha_fin) >= new Date() && c.estado === 'Activo';
    }).length;
    const ocupacion = totalPropiedades > 0 ? Math.round((contratosActivos / totalPropiedades) * 100) : 0;
    const liqPendientes = liquidaciones.filter(l => l.estado === 'Pendiente' || l.estado === 'pendiente').length;
    const liqLiquidadas = liquidaciones.filter(l => l.estado === 'Liquidado' || l.estado === 'liquidado').length;
    return { totalPropiedades, contratosActivos, ocupacion, liqPendientes, liqLiquidadas };
  }, [propiedades, contratos, liquidaciones]);

  // Liquidaciones del mes actual
  const mesActual = new Date().toISOString().substring(0, 7);
  const liqMesActual = liquidaciones.filter(l => (l.periodo || '').startsWith(mesActual));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-orange-600 p-4 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <BarChart2 size={20} /> Reportes
        </h2>
      </div>

      <div className="p-6 space-y-8">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <Home size={20} className="mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-blue-700">{metricas.totalPropiedades}</p>
            <p className="text-xs text-blue-600">Propiedades</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <TrendingUp size={20} className="mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold text-emerald-700">{metricas.ocupacion}%</p>
            <p className="text-xs text-emerald-600">Ocupación</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <FileText size={20} className="mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-amber-700">{metricas.liqPendientes}</p>
            <p className="text-xs text-amber-600">Liq. Pendientes</p>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
            <Users size={20} className="mx-auto text-violet-500 mb-1" />
            <p className="text-2xl font-bold text-violet-700">{metricas.contratosActivos}</p>
            <p className="text-xs text-violet-600">Contratos Activos</p>
          </div>
        </div>

        {/* Gráfico ingresos vs egresos */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Ingresos vs Egresos — últimos 6 meses (USD)</h3>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barGap={4}>
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top propiedades */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Top propiedades por resultado neto (USD)</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-left">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Propiedad</th>
                  <th className="px-4 py-3 font-semibold text-right">Ingresos</th>
                  <th className="px-4 py-3 font-semibold text-right">Egresos</th>
                  <th className="px-4 py-3 font-semibold text-right">Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topPropiedades.map((p, i) => (
                  <tr key={p.id_propiedad} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400 font-mono">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{p.alias}<span className="text-xs text-slate-400 ml-2">{p.direccion}</span></td>
                    <td className="px-4 py-3 text-right text-emerald-600">${p.ingresos.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-rose-600">${p.egresos.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-bold ${p.neto >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
                      ${p.neto.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {topPropiedades.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-slate-400">Sin datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Liquidaciones del mes */}
        {liqMesActual.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Liquidaciones del mes actual</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-left">
                    <th className="px-4 py-3 font-semibold">Propiedad</th>
                    <th className="px-4 py-3 font-semibold text-right">A Pagar</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liqMesActual.map(l => {
                    const prop = propiedades.find(p => p.id_propiedad === l.id_propiedad);
                    return (
                      <tr key={l.id_liq} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{prop ? prop.alias : l.id_propiedad}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {l.moneda_pago || 'USD'} {Number(l.a_pagar_propietario || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            l.estado === 'Liquidado' || l.estado === 'liquidado'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {l.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportesPanel;

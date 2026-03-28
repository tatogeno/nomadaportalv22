import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Filter, ArrowUpDown } from 'lucide-react';
import DailyMovementForm from './DailyMovementForm';

const FinanzasPanel = ({ movimientos, liquidaciones, propiedades, onMovementSuccess }) => {
  const [activeSubTab, setActiveSubTab] = useState('estado');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroMes, setFiltroMes] = useState('');

  const categorias = useMemo(() => {
    const cats = new Set(movimientos.map(m => m.categoria).filter(Boolean));
    return ['todas', ...Array.from(cats)];
  }, [movimientos]);

  const meses = useMemo(() => {
    const ms = new Set(movimientos.map(m => m.fecha?.substring(0, 7)).filter(Boolean));
    return Array.from(ms).sort().reverse();
  }, [movimientos]);

  const movimientosFiltrados = useMemo(() => {
    return movimientos
      .filter(m => filtroTipo === 'todos' || m.tipo === filtroTipo)
      .filter(m => filtroCategoria === 'todas' || m.categoria === filtroCategoria)
      .filter(m => !filtroMes || (m.fecha || '').startsWith(filtroMes))
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  }, [movimientos, filtroTipo, filtroCategoria, filtroMes]);

  const getPropiedadAlias = (idPropiedad) => {
    const prop = propiedades.find(p => p.id_propiedad === idPropiedad);
    return prop ? prop.alias : idPropiedad;
  };

  // Sub-tab: Estado General
  const EstadoGeneralTab = () => {
    const mesActual = new Date().toISOString().substring(0, 7);
    const movMes = movimientos.filter(m => (m.fecha || '').startsWith(mesActual));

    const ingresosMes = movMes.filter(m => m.tipo === 'Ingreso' && m.moneda === 'USD')
      .reduce((s, m) => s + Number(m.monto || 0), 0);
    const egresosMes = movMes.filter(m => m.tipo === 'Egreso' && m.moneda === 'USD')
      .reduce((s, m) => s + Number(m.monto || 0), 0);
    const balanceMes = ingresosMes - egresosMes;

    const ingresosTotal = movimientos.filter(m => m.tipo === 'Ingreso' && m.moneda === 'USD')
      .reduce((s, m) => s + Number(m.monto || 0), 0);
    const egresosTotal = movimientos.filter(m => m.tipo === 'Egreso' && m.moneda === 'USD')
      .reduce((s, m) => s + Number(m.monto || 0), 0);

    const ultimosMovimientos = [...movimientos]
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
      .slice(0, 8);

    return (
      <div className="space-y-6">
        {/* Métricas del mes */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Este mes ({mesActual})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">Ingresos USD</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">${ingresosMes.toLocaleString()}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-rose-600 mb-1">
                <TrendingDown size={16} />
                <span className="text-sm font-medium">Egresos USD</span>
              </div>
              <p className="text-2xl font-bold text-rose-700">${egresosMes.toLocaleString()}</p>
            </div>
            <div className={`border rounded-xl p-4 ${balanceMes >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className={`flex items-center gap-2 mb-1 ${balanceMes >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                <DollarSign size={16} />
                <span className="text-sm font-medium">Balance USD</span>
              </div>
              <p className={`text-2xl font-bold ${balanceMes >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ${balanceMes.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Acumulado */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Acumulado total (USD)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Total Ingresos</p>
              <p className="text-xl font-bold text-emerald-600">${ingresosTotal.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Total Egresos</p>
              <p className="text-xl font-bold text-rose-600">${egresosTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Últimos movimientos */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Últimos movimientos</h3>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
            {ultimosMovimientos.length === 0 ? (
              <p className="text-center text-slate-400 py-6">Sin movimientos</p>
            ) : ultimosMovimientos.map(m => (
              <div key={m.id_mov} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium">{m.descripcion || m.categoria}</p>
                  <p className="text-xs text-slate-400">{m.fecha} · {getPropiedadAlias(m.id_propiedad)} · {m.categoria}</p>
                </div>
                <span className={`text-sm font-bold ${m.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {m.tipo === 'Ingreso' ? '+' : '-'}{m.moneda} {Number(m.monto || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Sub-tab: Historial
  const HistorialTab = () => (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Filtrar:</span>
        </div>
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white outline-none"
        >
          <option value="todos">Todos los tipos</option>
          <option value="Ingreso">Ingresos</option>
          <option value="Egreso">Egresos</option>
        </select>
        <select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white outline-none"
        >
          {categorias.map(c => (
            <option key={c} value={c}>{c === 'todas' ? 'Todas las categorías' : c}</option>
          ))}
        </select>
        <select
          value={filtroMes}
          onChange={e => setFiltroMes(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white outline-none"
        >
          <option value="">Todos los meses</option>
          {meses.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="text-xs text-slate-400 self-center ml-auto">{movimientosFiltrados.length} registros</span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-left">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Propiedad</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 font-semibold">Descripción</th>
              <th className="px-4 py-3 font-semibold text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimientosFiltrados.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-400">Sin resultados</td></tr>
            ) : movimientosFiltrados.map(m => (
              <tr key={m.id_mov} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-500">{m.fecha}</td>
                <td className="px-4 py-3">{getPropiedadAlias(m.id_propiedad)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    m.tipo === 'Ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {m.tipo === 'Ingreso' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {m.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{m.categoria}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{m.descripcion || '—'}</td>
                <td className={`px-4 py-3 text-right font-semibold ${m.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {m.tipo === 'Ingreso' ? '+' : '-'}{m.moneda} {Number(m.monto || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const subTabs = [
    { id: 'estado', label: 'Estado General' },
    { id: 'nuevo', label: 'Nuevo Movimiento' },
    { id: 'historial', label: 'Historial' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-emerald-600 p-4 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <DollarSign size={20} /> Finanzas
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
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeSubTab === 'estado' && <EstadoGeneralTab />}
        {activeSubTab === 'nuevo' && (
          <DailyMovementForm properties={propiedades} onSuccess={onMovementSuccess} />
        )}
        {activeSubTab === 'historial' && <HistorialTab />}
      </div>
    </div>
  );
};

export default FinanzasPanel;

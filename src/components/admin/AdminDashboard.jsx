import React, { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Home,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = ({ movimientos, propiedades, liquidaciones }) => {
  // Cálculos en tiempo real
  const stats = useMemo(() => {
    const totalIncome = movimientos
      .filter(m => m.tipo === 'Ingreso')
      .reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);

    const totalExpense = movimientos
      .filter(m => m.tipo === 'Egreso')
      .reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);

    const netBalance = totalIncome - totalExpense;
    const margin = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

    // Ocupación
    const occupiedCount = propiedades.filter(p => p.estado === 'Activo').length;
    const occupancyRate = propiedades.length > 0
      ? ((occupiedCount / propiedades.length) * 100).toFixed(0)
      : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      margin,
      occupiedCount,
      occupancyRate
    };
  }, [movimientos, propiedades]);

  // Distribución de gastos por categoría
  const expensesByCategory = useMemo(() => {
    const categories = {};
    movimientos
      .filter(m => m.tipo === 'Egreso')
      .forEach(m => {
        const cat = m.categoria || 'Otros';
        categories[cat] = (categories[cat] || 0) + (parseFloat(m.monto) || 0);
      });

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

    return Object.entries(categories)
      .map(([label, value]) => ({
        label,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(0) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [movimientos]);

  // Movimientos recientes por mes (últimos 6 meses)
  const monthlyData = useMemo(() => {
    const months = {};
    const now = new Date();

    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-AR', { month: 'short' });
      months[key] = { month: monthName, income: 0, expense: 0 };
    }

    // Agregar datos
    movimientos.forEach(m => {
      if (!m.fecha) return;
      const monthKey = m.fecha.substring(0, 7); // YYYY-MM
      if (months[monthKey]) {
        const amount = parseFloat(m.monto) || 0;
        if (m.tipo === 'Ingreso') {
          months[monthKey].income += amount;
        } else if (m.tipo === 'Egreso') {
          months[monthKey].expense += amount;
        }
      }
    });

    return Object.values(months);
  }, [movimientos]);

  // Rentabilidad por propiedad
  const propertyProfitability = useMemo(() => {
    const propStats = {};

    console.log('📊 DEBUG Dashboard - Propiedades:', propiedades);
    console.log('📊 DEBUG Dashboard - Total movimientos:', movimientos.length);

    propiedades.forEach(p => {
      propStats[p.id_propiedad] = {
        name: p.alias || p.direccion,
        status: p.estado,
        income: 0,
        expense: 0
      };
    });

    movimientos.forEach(m => {
      if (propStats[m.id_propiedad]) {
        const amount = parseFloat(m.monto) || 0;
        if (m.tipo === 'Ingreso') {
          propStats[m.id_propiedad].income += amount;
        } else if (m.tipo === 'Egreso') {
          propStats[m.id_propiedad].expense += amount;
        }
      }
    });

    console.log('📊 DEBUG Dashboard - propStats calculado:', propStats);

    // Debug específico para Defensa 4A y 4B
    const defensaMovs = movimientos.filter(m =>
      m.id_propiedad === 'H-001' || m.id_propiedad === 'H-002'
    );
    console.log('📊 DEBUG - Movimientos de Defensa 4A (H-001) y 4B (H-002):', defensaMovs);
    console.log('📊 DEBUG - H-001 stats:', propStats['H-001']);
    console.log('📊 DEBUG - H-002 stats:', propStats['H-002']);

    return Object.values(propStats)
      .map(p => ({
        ...p,
        net: p.income - p.expense,
        roi: p.income > 0 ? (((p.income - p.expense) / p.income) * 100).toFixed(0) : 0
      }))
      .sort((a, b) => b.net - a.net)
      .slice(0, 5);
  }, [propiedades, movimientos]);

  const getBarColor = (category) => {
    const colors = {
      'Mantenimiento': 'bg-orange-500',
      'Expensas': 'bg-slate-500',
      'ABL': 'bg-red-500',
      'Impuestos': 'bg-red-600',
      'Honorarios': 'bg-teal-500',
      'Comisión': 'bg-purple-500',
      'Servicios': 'bg-blue-500'
    };
    return colors[category] || 'bg-slate-400';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Dashboard */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tablero de Control</h2>
          <p className="text-slate-500 text-sm">Visión general del negocio en tiempo real</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Facturación Total"
          value={formatCurrency(stats.totalIncome, 'USD')}
          trend="+12%"
          trendUp={true}
          icon={DollarSign}
          color="blue"
        />
        <KpiCard
          title="Gastos Operativos"
          value={formatCurrency(stats.totalExpense, 'USD')}
          trend="+5%"
          trendUp={false}
          icon={TrendingDown}
          color="red"
        />
        <KpiCard
          title="Cash Flow Neto"
          value={formatCurrency(stats.netBalance, 'USD')}
          subValue={`Margen: ${stats.margin}%`}
          trend="+8%"
          trendUp={true}
          icon={Activity}
          color="emerald"
        />
        <KpiCard
          title="Ocupación"
          value={`${stats.occupancyRate}%`}
          subValue={`${stats.occupiedCount}/${propiedades.length} Unidades`}
          trend="Estable"
          trendUp={true}
          icon={Home}
          color="indigo"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Evolución de Ingresos vs Egresos (Últimos 6 meses)
          </h3>

          {/* Custom CSS Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
            {monthlyData.map((data, i) => {
              const maxValue = Math.max(
                ...monthlyData.map(d => Math.max(d.income, d.expense))
              );
              const hInc = maxValue > 0 ? (data.income / maxValue) * 100 : 0;
              const hExp = maxValue > 0 ? (data.expense / maxValue) * 100 : 0;

              return (
                <div key={i} className="flex flex-col items-center gap-2 w-full">
                  <div className="relative w-full flex justify-center items-end h-full gap-1">
                    {/* Income Bar */}
                    <div
                      className="w-3 md:w-6 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all cursor-pointer group relative"
                      style={{ height: `${hInc}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        ${(data.income / 1000).toFixed(0)}k
                      </div>
                    </div>
                    {/* Expense Bar */}
                    <div
                      className="w-3 md:w-6 bg-slate-300 rounded-t-sm hover:bg-slate-400 transition-all cursor-pointer group relative"
                      style={{ height: `${hExp}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        -${(data.expense / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium capitalize">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Ingresos
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-3 h-3 bg-slate-300 rounded-sm"></div> Egresos
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-purple-500" />
            Distribución de Gastos
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-5">
            {expensesByCategory.length > 0 ? (
              expensesByCategory.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-800">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className={`${getBarColor(item.label)} h-2.5 rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                <PieChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay gastos registrados</p>
              </div>
            )}
          </div>
          {expensesByCategory.length > 0 && expensesByCategory[0].percentage > 50 && (
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-orange-800 uppercase">
                    Alerta de Costos
                  </h4>
                  <p className="text-xs text-orange-700 mt-1">
                    {expensesByCategory[0].label} representa más del 50% de los gastos totales.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Rentabilidad por Propiedad (Top 5)</h3>
        </div>
        <div className="overflow-x-auto">
          {propertyProfitability.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="p-3">Propiedad</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Ingresos (YTD)</th>
                  <th className="p-3 text-right">Gastos (YTD)</th>
                  <th className="p-3 text-right">Resultado</th>
                  <th className="p-3 text-center">ROI</th>
                </tr>
              </thead>
              <tbody>
                {propertyProfitability.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-700">{row.name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          row.status === 'Activo'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      {formatCurrency(row.income, 'USD')}
                    </td>
                    <td className="p-3 text-right text-red-500">
                      -{formatCurrency(row.expense, 'USD')}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      {formatCurrency(row.net, 'USD')}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-bold ${
                          row.net > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {row.roi}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay datos de propiedades disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function KpiCard({ title, value, subValue, trend, trendUp, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );
}

export default AdminDashboard;

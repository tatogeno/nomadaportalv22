import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, Download, CheckCircle, AlertCircle,
  ArrowUpCircle, ArrowDownCircle, Wallet
} from 'lucide-react';

// Components
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import MovementsTable from './components/MovementsTable';
import WithdrawalSettings from './components/WithdrawalSettings';
import Toast from './components/Toast';
import AdminRoute from './components/admin/AdminRoute';

// Hooks & Utils
import { useAuth } from './hooks/useAuth';
import { useData } from './contexts/DataContext';
import { formatMonthYear, getMonthYear } from './utils/formatters';
import { adminApiService } from './services/adminApiService';

const App = () => {
  // Check for admin route
  const isAdminRoute = window.location.pathname === '/admin-nomada';
  
  if (isAdminRoute) {
    return <AdminRoute />;
  }
  
  return <OwnerPortal />;
};

const OwnerPortal = () => {
  // Auth
  const { user, isAuthenticated, loading: authLoading, error: authError, login, logout, checkSession } = useAuth();
  
  // Data
  const { 
    propiedades, 
    liquidaciones, 
    movimientos, 
    loading: dataLoading,
    refreshData,
    isMockMode 
  } = useData();

  // UI States
  const [selectedPropId, setSelectedPropId] = useState(null);
  const [selectedLiqId, setSelectedLiqId] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // --- DERIVED DATA ---

  // 1. Propiedades del usuario
  const userProperties = useMemo(() => {
    if (!user) return [];
    return propiedades.filter(p => p.id_propietario === user.id_propietario);
  }, [user, propiedades]);

  // 2. Auto-seleccionar primera propiedad
  useEffect(() => {
    if (userProperties.length > 0 && !selectedPropId) {
      setSelectedPropId(userProperties[0].id_propiedad);
    }
  }, [userProperties, selectedPropId]);

  // 3. Liquidaciones de la propiedad seleccionada
  const propertyLiquidations = useMemo(() => {
    if (!selectedPropId) return [];
    return liquidaciones
      .filter(l => l.id_propiedad === selectedPropId)
      .sort((a, b) => new Date(b.periodo) - new Date(a.periodo));
  }, [selectedPropId, liquidaciones]);

  // 4. Auto-seleccionar última liquidación
  useEffect(() => {
    if (propertyLiquidations.length > 0 && !selectedLiqId) {
      setSelectedLiqId(propertyLiquidations[0].id_liq);
    }
  }, [propertyLiquidations, selectedLiqId]);

  // 5. Liquidación actual
  const currentLiq = useMemo(() => 
    liquidaciones.find(l => l.id_liq === selectedLiqId), 
    [selectedLiqId, liquidaciones]
  );

  // 6. Movimientos del periodo
  const currentMovements = useMemo(() => {
    if (!currentLiq) return [];

    const liqDate = getMonthYear(currentLiq.periodo);

    console.log('🏠 DEBUG Portal Propietario:');
    console.log('  - currentLiq:', currentLiq);
    console.log('  - id_propiedad de liquidación:', currentLiq.id_propiedad);
    console.log('  - Tipo:', typeof currentLiq.id_propiedad);
    console.log('  - Total movimientos en sistema:', movimientos.length);

    // DEBUG: Mostrar primeros 3 movimientos con sus id_propiedad
    console.log('  - Primeros 3 movimientos:');
    movimientos.slice(0, 3).forEach((m, idx) => {
      console.log(`    [${idx}]:`, {
        id_mov: m.id_mov,
        id_propiedad: m.id_propiedad,
        tipo_id: typeof m.id_propiedad,
        fecha: m.fecha,
        monto: m.monto
      });
    });

    // DEBUG: Mostrar todos los id_propiedad únicos
    const uniqueIds = [...new Set(movimientos.map(m => m.id_propiedad))];
    console.log('  - IDs de propiedad únicos en movimientos:', uniqueIds);

    const filtered = movimientos.filter(m => {
      if (m.id_propiedad !== currentLiq.id_propiedad) return false;

      const movDate = getMonthYear(m.fecha);
      return movDate.month === liqDate.month && movDate.year === liqDate.year;
    });

    console.log('  - Movimientos filtrados para esta propiedad/periodo:', filtered);
    console.log('  - Cantidad de movimientos filtrados:', filtered.length);

    return filtered;
  }, [currentLiq, movimientos]);

  // Separar ingresos y egresos
  const ingresos = currentMovements.filter(m => m.tipo === 'Ingreso');
  const egresos = currentMovements.filter(m => m.tipo === 'Egreso');

  // 7. Calcular totales en tiempo real desde movimientos
  const calculatedTotals = useMemo(() => {
    if (!currentMovements.length) {
      console.log('  ⚠️ No hay movimientos para calcular totales');
      return {
        total_ingresos: 0,
        total_gastos: 0,
        a_pagar_propietario: 0,
        moneda_pago: 'USD'
      };
    }

    // Sumar ingresos
    const totalIngresos = ingresos.reduce((sum, m) => {
      const monto = parseFloat(m.monto) || 0;
      // Convertir a USD si es necesario (asumimos USD como base)
      return sum + monto;
    }, 0);

    // Sumar gastos
    const totalGastos = egresos.reduce((sum, m) => {
      const monto = parseFloat(m.monto) || 0;
      return sum + monto;
    }, 0);

    console.log('  💰 Cálculo de totales:');
    console.log('    - Total ingresos:', totalIngresos);
    console.log('    - Total gastos:', totalGastos);
    console.log('    - Neto a pagar:', totalIngresos - totalGastos);

    // Detectar moneda predominante
    const monedas = currentMovements.map(m => m.moneda).filter(Boolean);
    const monedaPredominante = monedas.length > 0
      ? monedas.sort((a, b) =>
          monedas.filter(m => m === b).length - monedas.filter(m => m === a).length
        )[0]
      : 'USD';

    return {
      total_ingresos: totalIngresos,
      total_gastos: totalGastos,
      a_pagar_propietario: totalIngresos - totalGastos,
      moneda_pago: monedaPredominante
    };
  }, [currentMovements, ingresos, egresos]);

  // --- HANDLERS ---

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      setToast({ message: 'Inicio de sesión exitoso', type: 'success' });
    } catch (error) {
      // Error ya se maneja en el componente LoginScreen
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setSelectedPropId(null);
    setSelectedLiqId(null);
    setToast({ message: 'Sesión cerrada', type: 'info' });
  };

  const handlePropertyChange = (propId) => {
    setSelectedPropId(propId);
    setSelectedLiqId(null); // Reset liquidation when property changes
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      setToast({ message: 'Datos actualizados', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al actualizar', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveWithdrawal = async (config) => {
    try {
      console.log('Guardando configuración:', config);

      // Preparar datos para actualizar en Google Sheets
      const updateData = {
        id_propietario: user.id_propietario,
        cbu_alias: config.cbu || '',
        'dirección_entrega': config.direccionEntrega || '' // Nota: columna con tilde
      };

      // Enviar a Google Sheets
      await adminApiService.updatePropietario(updateData);

      setToast({ message: 'Preferencia guardada correctamente en Google Sheets', type: 'success' });

      // Refrescar datos para ver los cambios
      setTimeout(() => {
        refreshData();
      }, 1000);

    } catch (error) {
      console.error('Error guardando configuración:', error);
      setToast({ message: 'Error al guardar: ' + error.message, type: 'error' });
    }
  };

  const handleDownloadPDF = () => {
    if (!currentLiq || !currentProp) {
      setToast({ message: 'No hay liquidación para descargar', type: 'error' });
      return;
    }

    // Crear contenido HTML para el PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liquidación ${formatMonthYear(currentLiq.periodo)} - ${currentProp.alias}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #1e293b;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #64748b;
            margin: 5px 0;
          }
          .info-box {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #cbd5e1;
          }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #475569; }
          .value { color: #1e293b; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:hover { background: #f8fafc; }
          .total-row {
            background: #f1f5f9;
            font-weight: bold;
            font-size: 16px;
          }
          .section-title {
            color: #1e293b;
            margin: 30px 0 15px 0;
            font-size: 20px;
            font-weight: 600;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .summary-card {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          .summary-card.income { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
          .summary-card.expense { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
          .summary-label {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 8px;
          }
          .summary-amount {
            font-size: 24px;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LIQUIDACIÓN DE ALQUILER</h1>
          <p>${formatMonthYear(currentLiq.periodo)}</p>
          <p>${currentProp.direccion} ${currentProp.piso_unidad || ''}</p>
        </div>

        <div class="info-box">
          <div class="info-row">
            <span class="label">Propietario:</span>
            <span class="value">${user.nombre_completo}</span>
          </div>
          <div class="info-row">
            <span class="label">Propiedad:</span>
            <span class="value">${currentProp.alias}</span>
          </div>
          <div class="info-row">
            <span class="label">Periodo:</span>
            <span class="value">${formatMonthYear(currentLiq.periodo)}</span>
          </div>
          <div class="info-row">
            <span class="label">Estado:</span>
            <span class="value">${currentLiq.estado}</span>
          </div>
        </div>

        <div class="summary">
          <div class="summary-card income">
            <div class="summary-label">TOTAL INGRESOS</div>
            <div class="summary-amount">${calculatedTotals.moneda_pago} ${calculatedTotals.total_ingresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-card expense">
            <div class="summary-label">TOTAL GASTOS</div>
            <div class="summary-amount">${calculatedTotals.moneda_pago} ${calculatedTotals.total_gastos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">NETO A PAGAR</div>
            <div class="summary-amount">${calculatedTotals.moneda_pago} ${calculatedTotals.a_pagar_propietario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <h2 class="section-title">Detalle de Ingresos</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            ${ingresos.map(m => `
              <tr>
                <td>${new Date(m.fecha).toLocaleDateString('es-AR')}</td>
                <td>${m.categoria}</td>
                <td>${m.descripcion || '-'}</td>
                <td>${m.moneda} ${parseFloat(m.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">TOTAL INGRESOS</td>
              <td>${calculatedTotals.moneda_pago} ${calculatedTotals.total_ingresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <h2 class="section-title">Detalle de Gastos</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            ${egresos.map(m => `
              <tr>
                <td>${new Date(m.fecha).toLocaleDateString('es-AR')}</td>
                <td>${m.categoria}</td>
                <td>${m.descripcion || '-'}</td>
                <td>${m.moneda} ${parseFloat(m.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">TOTAL GASTOS</td>
              <td>${calculatedTotals.moneda_pago} ${calculatedTotals.total_gastos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Generado por Nómada Portal - ${new Date().toLocaleDateString('es-AR')}</p>
          <p>Este documento es un resumen de su liquidación mensual</p>
        </div>
      </body>
      </html>
    `;

    // Crear ventana nueva con el contenido
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();

      // Esperar a que cargue y luego imprimir
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      setToast({ message: 'Error al abrir ventana de impresión. Verifica bloqueador de pop-ups', type: 'error' });
    }
  };

  // --- RENDER ---

  // Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} loading={authLoading} error={authError} />;
  }

  // Loading State
  if (dataLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const currentProp = userProperties.find(p => p.id_propiedad === selectedPropId);

  // Empty State - No properties available
  if (userProperties.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="bg-slate-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Home className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Sin propiedades asignadas
            </h3>
            <p className="text-slate-600 mb-2">
              No tienes propiedades asignadas a tu cuenta.
            </p>
            <p className="text-sm text-slate-500">
              Contacta al administrador para que te asigne una propiedad.
            </p>
            <button
              onClick={handleLogout}
              className="mt-6 px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State - No liquidation selected or available
  if (!currentLiq) {
    const hasLiquidations = propertyLiquidations.length > 0;

    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row relative">
        {/* Sidebar */}
        <Sidebar
          currentUser={user}
          properties={userProperties}
          selectedPropertyId={selectedPropId}
          onPropertyChange={handlePropertyChange}
          liquidations={propertyLiquidations}
          selectedLiquidationId={selectedLiqId}
          onLiquidationChange={setSelectedLiqId}
          onLogout={handleLogout}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          isMockMode={isMockMode}
        />

        {/* Main Content - Empty State */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="bg-slate-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {hasLiquidations ? 'Selecciona una liquidación' : 'Sin liquidaciones disponibles'}
              </h3>
              <p className="text-slate-600 mb-2">
                {hasLiquidations
                  ? 'Por favor selecciona una liquidación del menú lateral para ver los detalles.'
                  : 'Esta propiedad aún no tiene liquidaciones cargadas.'
                }
              </p>
              <p className="text-sm text-slate-500">
                {hasLiquidations
                  ? 'Puedes ver liquidaciones anteriores desde el selector en la barra lateral.'
                  : 'Las liquidaciones aparecerán aquí una vez que sean procesadas por el administrador.'
                }
              </p>
              {currentProp && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-600 text-sm">
                    <Home className="w-4 h-4" />
                    <span className="font-medium">
                      {currentProp.direccion} {currentProp.piso_unidad && `- ${currentProp.piso_unidad}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row relative">
      
      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        currentUser={user}
        properties={userProperties}
        selectedPropertyId={selectedPropId}
        onPropertyChange={handlePropertyChange}
        liquidations={propertyLiquidations}
        selectedLiquidationId={selectedLiqId}
        onLiquidationChange={setSelectedLiqId}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        isMockMode={isMockMode}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 capitalize">
              {formatMonthYear(currentLiq.periodo)}
            </h2>
            <div className="flex items-center space-x-2 text-slate-500 mt-2">
              <Home className="w-4 h-4" />
              <span className="text-sm">
                {currentProp?.direccion} {currentProp?.piso_unidad && `- ${currentProp.piso_unidad}`}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            
            <div className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-sm ${
              currentLiq.estado === 'Liquidado' 
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
            }`}>
              {currentLiq.estado === 'Liquidado' 
                ? <CheckCircle className="w-4 h-4" /> 
                : <AlertCircle className="w-4 h-4" />
              }
              <span>{currentLiq.estado}</span>
            </div>
          </div>
        </header>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Ingresos"
            amount={calculatedTotals.total_ingresos}
            currency={calculatedTotals.moneda_pago}
            icon={ArrowUpCircle}
            colorClass="text-emerald-600"
          />
          <MetricCard
            title="Total Gastos"
            amount={calculatedTotals.total_gastos}
            currency={calculatedTotals.moneda_pago}
            icon={ArrowDownCircle}
            colorClass="text-rose-600"
          />
          <MetricCard
            title="Neto a Pagar"
            amount={calculatedTotals.a_pagar_propietario}
            currency={calculatedTotals.moneda_pago}
            icon={Wallet}
            colorClass="text-blue-600"
            subText={currentLiq.estado === 'Liquidado' ? 'Liquidado y pagado' : 'Saldo del periodo'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Movements Tables */}
          <div className="lg:col-span-2 space-y-6">
            <MovementsTable 
              title="Detalle de Ingresos"
              movements={ingresos}
              type="Ingreso"
              accentColor="emerald"
            />
            
            <MovementsTable 
              title="Detalle de Gastos"
              movements={egresos}
              type="Egreso"
              accentColor="rose"
            />
          </div>

          {/* Withdrawal Settings */}
          <div className="lg:col-span-1">
            <WithdrawalSettings 
              currentUser={user}
              onSave={handleSaveWithdrawal}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

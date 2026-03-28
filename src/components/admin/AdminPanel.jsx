import React, { useState, useEffect } from 'react';
import { Building, TrendingUp, Briefcase, FileText, RefreshCw, LogOut, PieChart, Users, DollarSign, BarChart2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import DailyMovementForm from './DailyMovementForm';
import PropertyWizard from './PropertyWizard';
import AdminDataView from './AdminDataView';
import AdminDashboard from './AdminDashboard';
import InquilinosPanel from './InquilinosPanel';
import PropiedadesPanel from './PropiedadesPanel';
import FinanzasPanel from './FinanzasPanel';
import ReportesPanel from './ReportesPanel';
import Toast from '../Toast';

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data, loading, refreshData } = useData();
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleMovementSuccess = (movement) => {
    setToast({ 
      message: '¡Movimiento registrado exitosamente!', 
      type: 'success' 
    });
    
    // Refresh data after 1 second
    setTimeout(() => {
      handleRefresh();
    }, 1000);
  };

  const handlePropertySuccess = () => {
    setToast({ 
      message: '¡Propiedad creada exitosamente!', 
      type: 'success' 
    });
    
    // Refresh data after 1 second
    setTimeout(() => {
      handleRefresh();
    }, 1000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
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

      {/* Navbar */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Building className="text-blue-400" />
            <span>Nómada Admin Panel</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Tabs */}
            <div className="flex gap-1 text-sm flex-wrap">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <PieChart size={15} /> Dashboard
              </button>

              <div className="w-[1px] bg-slate-700 mx-0.5"></div>

              <button
                onClick={() => setActiveTab('inquilinos')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'inquilinos'
                    ? 'bg-violet-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Users size={15} /> Inquilinos
              </button>

              <button
                onClick={() => setActiveTab('propiedades')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'propiedades'
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Building size={15} /> Propiedades
              </button>

              <button
                onClick={() => setActiveTab('finanzas')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'finanzas'
                    ? 'bg-emerald-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <DollarSign size={15} /> Finanzas
              </button>

              <button
                onClick={() => setActiveTab('reportes')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'reportes'
                    ? 'bg-orange-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <BarChart2 size={15} /> Reportes
              </button>

              <div className="w-[1px] bg-slate-700 mx-0.5"></div>

              <button
                onClick={() => setActiveTab('daily')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'daily'
                    ? 'bg-sky-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <TrendingUp size={15} /> Día a Día
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Briefcase size={15} /> Back Office
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'data'
                    ? 'bg-slate-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <FileText size={15} /> Registros
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-900 rounded-lg transition text-red-400"
              title="Salir del panel admin"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="animate-fade-in">
                <AdminDashboard
                  movimientos={data.movimientos}
                  propiedades={data.propiedades}
                  liquidaciones={data.liquidaciones}
                />
              </div>
            )}

            {activeTab === 'inquilinos' && (
              <div className="animate-fade-in">
                <InquilinosPanel
                  contratos={data.contratos}
                  propiedades={data.propiedades}
                  liquidaciones={data.liquidaciones}
                  movimientos={data.movimientos}
                />
              </div>
            )}

            {activeTab === 'propiedades' && (
              <div className="animate-fade-in">
                <PropiedadesPanel
                  propiedades={data.propiedades}
                  contratos={data.contratos}
                  propietarios={data.propietarios}
                />
              </div>
            )}

            {activeTab === 'finanzas' && (
              <div className="animate-fade-in">
                <FinanzasPanel
                  movimientos={data.movimientos}
                  liquidaciones={data.liquidaciones}
                  propiedades={data.propiedades}
                  onMovementSuccess={handleMovementSuccess}
                />
              </div>
            )}

            {activeTab === 'reportes' && (
              <div className="animate-fade-in">
                <ReportesPanel
                  movimientos={data.movimientos}
                  propiedades={data.propiedades}
                  liquidaciones={data.liquidaciones}
                  contratos={data.contratos}
                />
              </div>
            )}

            {activeTab === 'daily' && (
              <div className="animate-fade-in">
                <DailyMovementForm
                  properties={data.propiedades}
                  onSuccess={handleMovementSuccess}
                />
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="animate-fade-in">
                <PropertyWizard onSuccess={handlePropertySuccess} />
              </div>
            )}

            {activeTab === 'data' && (
              <div className="animate-fade-in">
                <AdminDataView
                  movimientos={data.movimientos}
                  propiedades={data.propiedades}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;

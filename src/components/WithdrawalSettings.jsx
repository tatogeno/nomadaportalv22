import React, { useState, useEffect } from 'react';
import { Settings, CreditCard, Wallet, CheckCircle, DollarSign, Truck } from 'lucide-react';

const WithdrawalSettings = ({ currentUser, onSave }) => {
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank');
  const [cbu, setCbu] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');

  useEffect(() => {
    if (currentUser?.cbu_alias) {
      setCbu(currentUser.cbu_alias);
    }
    if (currentUser?.direccion_entrega) {
      setDireccionEntrega(currentUser.direccion_entrega);
    }
  }, [currentUser]);

  const handleSave = () => {
    onSave({ withdrawalMethod, cbu, direccionEntrega });
  };

  return (
    <div className="space-y-6">
      
      {/* Payment Configuration Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
          <Settings className="w-5 h-5 text-blue-600" />
          Configurar Cobro
        </h3>

        <div className="space-y-4 relative z-10">
          
          {/* Bank Transfer Option */}
          <label className={`block border p-4 rounded-xl cursor-pointer transition relative ${
            withdrawalMethod === 'bank' 
              ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500 ring-opacity-20' 
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}>
            <div className="flex items-start gap-3">
              <input 
                type="radio" 
                name="withdrawal" 
                className="mt-1 accent-blue-600" 
                checked={withdrawalMethod === 'bank'} 
                onChange={() => setWithdrawalMethod('bank')} 
              />
              <div className="w-full">
                <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" /> 
                  Transferencia Bancaria
                </div>
                
                <div className={`mt-3 space-y-2 text-sm transition-opacity ${
                  withdrawalMethod !== 'bank' && 'opacity-50'
                }`}>
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5 font-medium">Cuenta guardada:</p>
                    <input 
                      disabled={withdrawalMethod !== 'bank'}
                      value={cbu} 
                      onChange={(e) => setCbu(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-slate-50" 
                      placeholder="CBU / CVU / Alias" 
                    />
                  </div>
                  
                  {currentUser?.banco && (
                    <p className="text-xs text-slate-400">
                      Banco: {currentUser.banco}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </label>

          {/* Cash Option */}
          <label className={`block border p-4 rounded-xl cursor-pointer transition ${
            withdrawalMethod === 'cash'
              ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500 ring-opacity-20'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="withdrawal"
                className="accent-blue-600"
                checked={withdrawalMethod === 'cash'}
                onChange={() => setWithdrawalMethod('cash')}
              />
              <div className="font-semibold text-slate-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                Retiro en Efectivo
                <span className="text-xs font-normal text-slate-500">(Oficina)</span>
              </div>
            </div>
          </label>

          {/* Delivery Option */}
          <label className={`block border p-4 rounded-xl cursor-pointer transition relative ${
            withdrawalMethod === 'delivery'
              ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500 ring-opacity-20'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}>
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="withdrawal"
                className="mt-1 accent-blue-600"
                checked={withdrawalMethod === 'delivery'}
                onChange={() => setWithdrawalMethod('delivery')}
              />
              <div className="w-full">
                <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Envío por Mensajería
                </div>

                <div className={`mt-3 space-y-2 text-sm transition-opacity ${
                  withdrawalMethod !== 'delivery' && 'opacity-50'
                }`}>
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5 font-medium">Dirección de entrega:</p>
                    <input
                      disabled={withdrawalMethod !== 'delivery'}
                      value={direccionEntrega}
                      onChange={(e) => setDireccionEntrega(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-slate-50"
                      placeholder="Ej: Av. Libertador 1000, Piso 4B, CABA"
                    />
                  </div>

                  <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ Costo a cargo del propietario
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>

        <button 
          onClick={handleSave}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex justify-center items-center gap-2 shadow-lg shadow-blue-200"
        >
          <CheckCircle className="w-4 h-4" /> 
          Guardar Preferencia
        </button>
      </div>

      {/* Support Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold mb-1">Soporte Nómada</h4>
            <p className="text-blue-100 text-sm">
              ¿Consultas sobre tus liquidaciones o pagos?
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/5491173723642?text=${encodeURIComponent(`Hola soy ${currentUser?.nombre_completo || 'un propietario'}, necesito asistencia.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-white text-blue-600 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-50 transition shadow-md text-center"
        >
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
};

export default WithdrawalSettings;

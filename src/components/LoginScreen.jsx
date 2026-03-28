import React, { useState } from 'react';
import { Building, Loader2, AlertCircle, Lock } from 'lucide-react';
import { isValidEmail } from '../utils/formatters';
import { apiService } from '../services/apiService';

const LoginScreen = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('juan@email.com'); // Default para testing
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [recoveringPassword, setRecoveringPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email) {
      setValidationError('Por favor ingresa tu email');
      return;
    }

    if (!isValidEmail(email)) {
      setValidationError('Por favor ingresa un email válido');
      return;
    }

    if (!password) {
      setValidationError('Por favor ingresa tu contraseña');
      return;
    }

    onLogin(email, password);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setValidationError('Por favor ingresa tu email primero');
      return;
    }

    if (!isValidEmail(email)) {
      setValidationError('Por favor ingresa un email válido');
      return;
    }

    setRecoveringPassword(true);
    setValidationError('');

    try {
      const propietario = await apiService.getPropietarioByEmail(email);

      if (!propietario) {
        setValidationError('Email no registrado en el sistema');
        setRecoveringPassword(false);
        return;
      }

      const nombreCompleto = propietario.nombre_completo || 'un propietario';
      const mensaje = `Hola soy ${nombreCompleto}, necesito recuperar mi contraseña`;
      const whatsappUrl = `https://wa.me/5491173723642?text=${encodeURIComponent(mensaje)}`;

      window.open(whatsappUrl, '_blank');
      setRecoveringPassword(false);
    } catch (error) {
      setValidationError('Error al buscar tu información. Intenta nuevamente.');
      setRecoveringPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Building className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Nómada Portal</h1>
          <p className="text-slate-500 mt-1">Gestión de Propiedades Temporales</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Registrado
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError('');
              }}
              disabled={loading || recoveringPassword}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValidationError('');
                }}
                disabled={loading || recoveringPassword}
                className="w-full pl-11 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Errores de validación */}
          {validationError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Errores del servidor */}
          {error && !validationError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            disabled={loading || recoveringPassword}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Verificando...</span>
              </>
            ) : (
              "Ingresar"
            )}
          </button>

          {/* Forgot Password Link */}
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading || recoveringPassword}
            className="w-full text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {recoveringPassword ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Buscando información...</span>
              </>
            ) : (
              "¿Olvidaste tu contraseña?"
            )}
          </button>
        </form>

        {/* Info adicional */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            Si no tienes acceso, contacta a tu administrador
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

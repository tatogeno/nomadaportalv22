import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

/**
 * Hook personalizado para manejar autenticación
 * En producción, esto se conectaría con un sistema real de auth
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Simula el login verificando el email y password en la base de datos
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Buscar propietario por email
      const propietario = await apiService.getPropietarioByEmail(email);

      if (!propietario) {
        throw new Error('Email no registrado en el sistema');
      }

      // Validar password - comparación flexible para números y strings
      if (propietario.password === null || propietario.password === undefined || propietario.password === '') {
        throw new Error('Esta cuenta no tiene contraseña configurada. Contacta al administrador.');
      }

      // Convertir ambos a string para comparar (Google Sheets puede devolver números)
      const storedPassword = String(propietario.password).trim();
      const inputPassword = String(password).trim();

      // Comparación flexible: exacta o numérica
      const passwordMatch = storedPassword === inputPassword ||
                           Number(storedPassword) === Number(inputPassword);

      if (!passwordMatch) {
        console.error('❌ Password no coincide:', {
          almacenado: storedPassword,
          ingresado: inputPassword,
          tipo_almacenado: typeof propietario.password,
          tipo_ingresado: typeof password
        });
        throw new Error('Contraseña incorrecta');
      }

      console.log('✅ Login exitoso para:', propietario.email);

      // Guardar usuario en sessionStorage
      sessionStorage.setItem('nomada_user', JSON.stringify(propietario));

      setUser(propietario);
      setIsAuthenticated(true);

      return propietario;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cierra sesión
   */
  const logout = useCallback(() => {
    sessionStorage.removeItem('nomada_user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * Verifica si hay sesión guardada
   */
  const checkSession = useCallback(() => {
    const savedUser = sessionStorage.getItem('nomada_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      } catch (err) {
        console.error('Error al parsear usuario guardado:', err);
        sessionStorage.removeItem('nomada_user');
      }
    }
    return null;
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkSession
  };
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe usarse dentro de DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Estado de datos
  const [data, setData] = useState({
    propietarios: [],
    propiedades: [],
    liquidaciones: [],
    movimientos: [],
    contratos: []
  });

  // Estado de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  /**
   * Carga inicial de datos
   */
  const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const fetchedData = await apiService.fetchAllData(forceRefresh);
      setData(fetchedData);
      setLastUpdate(new Date());
      return fetchedData;
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error en loadData:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recarga los datos (limpiando cache)
   */
  const refreshData = useCallback(async () => {
    apiService.clearCache();
    return loadData(true);
  }, [loadData]);

  /**
   * Carga inicial al montar el componente
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  const value = {
    // Datos
    data,
    propietarios: data.propietarios,
    propiedades: data.propiedades,
    liquidaciones: data.liquidaciones,
    movimientos: data.movimientos,
    contratos: data.contratos,

    // Estado
    loading,
    error,
    lastUpdate,

    // Métodos
    loadData,
    refreshData,

    // Info
    isMockMode: apiService.isMockMode()
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

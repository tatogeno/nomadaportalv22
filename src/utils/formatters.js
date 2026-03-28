/**
 * Utilidades de formato para la aplicación
 */

/**
 * Formatea fecha a formato legible en español
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    // Ajuste para evitar problemas de zona horaria
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const offsetDate = new Date(date.getTime() + userTimezoneOffset);
    
    return offsetDate.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return dateString;
  }
};

/**
 * Formatea fecha a mes y año
 */
export const formatMonthYear = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const offsetDate = new Date(date.getTime() + userTimezoneOffset);
    
    return offsetDate.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long'
    });
  } catch (error) {
    console.error('Error formateando mes/año:', error);
    return dateString;
  }
};

/**
 * Obtiene mes y año como objeto
 */
export const getMonthYear = (dateString) => {
  const date = new Date(dateString);
  return { 
    month: date.getMonth(), 
    year: date.getFullYear() 
  };
};

/**
 * Formatea moneda
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '-';
  
  const locale = currency === 'ARS' ? 'es-AR' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'ARS' ? 0 : 2,
    maximumFractionDigits: currency === 'ARS' ? 0 : 2
  }).format(amount);
};

/**
 * Formatea número sin símbolo de moneda
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  return number.toLocaleString('es-AR');
};

/**
 * Calcula el porcentaje de cambio entre dos valores
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

/**
 * Valida email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Capitaliza primera letra
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Genera color basado en categoría
 */
export const getCategoryColor = (categoria) => {
  const colors = {
    'Alquiler': 'text-emerald-600',
    'Ingreso': 'text-emerald-600',
    'Expensas': 'text-rose-600',
    'ABL': 'text-orange-600',
    'Mantenimiento': 'text-blue-600',
    'Comisión': 'text-purple-600',
    'Egreso': 'text-rose-600'
  };
  
  return colors[categoria] || 'text-slate-600';
};

/**
 * Genera color de fondo basado en categoría
 */
export const getCategoryBgColor = (categoria) => {
  const colors = {
    'Alquiler': 'bg-emerald-50',
    'Ingreso': 'bg-emerald-50',
    'Expensas': 'bg-rose-50',
    'ABL': 'bg-orange-50',
    'Mantenimiento': 'bg-blue-50',
    'Comisión': 'bg-purple-50',
    'Egreso': 'bg-rose-50'
  };
  
  return colors[categoria] || 'bg-slate-50';
};

/**
 * Trunca texto largo
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

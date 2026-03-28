import React from 'react';

const MetricCard = ({ title, amount, currency, icon: Icon, colorClass, subText, trend }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${colorClass}`}>
            {currency} {typeof amount === 'number' ? amount.toLocaleString('es-AR') : amount}
          </h3>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '•'} {Math.abs(trend)}% vs mes anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('700', '100')}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>
      {subText && (
        <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">{subText}</p>
      )}
    </div>
  );
};

export default MetricCard;

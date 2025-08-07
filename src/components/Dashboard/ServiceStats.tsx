import React from 'react';
import { Server, AlertTriangle } from 'lucide-react';

interface ServiceStatsProps {
  services: Array<{
    service: string;
    count: number;
    errorRate: number;
  }>;
}

export const ServiceStats: React.FC<ServiceStatsProps> = ({ services }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h3>
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.service} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Server className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{service.service}</p>
                <p className="text-xs text-gray-500">{service.count} logs</p>
              </div>
            </div>
            <div className="flex items-center">
              {service.errorRate > 10 && (
                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span 
                className={`text-sm font-medium ${
                  service.errorRate > 10 
                    ? 'text-red-600' 
                    : service.errorRate > 5 
                    ? 'text-yellow-600' 
                    : 'text-green-600'
                }`}
              >
                {service.errorRate.toFixed(1)}% errors
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
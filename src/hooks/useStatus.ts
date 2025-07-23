import { useMemo } from "react";

export const useStatus = (statusType: string) => {
  const status = useMemo(() => {
    
  const statusMap: Record<string, { status: string; color: string }> = {
    'Running': {status: 'En emisión', color: 'bg-green-500 shadow-lg shadow-green-500/50'},
    'Ended': {status: 'Finalizada', color: 'bg-gray-400'},
    'In Development': {status: 'Producción', color: 'bg-yellow-500 shadow-lg shadow-yellow-500/50'},
    'To Be Determined': {status: 'TBD', color: 'bg-blue-500 shadow-lg shadow-blue-500/50'}
  };
  return statusType in statusMap ? statusMap[statusType] : {status: 'N/A', color: 'bg-gray-400'};
  }, [statusType]);

  return {
    status,
  };
};
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LogFilters } from "../components/Logss/LogFilters";
import { LogEntry } from "../components/Logss/LogEntry";
import { fetchLogs } from "../store/slices/logsSlice";
import { AppDispatch, RootState } from "../store";

export const LogsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { filteredLogs, isLoading, error } = useSelector(
    (state: RootState) => state.logs
  );

  useEffect(() => {
    dispatch(fetchLogs());
  }, [dispatch]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error loading logs: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logs</h1>
        <p className="text-gray-600">
          View and search through your application logs
        </p>
      </div>

      <LogFilters />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No logs found matching your criteria.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => <LogEntry key={log.id} log={log} />)
          )}
        </div>
      )}
    </div>
  );
};

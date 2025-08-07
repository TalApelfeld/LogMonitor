import React from "react";
import { format } from "date-fns";
import { AlertCircle, AlertTriangle, Info, Bug } from "lucide-react";
import { LogEntry as LogEntryType } from "../../types";
import { clsx } from "clsx";

interface LogEntryProps {
  log: LogEntryType;
}

export const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  const levelConfig = {
    error: {
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    warn: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    info: {
      icon: Info,
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    debug: {
      icon: Bug,
      color: "text-gray-500",
      bg: "bg-gray-50",
      border: "border-gray-200",
    },
  };

  const config = levelConfig[log.level];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        "p-4 border-l-4 rounded-lg transition-all hover:shadow-sm",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className={clsx("w-5 h-5 mt-0.5", config.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span
                className={clsx(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                  config.color.replace("text-", "text-"),
                  config.bg.replace("bg-", "bg-").replace("-50", "-100")
                )}
              >
                {log.level}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {log.service}
              </span>
              <span className="text-xs text-gray-500">{log.source}</span>
            </div>
            <span className="text-xs text-gray-500">
              {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
            </span>
          </div>
          <p className="text-sm text-gray-900 mb-2">{log.message}</p>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                View metadata
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

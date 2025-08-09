import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Activity, AlertTriangle, FileText, TrendingUp } from "lucide-react";
import { MetricsCard } from "../components/Dashboard/MetricsCard";
import { LogsChart } from "../components/Dashboard/LogsChart";
import { ServiceStats } from "../components/Dashboard/ServiceStats";
import { fetchAnalytics } from "../store/slices/analyticsSlice";
import { AppDispatch, RootState } from "../store";
import { data } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: analytics, isLoading } = useSelector(
    (state: RootState) => state.analytics
  );
  console.log("Analytics Data:", data);

  useEffect(() => {
    dispatch(fetchAnalytics("24h"));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Monitor your application logs and performance metrics
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Logs"
          value={analytics?.totalLogs?.toLocaleString() || "0"}
          change="+12% from yesterday"
          changeType="positive"
          icon={FileText}
          iconColor="text-blue-500"
        />
        <MetricsCard
          title="Error Rate"
          value={`${analytics?.errorRate?.toFixed(1) || "0"}%`}
          change="-2.3% from yesterday"
          changeType="positive"
          icon={AlertTriangle}
          iconColor="text-red-500"
        />
        <MetricsCard
          title="Active Services"
          value={analytics?.serviceStats?.length || "0"}
          change="2 new services"
          changeType="neutral"
          icon={Activity}
          iconColor="text-green-500"
        />
        <MetricsCard
          title="Performance"
          value="98.2%"
          change="+0.5% from yesterday"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-purple-500"
        />
      </div>

      {/* Charts and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LogsChart data={analytics?.timeSeriesData || []} />
        <ServiceStats services={analytics?.serviceStats || []} />
      </div>
    </div>
  );
};

import { esClient } from "../es/elasticSearchClient";
import { Request, Response, NextFunction } from "express";

// const analytics = {
//   totalLogs: 1247,
//   errorRate: 8.3,
//   serviceStats: [
//     { service: "api", count: 456, errorRate: 12.1 },
//     { service: "web", count: 342, errorRate: 4.2 },
//     { service: "database", count: 289, errorRate: 6.8 },
//     { service: "auth", count: 160, errorRate: 2.1 },
//   ],
//   timeSeriesData: Array.from({ length: 24 }, (_, i) => ({
//     timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
//     errors: Math.floor(Math.random() * 20) + 5,
//     warnings: Math.floor(Math.random() * 40) + 10,
//     info: Math.floor(Math.random() * 100) + 50,
//   })),
//   topErrors: [
//     { message: "Database connection timeout", count: 23, service: "database" },
//     { message: "Authentication failed", count: 18, service: "auth" },
//     { message: "API rate limit exceeded", count: 15, service: "api" },
//   ],
// };

// export async function getAnalytics(req: Request, res: Response) {
//   const { timeRange } = req.query;

//   // In a real application, you would calculate analytics based on timeRange
//   // For now, we return the mock data
//   res.json(analytics);
// }

export async function getAnalytics(req: Request, res: Response) {
  try {
    const now = Date.now();
    const twentyFourHoursAgo = new Date(
      now - 24 * 60 * 60 * 1000
    ).toISOString();

    const response = await esClient.search({
      index: "my-logs",
      size: 0,
      query: {
        range: {
          // restrict timeSeriesData to last 24 hours
          timestamp: { gte: twentyFourHoursAgo, lte: "now" },
        },
      },
      aggs: {
        // Count all logs
        total: { value_count: { field: "timestamp" } },
        // Count logs by level
        levels: { terms: { field: "level", size: 10 } }, // e.g., error, warn, info
        // Count logs by service, with sub‑agg for error levels
        services: {
          terms: { field: "service", size: 10 },
          aggs: {
            service_error_count: {
              filter: { term: { level: "error" } },
            },
          },
        },
        // Hourly counts for last 24h, with level breakdown
        last_24_hours: {
          date_histogram: {
            field: "timestamp",
            fixed_interval: "1h",
            min_doc_count: 0,
            extended_bounds: {
              min: twentyFourHoursAgo,
              max: now,
            },
          },
          aggs: {
            errors: { filter: { term: { level: "error" } } },
            warnings: { filter: { term: { level: "warn" } } },
            info: { filter: { term: { level: "info" } } },
          },
        },
        // Top error messages (by count)
        top_errors: {
          terms: {
            field: "message.keyword",
            size: 3,
          },
          aggs: {
            by_service: {
              terms: { field: "service", size: 1 },
            },
          },
        },
      },
    });

    const aggs = response.aggregations as any;

    // Build the analytics object
    const totalLogs: number = aggs.total.value;

    const errorCount =
      aggs.levels.buckets.find((b: any) => b.key === "error")?.doc_count ?? 0;
    const errorRate: number = totalLogs ? (errorCount / totalLogs) * 100 : 0;

    // Service stats
    const serviceStats = aggs.services.buckets.map((bucket: any) => {
      const serviceCount: number = bucket.doc_count;
      const serviceErrorCount: number = bucket.service_error_count.doc_count;
      return {
        service: bucket.key,
        count: serviceCount,
        errorRate: serviceCount ? (serviceErrorCount / serviceCount) * 100 : 0,
      };
    });

    // Time series data (last 24 hours)
    const timeSeriesData = aggs.last_24_hours.buckets.map((bucket: any) => ({
      timestamp: bucket.key_as_string,
      errors: bucket.errors.doc_count,
      warnings: bucket.warnings.doc_count,
      info: bucket.info.doc_count,
    }));

    // Top error messages
    const topErrors = aggs.top_errors.buckets.map((bucket: any) => {
      const topService =
        bucket.by_service.buckets.length > 0
          ? bucket.by_service.buckets[0].key
          : null;
      return {
        message: bucket.key,
        count: bucket.doc_count,
        service: topService,
      };
    });

    res.json({
      totalLogs,
      errorRate,
      serviceStats,
      timeSeriesData,
      topErrors,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
}

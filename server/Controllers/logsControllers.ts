import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { ensureLogsIndex, esClient } from "../es/elasticSearchClient";

interface ILog {
  id: string;
  timestamp: string;
  level: string | undefined;
  message: string | undefined;
  service: string | undefined;
  source: string;
  metadata: {
    userId: number;
    requestId: any;
  };
}

const logs: ILog[] = [];

// function generateSampleLogs() {
//   const levels = ["error", "warn", "info", "debug"];
//   const services = ["api", "web", "database", "auth"];
//   const messages = [
//     "User authentication successful",
//     "Database query executed",
//     "API request processed",
//     "Error processing request",
//     "Warning: High memory usage",
//     "Connection established",
//     "Session expired",
//     "Data validation failed",
//   ];

//   for (let i = 0; i < 100; i++) {
//     logs.push({
//       id: uuidv4(),
//       timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
//       level: levels[Math.floor(Math.random() * levels.length)],
//       message: messages[Math.floor(Math.random() * messages.length)],
//       service: services[Math.floor(Math.random() * services.length)],
//       source: "application",
//       metadata: {
//         userId: Math.floor(Math.random() * 1000),
//         requestId: uuidv4().substring(0, 8),
//       },
//     });
//   }
// }
// generateSampleLogs();

export async function sortLogs(req: Request, res: Response) {
  // Sort logs by timestamp (newest first)
  const sortedLogs = logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.json(sortedLogs);
}

// export async function searchLogs(req: Request, res: Response) {
//   const { level, service, timeRange, search } = req.query;
//   let filteredLogs = [...logs];

//   // Filter by level
//   if (level) {
//     filteredLogs = filteredLogs.filter((log) => log.level === level);
//   }

//   // Filter by service
//   if (service) {
//     filteredLogs = filteredLogs.filter((log) => log.service === service);
//   }

//   // Filter by search term
//   if (typeof search === "string") {
//     const searchLower = search.toLowerCase();
//     filteredLogs = filteredLogs.filter(
//       (log: ILog) =>
//         (log.message && log.message.toLowerCase().includes(searchLower)) ||
//         (log.service && log.service.toLowerCase().includes(searchLower))
//     );
//   }

//   // Filter by time range
//   if (timeRange) {
//     const now = new Date();
//     let cutoff;

//     switch (timeRange) {
//       case "1h":
//         cutoff = new Date(now.getTime() - 60 * 60 * 1000);
//         break;
//       case "6h":
//         cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000);
//         break;
//       case "24h":
//         cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//         break;
//       case "7d":
//         cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//         break;
//       default:
//         cutoff = new Date(0);
//     }

//     filteredLogs = filteredLogs.filter(
//       (log) => new Date(log.timestamp) > cutoff
//     );
//   }

//   // Sort by timestamp (newest first)
//   filteredLogs.sort(
//     (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
//   );

//   res.json(filteredLogs);
// }

export async function searchLogsInIndex(req: Request, res: Response) {
  const { q, level, service, from, to } = req.query;
  const must: any[] = [];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: [
          "message^3", // boost message field
          "service",
          "level",
        ],
        type: "best_fields", // or 'phrase_prefix' for prefix searches
        fuzziness: "AUTO", // optional fuzzy matching
      },
    });
  } else {
    must.push({ match_all: {} });
  }

  const filter: any[] = [];
  if (level) filter.push({ term: { level } });
  if (service) filter.push({ term: { service } });
  if (from || to) {
    filter.push({
      range: {
        timestamp: {
          gte: from ?? "1970-01-01T00:00:00Z",
          lte: to ?? "now",
        },
      },
    });
  }

  try {
    const { hits } = await esClient.search({
      index: "my-logs",
      size: 1000,
      query: { bool: { must, filter } },
      sort: [{ timestamp: { order: "desc" } }],
    });
    const logs = hits.hits.map((h: any) => h._source);
    res.json(logs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Elasticsearch search error" });
  }
}

export async function createLog(req: Request, res: Response) {
  const { level, message, service, source, metadata } = req.body;

  const newLog = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    level: level || "info",
    message,
    service: service || "unknown",
    source: source || "api",
    metadata: metadata || {},
  };

  logs.unshift(newLog);

  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(1000);
  }

  res.status(201).json(newLog);
}

export async function uploadLogsFromFile(req: Request, res: Response) {
  console.log("Test");

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  await ensureLogsIndex();

  const { mimetype, buffer } = req.file;
  let logs: Record<string, any>[] = [];

  try {
    const text = buffer.toString("utf-8");
    if (mimetype === "application/json") {
      // Support JSON array or one JSON object per line
      const trimmed = text.trim();
      logs = trimmed.startsWith("[")
        ? JSON.parse(trimmed)
        : text
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0)
            .map((line) => JSON.parse(line));
    } else if (mimetype === "text/csv") {
      // Simple CSV parser; adapt to your CSV format
      const [headerLine, ...lines] = text.trim().split(/\r?\n/);
      const headers = headerLine?.split(",");
      logs = lines.map((line) => {
        const values = line.split(",");
        const entry: Record<string, any> = {};
        headers?.forEach((h, i) => (entry[h] = values[i]));
        return entry;
      });
    } else {
      return res.status(415).json({ message: "Unsupported file type" });
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid log file" });
  }

  // Prepare bulk operations for Elasticsearch
  const bulkOps = logs.flatMap((log) => [
    { index: { _index: "my-logs" } }, // or your date-based index name
    log,
  ]);

  try {
    const result = await esClient.bulk({
      refresh: true,
      operations: bulkOps,
    });

    if (result.errors) {
      console.warn("Bulk indexing errors", result.items);
    }
    return res.status(200).json({ indexed: logs.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Elasticsearch error" });
  }
}

export async function getLogsFromIndex(req: Request, res: Response) {
  try {
    // adjust `size` for how many documents you want; ES defaults to 10
    const { hits } = await esClient.search({
      index: "my-logs",
      size: 1000,
      query: { match_all: {} },
      sort: [{ timestamp: { order: "desc" } }],
    });

    const logs = hits.hits.map((hit: any) => hit._source);
    return res.json(logs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Elasticsearch query error" });
  }
}

export async function ingestLogEntry(req: Request, res: Response) {
  try {
    // accept either a single log or an array of logs
    const payload = Array.isArray(req.body) ? req.body : [req.body];

    // normalise fields and assign IDs/timestamps
    const docs = payload.map((entry: any) => ({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: entry.level ?? "info",
      message: entry.message,
      service: entry.service ?? "unknown",
      source: entry.source ?? "remote",
      metadata: entry.metadata ?? {},
    }));

    await ensureLogsIndex();

    // index them via bulk API
    const operations = docs.flatMap((doc) => [
      { index: { _index: "my-logs" } },
      doc,
    ]);
    const result = await esClient.bulk({ refresh: true, operations });

    if (result.errors) {
      console.warn("Ingestion errors:", result.items);
      return res.status(500).json({ message: "Some logs failed to index" });
    }
    res.status(201).json({ indexed: docs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to ingest logs" });
  }
}

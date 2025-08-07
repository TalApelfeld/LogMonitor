import { Client } from "@elastic/elasticsearch";
import config from "config";

interface ElasticConfig {
  cloudID: string;
  username: string;
  password: string;
  apiKey: string;
}

console.log("Loading Elasticsearch client...");

const elasticConfig = config.get<ElasticConfig>("elastic");

export const esClient = new Client({
  cloud: {
    id: elasticConfig.cloudID,
  },
  auth: {
    apiKey: elasticConfig.apiKey,
  },
});

export async function ensureLogsIndex() {
  const exists = await esClient.indices.exists({ index: "my-logs" });
  if (!exists) {
    await esClient.indices.create({
      index: "my-logs",
      mappings: {
        properties: {
          timestamp: { type: "date" },
          level: { type: "keyword" },
          service: { type: "keyword" },
          message: { type: "text" },
          userId: { type: "keyword" },
          requestId: { type: "keyword" },
          traceId: { type: "keyword" },
          meta: { type: "object", enabled: false },
        },
      },
    });
  }
}

esClient
  .ping()
  .then(() => {
    console.log("Elasticsearch is connected");
  })
  .catch((error) => {
    console.error("Elasticsearch connection failed", error);
  });

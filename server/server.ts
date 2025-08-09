import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { app } from "./app";
import "./es/elasticSearchClient";
import { initPostgres, initTable } from "./postgresDB/db";

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await initPostgres();
    await initTable(); // <-- create table if not exists
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Sample credentials:");
      console.log("Admin: admin@logmonitor.com / admin123");
      console.log("User: user@logmonitor.com / user123");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

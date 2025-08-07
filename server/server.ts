import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { app } from "./app";
import "./es/elasticSearchClient";
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Sample credentials:");
  console.log("Admin: admin@logmonitor.com / admin123");
  console.log("User: user@logmonitor.com / user123");
});

import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import search from "./yts";

const app = new Hono();

// Serve frontend (index.html)
app.get("/", serveStatic({ path: "./src/frontend/index.html" }));

// Serve all frontend static files
app.use("/frontend/*", serveStatic({ root: "./src" }));

// API route for YTS search
app.get("/api/search/yts", async (c) => {
  const query = c.req.query("query") || "";
  if (!query) {
    return c.json({ status: "error", error: "Missing query parameter" }, 400);
  }

  const results = await search(query, true); // true = encode cover image
  return c.json(results);
});

export default app;
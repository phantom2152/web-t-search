import { Hono } from "hono";
import search from "./providers/yts";

type Bindings = {
  ASSETS: {
    fetch: typeof fetch;
  };
};

const app = new Hono<{ Bindings: Bindings }>();


app.get("/api/search/yts", async (c) => {
  const query = c.req.query("query") || "";
  if (!query) {
    return c.json({ status: "error", error: "Missing query parameter" }, 400);
  }

  const results = await search(query, true);
  return c.json(results);
});

app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
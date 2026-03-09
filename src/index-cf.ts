import { Hono } from "hono";
import YTSSearch from "./providers/yts";
import TPBSearch from "./providers/piratebay";
import type { TPBCategories } from "./providers/piratebay";

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

  const results = await YTSSearch(query, true);
  return c.json(results);
});

app.get("/api/search/tpb", async (c) => {
  const query = c.req.query("query") || "";
  const category = c.req.query("category") || "All";
  const sortBy = c.req.query("sort") as 'name' | 'date' | 'size' | 'seeders' | 'leechers';
  const order = c.req.query("order") as 'asc' | 'desc';
  
  if (!query) {
    return c.json({ status: "error", error: "Missing query parameter" }, 400);
  }

  const results = await TPBSearch(query, { 
    category: category as keyof TPBCategories,
    sortBy,
    order 
  }); 
  return c.json(results);
});

app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
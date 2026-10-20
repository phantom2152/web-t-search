// zenFetch.ts

export interface ZenFetchOptions extends RequestInit {
  /** Extra ZenRows params, e.g. { premium_proxy: "true", proxy_country: "us" } */
  zenrows?: Record<string, string>;
}

export async function zenFetch(
  input: string | URL | Request,
  options: ZenFetchOptions = {}
): Promise<Response> {
  const API_KEY = process.env.ZENROWS_API_KEY;
  if (!API_KEY) {
    throw new Error("ZENROWS_API_KEY is not set");
  }

  const targetUrl =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  const { zenrows, ...init } = options;
  const method = (init.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

  const params = new URLSearchParams({ apikey: API_KEY, url: targetUrl, ...zenrows });

  // Forward headers to the target site
  const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined));
  const hasHeaders = [...headers.keys()].length > 0;
  if (hasHeaders) {
    params.set("custom_headers", "true");
  }

  const zenrowsUrl = `https://api.zenrows.com/v1/?${params.toString()}`;

  // The ZenRows endpoint accepts the same method/body as the target request
  const response = await fetch(zenrowsUrl, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : init.body,
    signal: init.signal,
  });

  return response;
}
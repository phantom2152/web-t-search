export class ApiError extends Error {
  readonly httpStatus?: number;
  constructor(message: string, httpStatus?: number) {
    super(message);
    this.name = "ApiError";
    this.httpStatus = httpStatus;
  }
}

type Params = Record<string, string | number | undefined>;

/** GET a JSON endpoint of ours. Throws ApiError on HTTP errors and on { status: "error" } bodies. */
export async function getJson<T extends { status: string; error?: string }>(
  path: string,
  params: Params,
  signal?: AbortSignal,
): Promise<T> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  }

  const res = await fetch(`${path}?${qs}`, { signal });

  let body: T;
  try {
    body = (await res.json()) as T;
  } catch {
    throw new ApiError(`Bad response (${res.status})`, res.status);
  }

  if (body.status === "error") throw new ApiError(body.error ?? "Request failed", res.status);
  if (!res.ok) throw new ApiError(`Request failed (${res.status})`, res.status);
  return body;
}
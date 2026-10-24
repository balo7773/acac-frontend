export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  status: number;
  detail: string;
  /** Per-field messages parsed from FastAPI/Pydantic 422 responses, keyed by field name. */
  fieldErrors: FieldErrors;
  /** Seconds from the Retry-After header, if the backend sent one (429). */
  retryAfter: number | null;

  constructor(
    status: number,
    detail: string,
    fieldErrors: FieldErrors = {},
    retryAfter: number | null = null
  ) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
    this.retryAfter = retryAfter;
  }
}

type PydanticIssue = { loc?: (string | number)[]; msg?: string };

function parseDetail(body: unknown): { detail: string | null; fieldErrors: FieldErrors } {
  const fieldErrors: FieldErrors = {};
  if (!body || typeof body !== "object" || !("detail" in body)) {
    return { detail: null, fieldErrors };
  }
  const raw = (body as { detail: unknown }).detail;

  if (typeof raw === "string") return { detail: raw, fieldErrors };

  // FastAPI validation errors: detail is [{ loc: ["body", "field"], msg: "..." }, ...]
  if (Array.isArray(raw)) {
    const messages: string[] = [];
    for (const issue of raw as PydanticIssue[]) {
      const msg = issue?.msg ?? "Invalid value";
      const field = issue?.loc?.filter((p) => p !== "body").join(".");
      if (field) {
        fieldErrors[field] ??= msg;
        messages.push(`${field.replace(/_/g, " ")}: ${msg}`);
      } else {
        messages.push(msg);
      }
    }
    return { detail: messages.join(" · ") || null, fieldErrors };
  }

  return { detail: null, fieldErrors };
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });
  } catch {
    // status 0 = network failure (offline, DNS, CORS, etc.)
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    let fieldErrors: FieldErrors = {};
    try {
      const parsed = parseDetail(await res.json());
      if (parsed.detail) detail = parsed.detail;
      fieldErrors = parsed.fieldErrors;
    } catch {}
    const ra = Number(res.headers.get("retry-after"));
    throw new ApiError(res.status, detail, fieldErrors, Number.isFinite(ra) && ra > 0 ? ra : null);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// NOTE (Part 3): multipart uploads must NOT set Content-Type — the browser adds the
// boundary. Add a separate `apiUpload` helper when essay upload lands.

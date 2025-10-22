// Simple API client for https://projects.sbw.media
// Split out per your preference.

export const SBWM_BASE_URL = "https://projects.sbw.media";

export type HttpError = { status: number; message: string };

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = "";
    try { msg = await res.text(); } catch { /* noop */ }
    throw <HttpError>{ status: res.status, message: msg || res.statusText };
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(resource: string): Promise<T[]> {
  const url = `${SBWM_BASE_URL}/${resource}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  return handle<T[]>(res);
}

export async function apiGetOne<T>(resource: string, id: string|number): Promise<T> {
  const url = `${SBWM_BASE_URL}/${resource}/${id}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  return handle<T>(res);
}

/**
 * Upsert:
 * - For auto-increment keys: POST to /Resource when id is 0/undefined, PUT to /Resource/{id} when id > 0
 * - For non-auto keys (e.g., Country ISO, Teacher Abbr, Projectrole ID string): PUT to /Resource/{id}
 * 
 * Pass:
 *   - resource: e.g. "Project"
 *   - payload: full object as the API expects
 *   - keyName: primary key field name (e.g. "ID", "Abbr", "ISO")
 *   - autoIncrement: true if key is auto-increment (see docs)
 */
export async function apiUpsert<T extends Record<string, any>>(
  resource: string,
  payload: T,
  keyName: string,
  autoIncrement: boolean
): Promise<T> {
  const keyVal = payload[keyName];

  // Determine method + URL
  let url = `${SBWM_BASE_URL}/${resource}`;
  let method: "POST"|"PUT" = "POST";

  if (!autoIncrement) {
    // Non-auto key: always PUT to /Resource/{id-like}
    if (keyVal === undefined || keyVal === null || keyVal === "") {
      throw new Error(`Missing non-auto key "${keyName}" for ${resource}`);
    }
    url = `${url}/${encodeURIComponent(String(keyVal))}`;
    method = "PUT";
  } else {
    // Auto-increment
    if (typeof keyVal === "number" && keyVal > 0) {
      url = `${url}/${keyVal}`;
      method = "PUT";
    } else {
      method = "POST";
    }
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  });
  return handle<T>(res);
}

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<any> => {
  const stored = localStorage.getItem("hms_auth");
  const headers: any = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (stored) {
    const { accessToken } = JSON.parse(stored);
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }
  const resp = await fetch(`http://localhost:4000/api${path}`, {
    ...options,
    headers
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }
  return resp.json();
};

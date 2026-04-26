import type { Campaign, CompanyDecision, LoginResponse, RaynetCompany } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${text}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getCampaigns(): Promise<Campaign[]> {
  return request<Campaign[]>("/api/campaigns");
}

export async function getCampaignHistory(): Promise<Campaign[]> {
  return request<Campaign[]>("/api/campaigns/history");
}

export async function createCampaign(
  name: string,
  planDate?: string,
): Promise<Campaign> {
  return request<Campaign>("/api/campaigns", {
    method: "POST",
    body: JSON.stringify({ name, planDate: planDate || null }),
  });
}

export async function renameCampaign(
  id: string,
  name: string,
): Promise<void> {
  return request<void>(`/api/campaigns/${id}/rename`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function getDecisions(
  campaignId: string,
): Promise<CompanyDecision[]> {
  return request<CompanyDecision[]>(
    `/api/campaigns/${campaignId}/decisions`,
  );
}

export async function saveDecisions(
  campaignId: string,
  decisions: { companyId: string; companyName: string; selected: boolean }[],
): Promise<void> {
  return request<void>(`/api/campaigns/${campaignId}/decisions`, {
    method: "PUT",
    body: JSON.stringify({ decisions }),
  });
}

export async function sendCampaign(id: string): Promise<Campaign> {
  return request<Campaign>(`/api/campaigns/${id}/send`, {
    method: "PUT",
  });
}

export async function getCompanies(): Promise<RaynetCompany[]> {
  return request<RaynetCompany[]>("/api/companies");
}

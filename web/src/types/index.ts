export interface Campaign {
  id: string;
  name: string;
  status: "Processed" | "Sent";
  planDate: string | null;
  createdAt: string;
}

export interface CompanyDecision {
  companyId: string;
  companyName: string;
  selected: boolean;
  decidedBy: string | null;
  accountManager?: string;
  systemType?: string;
}

export interface RaynetCompany {
  companyId: string;
  companyName: string;
  accountManager: string;
  category: string | null;
}

export interface LoginResponse {
  token: string;
  displayName: string;
  role: string;
}

export interface User {
  displayName: string;
  role: string;
  token: string;
}

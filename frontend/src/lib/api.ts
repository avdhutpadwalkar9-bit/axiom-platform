const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Try refresh
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.getToken()}`;
        const retry = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers,
        });
        if (!retry.ok) throw new Error(await retry.text());
        if (retry.status === 204) return undefined as T;
        return retry.json();
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  // Auth
  async signup(email: string, password: string, name?: string) {
    return this.request<{ id: string; email: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request<{
      access_token: string;
      refresh_token: string;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return data;
  }

  async getMe() {
    return this.request<{ id: string; email: string; name: string | null }>(
      "/api/auth/me"
    );
  }

  // Models
  async listModels() {
    return this.request<
      Array<{
        id: string;
        name: string;
        description: string | null;
        start_date: string;
        period_count: number;
        updated_at: string;
      }>
    >("/api/models");
  }

  async createModel(data: {
    name: string;
    description?: string;
    start_date: string;
    period_count?: number;
  }) {
    return this.request<{ id: string }>("/api/models", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getModel(id: string) {
    return this.request<{
      id: string;
      name: string;
      description: string | null;
      start_date: string;
      period_count: number;
    }>(`/api/models/${id}`);
  }

  async deleteModel(id: string) {
    return this.request<void>(`/api/models/${id}`, { method: "DELETE" });
  }

  // Sections
  async listSections(modelId: string) {
    return this.request<
      Array<{
        id: string;
        name: string;
        section_type: string | null;
        sort_order: number;
        statement: string | null;
      }>
    >(`/api/models/${modelId}/sections`);
  }

  async createSection(
    modelId: string,
    data: { name: string; section_type?: string; statement?: string; sort_order?: number }
  ) {
    return this.request<{ id: string }>(`/api/models/${modelId}/sections`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Variables
  async listVariables(modelId: string) {
    return this.request<
      Array<{
        id: string;
        name: string;
        slug: string;
        section_id: string | null;
        variable_type: string;
        data_type: string;
        formula: string | null;
        default_value: number | null;
        sort_order: number;
      }>
    >(`/api/models/${modelId}/variables`);
  }

  async createVariable(
    modelId: string,
    data: {
      name: string;
      section_id?: string;
      variable_type?: string;
      data_type?: string;
      formula?: string;
      default_value?: number;
      sort_order?: number;
    }
  ) {
    return this.request<{ id: string }>(`/api/models/${modelId}/variables`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateVariable(
    variableId: string,
    data: { name?: string; formula?: string; sort_order?: number }
  ) {
    return this.request(`/api/variables/${variableId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteVariable(variableId: string) {
    return this.request<void>(`/api/variables/${variableId}`, {
      method: "DELETE",
    });
  }

  // Scenarios
  async listScenarios(modelId: string) {
    return this.request<
      Array<{
        id: string;
        name: string;
        is_base: boolean;
        color: string | null;
      }>
    >(`/api/models/${modelId}/scenarios`);
  }

  // Cells
  async updateCell(data: {
    variable_id: string;
    scenario_id: string;
    period_index: number;
    value: number | null;
  }) {
    return this.request("/api/cells", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateCells(
    updates: Array<{
      variable_id: string;
      scenario_id: string;
      period_index: number;
      value: number | null;
    }>
  ) {
    return this.request("/api/cells/bulk", {
      method: "PUT",
      body: JSON.stringify({ updates }),
    });
  }

  // Compute
  async compute(modelId: string, scenarioId?: string) {
    const query = scenarioId ? `?scenario_id=${scenarioId}` : "";
    return this.request<{
      scenario_id: string;
      period_count: number;
      start_date: string;
      values: Record<string, Record<number, number>>;
    }>(`/api/models/${modelId}/compute${query}`);
  }
}

export const api = new ApiClient();
